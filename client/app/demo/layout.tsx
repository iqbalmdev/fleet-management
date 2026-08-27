import type { ReactNode } from "react";
import { headers } from "next/headers";
import { FleetMark } from "@/components/fleet-mark";
import { DemoStepper } from "@/components/demo-stepper";
import { roleForPath, stepperIdForPath } from "@/lib/demo-flow";

export default async function DemoLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const path = headerList.get("x-demo-path") ?? "/demo";
  const role = roleForPath(path);
  const current = stepperIdForPath(path);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <FleetMark compact />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">
                ENTERPRISE SCHOOL TRANSPORT · DEMO
              </p>
              <p className="text-sm text-slate-600">Role lens: {role}</p>
            </div>
          </div>
          <DemoStepper current={current} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
