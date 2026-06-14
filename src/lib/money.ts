export function toMinorUnits(amount: string | number, currency: string): number {
  const parsed = typeof amount === "number" ? amount : Number(String(amount).replace(/,/g, "").trim());

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  if (currency === "USD") {
    return Math.round(parsed * 100);
  }

  return Math.round(parsed);
}

export function formatMinorUnits(minorUnits: number, currency: string): string {
  const isUsd = currency === "USD";
  const absolute = Math.abs(minorUnits);
  const whole = isUsd ? (absolute / 100).toFixed(2) : String(absolute);
  return `${minorUnits < 0 ? "-" : ""}${currency} ${whole}`;
}