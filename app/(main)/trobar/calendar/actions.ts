"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createCalendarItem(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const user = session.user as any;

  const month = Number(formData.get("month"));
  const workContent = String(formData.get("workContent") ?? "").trim();
  if (!month || !workContent) return;

  await prisma.manufacturingCalendar.create({
    data: {
      month,
      workContent,
      requiredPeople: formData.get("requiredPeople") ? Number(formData.get("requiredPeople")) : null,
      requiredMembers: String(formData.get("requiredMembers") ?? "").trim() || null,
      requiredMaterials: String(formData.get("requiredMaterials") ?? "").trim() || null,
      note: String(formData.get("note") ?? "").trim() || null,
      createdBy: user.memberId ?? user.email,
    },
  });
  revalidatePath("/trobar/calendar");
}
