import { createHash, randomBytes } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}