import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 flex-none rotate-45 items-center justify-center rounded-md border-[1.5px] border-gold">
            <div className="h-2.5 w-2.5 rounded-[1px] bg-gold" />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-[1.5px]">PROJECT ALPHA</div>
            <div className="font-mono text-[9px] tracking-[1px] text-dim">PERSONAL OS</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
