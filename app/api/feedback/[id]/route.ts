import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function authorize(id: string, user: any) {
  const feedback = await prisma.productFeedback.findUnique({ where: { id } });
  if (!feedback) return { feedback: null, error: "フィードバックが見つかりません" };
  const isOwner = feedback.createdBy === (user.memberId ?? user.email);
  if (!isOwner && user.role !== "admin") return { feedback: null, error: "権限がありません" };
  return { feedback, error: null };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  const { id } = await params;
  const user = session.user as any;
  const { feedback, error } = await authorize(id, user);
  if (error) return NextResponse.json({ error }, { status: feedback === null ? 404 : 403 });

  const body = await req.json();
  await prisma.productFeedback.update({
    where: { id },
    data: {
      productId: body.productId || null,
      goodPoint: body.goodPoint?.trim() || null,
      improvementPoint: body.improvementPoint?.trim() || null,
      customerComment: body.customerComment?.trim() || null,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  const feedback = await prisma.productFeedback.findUnique({ where: { id } });
  if (!feedback) return NextResponse.json({ error: "フィードバックが見つかりません" }, { status: 404 });

  // 自分の投稿 or 管理者のみ削除可
  const isOwner = feedback.createdBy === (user.memberId ?? user.email);
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
  }

  await prisma.productFeedback.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
