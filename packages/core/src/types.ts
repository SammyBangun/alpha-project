// Canonical shared types. Web, mobile, and api import these — never redefine.
// Field names are the source of truth (ARCHITECTURE §4 / §5).

/**
 * A single day's input metrics. The ONE source of truth — every aggregate
 * (weekly/monthly score, streak, level, honor, burnout) is derived from these.
 * We track effort (input), never outcomes.
 */
export interface DailyLog {
  date: string; // 'YYYY-MM-DD'
  deepWorkHours: number;
  workout: boolean;
  learningMinutes: number;
  noZeroDay: boolean;
  oathCount: number; // 0..7 core values honored
  mit?: string;
  intentions?: string;
  reflection?: string;
  lessons?: string;
}

/** Fields a client may send when upserting a day (never the score — server computes it). */
export type DailyLogInput = Partial<Omit<DailyLog, "date">>;

/**
 * The minimal shape `dayScore` actually depends on. Decoupled from `DailyLog` so any
 * record carrying these four inputs (e.g. an API DTO with `mit: string | null`) scores
 * cleanly without fighting the optional text fields.
 */
export interface ScoreInput {
  noZeroDay?: boolean;
  deepWorkHours?: number;
  workout?: boolean;
  learningMinutes?: number;
}

/** A progression rank, keyed off the trailing 30-day average score. */
export interface Level {
  num: number;
  name: string;
  min: number; // inclusive lower bound of avg-30 score
}

/** Result of resolving a 30-day average into a rank. */
export interface LevelInfo {
  consistency: number; // the avg-30 score that was resolved
  current: Level;
  next: Level | null; // null when already at max rank
  levels: readonly Level[];
}

/** Environment optimization factors (0..100). For phone distraction, lower is better. */
export interface EnvFactors {
  phoneDistraction: number;
  workspaceQuality: number;
  sleepQuality: number;
  focusEnvironment: number;
}

export type BurnoutLabel = "HEALTHY" | "MODERATE" | "HIGH";

export interface BurnoutLoad {
  pct: number; // 0..100
  label: BurnoutLabel;
}

/** A date-keyed map of logs, e.g. { '2026-06-24': DailyLog }. The natural shape for derivations. */
export type LogsByDate = Record<string, DailyLog | undefined>;
