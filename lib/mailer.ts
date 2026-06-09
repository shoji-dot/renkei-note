import { createTransport } from "nodemailer";

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
