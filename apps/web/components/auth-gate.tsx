"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

/** Guards the (app) routes: waits for zustand rehydration, then bounces guests to /login. */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="font-mono text-xs tracking-widest text-dim">LOADING…</div>
      </div>
    );
  }
  if (!token) return null; // redirecting
  return <>{children}</>;
}
