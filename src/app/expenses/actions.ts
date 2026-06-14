"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { normalizeCell } from "@/lib/csv";
import { parseSplitAllocations } from "@/lib/splits";

export async function createExpenseAction(formData: FormData) {
  const user = await requireUser();
  const groupId = String(formData.get("groupId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amountMinor = Number(String(formData.get("amountMinor") ?? "0"));
  const currency = String(formData.get("currency") ?? "INR").trim().toUpperCase();
  const paidById = String(formData.get("paidById") ?? user.id);
  const splitType = String(formData.get("splitType") ?? "EQUAL").trim().toUpperCase() as "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARE";
  const splitWith = String(formData.get("splitWith") ?? "").split(",").map(normalizeCell).filter(Boolean);
  const splitDetails = String(formData.get("splitDetails") ?? "");
  const date = new Date(String(formData.get("date") ?? new Date().toISOString()));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!groupId || !description || !Number.isFinite(amountMinor)) {
    redirect("/expenses?error=missing-fields");
  }

  const expense = await db.expense.create({
    data: {
      groupId,
      paidById,
      importedById: user.id,
      date,
      description,
      amountMinor: Math.round(amountMinor),
      currency,
      splitType,
      notes
    }
  });

  const allocations = parseSplitAllocations(splitType, splitWith, splitDetails, Math.round(amountMinor));

  if (allocations.length > 0) {
    const users = await db.user.findMany({ where: { name: { in: splitWith } } });
    const userMap = new Map<string, (typeof users)[number]>(users.map((entry: (typeof users)[number]) => [entry.name, entry] as const));

    await db.expenseSplit.createMany({
      data: allocations.map((allocation) => ({
        expenseId: expense.id,
        userId: userMap.get(allocation.name)?.id ?? paidById,
        amountMinor: allocation.amountMinor,
        shareValue: null
      }))
    });
  }

  revalidatePath("/expenses");
  revalidatePath("/balances");
  redirect("/expenses");
}

export async function createSettlementAction(formData: FormData) {
  const user = await requireUser();
  const groupId = String(formData.get("groupId") ?? "");
  const fromUserId = String(formData.get("fromUserId") ?? "");
  const toUserId = String(formData.get("toUserId") ?? "");
  const amountMinor = Number(String(formData.get("amountMinor") ?? "0"));
  const currency = String(formData.get("currency") ?? "INR").trim().toUpperCase();
  const note = String(formData.get("note") ?? "").trim();
  const date = new Date(String(formData.get("date") ?? new Date().toISOString()));

  if (!groupId || !fromUserId || !toUserId || !Number.isFinite(amountMinor)) {
    redirect("/expenses?error=missing-settlement-fields");
  }

  await db.settlement.create({
    data: {
      groupId,
      fromUserId,
      toUserId,
      amountMinor: Math.round(amountMinor),
      currency,
      note: note || `Recorded by ${user.displayName}`,
      date
    }
  });

  revalidatePath("/expenses");
  revalidatePath("/balances");
  redirect("/expenses");
}