"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendTaskNotificationAsync } from "@/lib/mailer";

export async function createTask(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const user = session.user as any;

  const title = String(formData.get("title") ?? "").trim();
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  const dueDateStr = String(formData.get("dueDate") ?? "");
  if (!title) return;

  await prisma.task.create({
    data: {
      title,
      assigneeId,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      createdBy: user.memberId ?? user.email,
    },
  });

  // 通知メール送信（非同期・失敗してもタスク作成は成功扱い）
  sendTaskNotificationAsync({ senderId: user.id, senderName: user.name, taskTitle: title });

  revalidatePath("/tasks");
}

export async function updateTaskStatus(id: string, status: "michakushu" | "shinkochu" | "kanryo") {
  const session = await getServerSession(authOptions);
  if (!session) return;
  await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath("/tasks");
}

export async function updateTask(id: string, data: { title: string; assigneeId: string | null; dueDate: string | null }) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      assigneeId: data.assigneeId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
}
