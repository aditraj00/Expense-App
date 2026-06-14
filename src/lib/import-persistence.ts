import { db } from "@/lib/db";
import { importExpensesCsv } from "@/lib/importer";
import { hashPassword } from "@/lib/auth";
import { normalizeCell, normalizeName } from "@/lib/csv";

type PersistOptions = {
  fileName: string;
  groupId: string;
  importedById?: string;
};

export async function persistImport(content: string, options: PersistOptions) {
  const report = importExpensesCsv(content);

  const importRun = await db.importRun.create({
    data: {
      groupId: options.groupId,
      importedById: options.importedById,
      fileName: options.fileName,
      status: "completed",
      summary: report.summary
    }
  });

  await db.importAnomaly.createMany({
    data: report.anomalies.map((anomaly) => ({
      importRunId: importRun.id,
      rowNumber: anomaly.rowNumber,
      severity: anomaly.severity,
      actionTaken: mapAction(anomaly.actionTaken),
      code: anomaly.code,
      message: anomaly.message,
      rawValue: anomaly.rawValue
    }))
  });

  const canonicalUsers = await ensureCanonicalUsers();
  const canonicalUserMap = new Map(canonicalUsers.map((user) => [normalizeName(user.name), user]));

  for (const row of report.rows) {
    const rowErrors = report.anomalies.filter((anomaly) => anomaly.rowNumber === row.rowNumber && anomaly.severity === "ERROR");

    if (rowErrors.length > 0) {
      continue;
    }

    const payer = canonicalUserMap.get(normalizeName(row.paidBy));
    const expense = await db.expense.create({
      data: {
        groupId: options.groupId,
        paidById: payer?.id ?? null,
        importedById: options.importedById ?? null,
        date: parseFlexibleDate(row.date),
        description: row.description,
        amountMinor: row.amountMinor,
        currency: row.currency,
        splitType: row.splitType === "UNKNOWN" ? "EQUAL" : row.splitType,
        sourceRowHash: row.sourceRowHash,
        sourceRowLabel: `${row.rowNumber}:${row.description}`,
        notes: row.notes
      }
    });

    const splitWithUsers = row.splitWith
      .map((memberName) => canonicalUserMap.get(normalizeName(memberName)))
      .filter((member): member is NonNullable<typeof member> => Boolean(member));

    if (splitWithUsers.length > 0) {
      const allocations = splitWithUsers.map((member) => ({
        expenseId: expense.id,
        userId: member.id,
        amountMinor: Math.floor(row.amountMinor / splitWithUsers.length),
        shareValue: null as number | null
      }));

      allocations[allocations.length - 1].amountMinor = row.amountMinor - allocations.slice(0, -1).reduce((sum, allocation) => sum + allocation.amountMinor, 0);

      await db.expenseSplit.createMany({
        data: allocations
      });
    }
  }

  return report;
}

function mapAction(action: string) {
  if (action === "normalized") return "NORMALIZED";
  if (action === "flagged") return "FLAGGED";
  if (action === "skipped") return "SKIPPED";
  return "KEPT";
}

function parseFlexibleDate(value: string) {
  const normalized = normalizeCell(value);
  const isoMatch = normalized.match(/^\d{4}-\d{2}-\d{2}$/);

  if (isoMatch) {
    return new Date(`${normalized}T00:00:00.000Z`);
  }

  const slashMatch = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00.000Z`);
  }

  const textDate = new Date(normalized);
  if (!Number.isNaN(textDate.getTime())) {
    return textDate;
  }

  return new Date();
}

async function ensureCanonicalUsers() {
  const baseUsers = [
    ["Aisha", "Aisha"],
    ["Rohan", "Rohan"],
    ["Priya", "Priya"],
    ["Meera", "Meera"],
    ["Dev", "Dev"],
    ["Sam", "Sam"]
  ] as const;

  const created = [] as Awaited<ReturnType<typeof db.user.findMany>>;

  for (const [name, displayName] of baseUsers) {
    const user = await db.user.upsert({
      where: { name },
      create: {
        name,
        displayName,
        passwordHash: hashPassword("password123")
      },
      update: {
        displayName
      }
    });

    created.push(user);
  }

  return created;
}