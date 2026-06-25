"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

/** Entry — route to the Daily Engine when signed in, else to login. */
export default function Home() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? "/system" : "/login");
  }, [hydrated, token, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="font-mono text-xs tracking-widest text-dim">PROJECT ALPHA</div>
    </div>
  );
}
