import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, listingsTable } from "@workspace/db";
import { rateLimit } from "express-rate-limit";
import { adminBruteForceGuard, recordAdminFailure, clearAdminFailures, getClientIpFromReq } from "../lib/firewall";
import { sanitizeString } from "../lib/sanitize";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD environment variable is required but not set. Server cannot start.");
}

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many admin requests. Try again later." },
});

const router = Router();

router.use(adminLimiter);
router.use(adminBruteForceGuard);

function checkAdminAuth(req: import("express").Request, res: import("express").Response): boolean {
  const ip = getClientIpFromReq(req);
  const authHeader = req.headers["x-admin-token"] as string | undefined;
  const bodyPassword = req.body?.password as string | undefined;
  const submitted = authHeader ?? bodyPassword ?? "";

  if (submitted !== ADMIN_PASSWORD) {
    recordAdminFailure(ip);
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  clearAdminFailures(ip);
  return true;
}

router.get("/listings", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    if (!checkAdminAuth(req, res)) return;

    let listings = await db.select().from(listingsTable);

    if (status === "pending_aadhaar") {
      listings = listings.filter((l) => l.verificationStatus === "aadhaar_pending");
    } else if (status !== "all" && status) {
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
    const id = req.params["id"] as string;
    if (!checkAdminAuth(req, res)) return;

    const action = sanitizeString(req.body?.action, 20);
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

router.delete("/listings/:id", async (req, res) => {
  try {
    const id = req.params["id"] as string;
    if (!checkAdminAuth(req, res)) return;

    await db.delete(listingsTable).where(eq(listingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete listing");
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

export default router;
