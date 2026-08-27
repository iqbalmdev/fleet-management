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
import { sampleInspections } from "@/lib/sample-data";

const tone = {
  Passed: "success",
  Failed: "danger",
  Overdue: "warning",
} as const;

export function InspectionsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="INSPECTIONS"
        title="Vehicle inspections"
        description="Demo pre-trip and fitness inspection records."
        action={<PrimaryButton>Schedule inspection</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Due today", value: "09" },
          { label: "Passed", value: "21" },
          { label: "Failed", value: "02" },
          { label: "Overdue", value: "03" },
        ]}
      />
      <Panel
        title="Inspection log"
        action={
          <div className="flex gap-2">
            <SearchField placeholder="Search inspector or vehicle" />
            <GhostButton>Checklist</GhostButton>
          </div>
        }
      >
        <DataTable
          columns={["Vehicle", "Type", "Inspector", "Date", "Result"]}
          rows={sampleInspections.map((item, index) => [
            item.vehicle,
            item.type,
            item.inspector,
            item.date,
            <StatusPill key={`i-${index}`} label={item.result} tone={tone[item.result]} />,
          ])}
        />
      </Panel>
    </div>
  );
}
