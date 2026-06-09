import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/mailer";
import { labelOf, POST_TYPES } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { type, category, title, content, imageUrls } = body;

  if (!type || !content) {
    return NextResponse.json({ error: "必須項目が未入力です" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      type,
      category: null,
      title: title || content.slice(0, 30),
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

  // 通知メール送信（非同期・失敗しても投稿は成功扱い）
  sendNotificationAsync({ postId: post.id, postTitle: post.title, type, senderId: user.id, senderName: user.name });

  return NextResponse.json({ id: post.id });
}

async function sendNotificationAsync({
  postId,
  postTitle,
  type,
  senderId,
  senderName,
}: {
  postId: string;
  postTitle: string;
  type: string;
  senderId: string;
  senderName: string;
}) {
  try {
    // 送信者のSMTP設定を取得
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { smtpUser: true, smtpPass: true },
    });

    if (!sender?.smtpUser || !sender?.smtpPass) return; // SMTP未設定なら送信しない

    // 通知ONのユーザー（送信者除く）のメールアドレスを取得
    const recipients = await prisma.user.findMany({
      where: {
        notifyPost: true,
        id: { not: senderId },
        email: { not: "" },
      },
      select: { email: true },
    });

    if (recipients.length === 0) return;

    const typeLabel = labelOf(POST_TYPES, type);
    const subject = `【連携ノート】${senderName}さんが投稿しました`;
    const text = `${senderName}さんが新しい投稿をしました。\n\n種類：${typeLabel}\nタイトル：${postTitle}\n\nアプリで確認する:\nhttps://renkei-note.up.railway.app/posts/${postId}`;

    await sendNotification({
      smtpUser: sender.smtpUser,
      smtpPass: sender.smtpPass,
      to: recipients.map((r) => r.email),
      subject,
      text,
    });
  } catch (err) {
    console.error("通知メール送信エラー:", err);
  }
}
