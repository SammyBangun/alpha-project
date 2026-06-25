"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel } from "@/components/ui/input";
import { ApiError, authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = isRegister
        ? await authApi.register(email, password, displayName || undefined)
        : await authApi.login(email, password);
      setSession(res);
      router.replace("/system");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardBody className="p-7">
        <div className="mb-1 text-lg font-semibold">
          {isRegister ? "Forge your identity" : "Re-enter the system"}
        </div>
        <p className="mb-6 text-[13px] text-muted">
          {isRegister
            ? "Create an account to begin the protocol."
            : "Sign in to run today's protocol."}
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div>
              <FieldLabel>Display name (optional)</FieldLabel>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              required
              minLength={isRegister ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? "At least 8 characters" : "••••••••"}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "…" : isRegister ? "Begin" : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 text-center text-[13px] text-muted">
          {isRegister ? (
            <>
              Already enlisted?{" "}
              <Link href="/login" className="text-gold hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/register" className="text-gold hover:underline">
                Create an account
              </Link>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
