import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import visitsRouter from "./visits";
import reportsRouter from "./reports";
import paymentsRouter from "./payments";
import adminRouter from "./admin";
import reviewsRouter from "./reviews";
import ownerRouter from "./owner";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/listings", listingsRouter);
router.use("/visits", visitsRouter);
router.use("/reports", reportsRouter);
router.use("/payments", paymentsRouter);
router.use("/admin", adminRouter);
router.use("/reviews", reviewsRouter);
router.use("/owner", ownerRouter);

export default router;
