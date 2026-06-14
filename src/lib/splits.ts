import { normalizeCell } from "@/lib/csv";

export type SplitType = "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARE";

export type SplitAllocation = {
  name: string;
  amountMinor: number;
};

export function parseSplitAllocations(
  splitType: SplitType,
  splitWith: string[],
  splitDetails: string,
  amountMinor: number
): SplitAllocation[] {
  if (splitWith.length === 0) {
    return [];
  }

  if (splitType === "EQUAL") {
    const baseAmount = Math.floor(amountMinor / splitWith.length);
    return splitWith.map((name, index) => ({
      name,
      amountMinor: index === splitWith.length - 1 ? amountMinor - baseAmount * (splitWith.length - 1) : baseAmount
    }));
  }

  if (splitType === "UNEQUAL") {
    const allocations = new Map<string, number>();

    splitDetails.split(";").forEach((entry) => {
      const [namePart, amountPart] = entry.trim().split(/\s+/, 2);
      if (!namePart || !amountPart) {
        return;
      }

      const numeric = Number(normalizeCell(amountPart).replace(/[^\d.-]/g, ""));
      if (Number.isFinite(numeric)) {
        allocations.set(normalizeCell(namePart), Math.round(numeric));
      }
    });

    return splitWith.map((name) => ({
      name,
      amountMinor: allocations.get(name) ?? 0
    }));
  }

  if (splitType === "PERCENTAGE") {
    const percentages = new Map<string, number>();

    splitDetails.split(";").forEach((entry) => {
      const match = entry.trim().match(/^(.+?)\s+([\d.]+)%$/);
      if (!match) {
        return;
      }

      percentages.set(normalizeCell(match[1]), Number(match[2]));
    });

    return splitWith.map((name, index) => {
      const rawAmount = Math.round((amountMinor * (percentages.get(name) ?? 0)) / 100);
      return {
        name,
        amountMinor: index === splitWith.length - 1
          ? amountMinor - splitWith.slice(0, -1).reduce((sum, currentName) => sum + Math.round((amountMinor * (percentages.get(currentName) ?? 0)) / 100), 0)
          : rawAmount
      };
    });
  }

  const shares = new Map<string, number>();

  splitDetails.split(";").forEach((entry) => {
    const match = entry.trim().match(/^(.+?)\s+([\d.]+)$/);
    if (!match) {
      return;
    }

    shares.set(normalizeCell(match[1]), Number(match[2]));
  });

  const totalShares = Array.from(shares.values()).reduce((sum, value) => sum + value, 0) || splitWith.length;

  return splitWith.map((name, index) => {
    const share = shares.get(name) ?? 1;
    const rawAmount = Math.round((amountMinor * share) / totalShares);
    return {
      name,
      amountMinor: index === splitWith.length - 1
        ? amountMinor - splitWith.slice(0, -1).reduce((sum, currentName) => sum + Math.round((amountMinor * (shares.get(currentName) ?? 1)) / totalShares), 0)
        : rawAmount
    };
  });
}