// Thin day controllers — req.userId comes from requireAuth; all access is user-scoped.
import type { Request, Response } from "express";
import { dateParam, dayUpsertSchema, daysRangeSchema } from "../schemas/day.schema.js";
import { notFound, unauthorized } from "../lib/errors.js";
import * as daysService from "../services/days.service.js";

function userId(req: Request): string {
  if (!req.userId) throw unauthorized();
  return req.userId;
}

export async function list(req: Request, res: Response): Promise<void> {
  const { from, to } = daysRangeSchema.parse(req.query);
  const days = await daysService.listDays(userId(req), from, to);
  res.json(days);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const date = dateParam.parse(req.params.date);
  const day = await daysService.getDay(userId(req), date);
  if (!day) throw notFound("No log for that date");
  res.json(day);
}

export async function upsert(req: Request, res: Response): Promise<void> {
  const date = dateParam.parse(req.params.date);
  const patch = dayUpsertSchema.parse(req.body);
  const day = await daysService.upsertDay(userId(req), date, patch);
  res.json(day);
}
