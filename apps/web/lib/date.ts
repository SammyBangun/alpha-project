// Date helpers for the web app — built on @alpha/core so the boundary format matches the API.
import { fmt, addDays, parseKey, lastNDates } from "@alpha/core";

export { fmt, addDays, parseKey, lastNDates };

/** Today's 'YYYY-MM-DD' key (local). */
export function todayKey(): string {
  return fmt(new Date());
}
