import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable, listingsTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { listingId, reporterId, reasons, details } = req.body;

    const id = randomUUID();
    const [report] = await db
      .insert(reportsTable)
      .values({ id, listingId, reporterId, reasons, details: details || null })
      .returning();

    const allReports = await db.select().from(reportsTable).where(eq(reportsTable.listingId, listingId));
    const count = allReports.length;

    await db
      .update(listingsTable)
      .set({ fraudReportCount: count, isHidden: count >= 3 })
      .where(eq(listingsTable.id, listingId));

    res.status(201).json({ ...report, createdAt: report.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create report");
    res.status(500).json({ error: "Failed to create report" });
  }
});

router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const reports = await db.select().from(reportsTable).where(eq(reportsTable.listingId, listingId));
    res.json(reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get reports");
    res.status(500).json({ error: "Failed to get reports" });
  }
});

export default router;
