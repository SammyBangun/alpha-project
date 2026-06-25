import { colors } from "@alpha/ui/tokens";

interface ScoreRingProps {
  score: number; // 0..100
  size?: number;
  label?: string;
}

/** Conic-gradient compliance ring with the score in the center (prototype's Daily Compliance). */
export function ScoreRing({ score, size = 150, label = "/ 100" }: ScoreRingProps) {
  const deg = Math.max(0, Math.min(100, score)) * 3.6;
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `conic-gradient(${colors.gold} ${deg}deg, rgba(255,255,255,0.07) 0deg)`,
      }}
    >
      <div className="absolute inset-2.5 flex flex-col items-center justify-center rounded-full bg-panel">
        <div className="text-[38px] font-bold leading-none text-gold">{score}</div>
        <div className="mt-1 font-mono text-[9px] tracking-wider text-faint">{label}</div>
      </div>
    </div>
  );
}
