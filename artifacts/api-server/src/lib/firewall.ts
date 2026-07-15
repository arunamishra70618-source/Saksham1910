import { type Request, type Response, type NextFunction } from "express";
import { logger } from "./logger";

const failedAttempts = new Map<string, { count: number; firstAt: number; blockedUntil?: number }>();

const XSS_PATTERNS = [/<script/i, /javascript:/i, /on\w+\s*=/i, /eval\s*\(/i, /document\.cookie/i];
const SQLI_PATTERNS = [/'\s*(or|and)\s*'?\d/i, /union\s+select/i, /drop\s+table/i, /;\s*delete\s+/i, /--\s*$/m];

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}

export function isSuspicious(value: string): boolean {
  return XSS_PATTERNS.some((p) => p.test(value)) || SQLI_PATTERNS.some((p) => p.test(value));
}

export function firewallMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const now = Date.now();

  const suspicious =
    Object.values(req.query).some((v) => typeof v === "string" && isSuspicious(v)) ||
    (req.body && typeof req.body === "object" &&
      Object.values(req.body as Record<string, unknown>).some(
        (v) => typeof v === "string" && isSuspicious(v)
      ));

  if (suspicious) {
    logger.warn({ ip, url: req.url, method: req.method }, "Suspicious request blocked by firewall");
    return void res.status(400).json({ error: "Bad request" });
  }

  next();
}

export function adminBruteForceGuard(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const now = Date.now();
  const WINDOW = 15 * 60 * 1000;
  const MAX_FAILS = 5;
  const BLOCK_DURATION = 30 * 60 * 1000;

  const record = failedAttempts.get(ip);

  if (record?.blockedUntil && now < record.blockedUntil) {
    const remainMin = Math.ceil((record.blockedUntil - now) / 60000);
    logger.warn({ ip }, `Blocked IP attempted admin access`);
    return void res.status(429).json({
      error: `Too many failed attempts. Blocked for ${remainMin} more minute(s).`,
    });
  }

  if (record && now - record.firstAt > WINDOW) {
    failedAttempts.delete(ip);
  }

  next();
}

export function recordAdminFailure(ip: string) {
  const now = Date.now();
  const WINDOW = 15 * 60 * 1000;
  const MAX_FAILS = 5;
  const BLOCK_DURATION = 30 * 60 * 1000;

  const record = failedAttempts.get(ip) ?? { count: 0, firstAt: now };
  record.count += 1;

  if (record.count >= MAX_FAILS) {
    record.blockedUntil = now + BLOCK_DURATION;
    logger.error({ ip, count: record.count }, "Admin IP blocked after repeated failures");
  }

  failedAttempts.set(ip, record);
}

export function clearAdminFailures(ip: string) {
  failedAttempts.delete(ip);
}

export function getClientIpFromReq(req: Request): string {
  return getClientIp(req);
}
