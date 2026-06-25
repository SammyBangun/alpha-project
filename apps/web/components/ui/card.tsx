import * as React from "react";
import { cn } from "./cn";

/** Panel surface — hairline border, near-black fill (matches prototype cards). */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-white/8 bg-panel", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

/** Mono micro-label used across the dashboard (e.g. "MANDATORY DAILY RULES"). */
export function Label({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("font-mono text-[10px] tracking-[1.5px] text-faint", className)}
      {...props}
    />
  );
}
