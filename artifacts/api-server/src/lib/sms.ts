import { logger } from "./logger";

export async function sendSmsOtp(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    logger.warn({ phone, otp }, "SMS not configured — OTP logged for dev");
    return;
  }

  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "otp",
      variables_values: otp,
      numbers: phone,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "unknown");
    logger.error({ phone, status: res.status, body }, "Fast2SMS error");
    throw new Error("SMS delivery failed");
  }
}
