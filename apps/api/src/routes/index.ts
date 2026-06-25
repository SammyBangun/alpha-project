// Protected router composition — everything here sits behind requireAuth.
// (/auth is mounted separately in index.ts with its own rate limiter.)
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { daysRouter } from "./days.routes.js";
import { metricsRouter } from "./metrics.routes.js";

export const apiRouter: Router = Router();

apiRouter.use("/days", requireAuth, daysRouter);
apiRouter.use("/metrics", requireAuth, metricsRouter);
