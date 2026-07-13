import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable, listingsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import { writeLimiter } from "../lib/rate-limit";
import { sanitizeString, sanitizeArray } from "../lib/sanitize";

const router = Router();

router.post("/", writeLimiter, async (req, res) => {
  try {
    const { listingId, reporterId, reasons, details } = req.body;

    if (!listingId || !reporterId || !Array.isArray(reasons) || reasons.length === 0) {
      return void res.status(400).json({ error: "listingId, reporterId, and at least one reason are required" });
    }

    const listing = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
    if (!listing.length) return void res.status(404).json({ error: "Listing not found" });

    const id = randomUUID();
    const [report] = await db
      .insert(reportsTable)
      .values({
        id,
        listingId: sanitizeString(listingId, 50),
        reporterId: sanitizeString(reporterId, 100),
        reasons: sanitizeArray(reasons, 10, 100),
        details: details ? sanitizeString(details, 500) : null,
      })
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
