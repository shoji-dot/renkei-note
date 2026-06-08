"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createFeedback(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const user = session.user as any;

  const productId = String(formData.get("productId") ?? "") || null;
  const goodPoint = String(formData.get("goodPoint") ?? "").trim() || null;
  const improvementPoint = String(formData.get("improvementPoint") ?? "").trim() || null;
  const customerComment = String(formData.get("customerComment") ?? "").trim() || null;
  if (!goodPoint && !improvementPoint && !customerComment) return;

  await prisma.productFeedback.create({
    data: { productId, goodPoint, improvementPoint, customerComment, createdBy: user.memberId ?? user.email },
  });
  revalidatePath("/gouton/feedback");
}
