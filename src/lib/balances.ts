import { db } from "@/lib/db";

export async function getGroupBalances(groupId: string) {
  const [group, memberships, users, expenses, settlements] = await Promise.all([
    db.group.findUnique({ where: { id: groupId } }),
    db.membership.findMany({ where: { groupId } }),
    db.user.findMany({ where: { memberships: { some: { groupId } } } }),
    db.expense.findMany({ where: { groupId }, orderBy: { date: "asc" }, include: { splits: true } }),
    db.settlement.findMany({ where: { groupId }, orderBy: { date: "asc" } })
  ]);

  if (!group) {
    return null;
  }

  const rows = new Map<string, {
    userId: string;
    displayName: string;
    balanceMinor: number;
    contributedMinor: number;
    owedMinor: number;
    entries: Array<{ label: string; amountMinor: number; type: "expense" | "settlement"; date: Date }>;
  }>();

  for (const user of users) {
    rows.set(user.id, {
      userId: user.id,
      displayName: user.displayName,
      balanceMinor: 0,
      contributedMinor: 0,
      owedMinor: 0,
      entries: []
    });
  }

   const activeMembers = (expenseDate: Date) => memberships.filter((membership: (typeof memberships)[number]) => membership.startsAt <= expenseDate && (!membership.endsAt || membership.endsAt > expenseDate));

  for (const expense of expenses) {
    if (expense.paidById) {
      const payer = rows.get(expense.paidById);
      if (payer) {
        payer.balanceMinor += expense.amountMinor;
        payer.contributedMinor += expense.amountMinor;
        payer.entries.push({
          label: expense.description,
          amountMinor: expense.amountMinor,
          type: "expense",
          date: expense.date
        });
      }
    }

    const participants = activeMembers(expense.date).map((membership: (typeof memberships)[number]) => membership.userId);
    const splitMap = new Map<string, number>(expense.splits.map((split: (typeof expense.splits)[number]) => [split.userId, split.amountMinor] as const));
    const fallback = participants.length > 0 ? Math.floor(expense.amountMinor / participants.length) : 0;

    for (const participantId of participants) {
      const participant = rows.get(participantId);
      if (!participant) {
        continue;
      }

      const owed: number = splitMap.get(participantId) ?? fallback;
      participant.balanceMinor -= owed;
      participant.owedMinor += owed;
      participant.entries.push({
        label: expense.description,
        amountMinor: -owed,
        type: "expense",
        date: expense.date
      });
    }
  }

  for (const settlement of settlements) {
    const from = rows.get(settlement.fromUserId);
    const to = rows.get(settlement.toUserId);

    if (from) {
      from.balanceMinor += settlement.amountMinor;
      from.entries.push({
        label: settlement.note ?? "Settlement",
        amountMinor: settlement.amountMinor,
        type: "settlement",
        date: settlement.date
      });
    }

    if (to) {
      to.balanceMinor -= settlement.amountMinor;
      to.entries.push({
        label: settlement.note ?? "Settlement",
        amountMinor: -settlement.amountMinor,
        type: "settlement",
        date: settlement.date
      });
    }
  }

  return {
    group,
    users: Array.from(rows.values()).sort((left, right) => right.balanceMinor - left.balanceMinor)
  };
}