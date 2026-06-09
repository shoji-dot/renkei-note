import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function authorize(id: string, user: any) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return { post: null, error: "投稿が見つかりません" };
  const isOwner = post.authorId === user.memberId;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) return { post: null, error: "権限がありません" };
  return { post, error: null };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  const { id } = await params;
  const user = session.user as any;
  const { post, error } = await authorize(id, user);
  if (error) return NextResponse.json({ error }, { status: post === null ? 404 : 403 });

  const body = await req.json();
  const { type, title, content } = body;
  await prisma.post.update({
    where: { id },
    data: {
      type: type ?? post!.type,
      title: title?.trim() || post!.title,
      body: content?.trim() || post!.body,
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
  const { post, error } = await authorize(id, user);
  if (error) return NextResponse.json({ error }, { status: post === null ? 404 : 403 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
