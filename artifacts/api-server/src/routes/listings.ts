import { Router } from "express";
import { eq, and, gte, lte, ilike, or } from "drizzle-orm";
import { db, listingsTable, savedListingsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { randomUUID } from "crypto";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { type, gender, budgetMin, budgetMax, verifiedOnly, search } = req.query as Record<string, string>;

    let listings = await db.select().from(listingsTable).where(eq(listingsTable.isHidden, false));

    if (type && type !== "Sab") {
      listings = listings.filter((l) => l.type === type);
    }
    if (gender && gender !== "Sab") {
      listings = listings.filter((l) => l.gender === gender);
    }
    if (budgetMin) {
      listings = listings.filter((l) => l.rent >= parseInt(budgetMin));
    }
    if (budgetMax) {
      listings = listings.filter((l) => l.rent <= parseInt(budgetMax));
    }
    if (verifiedOnly === "true") {
      listings = listings.filter((l) => l.verificationStatus === "aadhaar_verified");
    }
    if (search) {
      const q = search.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.area.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.landmark.toLowerCase().includes(q)
      );
    }

    res.json(listings.map(formatListing));
  } catch (err) {
    req.log.error({ err }, "Failed to get listings");
    res.status(500).json({ error: "Failed to get listings" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const id = randomUUID();
    const verificationStatus = body.aadhaarConsent ? "aadhaar_pending" : "phone_verified";

    const [listing] = await db
      .insert(listingsTable)
      .values({
        id,
        name: body.name,
        type: body.type,
        gender: body.gender,
        area: body.area,
        gali: body.gali,
        landmark: body.landmark,
        mapsLink: body.mapsLink || null,
        rent: body.rent,
        deposit: body.deposit,
        roomType: body.roomType,
        ownerName: body.ownerName,
        ownerPhone: body.ownerPhone,
        alternatePhone: body.alternatePhone || null,
        verificationStatus,
        aadhaarImageUrl: body.aadhaarImageUrl || null,
        escrowEnabled: body.escrowEnabled ?? false,
        amenities: body.amenities || [],
        securityFeatures: body.securityFeatures || [],
        curfewTime: body.curfewTime || "No Curfew",
        guestPolicy: body.guestPolicy || "Open",
        smokingAllowed: body.smokingAllowed ?? false,
        alcoholAllowed: body.alcoholAllowed ?? false,
        nonVegAllowed: body.nonVegAllowed ?? true,
        photos: body.photos || [],
      })
      .returning();

    res.status(201).json(formatListing(listing));
  } catch (err) {
    req.log.error({ err }, "Failed to create listing");
    res.status(500).json({ error: "Failed to create listing" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const listings = await db.select().from(listingsTable).where(eq(listingsTable.isHidden, false));
    const totalListings = listings.length;
    const verifiedListings = listings.filter((l) => l.verificationStatus === "aadhaar_verified").length;
    const pgCount = listings.filter((l) => l.type === "PG").length;
    const flatCount = listings.filter((l) => l.type === "Flat").length;
    const hostelCount = listings.filter((l) => l.type === "Hostel").length;
    const avgRent = totalListings > 0 ? Math.round(listings.reduce((s, l) => s + l.rent, 0) / totalListings) : 0;
    const escrowEnabledCount = listings.filter((l) => l.escrowEnabled).length;
    const recentListings = listings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(formatListing);

    res.json({ totalListings, verifiedListings, pgCount, flatCount, hostelCount, avgRent, escrowEnabledCount, recentListings });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/saved", async (req, res) => {
  try {
    const { userId } = req.query as { userId: string };
    if (!userId) return void res.status(400).json({ error: "userId required" });

    const saved = await db.select().from(savedListingsTable).where(eq(savedListingsTable.userId, userId));
    const listingIds = saved.map((s) => s.listingId);

    if (listingIds.length === 0) return void res.json([]);

    const listings = await db.select().from(listingsTable);
    const filteredListings = listings.filter((l) => listingIds.includes(l.id));

    res.json(filteredListings.map(formatListing));
  } catch (err) {
    req.log.error({ err }, "Failed to get saved listings");
    res.status(500).json({ error: "Failed to get saved listings" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
    if (!listing) return void res.status(404).json({ error: "Not found" });
    res.json(formatListing(listing));
  } catch (err) {
    req.log.error({ err }, "Failed to get listing");
    res.status(500).json({ error: "Failed to get listing" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updateData: Partial<typeof listingsTable.$inferInsert> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.rent !== undefined) updateData.rent = body.rent;
    if (body.deposit !== undefined) updateData.deposit = body.deposit;
    if (body.verificationStatus !== undefined) updateData.verificationStatus = body.verificationStatus;
    if (body.isHidden !== undefined) updateData.isHidden = body.isHidden;
    if (body.fraudReportCount !== undefined) updateData.fraudReportCount = body.fraudReportCount;

    const [updated] = await db.update(listingsTable).set(updateData).where(eq(listingsTable.id, id)).returning();
    if (!updated) return void res.status(404).json({ error: "Not found" });
    res.json(formatListing(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update listing");
    res.status(500).json({ error: "Failed to update listing" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(listingsTable).where(eq(listingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete listing");
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

router.post("/:id/save", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, action } = req.body;
    if (!userId) return void res.status(400).json({ error: "userId required" });

    const existing = await db
      .select()
      .from(savedListingsTable)
      .where(and(eq(savedListingsTable.userId, userId), eq(savedListingsTable.listingId, id)));

    if (action === "save" && existing.length === 0) {
      await db.insert(savedListingsTable).values({ id: randomUUID(), userId, listingId: id });
      return void res.json({ saved: true });
    } else if (action === "unsave" && existing.length > 0) {
      await db
        .delete(savedListingsTable)
        .where(and(eq(savedListingsTable.userId, userId), eq(savedListingsTable.listingId, id)));
      return void res.json({ saved: false });
    }

    res.json({ saved: existing.length > 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to save/unsave listing");
    res.status(500).json({ error: "Failed to save listing" });
  }
});

router.post("/:id/reveal-phone", async (req, res) => {
  try {
    const { id } = req.params;
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
    if (!listing) return void res.status(404).json({ error: "Not found" });
    res.json({ phone: listing.ownerPhone, alternatePhone: listing.alternatePhone });
  } catch (err) {
    req.log.error({ err }, "Failed to reveal phone");
    res.status(500).json({ error: "Failed to reveal phone" });
  }
});

function formatListing(l: typeof listingsTable.$inferSelect) {
  return {
    ...l,
    rating: l.rating / 10,
    createdAt: l.createdAt.toISOString(),
  };
}

export default router;
