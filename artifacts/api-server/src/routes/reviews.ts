import { Router } from "express";
import { eq, and, avg, count } from "drizzle-orm";
import { db, reviewsTable, visitsTable, listingsTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router = Router();

router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
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

router.post("/", async (req, res) => {
  try {
    const { listingId, reviewerId, reviewerName, rating, comment } = req.body;

    if (!listingId || !reviewerId || !reviewerName || !rating || !comment) {
      return void res.status(400).json({ error: "Missing required fields" });
    }
    if (rating < 1 || rating > 5) {
      return void res.status(400).json({ error: "Rating must be 1-5" });
    }
    if (comment.length > 200) {
      return void res.status(400).json({ error: "Comment too long" });
    }

    const existing = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.listingId, listingId), eq(reviewsTable.reviewerId, reviewerId)));

    if (existing.length > 0) {
      return void res.status(409).json({ error: "You have already reviewed this property" });
    }

    const [review] = await db
      .insert(reviewsTable)
      .values({ id: randomUUID(), listingId, reviewerId, reviewerName, rating, comment })
      .returning();

    const [stats] = await db
      .select({ avg: avg(reviewsTable.rating), cnt: count() })
      .from(reviewsTable)
      .where(eq(reviewsTable.listingId, listingId));

    await db
      .update(listingsTable)
      .set({
        rating: Math.round(Number(stats.avg) * 10) / 10,
        reviewCount: Number(stats.cnt),
      })
      .where(eq(listingsTable.id, listingId));

    res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to submit review");
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.patch("/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerReply } = req.body;
    if (!ownerReply) return void res.status(400).json({ error: "Reply text required" });

    const [review] = await db
      .update(reviewsTable)
      .set({ ownerReply })
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
