export function sanitizeString(val: unknown, maxLen = 500): string {
  if (typeof val !== "string") return "";
  return val
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .slice(0, maxLen);
}

export function sanitizePhone(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.replace(/\D/g, "").slice(0, 15);
}

export function sanitizeInt(val: unknown, min = 0, max = 9_999_999): number {
  const n = parseInt(String(val), 10);
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export function sanitizeArray(val: unknown, maxItems = 20, maxItemLen = 100): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .slice(0, maxItems)
    .map((v) => sanitizeString(v, maxItemLen))
    .filter(Boolean);
}
