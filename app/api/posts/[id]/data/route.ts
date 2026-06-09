import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { type: true, title: true, body: true } });
  if (!post) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  return NextResponse.json(post);
}
