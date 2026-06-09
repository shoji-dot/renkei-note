import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const user = session.user as any;
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      smtpUser: true,
      smtpPass: true, // 設定済みか確認するためだけに取得（レスポンスには含めない）
      notifyPost: true,
      notifyFeedback: true,
      notifyTask: true,
    },
  });

  return NextResponse.json({
    smtpUser: data?.smtpUser ?? "",
    smtpConfigured: !!data?.smtpPass,
    notifyPost: data?.notifyPost ?? true,
    notifyFeedback: data?.notifyFeedback ?? false,
    notifyTask: data?.notifyTask ?? false,
  });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { smtpUser, smtpPass, notifyPost, notifyFeedback, notifyTask } = body;

  const updateData: Record<string, unknown> = {
    notifyPost: !!notifyPost,
    notifyFeedback: !!notifyFeedback,
    notifyTask: !!notifyTask,
  };

  if (smtpUser !== undefined) updateData.smtpUser = smtpUser || null;
  if (smtpPass) updateData.smtpPass = smtpPass; // 入力がある場合のみ更新

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}
