import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, listingsTable } from "@workspace/db";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

router.get("/listings", async (req, res) => {
  try {
    const { password, status } = req.query as { password: string; status?: string };

    if (password !== ADMIN_PASSWORD) {
      return void res.status(401).json({ error: "Unauthorized" });
    }

    let listings = await db.select().from(listingsTable);

    if (status === "pending_aadhaar") {
      listings = listings.filter((l) => l.verificationStatus === "aadhaar_pending");
    } else if (status === "all") {
    } else if (status) {
      listings = listings.filter((l) => l.verificationStatus === status);
    }

    res.json(
      listings.map((l) => ({
        ...l,
        rating: l.rating / 10,
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get admin listings");
    res.status(500).json({ error: "Failed to get listings" });
  }
});

router.post("/listings/:id/verify-aadhaar", async (req, res) => {
  try {
    const { id } = req.params;
    const { action, password } = req.body;

    if (password !== ADMIN_PASSWORD) {
      return void res.status(401).json({ error: "Unauthorized" });
    }

    const verificationStatus = action === "approve" ? "aadhaar_verified" : "phone_verified";

    const [updated] = await db
      .update(listingsTable)
      .set({ verificationStatus })
      .where(eq(listingsTable.id, id))
      .returning();

    if (!updated) return void res.status(404).json({ error: "Not found" });

    res.json({
      ...updated,
      rating: updated.rating / 10,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to verify Aadhaar");
    res.status(500).json({ error: "Failed to verify Aadhaar" });
  }
});

export default router;
