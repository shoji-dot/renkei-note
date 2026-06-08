"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createDevMemo(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const user = session.user as any;

  const ideaName = String(formData.get("ideaName") ?? "").trim();
  if (!ideaName) return;
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const customerRequest = String(formData.get("customerRequest") ?? "").trim() || null;
  const relatedProductId = String(formData.get("relatedProductId") ?? "") || null;

  await prisma.productDevMemo.create({
    data: {
      ideaName,
      reason,
      customerRequest,
      relatedProductId,
      proposerId: user.memberId ?? null,
      createdBy: user.memberId ?? user.email,
    },
  });
  revalidatePath("/gouton/dev-memo");
}

export async function updateDevMemoStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  await prisma.productDevMemo.update({ where: { id }, data: { status: status as any } });
  revalidatePath("/gouton/dev-memo");
}
