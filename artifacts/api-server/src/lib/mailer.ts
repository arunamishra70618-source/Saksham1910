import nodemailer from "nodemailer";
import { logger } from "./logger";

export async function sendEmailOtp(
  email: string,
  otp: string,
  name?: string
): Promise<void> {
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    logger.warn({ email, otp }, "Email not configured — OTP logged for dev");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  const greeting = name ? `Hi ${name},` : "Hello,";

  await transporter.sendMail({
    from: `"PG.com" <${GMAIL_USER}>`,
    to: email,
    subject: `${otp} — Your PG.com login OTP`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#7C3AED;margin-bottom:4px">PG.com</h2>
        <p style="color:#64748b;font-size:13px;margin-top:0">Zero broker. Real homes. Safe deals.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
        <p style="font-size:15px;color:#1e293b">${greeting}</p>
        <p style="font-size:15px;color:#1e293b">Your one-time login code is:</p>
        <div style="background:#f8f5ff;border:1px solid #c4b5fd;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#7C3AED">${otp}</span>
        </div>
        <p style="font-size:13px;color:#64748b">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="font-size:12px;color:#94a3b8;margin-top:24px">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}
