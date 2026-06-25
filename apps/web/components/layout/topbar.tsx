"use client";

import { usePathname } from "next/navigation";
import { useMetrics, useDay } from "@/lib/hooks";
import { todayKey } from "@/lib/date";
import { PAGE_TITLES } from "./nav";

export function Topbar() {
  const pathname = usePathname();
  const id = pathname.split("/")[1] ?? "system";
  const [code, title] = PAGE_TITLES[id] ?? ["ALPHA", "Project Alpha"];

  const { data: metrics } = useMetrics();
  const { data: today } = useDay(todayKey());

  const todayLabel = new Date()
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/7 bg-bg/80 px-9 py-[18px] backdrop-blur-md">
      <div>
        <div className="mb-[3px] font-mono text-[10px] tracking-[2px] text-gold">{code}</div>
        <h1 className="m-0 text-[21px] font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-[1px] text-faint">{todayLabel}</div>
          <div className="text-xs text-muted">Streak · {metrics?.streak ?? 0} days</div>
        </div>
        <div className="flex items-center gap-2.5 rounded-md border border-gold/25 bg-gold/6 px-3.5 py-2">
          <span className="font-mono text-[9px] tracking-[1px] text-faint">TODAY</span>
          <span className="text-lg font-bold text-gold">{today?.score ?? 0}</span>
        </div>
      </div>
    </header>
  );
}
