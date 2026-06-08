"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  revalidatePath("/tasks");
}

export async function updateTaskStatus(id: string, status: "michakushu" | "shinkochu" | "kanryo") {
  const session = await getServerSession(authOptions);
  if (!session) return;
  await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath("/tasks");
}
