// Typed fetch client. Attaches Bearer access token; on 401 it refreshes once
// (deduped across concurrent calls) and retries. Refresh failure clears the session.
import { useAuthStore } from "./auth-store";
import type {
  AuthResponse,
  DayDto,
  DayUpsertInput,
  MetricsSummary,
  RefreshResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOpts {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach Bearer (default true)
  retry?: boolean; // internal — allow one refresh+retry (default true)
}

let refreshInFlight: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();
  if (!refreshToken) {
    clear();
    return null;
  }
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clear();
      return null;
    }
    const data = (await res.json()) as RefreshResponse;
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clear();
    return null;
  }
}

/** Dedupe concurrent refreshes so a burst of 401s triggers a single rotation. */
function refreshOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { method = "GET", body, auth = true, retry = true } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    const newToken = await refreshOnce();
    if (newToken) return apiFetch<T>(path, { ...opts, retry: false });
  }

  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const data = await res.json();
      message = data?.error?.message ?? message;
      code = data?.error?.code;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---- endpoint wrappers ----
export const authApi = {
  register: (email: string, password: string, displayName?: string) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: { email, password, displayName },
    }),
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", auth: false, body: { email, password } }),
  logout: (refreshToken: string) =>
    apiFetch<void>("/auth/logout", { method: "POST", auth: false, body: { refreshToken } }),
};

export const daysApi = {
  list: (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const qs = q.toString();
    return apiFetch<DayDto[]>(`/days${qs ? `?${qs}` : ""}`);
  },
  get: (date: string) => apiFetch<DayDto>(`/days/${date}`),
  upsert: (date: string, patch: DayUpsertInput) =>
    apiFetch<DayDto>(`/days/${date}`, { method: "PUT", body: patch }),
};

export const metricsApi = {
  summary: () => apiFetch<MetricsSummary>("/metrics/summary"),
};
