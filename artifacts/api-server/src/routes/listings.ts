import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, listingsTable, savedListingsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import { strictLimiter, writeLimiter } from "../lib/rate-limit";
import { sanitizeString, sanitizePhone, sanitizeInt, sanitizeArray } from "../lib/sanitize";

const ALLOWED_TYPES = ["PG", "Flat", "Hostel"];
const ALLOWED_GENDERS = ["Boys", "Girls", "Co-ed", "Any", "Mixed"];
const ALLOWED_ROOM_TYPES = ["Private", "Shared", "Triple"];

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { type, gender, budgetMin, budgetMax, verifiedOnly, search } = req.query as Record<string, string>;

    let listings = await db.select().from(listingsTable).where(eq(listingsTable.isHidden, false));

    if (type && type !== "Sab" && ALLOWED_TYPES.includes(type)) {
      listings = listings.filter((l) => l.type === type);
    }
    if (gender && gender !== "Sab" && ALLOWED_GENDERS.includes(gender)) {
      listings = listings.filter((l) => l.gender === gender);
    }
    if (budgetMin) {
      listings = listings.filter((l) => l.rent >= sanitizeInt(budgetMin, 0, 999999));
    }
    if (budgetMax) {
      listings = listings.filter((l) => l.rent <= sanitizeInt(budgetMax, 0, 999999));
    }
    if (verifiedOnly === "true") {
      listings = listings.filter((l) => l.verificationStatus === "aadhaar_verified");
    }
    if (search) {
      const q = sanitizeString(search, 100).toLowerCase();
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

router.post("/", writeLimiter, async (req, res) => {
  try {
    const body = req.body;

    const name = sanitizeString(body.name, 150);
    const type = ALLOWED_TYPES.includes(body.type) ? body.type : null;
    const gender = ALLOWED_GENDERS.includes(body.gender) ? body.gender : null;
    const area = sanitizeString(body.area, 100);
    const ownerPhone = sanitizePhone(body.ownerPhone);

    if (!name || !type || !gender || !area || ownerPhone.length < 10) {
      return void res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const rent = sanitizeInt(body.rent, 500, 200000);
    const deposit = sanitizeInt(body.deposit, 0, 1000000);

    const id = randomUUID();
    const verificationStatus = body.aadhaarConsent ? "aadhaar_pending" : "phone_verified";

    const [listing] = await db
      .insert(listingsTable)
      .values({
        id,
        name,
        type,
        gender,
        area,
        gali: sanitizeString(body.gali, 200),
        landmark: sanitizeString(body.landmark, 200),
        mapsLink: body.mapsLink ? sanitizeString(body.mapsLink, 500) : null,
        rent,
        deposit,
        roomType: ALLOWED_ROOM_TYPES.includes(body.roomType) ? body.roomType : "Private",
        ownerName: sanitizeString(body.ownerName, 100),
        ownerPhone,
        alternatePhone: body.alternatePhone ? sanitizePhone(body.alternatePhone) : null,
        verificationStatus,
        aadhaarImageUrl: body.aadhaarImageUrl ? sanitizeString(body.aadhaarImageUrl, 500) : null,
        escrowEnabled: Boolean(body.escrowEnabled),
        amenities: sanitizeArray(body.amenities),
        securityFeatures: sanitizeArray(body.securityFeatures),
        curfewTime: sanitizeString(body.curfewTime, 50) || "No Curfew",
        guestPolicy: sanitizeString(body.guestPolicy, 50) || "Open",
        smokingAllowed: Boolean(body.smokingAllowed),
        alcoholAllowed: Boolean(body.alcoholAllowed),
        nonVegAllowed: body.nonVegAllowed !== false,
        photos: sanitizeArray(body.photos, 10, 500),
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

    const safeUserId = sanitizeString(userId, 100);
    const saved = await db.select().from(savedListingsTable).where(eq(savedListingsTable.userId, safeUserId));
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
    const id = req.params["id"] as string;
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
    const id = req.params["id"] as string;
    const body = req.body;
    const updateData: Partial<typeof listingsTable.$inferInsert> = {};
    if (body.name !== undefined) updateData.name = sanitizeString(body.name, 150);
    if (body.rent !== undefined) updateData.rent = sanitizeInt(body.rent, 500, 200000);
    if (body.deposit !== undefined) updateData.deposit = sanitizeInt(body.deposit, 0, 1000000);
    if (body.verificationStatus !== undefined) updateData.verificationStatus = sanitizeString(body.verificationStatus, 50);
    if (body.isHidden !== undefined) updateData.isHidden = Boolean(body.isHidden);
    if (body.fraudReportCount !== undefined) updateData.fraudReportCount = sanitizeInt(body.fraudReportCount, 0, 9999);

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
    const id = req.params["id"] as string;
    await db.delete(listingsTable).where(eq(listingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete listing");
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

router.post("/:id/save", writeLimiter, async (req, res) => {
  try {
    const id = req.params["id"] as string;
    const { userId, action } = req.body;
    if (!userId) return void res.status(400).json({ error: "userId required" });

    const safeUserId = sanitizeString(userId, 100);

    const existing = await db
      .select()
      .from(savedListingsTable)
      .where(and(eq(savedListingsTable.userId, safeUserId), eq(savedListingsTable.listingId, id)));

    if (action === "save" && existing.length === 0) {
      await db.insert(savedListingsTable).values({ id: randomUUID(), userId: safeUserId, listingId: id });
      return void res.json({ saved: true });
    } else if (action === "unsave" && existing.length > 0) {
      await db
        .delete(savedListingsTable)
        .where(and(eq(savedListingsTable.userId, safeUserId), eq(savedListingsTable.listingId, id)));
      return void res.json({ saved: false });
    }

    res.json({ saved: existing.length > 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to save/unsave listing");
    res.status(500).json({ error: "Failed to save listing" });
  }
});

router.post("/:id/reveal-phone", strictLimiter, async (req, res) => {
  try {
    const id = req.params["id"] as string;
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
