"use client";

import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/components/ui/cn";

interface Stepper {
  onInc: () => void;
  onDec: () => void;
}

interface RuleRowProps {
  title: string;
  subtitle: string;
  done: boolean;
  onToggle: () => void;
  stepper?: Stepper;
}

/** A mandatory-rule row: gold check toggle + label, with an optional +/- stepper. */
export function RuleRow({ title, subtitle, done, onToggle, stepper }: RuleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-md border px-4 py-3.5",
        done ? "border-gold/30 bg-gold/6" : "border-white/8 bg-panel2",
      )}
    >
      <button
        onClick={onToggle}
        aria-pressed={done}
        className={cn(
          "flex h-6 w-6 flex-none items-center justify-center rounded-md border-[1.5px] transition-colors",
          done ? "border-gold bg-gold text-bg" : "border-white/20 text-transparent",
        )}
      >
        <Check size={14} strokeWidth={3} />
      </button>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-faint">{subtitle}</div>
      </div>
      {stepper && (
        <div className="flex items-center gap-1.5">
          <StepBtn onClick={stepper.onDec} aria-label="decrease">
            <Minus size={16} />
          </StepBtn>
          <StepBtn onClick={stepper.onInc} aria-label="increase">
            <Plus size={16} />
          </StepBtn>
        </div>
      )}
    </div>
  );
}

function StepBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-white/12 text-fg transition-colors hover:bg-white/5"
      {...props}
    >
      {children}
    </button>
  );
}
