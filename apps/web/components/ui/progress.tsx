import { cn } from "./cn";

interface ProgressProps {
  value: number; // 0..100
  className?: string;
  barClassName?: string;
  height?: number;
}

/** Thin gold progress bar (rails + fill), used for XP / domains / objectives. */
export function Progress({ value, className, barClassName, height = 5 }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("overflow-hidden rounded-full bg-white/8", className)}
      style={{ height }}
    >
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-gold-deep to-gold", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
