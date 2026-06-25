import { z } from "zod";

/** 'YYYY-MM-DD' calendar date, validated and real (rejects 2026-13-40). */
export const dateParam = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y!, m! - 1, d!);
    return dt.getFullYear() === y && dt.getMonth() === m! - 1 && dt.getDate() === d;
  }, "Not a real calendar date");

/** Input the client may send on PUT /days/:date. Never includes score — server computes it. */
export const dayUpsertSchema = z
  .object({
    deepWorkHours: z.number().min(0).max(24),
    workout: z.boolean(),
    learningMinutes: z.number().int().min(0).max(1440),
    noZeroDay: z.boolean(),
    oathCount: z.number().int().min(0).max(7),
    mit: z.string().max(2000),
    intentions: z.string().max(5000),
    reflection: z.string().max(5000),
    lessons: z.string().max(5000),
  })
  .partial();

export const daysRangeSchema = z.object({
  from: dateParam.optional(),
  to: dateParam.optional(),
});

export type DayUpsertInput = z.infer<typeof dayUpsertSchema>;
