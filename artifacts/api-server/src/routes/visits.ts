import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, visitsTable, listingsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import { writeLimiter } from "../lib/rate-limit";
import { sanitizeString, sanitizePhone } from "../lib/sanitize";

const router = Router();

router.post("/", writeLimiter, async (req, res) => {
  try {
    const { listingId, buyerName, buyerPhone, visitDate, userId } = req.body;

    if (!listingId || !buyerName || !buyerPhone || !visitDate || !userId) {
      return void res.status(400).json({ error: "All fields are required" });
    }

    const safePhone = sanitizePhone(buyerPhone);
    if (safePhone.length < 10) {
      return void res.status(400).json({ error: "Invalid phone number" });
    }

    const parsedDate = new Date(visitDate);
    if (isNaN(parsedDate.getTime())) {
      return void res.status(400).json({ error: "Invalid visit date" });
    }

    const safeListingId = sanitizeString(listingId, 50);
    const listing = await db.select().from(listingsTable).where(eq(listingsTable.id, safeListingId));
    if (!listing.length) return void res.status(404).json({ error: "Listing not found" });

    const id = randomUUID();
    const [visit] = await db
      .insert(visitsTable)
      .values({
        id,
        listingId: safeListingId,
        buyerName: sanitizeString(buyerName, 100),
        buyerPhone: safePhone,
        visitDate: parsedDate.toISOString(),
        userId: sanitizeString(userId, 150),
        status: "pending",
      })
      .returning();

    await db
      .update(listingsTable)
      .set({ visitCount: (listing[0].visitCount ?? 0) + 1 })
      .where(eq(listingsTable.id, safeListingId));

    res.status(201).json({ ...visit, createdAt: visit.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to schedule visit");
    res.status(500).json({ error: "Failed to schedule visit" });
  }
});

router.post("/:id/confirm", async (req, res) => {
  try {
    const id = req.params["id"] as string;
    const [visit] = await db.update(visitsTable).set({ status: "confirmed" }).where(eq(visitsTable.id, id)).returning();
    if (!visit) return void res.status(404).json({ error: "Not found" });
    res.json({ ...visit, createdAt: visit.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to confirm visit");
    res.status(500).json({ error: "Failed to confirm visit" });
  }
});

export default router;
