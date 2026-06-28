import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, visitsTable, listingsTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { listingId, buyerName, buyerPhone, visitDate, userId } = req.body;

    const id = randomUUID();
    const [visit] = await db
      .insert(visitsTable)
      .values({ id, listingId, buyerName, buyerPhone, visitDate, userId, status: "pending" })
      .returning();

    await db
      .update(listingsTable)
      .set({ visitCount: (await db.select().from(listingsTable).where(eq(listingsTable.id, listingId)))[0]?.visitCount + 1 || 1 })
      .where(eq(listingsTable.id, listingId));

    res.status(201).json({ ...visit, createdAt: visit.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to schedule visit");
    res.status(500).json({ error: "Failed to schedule visit" });
  }
});

router.post("/:id/confirm", async (req, res) => {
  try {
    const { id } = req.params;
    const [visit] = await db.update(visitsTable).set({ status: "confirmed" }).where(eq(visitsTable.id, id)).returning();
    if (!visit) return void res.status(404).json({ error: "Not found" });
    res.json({ ...visit, createdAt: visit.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to confirm visit");
    res.status(500).json({ error: "Failed to confirm visit" });
  }
});

export default router;
