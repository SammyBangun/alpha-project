"use client";

import { cn } from "@/components/ui/cn";
import { Card, CardBody, Label } from "@/components/ui/card";
import type { DayDto } from "@/lib/types";

// ---------- stat cards ----------
export interface Stat {
  label: string;
  value: number | string;
  unit?: string;
  trend: string;
  trendGold?: boolean;
}

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardBody className="p-[18px]">
            <div className="mb-2.5 font-mono text-[9px] tracking-[1px] text-faint">{s.label}</div>
            <div className="text-[26px] font-bold leading-none">
              {s.value}
              {s.unit && <span className="text-[13px] font-medium text-faint">{s.unit}</span>}
            </div>
            <div className={cn("mt-2.5 text-[11px]", s.trendGold ? "text-gold" : "text-muted")}>
              {s.trend}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// ---------- big score trio ----------
export function ScoreTrio({ daily, weekly, monthly }: { daily: number; weekly: number; monthly: number }) {
  return (
    <div className="grid grid-cols-3 gap-3.5">
      <Card className="border-gold/20 bg-gradient-to-b from-gold/6 to-panel text-center">
        <CardBody className="p-[18px]">
          <div className="mb-2 font-mono text-[9px] tracking-[1px] text-faint">DAILY ALPHA SCORE</div>
          <div className="text-[30px] font-bold text-gold">{daily}</div>
        </CardBody>
      </Card>
      <Card className="text-center">
        <CardBody className="p-[18px]">
          <div className="mb-2 font-mono text-[9px] tracking-[1px] text-faint">WEEKLY ALPHA SCORE</div>
          <div className="text-[30px] font-bold">{weekly}</div>
        </CardBody>
      </Card>
      <Card className="text-center">
        <CardBody className="p-[18px]">
          <div className="mb-2 font-mono text-[9px] tracking-[1px] text-faint">MONTHLY ALPHA SCORE</div>
          <div className="text-[30px] font-bold">{monthly}</div>
        </CardBody>
      </Card>
    </div>
  );
}

// ---------- 7-day score bars ----------
export interface ScoreBar {
  label: string;
  score: number;
}

export function ScoreBars({ bars }: { bars: ScoreBar[] }) {
  const fill = (s: number) =>
    s >= 75
      ? "linear-gradient(180deg,#d4a24e,#a07d2c)"
      : s >= 50
        ? "#8a6a26"
        : "#4a3a1c";
  return (
    <Card>
      <CardBody>
        <Label className="mb-5">ALPHA SCORE · LAST 7 DAYS</Label>
        <div className="flex h-[140px] items-end gap-2.5">
          {bars.map((b, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="font-mono text-[10px] text-muted">{b.score}</span>
              <div
                className="w-full rounded-md"
                style={{ height: Math.max(3, (b.score / 100) * 110), background: fill(b.score) }}
              />
              <span className="font-mono text-[9px] text-faint">{b.label}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ---------- 14-day deep work bars ----------
export function DeepWorkBars({ hours }: { hours: number[] }) {
  return (
    <Card>
      <CardBody>
        <Label className="mb-5">DEEP WORK HOURS · LAST 14 DAYS</Label>
        <div className="flex h-[140px] items-end gap-[5px]">
          {hours.map((h, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded"
                style={{
                  height: Math.max(3, Math.min(1, h / 5) * 120),
                  background: h >= 2 ? "linear-gradient(180deg,#d4a24e,#a07d2c)" : "#4a3a1c",
                }}
                title={`${h}h`}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ---------- 98-day heatmap ----------
export interface HeatCell {
  title: string;
  score: number;
  future: boolean;
}

function heatColor(s: number) {
  return s >= 85 ? "#d4a24e" : s >= 60 ? "#8a6a26" : s >= 35 ? "#4a3a1c" : s > 0 ? "#2a2418" : "#1a1a1d";
}

export function Heatmap({ cells }: { cells: HeatCell[] }) {
  return (
    <Card>
      <CardBody>
        <div className="mb-[18px] flex items-center justify-between">
          <Label>CONSISTENCY HEATMAP · LAST 98 DAYS</Label>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-faint">
            <span>LOW</span>
            {["#1a1a1d", "#4a3a1c", "#8a6a26", "#d4a24e"].map((c) => (
              <span key={c} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: c }} />
            ))}
            <span>HIGH</span>
          </div>
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {cells.map((c, i) => (
            <div
              key={i}
              title={c.title}
              className="h-[13px] w-[13px] rounded-[3px]"
              style={{
                background: c.future ? "transparent" : heatColor(c.score),
                border: c.future ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ---------- month calendar ----------
export interface CalCell {
  key: string;
  day: number | null;
  score: number;
  isToday: boolean;
  future: boolean;
}

export function CalendarMonth({
  monthLabel,
  cells,
  selectedKey,
  onSelect,
}: {
  monthLabel: string;
  cells: CalCell[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const bg = (s: number, future: boolean) =>
    future
      ? "transparent"
      : s >= 85
        ? "rgba(212,162,78,0.85)"
        : s >= 60
          ? "rgba(212,162,78,0.45)"
          : s >= 35
            ? "rgba(212,162,78,0.2)"
            : s > 0
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.025)";

  return (
    <Card>
      <CardBody>
        <Label className="mb-[18px]">PROGRESS CALENDAR · {monthLabel}</Label>
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
            <div key={i} className="text-center font-mono text-[9px] text-dim">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((c, i) =>
            c.day === null ? (
              <div key={i} className="aspect-square rounded-md" />
            ) : (
              <button
                key={i}
                onClick={() => !c.future && onSelect(c.key)}
                disabled={c.future}
                className="flex aspect-square items-center justify-center rounded-md border"
                style={{
                  background: bg(c.score, c.future),
                  borderColor:
                    c.key === selectedKey
                      ? "#d4a24e"
                      : c.isToday
                        ? "rgba(212,162,78,0.5)"
                        : "rgba(255,255,255,0.05)",
                  cursor: c.future ? "default" : "pointer",
                }}
              >
                <span
                  className="font-mono text-[11px]"
                  style={{
                    color: c.score >= 60 ? "#0a0a0c" : c.future ? "#3a3a40" : "#9a9aa0",
                    fontWeight: c.score >= 60 ? 700 : 400,
                  }}
                >
                  {c.day}
                </span>
              </button>
            ),
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ---------- selected day panel ----------
export function SelectedDay({ label, day }: { label: string; day: DayDto | null }) {
  const dot = (ok: boolean) => (
    <span
      className="h-2 w-2 flex-none rounded-full"
      style={{ background: ok ? "#d4a24e" : "rgba(255,255,255,0.15)" }}
    />
  );
  const rules = [
    { label: "No Zero Day", ok: !!day?.noZeroDay, val: day?.noZeroDay ? "YES" : "NO" },
    { label: "Deep Work", ok: (day?.deepWorkHours ?? 0) >= 2, val: day ? `${day.deepWorkHours}h` : "—" },
    { label: "Physical Training", ok: !!day?.workout, val: day?.workout ? "DONE" : "NO" },
    { label: "Learning", ok: (day?.learningMinutes ?? 0) >= 30, val: day ? `${day.learningMinutes}m` : "—" },
  ];
  return (
    <Card>
      <CardBody>
        <Label className="mb-1.5 text-gold">SELECTED · {label}</Label>
        <div className="my-2 mb-4 text-[40px] font-bold text-gold">
          {day?.score ?? 0}
          <span className="text-base font-medium text-faint">/100</span>
        </div>
        <div className="flex flex-col gap-3">
          {rules.map((r) => (
            <div key={r.label} className="flex items-center gap-2.5">
              {dot(r.ok)}
              <span className="flex-1 text-[13px] text-muted">{r.label}</span>
              <span className="font-mono text-xs text-faint">{r.val}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
