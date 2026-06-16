import { createTransport } from "nodemailer";
import { prisma } from "@/lib/db";

type SendNotificationParams = {
  smtpUser: string;
  smtpPass: string;
  to: string[];
  subject: string;
  text: string;
};

export async function sendNotification({
  smtpUser,
  smtpPass,
  to,
  subject,
  text,
}: SendNotificationParams): Promise<void> {
  if (to.length === 0) return;

  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `"連携ノート" <${smtpUser}>`,
    to: to.join(","),
    subject,
    text,
  });
}

// --- フィードバック通知 ---
export async function sendFeedbackNotificationAsync({
  senderId,
  senderName,
}: {
  senderId: string;
  senderName: string;
}) {
  try {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { smtpUser: true, smtpPass: true },
    });
    if (!sender?.smtpUser || !sender?.smtpPass) return;

    const recipients = await prisma.user.findMany({
      where: { notifyFeedback: true, id: { not: senderId }, email: { not: "" } },
      select: { email: true },
    });
    if (recipients.length === 0) return;

    await sendNotification({
      smtpUser: sender.smtpUser,
      smtpPass: sender.smtpPass,
      to: recipients.map((r) => r.email),
      subject: `【連携ノート】${senderName}さんが商品フィードバックを登録しました`,
      text: `${senderName}さんが商品フィードバックを登録しました。\n\nアプリで確認する:\nhttps://renkei-note.up.railway.app/gouton/feedback`,
    });
  } catch (err) {
    console.error("フィードバック通知メール送信エラー:", err);
  }
}

// --- タスク通知 ---
export async function sendTaskNotificationAsync({
  senderId,
  senderName,
  taskTitle,
}: {
  senderId: string;
  senderName: string;
  taskTitle: string;
}) {
  try {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { smtpUser: true, smtpPass: true },
    });
    if (!sender?.smtpUser || !sender?.smtpPass) return;

    const recipients = await prisma.user.findMany({
      where: { notifyTask: true, id: { not: senderId }, email: { not: "" } },
      select: { email: true },
    });
    if (recipients.length === 0) return;

    await sendNotification({
      smtpUser: sender.smtpUser,
      smtpPass: sender.smtpPass,
      to: recipients.map((r) => r.email),
      subject: `【連携ノート】${senderName}さんがタスクを追加しました`,
      text: `${senderName}さんが新しいタスクを追加しました。\n\nタイトル：${taskTitle}\n\nアプリで確認する:\nhttps://renkei-note.up.railway.app/tasks`,
    });
  } catch (err) {
    console.error("タスク通知メール送信エラー:", err);
  }
}
