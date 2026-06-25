// Central error handler — turns AppError / ZodError / unknown into clean JSON.
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.js";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: "Route not found", code: "NOT_FOUND" } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { message: "Validation failed", code: "VALIDATION_ERROR", issues: err.flatten() },
    });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { message: err.message, code: err.code } });
    return;
  }
  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  res.status(500).json({ error: { message: "Internal server error", code: "INTERNAL" } });
}
