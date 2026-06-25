"use client";

import { Card, CardBody, Label } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { RuleRow } from "@/components/daily/rule-row";
import { AutoSaveField } from "@/components/daily/autosave";
import { useDay, useUpsertDay, emptyDay } from "@/lib/hooks";
import { todayKey } from "@/lib/date";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export default function DailyEnginePage() {
  const date = todayKey();
  const { data } = useDay(date);
  const day = data ?? emptyDay(date);
  const { mutate } = useUpsertDay(date);

  const rulesDone = [day.noZeroDay, day.deepWorkHours >= 2, day.workout, day.learningMinutes >= 30].filter(
    Boolean,
  ).length;

  const verdict =
    day.score >= 100
      ? "Perfect day. This is the standard."
      : day.score >= 75
        ? "Strong. Close the gap."
        : day.score >= 50
          ? "Acceptable. No zero day."
          : "Move now. Hit the minimum.";

  return (
    <div className="flex flex-col gap-4">
      {/* execute banner */}
      <div className="flex items-center gap-3 rounded-lg border border-gold/22 bg-gold/5 px-5 py-4">
        <span className="text-[13px] font-semibold text-gold">EXECUTE.</span>
        <span className="text-[13px] text-muted">
          Don&apos;t plan your life. Run today&apos;s protocol. {rulesDone}/4 mandatory rules complete.
        </span>
      </div>

      <div className="grid grid-cols-[1.3fr_0.85fr] gap-4 max-lg:grid-cols-1">
        {/* mandatory rules */}
        <Card>
          <CardBody>
            <Label className="mb-[18px]">MANDATORY DAILY RULES</Label>
            <div className="flex flex-col gap-3">
              <RuleRow
                title="No Zero Day"
                subtitle="Move the needle, even 1%."
                done={day.noZeroDay}
                onToggle={() => mutate({ noZeroDay: !day.noZeroDay })}
              />
              <RuleRow
                title="Deep Work ≥ 2h"
                subtitle={`Logged: ${day.deepWorkHours}h`}
                done={day.deepWorkHours >= 2}
                onToggle={() => mutate({ deepWorkHours: day.deepWorkHours >= 2 ? 0 : 2 })}
                stepper={{
                  onInc: () => mutate({ deepWorkHours: round1(clamp(day.deepWorkHours + 0.5, 0, 12)) }),
                  onDec: () => mutate({ deepWorkHours: round1(clamp(day.deepWorkHours - 0.5, 0, 12)) }),
                }}
              />
              <RuleRow
                title="Physical Training"
                subtitle="Strength · conditioning · movement."
                done={day.workout}
                onToggle={() => mutate({ workout: !day.workout })}
              />
              <RuleRow
                title="Learning ≥ 30min"
                subtitle={`Logged: ${day.learningMinutes} min`}
                done={day.learningMinutes >= 30}
                onToggle={() => mutate({ learningMinutes: day.learningMinutes >= 30 ? 0 : 30 })}
                stepper={{
                  onInc: () => mutate({ learningMinutes: clamp(day.learningMinutes + 15, 0, 300) }),
                  onDec: () => mutate({ learningMinutes: clamp(day.learningMinutes - 15, 0, 300) }),
                }}
              />
            </div>
          </CardBody>
        </Card>

        {/* daily score ring */}
        <Card>
          <CardBody className="flex flex-col items-center justify-center">
            <Label className="mb-[18px] self-start">DAILY COMPLIANCE</Label>
            <ScoreRing score={day.score} />
            <div className="mt-[18px] text-center text-[13px] text-muted">{verdict}</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {/* morning */}
        <Card>
          <CardBody>
            <Label className="mb-4 text-gold">☀ MORNING PROTOCOL</Label>
            <div className="flex flex-col gap-4">
              <AutoSaveField
                label="Most Important Task (MIT)"
                value={day.mit ?? ""}
                placeholder="The one thing that makes today a win…"
                onSave={(v) => mutate({ mit: v })}
              />
              <AutoSaveField
                label="Daily Intentions"
                value={day.intentions ?? ""}
                placeholder="How will I show up today?"
                onSave={(v) => mutate({ intentions: v })}
                textarea
              />
            </div>
          </CardBody>
        </Card>

        {/* night */}
        <Card>
          <CardBody>
            <Label className="mb-4 text-[#8a8aff]">☾ NIGHT REVIEW</Label>
            <div className="flex flex-col gap-4">
              <AutoSaveField
                label="Reflection"
                value={day.reflection ?? ""}
                placeholder="What happened today? Be honest."
                onSave={(v) => mutate({ reflection: v })}
                textarea
                minHeight={62}
              />
              <AutoSaveField
                label="Lessons Learned"
                value={day.lessons ?? ""}
                placeholder="What will I carry forward?"
                onSave={(v) => mutate({ lessons: v })}
                textarea
                minHeight={62}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
