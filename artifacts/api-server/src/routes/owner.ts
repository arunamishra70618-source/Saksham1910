import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, listingsTable, visitsTable } from "@workspace/db";

const router = Router();

router.get("/dashboard/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    const listings = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.ownerPhone, phone));

    const listingIds = listings.map((l) => l.id);

    let totalVisits = 0;
    let pendingVisits = 0;
    let confirmedVisits = 0;

    const visitsByListing: Record<string, { total: number; pending: number; confirmed: number }> = {};

    if (listingIds.length > 0) {
      for (const lid of listingIds) {
        const visits = await db.select().from(visitsTable).where(eq(visitsTable.listingId, lid));
        const pending = visits.filter((v) => v.status === "pending").length;
        const confirmed = visits.filter((v) => v.status === "confirmed").length;
        totalVisits += visits.length;
        pendingVisits += pending;
        confirmedVisits += confirmed;
        visitsByListing[lid] = { total: visits.length, pending, confirmed };
      }
    }

    const activeListings = listings.filter((l) => !l.isHidden);
    const totalViews = listings.reduce((sum, l) => sum + l.visitCount, 0);
    const avgRating =
      listings.length > 0
        ? Math.round((listings.reduce((sum, l) => sum + l.rating, 0) / listings.length) * 10) / 10
        : 0;

    const listingStats = listings.map((l) => ({
      id: l.id,
      name: l.name,
      area: l.area,
      type: l.type,
      rent: l.rent,
      isHidden: l.isHidden,
      verificationStatus: l.verificationStatus,
      visitCount: visitsByListing[l.id]?.total ?? 0,
      pendingVisits: visitsByListing[l.id]?.pending ?? 0,
      confirmedVisits: visitsByListing[l.id]?.confirmed ?? 0,
      reviewCount: l.reviewCount,
      rating: l.rating,
      fraudReportCount: l.fraudReportCount,
      createdAt: l.createdAt.toISOString(),
    }));

    res.json({
      totalListings: listings.length,
      activeListings: activeListings.length,
      totalViews,
      totalVisits,
      pendingVisits,
      confirmedVisits,
      avgRating,
      listings: listingStats,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get owner dashboard");
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;
