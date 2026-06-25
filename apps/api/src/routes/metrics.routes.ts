import { Router } from "express";
import { asyncHandler } from "../lib/errors.js";
import { summary } from "../controllers/metrics.controller.js";

export const metricsRouter: Router = Router();

metricsRouter.get("/summary", asyncHandler(summary)); // GET /metrics/summary
