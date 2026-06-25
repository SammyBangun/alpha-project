// App-level error type + an async wrapper so controllers can throw freely.
import type { Request, Response, NextFunction, RequestHandler } from "express";

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (msg: string, code?: string) => new AppError(400, msg, code);
export const unauthorized = (msg = "Unauthorized") => new AppError(401, msg, "UNAUTHORIZED");
export const forbidden = (msg = "Forbidden") => new AppError(403, msg, "FORBIDDEN");
export const notFound = (msg = "Not found") => new AppError(404, msg, "NOT_FOUND");
export const conflict = (msg: string, code?: string) => new AppError(409, msg, code);

/** Wrap an async handler so rejected promises reach the error middleware. */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
