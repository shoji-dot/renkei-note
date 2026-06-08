"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createBrewing(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const user = session.user as any;

  const productId = String(formData.get("productId") ?? "") || null;
  const startDateStr = String(formData.get("startDate") ?? "");
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  const comment = String(formData.get("comment") ?? "").trim() || null;

  await prisma.brewingProgress.create({
    data: {
      productId,
      startDate: startDateStr ? new Date(startDateStr) : null,
      assigneeId,
      comment,
      createdBy: user.memberId ?? user.email,
    },
  });
  revalidatePath("/trobar/brewing");
}

export async function updateBrewingStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  await prisma.brewingProgress.update({ where: { id }, data: { status: status as any } });
  revalidatePath("/trobar/brewing");
}
