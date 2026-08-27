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
import { sampleMaintenance } from "@/lib/sample-data";

const tone = {
  Critical: "danger",
  Pending: "warning",
  "In progress": "info",
  Closed: "success",
} as const;

export function MaintenancePage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="MAINTENANCE"
        title="Maintenance tracker"
        description="Demo workshop jobs for the FleetCare Demo School fleet."
        action={<PrimaryButton>New work order</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Open jobs", value: "3" },
          { label: "Critical", value: "1" },
          { label: "Due this week", value: "2" },
          { label: "Completed MTD", value: "17" },
        ]}
      />
      <Panel
        title="Work orders"
        action={
          <div className="flex gap-2">
            <SearchField placeholder="Search vehicle" />
            <GhostButton>Workshop</GhostButton>
          </div>
        }
      >
        <DataTable
          columns={["Vehicle", "Issue", "Workshop", "Due", "Priority"]}
          rows={sampleMaintenance.map((item, index) => [
            item.vehicle,
            item.issue,
            item.workshop,
            item.due,
            <StatusPill key={`m-${index}`} label={item.priority} tone={tone[item.priority]} />,
          ])}
        />
      </Panel>
    </div>
  );
}
