// requireAuth — verifies the Bearer access token and injects req.userId.
// Every non-/auth route sits behind this; services then scope all queries by userId.
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { unauthorized } from "../lib/errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(unauthorized("Missing Bearer token"));
  }
  const { sub } = verifyAccessToken(token);
  req.userId = sub;
  next();
}
