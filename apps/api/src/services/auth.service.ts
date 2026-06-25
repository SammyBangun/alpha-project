// Auth logic: register, login, rotating refresh, logout (ARCHITECTURE §8).
// Passwords hashed with bcryptjs. Refresh tokens are persisted + rotated (single-use).
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  decodeExpiry,
} from "../lib/jwt.js";
import { conflict, unauthorized } from "../lib/errors.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

const BCRYPT_ROUNDS = 12;

export interface PublicUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function toPublic(u: User): PublicUser {
  return { id: u.id, email: u.email, displayName: u.displayName, createdAt: u.createdAt };
}

/** Issue an access token + a fresh persisted refresh token for a user. */
async function issueTokens(userId: string): Promise<AuthTokens> {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt: decodeExpiry(refreshToken) },
  });
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<{ user: PublicUser } & AuthTokens> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict("Email already registered", "EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName: input.displayName ?? null },
  });

  const tokens = await issueTokens(user.id);
  return { user: toPublic(user), ...tokens };
}

export async function login(input: LoginInput): Promise<{ user: PublicUser } & AuthTokens> {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Always run a compare to avoid leaking which emails exist (timing).
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const ok = await bcrypt.compare(input.password, hash);
  if (!user || !ok) throw unauthorized("Invalid email or password");

  const tokens = await issueTokens(user.id);
  return { user: toPublic(user), ...tokens };
}

/**
 * Rotate a refresh token: verify signature, ensure the row still exists (not
 * already used/revoked), delete it, then issue a brand-new pair. Single-use.
 */
export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const { sub } = verifyRefreshToken(refreshToken);

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.userId !== sub) throw unauthorized("Refresh token revoked");
  if (stored.expiresAt.getTime() < Date.now()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw unauthorized("Refresh token expired");
  }

  // rotate: invalidate the presented token, then mint a fresh pair
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  return issueTokens(sub);
}

/** Revoke a single refresh token (logout on one device). Idempotent. */
export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}
