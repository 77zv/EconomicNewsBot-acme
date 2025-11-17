import crypto from "crypto";

/**
 * Generates a unique hash for a news event based on title, date, impact, and currency
 * This matches the unique constraint in the NewsEvent model
 */
export function generateNewsEventHash(
  title: string,
  date: string,
  impact: string,
  currency: string
): string {
  const hashInput = `${title}|${date}|${impact}|${currency}`;
  return crypto.createHash("sha256").update(hashInput).digest("hex");
}

