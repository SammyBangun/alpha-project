import type { Request, Response } from "express";
import { unauthorized } from "../lib/errors.js";
import { metricsSummary } from "../services/metrics.service.js";

export async function summary(req: Request, res: Response): Promise<void> {
  if (!req.userId) throw unauthorized();
  res.json(await metricsSummary(req.userId));
}
