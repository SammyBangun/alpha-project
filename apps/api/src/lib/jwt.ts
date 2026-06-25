// JWT signing/verification for access + refresh tokens (ARCHITECTURE §8).
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "./env.js";
import { unauthorized } from "./errors.js";

export interface TokenPayload {
  sub: string; // userId
}

type Ttl = SignOptions["expiresIn"];

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as Ttl,
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as Ttl,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return normalize(decoded);
  } catch {
    throw unauthorized("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return normalize(decoded);
  } catch {
    throw unauthorized("Invalid or expired refresh token");
  }
}

function normalize(decoded: string | jwt.JwtPayload): TokenPayload {
  if (typeof decoded === "string" || !decoded.sub) {
    throw unauthorized("Malformed token payload");
  }
  return { sub: String(decoded.sub) };
}

/** Read the `exp` of an issued token as a Date — used to persist RefreshToken.expiresAt. */
export function decodeExpiry(token: string): Date {
  const decoded = jwt.decode(token);
  if (decoded && typeof decoded !== "string" && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }
  // fallback: 30 days out
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}
