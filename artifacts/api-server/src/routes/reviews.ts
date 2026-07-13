import { Router } from "express";
import { eq, and, avg, count } from "drizzle-orm";
import { db, reviewsTable, listingsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import { writeLimiter, strictLimiter } from "../lib/rate-limit";
import { sanitizeString } from "../lib/sanitize";

const router = Router();

router.get("/:listingId", async (req, res) => {
  try {
    const listingId = req.params["listingId"] as string;
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.listingId, listingId))
      .orderBy(reviewsTable.createdAt);

    res.json(reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get reviews");
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

router.post("/", writeLimiter, async (req, res) => {
  try {
    const { listingId, reviewerId, reviewerName, rating, comment } = req.body;

    if (!listingId || !reviewerId || !reviewerName) {
      return void res.status(400).json({ error: "listingId, reviewerId, and reviewerName are required" });
    }

    const safeRating = parseInt(String(rating), 10);
    if (!safeRating || safeRating < 1 || safeRating > 5) {
      return void res.status(400).json({ error: "Rating must be 1–5" });
    }

    const safeComment = sanitizeString(comment, 200);
    if (safeComment.length < 10) {
      return void res.status(400).json({ error: "Comment must be at least 10 characters" });
    }

    const safeListingId = sanitizeString(listingId, 50);
    const safeReviewerId = sanitizeString(reviewerId, 150);

    const listing = await db.select().from(listingsTable).where(eq(listingsTable.id, safeListingId));
    if (!listing.length) return void res.status(404).json({ error: "Listing not found" });

    const existing = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.listingId, safeListingId), eq(reviewsTable.reviewerId, safeReviewerId)));

    if (existing.length > 0) {
      return void res.status(409).json({ error: "You have already reviewed this property" });
    }

    const [review] = await db
      .insert(reviewsTable)
      .values({
        id: randomUUID(),
        listingId: safeListingId,
        reviewerId: safeReviewerId,
        reviewerName: sanitizeString(reviewerName, 100),
        rating: safeRating,
        comment: safeComment,
      })
      .returning();

    const [stats] = await db
      .select({ avg: avg(reviewsTable.rating), cnt: count() })
      .from(reviewsTable)
      .where(eq(reviewsTable.listingId, safeListingId));

    await db
      .update(listingsTable)
      .set({
        rating: Math.round(Number(stats.avg) * 10) / 10,
        reviewCount: Number(stats.cnt),
      })
      .where(eq(listingsTable.id, safeListingId));

    res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to submit review");
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.patch("/:id/reply", strictLimiter, async (req, res) => {
  try {
    const id = req.params["id"] as string;
    const { ownerReply } = req.body;

    const safeReply = sanitizeString(ownerReply, 300);
    if (!safeReply) return void res.status(400).json({ error: "Reply text required" });

    const [review] = await db
      .update(reviewsTable)
      .set({ ownerReply: safeReply })
      .where(eq(reviewsTable.id, id))
      .returning();

    if (!review) return void res.status(404).json({ error: "Review not found" });
    res.json({ ...review, createdAt: review.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to post reply");
    res.status(500).json({ error: "Failed to post reply" });
  }
});

export default router;
