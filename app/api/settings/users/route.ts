import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const user = session.user as any;
  if (user?.role !== "admin") return null;
  return session;
}

// ユーザー一覧
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await prisma.member.findMany({
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

// ユーザー追加
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const member = await tx.member.create({ data: { name, role } });
    const user = await tx.user.create({
      data: { email, passwordHash, memberId: member.id },
    });
    return { member, user };
  });

  return NextResponse.json(result, { status: 201 });
}

// パスワード・メール・ロール変更
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, email, password, role } = await req.json();
  if (!userId) return NextResponse.json({ error: "userIdが必要です" }, { status: 400 });

  const userUpdate: any = {};
  if (email) userUpdate.email = email;
  if (password) userUpdate.passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({ where: { id: userId }, data: userUpdate });
    }
    if (role) {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { memberId: true } });
      if (user?.memberId) {
        await tx.member.update({ where: { id: user.memberId }, data: { role } });
      }
    }
  });

  return NextResponse.json({ ok: true });
}

// ユーザー削除
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userIdが必要です" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { memberId: true } });
  await prisma.user.delete({ where: { id: userId } });
  if (user?.memberId) {
    await prisma.member.delete({ where: { id: user.memberId } });
  }

  return NextResponse.json({ ok: true });
}
