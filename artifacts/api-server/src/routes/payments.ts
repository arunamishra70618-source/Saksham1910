import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, paymentsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { randomUUID, createHmac } from "crypto";
import { createRequire } from "module";

const router = Router();

const _require = createRequire(import.meta.url);

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  const Razorpay = _require("razorpay");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post("/create-order", async (req, res) => {
  try {
    const { listingId, buyerId, amount } = req.body;
    const razorpay = getRazorpay();
    let orderId: string;

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        notes: { listingId, buyerId },
      });
      orderId = order.id;
    } else {
      orderId = `order_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      logger.warn("Razorpay not configured — using mock order ID");
    }

    await db.insert(paymentsTable).values({
      id: randomUUID(),
      listingId,
      buyerId,
      orderId,
      amount,
      status: "pending",
    });

    res.status(201).json({
      orderId,
      amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create escrow order");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.post("/confirm", async (req, res) => {
  try {
    const { orderId, paymentId, signature, listingId, buyerId } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret) {
      const expected = createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
      if (expected !== signature) {
        return void res.status(400).json({ success: false, message: "Invalid payment signature" });
      }
    }

    await db
      .update(paymentsTable)
      .set({ paymentId, status: "held" })
      .where(eq(paymentsTable.orderId, orderId));

    res.json({ success: true, message: "Payment confirmed and held in escrow" });
  } catch (err) {
    req.log.error({ err }, "Failed to confirm payment");
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

router.post("/release", async (req, res) => {
  try {
    const { paymentId } = req.body;
    await db
      .update(paymentsTable)
      .set({ status: "released" })
      .where(eq(paymentsTable.paymentId, paymentId));
    res.json({ success: true, message: "Payment released to owner" });
  } catch (err) {
    req.log.error({ err }, "Failed to release escrow");
    res.status(500).json({ error: "Failed to release escrow" });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const { paymentId } = req.body;
    const razorpay = getRazorpay();

    if (razorpay && paymentId && !paymentId.startsWith("order_")) {
      await razorpay.payments.refund(paymentId, {});
    }

    await db
      .update(paymentsTable)
      .set({ status: "refunded" })
      .where(eq(paymentsTable.paymentId, paymentId));

    res.json({ success: true, message: "Payment refunded to buyer" });
  } catch (err) {
    req.log.error({ err }, "Failed to refund escrow");
    res.status(500).json({ error: "Failed to refund" });
  }
});

export default router;
