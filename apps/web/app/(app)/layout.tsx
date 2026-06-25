import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex h-screen flex-1 flex-col overflow-y-auto">
          <Topbar />
          <div className="mx-auto w-full max-w-[1180px] flex-1 animate-alphaFade px-9 pb-16 pt-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
