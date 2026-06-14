import { hashRow, normalizeCell, normalizeName, parseCsv } from "@/lib/csv";
import { toMinorUnits } from "@/lib/money";

export type ImportAction = "kept" | "normalized" | "flagged" | "skipped";

export type ImportAnomaly = {
  rowNumber: number;
  code: string;
  severity: "INFO" | "WARNING" | "ERROR";
  actionTaken: ImportAction;
  message: string;
  rawValue?: string;
};

export type ImportedExpenseRow = {
  rowNumber: number;
  sourceRowHash: string;
  date: string;
  description: string;
  paidBy: string;
  amountMinor: number;
  currency: string;
  splitType: "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARE" | "UNKNOWN";
  splitWith: string[];
  splitDetails: string;
  notes: string;
};

export type ImportResult = {
  rows: ImportedExpenseRow[];
  anomalies: ImportAnomaly[];
  summary: {
    totalRows: number;
    keptRows: number;
    normalizedRows: number;
    flaggedRows: number;
    skippedRows: number;
  };
};

const teamMembers = new Set(["aisha", "rohan", "priya", "meera", "dev", "sam"]);

export function importExpensesCsv(content: string): ImportResult {
  const csv = parseCsv(content);
  const rows: ImportedExpenseRow[] = [];
  const anomalies: ImportAnomaly[] = [];
  const seenRows = new Map<string, number>();

  csv.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const paidBy = normalizeCell(row.paid_by);
    const description = normalizeCell(row.description);
    const date = normalizeCell(row.date);
    const currency = normalizeCell(row.currency) || "INR";
    const splitTypeRaw = normalizeCell(row.split_type);
    const splitType = normalizeSplitType(splitTypeRaw);
    const splitWith = normalizeSplitWith(row.split_with);
    const splitDetails = normalizeCell(row.split_details);
    const notes = normalizeCell(row.notes);
    const hash = hashRow(row);
    const amountRaw = normalizeCell(row.amount);

    if (seenRows.has(hash)) {
      anomalies.push({
        rowNumber,
        code: "DUPLICATE_ROW",
        severity: "WARNING",
        actionTaken: "skipped",
        message: `Duplicate row matches row ${seenRows.get(hash)} and was skipped.`,
        rawValue: description
      });
      return;
    }

    seenRows.set(hash, rowNumber);

    if (!paidBy) {
      anomalies.push({
        rowNumber,
        code: "MISSING_PAYER",
        severity: "ERROR",
        actionTaken: "flagged",
        message: "Missing payer; the row stays in the report but cannot be imported as an expense."
      });
    }

    if (!teamMembers.has(normalizeName(paidBy))) {
      anomalies.push({
        rowNumber,
        code: "UNKNOWN_PAYER",
        severity: "WARNING",
        actionTaken: "flagged",
        message: `Payer ${paidBy || "(blank)"} is not a canonical member name and needs review.`,
        rawValue: paidBy
      });
    }

    if (!currency) {
      anomalies.push({
        rowNumber,
        code: "MISSING_CURRENCY",
        severity: "ERROR",
        actionTaken: "flagged",
        message: "Missing currency; defaulting is not safe for import."
      });
    }

    if (!splitTypeRaw) {
      anomalies.push({
        rowNumber,
        code: "MISSING_SPLIT_TYPE",
        severity: "ERROR",
        actionTaken: "flagged",
        message: "Missing split type; row needs manual classification."
      });
    }

    if (!amountRaw) {
      anomalies.push({
        rowNumber,
        code: "MISSING_AMOUNT",
        severity: "ERROR",
        actionTaken: "flagged",
        message: "Missing amount; row cannot be imported."
      });
    }

    const amountMinor = amountRaw ? toMinorUnits(amountRaw, currency) : 0;

    if (amountMinor < 0) {
      anomalies.push({
        rowNumber,
        code: "NEGATIVE_AMOUNT",
        severity: "INFO",
        actionTaken: "normalized",
        message: "Negative amount is treated as a refund/reversal and kept as-is.",
        rawValue: amountRaw
      });
    }

    if (splitType === "UNKNOWN") {
      anomalies.push({
        rowNumber,
        code: "UNSUPPORTED_SPLIT_TYPE",
        severity: "ERROR",
        actionTaken: "flagged",
        message: `Split type ${splitTypeRaw || "(blank)"} is not supported yet.`,
        rawValue: splitTypeRaw
      });
    }

    if (currency === "INR" && /\d+\.\d+/.test(amountRaw)) {
      anomalies.push({
        rowNumber,
        code: "DECIMAL_IN_INR",
        severity: "INFO",
        actionTaken: "normalized",
        message: "INR decimal amount was rounded to the nearest rupee."
      });
    }

    if (/\bmeera\b/i.test(notes) && /2026-04|04\/2026|April/i.test(date)) {
      anomalies.push({
        rowNumber,
        code: "MEMBERSHIP_CHANGE_REVIEW",
        severity: "WARNING",
        actionTaken: "flagged",
        message: "Membership changed around this date and needs validation before final settlement."
      });
    }

    rows.push({
      rowNumber,
      sourceRowHash: hash,
      date,
      description,
      paidBy,
      amountMinor,
      currency,
      splitType,
      splitWith,
      splitDetails,
      notes
    });
  });

  const keptRows = anomalies.filter((item) => item.actionTaken === "kept").length;
  const normalizedRows = anomalies.filter((item) => item.actionTaken === "normalized").length;
  const flaggedRows = anomalies.filter((item) => item.actionTaken === "flagged").length;
  const skippedRows = anomalies.filter((item) => item.actionTaken === "skipped").length;

  return {
    rows,
    anomalies,
    summary: {
      totalRows: csv.rows.length,
      keptRows,
      normalizedRows,
      flaggedRows,
      skippedRows
    }
  };
}

function normalizeSplitType(value: string): ImportedExpenseRow["splitType"] {
  const normalized = value.toLowerCase();

  if (normalized === "equal") return "EQUAL";
  if (normalized === "unequal") return "UNEQUAL";
  if (normalized === "percentage") return "PERCENTAGE";
  if (normalized === "share") return "SHARE";

  return "UNKNOWN";
}

function normalizeSplitWith(value: string | undefined): string[] {
  const normalized = normalizeCell(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(";")
    .map((entry) => normalizeCell(entry))
    .filter(Boolean);
}