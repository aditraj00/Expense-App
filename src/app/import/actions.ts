"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { persistImport } from "@/lib/import-persistence";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function importCsvAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("csv");
  const groupId = String(formData.get("groupId") ?? "");

  if (!(file instanceof File) || file.size === 0 || !groupId) {
    redirect("/import?error=missing-file");
  }

  const content = await file.text();

  const report = await persistImport(content, {
    fileName: file.name || "expenses_export.csv",
    groupId,
    importedById: user.id
  });

  revalidatePath("/import");
  revalidatePath("/");
  revalidatePath("/balances");

  redirect(`/import?run=${report.summary.totalRows}`);
}

export async function seedDemoDataAction() {
  const user = await requireUser();

  const group = await db.group.upsert({
    where: { id: "cm-demo-group" },
    create: { id: "cm-demo-group", name: "Flatmates house", currency: "INR" },
    update: {}
  });

  await db.membership.upsert({
    where: { id: "cm-demo-membership" },
    create: {
      id: "cm-demo-membership",
      groupId: group.id,
      userId: user.id,
      role: "ADMIN",
      startsAt: new Date("2026-02-01T00:00:00.000Z")
    },
    update: {}
  });

  revalidatePath("/import");
  redirect("/import");
}