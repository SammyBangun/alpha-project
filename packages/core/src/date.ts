// Date helpers operating on 'YYYY-MM-DD' strings — the boundary format used everywhere.
// All math is done in local time on calendar dates (no time-of-day component).

/** Format a Date as 'YYYY-MM-DD' (local calendar date). */
export function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a 'YYYY-MM-DD' key into a local Date at midnight. */
export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Return a new Date offset by `n` calendar days (n may be negative). */
export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/**
 * The last `n` date keys ending at `asOf` (inclusive), oldest first.
 * e.g. lastNDates(2026-06-24, 3) -> ['2026-06-22','2026-06-23','2026-06-24'].
 */
export function lastNDates(asOf: Date, n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(fmt(addDays(asOf, -i)));
  }
  return out;
}

/** Whether two Dates fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return fmt(a) === fmt(b);
}
