import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { generateOtp, saveOtp, verifyOtp, hasActiveOtp } from "../lib/otp-store";
import { sendEmailOtp } from "../lib/mailer";
import { sendSmsOtp } from "../lib/sms";
import { sanitizeString } from "../lib/sanitize";
import { logger } from "../lib/logger";

const router = Router();

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body?.phone || req.ip || "unknown",
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP requests. Please wait 15 minutes." },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.body?.phone || req.ip || "unknown",
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts. Please wait." },
});

router.post("/send-otp", otpSendLimiter, async (req, res) => {
  const rawPhone = String(req.body?.phone || "").replace(/\D/g, "").slice(-10);
  const rawEmail = sanitizeString(String(req.body?.email || ""));
  const rawName = req.body?.name ? sanitizeString(String(req.body.name)) : undefined;

  if (!rawPhone || rawPhone.length !== 10) {
    res.status(400).json({ error: "Enter a valid 10-digit phone number" });
    return;
  }
  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    res.status(400).json({ error: "Enter a valid email address" });
    return;
  }

  const key = `otp:${rawPhone}`;

  if (hasActiveOtp(key)) {
    res.status(429).json({ error: "An OTP was already sent. Please wait a moment before requesting again." });
    return;
  }

  const otp = generateOtp();
  saveOtp(key, otp);

  const isDev = !process.env.GMAIL_USER && !process.env.FAST2SMS_API_KEY;

  try {
    await Promise.allSettled([
      sendEmailOtp(rawEmail, otp, rawName),
      sendSmsOtp(rawPhone, otp),
    ]);
  } catch (err) {
    req.log.error({ err }, "OTP delivery error");
  }

  logger.info({ phone: rawPhone.slice(0, 6) + "XXXX", isDev }, "OTP sent");

  res.json({
    message: `OTP sent to +91-${rawPhone.slice(0, 2)}XXXXXXXX and your email`,
    ...(isDev ? { devOtp: otp } : {}),
  });
});

router.post("/verify-otp", otpVerifyLimiter, (req, res) => {
  const rawPhone = String(req.body?.phone || "").replace(/\D/g, "").slice(-10);
  const rawEmail = sanitizeString(String(req.body?.email || ""));
  const rawName = req.body?.name ? sanitizeString(String(req.body.name)) : rawEmail.split("@")[0];
  const otp = String(req.body?.otp || "").replace(/\D/g, "");

  if (!rawPhone || rawPhone.length !== 10) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }
  if (!otp || otp.length !== 6) {
    res.status(400).json({ error: "Enter the 6-digit OTP" });
    return;
  }

  const key = `otp:${rawPhone}`;
  const result = verifyOtp(key, otp);

  if (result === "valid") {
    const user = { name: rawName, email: rawEmail, phone: rawPhone };
    // Set server-side session (httpOnly cookie)
    req.session.user = user;
    req.session.save((err) => {
      if (err) {
        req.log.error({ err }, "Session save failed");
        res.status(500).json({ error: "Session error. Please try again." });
        return;
      }
      logger.info({ phone: rawPhone.slice(0, 6) + "XXXX" }, "User session created");
      res.json({ user });
    });
    return;
  }

  const messages: Record<"invalid" | "expired" | "too_many", string> = {
    invalid: "Wrong OTP. Please check and try again.",
    expired: "OTP has expired. Please request a new one.",
    too_many: "Too many wrong attempts. Please request a new OTP.",
  };

  res.status(400).json({ error: messages[result] });
});

// Get current session user
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Logout — destroy session
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error({ err }, "Session destroy failed");
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
