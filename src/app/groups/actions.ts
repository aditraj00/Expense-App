"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function createGroupAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "INR").trim().toUpperCase();

  if (!name) {
    redirect("/groups?error=missing-name");
  }

  const group = await db.group.create({
    data: { name, currency }
  });

  await db.membership.create({
    data: {
      groupId: group.id,
      userId: user.id,
      role: "ADMIN",
      startsAt: new Date()
    }
  });

  revalidatePath("/groups");
  redirect("/groups");
}

export async function addMemberAction(formData: FormData) {
  await requireUser();
  const groupId = String(formData.get("groupId") ?? "");
  const userName = String(formData.get("userName") ?? "").trim();
  const startsAt = new Date(String(formData.get("startsAt") ?? new Date().toISOString()));

  if (!groupId || !userName) {
    redirect("/groups?error=missing-fields");
  }

  const user = await db.user.upsert({
    where: { name: userName },
    create: { name: userName, displayName: userName, passwordHash: null },
    update: { displayName: userName }
  });

  await db.membership.create({
    data: {
      groupId,
      userId: user.id,
      startsAt
    }
  });

  revalidatePath("/groups");
  redirect("/groups");
}

export async function endMembershipAction(formData: FormData) {
  await requireUser();
  const membershipId = String(formData.get("membershipId") ?? "");
  const endsAt = new Date(String(formData.get("endsAt") ?? new Date().toISOString()));

  if (!membershipId) {
    redirect("/groups?error=missing-membership");
  }

  await db.membership.update({
    where: { id: membershipId },
    data: { endsAt }
  });

  revalidatePath("/groups");
  redirect("/groups");
}