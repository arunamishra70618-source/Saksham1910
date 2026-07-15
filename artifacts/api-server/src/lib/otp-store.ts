interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function saveOtp(key: string, otp: string): void {
  store.set(key, { otp, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
}

export type OtpResult = "valid" | "invalid" | "expired" | "too_many";

export function verifyOtp(key: string, otp: string): OtpResult {
  const entry = store.get(key);
  if (!entry) return "invalid";
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return "expired";
  }
  if (entry.attempts >= MAX_ATTEMPTS) return "too_many";
  entry.attempts++;
  if (entry.otp !== otp) return "invalid";
  store.delete(key);
  return "valid";
}

export function hasActiveOtp(key: string): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { store.delete(key); return false; }
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
}, 5 * 60 * 1000);
