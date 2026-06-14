import { createHash } from "crypto";

export type ParsedCsvRow = Record<string, string>;

export type CsvParseResult = {
  headers: string[];
  rows: ParsedCsvRow[];
};

export function parseCsv(content: string): CsvParseResult {
  const rows = content
    .trim()
    .split(/\r?\n/)
    .map((line) => splitCsvLine(line));

  const headers = rows.shift();

  if (!headers) {
    throw new Error("CSV is empty");
  }

  return {
    headers,
    rows: rows.map((row) => {
      const parsedRow: ParsedCsvRow = {};

      headers.forEach((header, index) => {
        parsedRow[header] = row[index] ?? "";
      });

      return parsedRow;
    })
  };
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      const nextCharacter = line[index + 1];
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

export function normalizeCell(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function normalizeName(value: string | undefined): string {
  return normalizeCell(value).toLowerCase();
}

export function hashRow(row: ParsedCsvRow): string {
  return createHash("sha1").update(JSON.stringify(row)).digest("hex");
}