// API DTOs — mirror the shapes returned by apps/api/src/services/*.
// Kept in sync by hand (no codegen yet); the api is the source of truth.

export interface PublicUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/** Returned by GET/PUT /days — date as 'YYYY-MM-DD', score is server-canonical. */
export interface DayDto {
  date: string;
  noZeroDay: boolean;
  deepWorkHours: number;
  workout: boolean;
  learningMinutes: number;
  oathCount: number;
  mit: string | null;
  intentions: string | null;
  reflection: string | null;
  lessons: string | null;
  score: number;
  updatedAt: string;
}

/** Fields the client may send on PUT /days/:date (server recomputes score). */
export interface DayUpsertInput {
  noZeroDay?: boolean;
  deepWorkHours?: number;
  workout?: boolean;
  learningMinutes?: number;
  oathCount?: number;
  mit?: string;
  intentions?: string;
  reflection?: string;
  lessons?: string;
}

export interface MetricsSummary {
  daily: number;
  weekly: number;
  monthly: number;
  streak: number;
  level: { num: number; name: string; consistency: number; next: string | null };
  xp: number;
}
