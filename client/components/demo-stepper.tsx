"use client";

import Link from "next/link";
import { demoSteps } from "@/lib/demo-flow";

export function DemoStepper({ current }: { current: string | null }) {
  const index = demoSteps.findIndex((step) => step.id === current);

  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {demoSteps.map((step, stepIndex) => {
        const active = step.id === current;
        const done = index > stepIndex;
        return (
          <li key={step.id} className="flex items-center gap-2">
            {stepIndex > 0 ? <span className="text-slate-300">→</span> : null}
            <Link
              href={step.href}
              className={
                active
                  ? "rounded-full bg-[#2563eb] px-3 py-1 text-xs font-semibold text-white"
                  : done
                    ? "rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#1d4ed8]"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
              }
            >
              {step.label}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
