import { Router } from "express";
import { asyncHandler } from "../lib/errors.js";
import * as days from "../controllers/days.controller.js";

// Mounted behind requireAuth in the router index.
export const daysRouter: Router = Router();

daysRouter.get("/", asyncHandler(days.list)); // GET /days?from=&to=
daysRouter.get("/:date", asyncHandler(days.getOne)); // GET /days/:date
daysRouter.put("/:date", asyncHandler(days.upsert)); // PUT /days/:date (server re-scores)
