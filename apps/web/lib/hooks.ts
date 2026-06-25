// TanStack Query hooks over the days/metrics API. Optimistic scoring uses @alpha/core
// so the UI updates instantly; the server's canonical score overwrites on settle.
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { dayScore } from "@alpha/core";
import { ApiError, daysApi, metricsApi } from "./api";
import type { DayDto, DayUpsertInput, MetricsSummary } from "./types";

export function emptyDay(date: string): DayDto {
  return {
    date,
    noZeroDay: false,
    deepWorkHours: 0,
    workout: false,
    learningMinutes: 0,
    oathCount: 0,
    mit: null,
    intentions: null,
    reflection: null,
    lessons: null,
    score: 0,
    updatedAt: new Date(0).toISOString(),
  };
}

const dayKey = (date: string) => ["day", date] as const;
const daysKey = (from: string, to: string) => ["days", from, to] as const;
const metricsKey = ["metrics", "summary"] as const;

/** A single day. A 404 (no log yet) resolves to a blank day rather than erroring. */
export function useDay(date: string, enabled = true): UseQueryResult<DayDto> {
  return useQuery({
    queryKey: dayKey(date),
    enabled,
    queryFn: async () => {
      try {
        return await daysApi.get(date);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return emptyDay(date);
        throw e;
      }
    },
  });
}

export function useDays(from: string, to: string, enabled = true): UseQueryResult<DayDto[]> {
  return useQuery({
    queryKey: daysKey(from, to),
    enabled,
    queryFn: () => daysApi.list(from, to),
  });
}

export function useMetrics(enabled = true): UseQueryResult<MetricsSummary> {
  return useQuery({
    queryKey: metricsKey,
    enabled,
    queryFn: () => metricsApi.summary(),
  });
}

export function useUpsertDay(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: DayUpsertInput) => daysApi.upsert(date, patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: dayKey(date) });
      const prev = qc.getQueryData<DayDto>(dayKey(date)) ?? emptyDay(date);
      const optimistic: DayDto = { ...prev, ...stripUndefined(patch) };
      // preview score with the shared brain (server stays authoritative on settle)
      optimistic.score = dayScore(optimistic);
      qc.setQueryData(dayKey(date), optimistic);
      return { prev };
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(dayKey(date), ctx.prev);
    },
    onSuccess: (server) => {
      qc.setQueryData(dayKey(date), server); // canonical
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["days"] });
      qc.invalidateQueries({ queryKey: metricsKey });
    },
  });
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}
