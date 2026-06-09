import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
