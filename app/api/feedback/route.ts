import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const user = session.user as any;
  const { productId, goodPoint, improvementPoint, customerComment, imageUrls } = await req.json();

  if (!goodPoint?.trim() && !improvementPoint?.trim() && !customerComment?.trim()) {
    return NextResponse.json({ error: "必須項目が未入力です" }, { status: 400 });
  }

  await prisma.productFeedback.create({
    data: {
      productId: productId || null,
      goodPoint: goodPoint?.trim() || null,
      improvementPoint: improvementPoint?.trim() || null,
      customerComment: customerComment?.trim() || null,
      createdBy: user.memberId ?? user.email,
      images: {
        create: (imageUrls ?? []).map((url: string) => ({ imageUrl: url })),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
