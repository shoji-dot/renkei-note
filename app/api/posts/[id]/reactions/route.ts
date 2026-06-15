import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: リアクション一覧取得
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id: postId } = await params;
  const reactions = await prisma.postReaction.findMany({
    where: { postId },
    include: { member: { select: { id: true, name: true } } },
  });

  return NextResponse.json(reactions);
}

// POST: リアクション追加・上書き（1人1種類）
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const user = session.user as any;
  if (!user.memberId) return NextResponse.json({ error: "メンバー情報が必要です" }, { status: 400 });

  const { id: postId } = await params;
  const { type } = await req.json();

  const validTypes = ["like", "confirmed", "will_contact"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "無効なリアクション種別です" }, { status: 400 });
  }

  const reaction = await prisma.postReaction.upsert({
    where: { postId_memberId: { postId, memberId: user.memberId } },
    create: { postId, memberId: user.memberId, type },
    update: { type },
  });

  return NextResponse.json(reaction);
}

// DELETE: リアクション取り消し
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const user = session.user as any;
  if (!user.memberId) return NextResponse.json({ error: "メンバー情報が必要です" }, { status: 400 });

  const { id: postId } = await params;

  await prisma.postReaction.deleteMany({
    where: { postId, memberId: user.memberId },
  });

  return NextResponse.json({ ok: true });
}
