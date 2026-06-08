import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { type, category, title, content, imageUrls } = body;

  if (!type || !title || !content) {
    return NextResponse.json({ error: "必須項目が未入力です" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      type,
      category: category || null,
      title,
      body: content,
      authorId: user.memberId ?? null,
      createdBy: user.memberId ?? user.email,
      images: {
        create: (imageUrls ?? []).map((url: string) => ({
          imageUrl: url,
          createdBy: user.memberId ?? user.email,
        })),
      },
    },
  });

  return NextResponse.json({ id: post.id });
}
