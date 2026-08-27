"use client";

import {
  GhostButton,
  ModuleHeader,
  Panel,
  PrimaryButton,
  StatGrid,
} from "@/components/admin-ui";

export function ReportsPage() {
  const reports = [
    { name: "Fleet utilization", period: "This month", owner: "Ops" },
    { name: "Fuel efficiency", period: "Last 30 days", owner: "Finance" },
    { name: "Driver attendance", period: "This week", owner: "HR" },
    { name: "Maintenance cost", period: "Q2", owner: "Workshop" },
    { name: "Trip punctuality", period: "This month", owner: "Ops" },
    { name: "Bill sanctions", period: "August", owner: "Accounts" },
  ];

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="REPORTS"
        title="Reports center"
        description="Sample analytics packs for operations and finance."
        action={<PrimaryButton>Generate report</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Saved reports", value: "18" },
          { label: "Scheduled", value: "06" },
          { label: "Shared links", value: "11" },
          { label: "Exports MTD", value: "43" },
        ]}
      />
      <Panel title="Report library" action={<GhostButton>Filters</GhostButton>}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.name}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="text-sm font-medium text-white">{report.name}</p>
              <p className="mt-1 text-xs text-slate-400">{report.period}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">{report.owner}</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-sky-300 hover:text-sky-200"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
