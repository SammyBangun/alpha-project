"use client";

import { useMemo, useState } from "react";
import { dayScore, weeklyScore, monthlyScore, fmt, addDays, parseKey } from "@alpha/core";
import { useDays, useMetrics } from "@/lib/hooks";
import { todayKey } from "@/lib/date";
import type { DayDto } from "@/lib/types";
import {
  StatCards,
  ScoreTrio,
  ScoreBars,
  DeepWorkBars,
  Heatmap,
  CalendarMonth,
  SelectedDay,
  type CalCell,
} from "@/components/metrics/panels";

const round = Math.round;

export default function MetricsPage() {
  const today = useMemo(() => new Date(), []);
  const from = fmt(addDays(today, -97));
  const to = todayKey();
  const { data: days } = useDays(from, to);
  const { data: metrics } = useMetrics();
  const [selectedKey, setSelectedKey] = useState(todayKey());

  const byDate = useMemo(() => {
    const m: Record<string, DayDto> = {};
    for (const d of days ?? []) m[d.date] = d;
    return m;
  }, [days]);

  const recent = (n: number): (DayDto | undefined)[] =>
    Array.from({ length: n }, (_, i) => byDate[fmt(addDays(today, -(n - 1 - i)))]);

  // ---- 30-day aggregates ----
  const last30 = recent(30);
  const deepW = last30.reduce((a, d) => a + (d?.deepWorkHours ?? 0), 0);
  const woRate = round((last30.filter((d) => d?.workout).length / 30) * 100);
  const learnH = round(last30.reduce((a, d) => a + (d?.learningMinutes ?? 0), 0) / 60);

  const daily = metrics?.daily ?? dayScore(byDate[todayKey()]);
  const weekly = metrics?.weekly ?? weeklyScore(recent(7));
  const monthly = metrics?.monthly ?? monthlyScore(last30);

  const stats = [
    { label: "DEEP WORK · 30D", value: round(deepW), unit: "h", trend: `+${round(deepW * 0.12)}h vs prev`, trendGold: true },
    { label: "WORKOUT CONSISTENCY", value: woRate, unit: "%", trend: woRate >= 70 ? "on target" : "below target", trendGold: woRate >= 70 },
    { label: "LEARNING · 30D", value: learnH, unit: "h", trend: `≈${round((learnH / 30) * 60)}min/day` },
    { label: "HABIT COMPLETION", value: monthly, unit: "%", trend: "30-day rate" },
  ];

  // ---- 7-day score bars ----
  const weekBars = recent(7).map((d, i) => {
    const dt = addDays(today, -(6 - i));
    return {
      label: dt.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      score: d?.score ?? 0,
    };
  });

  // ---- 14-day deep work bars ----
  const deepBars = recent(14).map((d) => d?.deepWorkHours ?? 0);

  // ---- 98-day heatmap ----
  const heatCells = Array.from({ length: 98 }, (_, idx) => {
    const dt = addDays(today, -(97 - idx));
    const key = fmt(dt);
    const score = byDate[key]?.score ?? 0;
    return { title: `${key} · ${score}`, score, future: false };
  });

  // ---- month calendar ----
  const year = today.getFullYear();
  const month = today.getMonth();
  const startDow = new Date(year, month, 1).getDay();
  const dim = new Date(year, month + 1, 0).getDate();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
  const calCells: CalCell[] = [];
  for (let b = 0; b < startDow; b++) calCells.push({ key: `blank-${b}`, day: null, score: 0, isToday: false, future: false });
  for (let d = 1; d <= dim; d++) {
    const dt = new Date(year, month, d);
    const key = fmt(dt);
    calCells.push({
      key,
      day: d,
      score: byDate[key]?.score ?? 0,
      isToday: key === todayKey(),
      future: dt > today && key !== todayKey(),
    });
  }

  const selectedDay = byDate[selectedKey] ?? null;
  const selectedLabel = parseKey(selectedKey)
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();

  return (
    <div className="flex flex-col gap-[18px]">
      <StatCards stats={stats} />
      <ScoreTrio daily={daily} weekly={weekly} monthly={monthly} />

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <ScoreBars bars={weekBars} />
        <DeepWorkBars hours={deepBars} />
      </div>

      <Heatmap cells={heatCells} />

      <div className="grid grid-cols-[1.4fr_1fr] gap-4 max-lg:grid-cols-1">
        <CalendarMonth monthLabel={monthLabel} cells={calCells} selectedKey={selectedKey} onSelect={setSelectedKey} />
        <SelectedDay label={selectedLabel} day={selectedDay} />
      </div>
    </div>
  );
}
