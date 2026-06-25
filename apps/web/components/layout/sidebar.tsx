"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Progress } from "@/components/ui/progress";
import { useMetrics } from "@/lib/hooks";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { NAV_ITEMS } from "./nav";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: metrics } = useMetrics();
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);

  const onLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      /* best-effort */
    }
    clear();
    router.replace("/login");
  };

  const level = metrics?.level;
  const xpPct = level
    ? level.next
      ? Math.round((level.consistency / 100) * 100)
      : 100
    : 0;

  return (
    <aside className="flex h-screen w-[248px] flex-none flex-col border-r border-white/7 bg-panel2 p-4">
      {/* brand */}
      <div className="flex items-center gap-3 px-2 pb-5 pt-1">
        <div className="flex h-[30px] w-[30px] flex-none rotate-45 items-center justify-center rounded-md border-[1.5px] border-gold">
          <div className="h-[9px] w-[9px] rounded-[1px] bg-gold" />
        </div>
        <div>
          <div className="text-[13px] font-bold tracking-[1.5px]">PROJECT ALPHA</div>
          <div className="font-mono text-[9px] tracking-[1px] text-dim">PERSONAL OS</div>
        </div>
      </div>

      <div className="px-2 pb-2.5 font-mono text-[9px] tracking-[1.5px] text-dim">MODULES</div>
      <nav className="flex flex-col gap-[3px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const base =
            "flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[13px] font-medium transition-colors";
          if (!item.enabled) {
            return (
              <div
                key={item.id}
                title="Coming soon"
                className={cn(base, "cursor-not-allowed text-dim/60")}
              >
                <Code active={false}>{item.code}</Code>
                <span className="flex-1">{item.label}</span>
                <span className="font-mono text-[8px] tracking-wide text-dim/50">SOON</span>
              </div>
            );
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                base,
                active
                  ? "border border-gold/22 bg-gold/10 text-fg"
                  : "border border-transparent text-faint hover:bg-white/5",
              )}
            >
              <Code active={active}>{item.code}</Code>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* rank widget */}
      <div className="mt-auto rounded-md border border-white/7 bg-gradient-to-b from-gold/6 to-transparent p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-[1px] text-faint">RANK</span>
          <span className="font-mono text-[9px] text-gold">LV.{level?.num ?? "—"}</span>
        </div>
        <div className="mb-3 text-sm font-semibold">{level?.name ?? "—"}</div>
        <Progress value={xpPct} />
        <div className="mt-1.5 flex justify-between font-mono text-[9px] text-faint">
          <span>{metrics?.xp ?? 0} XP</span>
          <span>{level?.next ? `→ ${level.next}` : "MAX"}</span>
        </div>
        <button
          onClick={onLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/8 py-2 text-[11px] text-faint transition-colors hover:bg-white/5 hover:text-fg"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  );
}

function Code({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-1 font-mono text-[10px] tracking-wide",
        active ? "border-gold/40 text-gold" : "border-white/8 text-dim",
      )}
    >
      {children}
    </span>
  );
}
