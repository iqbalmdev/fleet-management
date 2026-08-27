"use client";

import {
  DataTable,
  GhostButton,
  ModuleHeader,
  Panel,
  PrimaryButton,
  SearchField,
  StatGrid,
  StatusPill,
} from "@/components/admin-ui";
import { sampleAssignments, sampleRoutes } from "@/lib/sample-data";

const routeTone = {
  Live: "success",
  Scheduled: "info",
  "Needs driver": "warning",
} as const;

export function RoutesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="ROUTES & ASSIGNMENTS"
        title="Routes and assignments"
        description="Demo routes mapped to seeded drivers and vehicles."
        action={<PrimaryButton>Create route</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Active routes", value: String(sampleRoutes.length) },
          { label: "Assigned today", value: "3" },
          { label: "Unassigned", value: "1" },
          { label: "Stops covered", value: "32" },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Route board" action={<GhostButton>Map view</GhostButton>}>
          <DataTable
            columns={["Route", "Shift", "Stops", "Status"]}
            rows={sampleRoutes.map((item, index) => [
              item.route,
              item.shift,
              item.stops,
              <StatusPill key={`r-${index}`} label={item.status} tone={routeTone[item.status]} />,
            ])}
          />
        </Panel>
        <Panel title="Assignments" action={<PrimaryButton>Assign</PrimaryButton>}>
          <DataTable
            columns={["Route", "Vehicle", "Driver"]}
            rows={sampleAssignments.map((item) => [item.route, item.vehicle, item.driver])}
          />
        </Panel>
      </div>
      <Panel title="Quick filters" action={<SearchField placeholder="Search route code" />}>
        <div className="flex flex-wrap gap-2">
          {["Morning", "Evening", "Staff", "Unassigned", "Critical"].map((chip) => (
            <button
              key={chip}
              type="button"
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              {chip}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
