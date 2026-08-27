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
import { sampleFuel } from "@/lib/sample-data";

const tone = {
  Posted: "success",
  Review: "warning",
} as const;

export function FuelPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="FUEL & EXPENSES"
        title="Fuel and expenses"
        description="Demo fill-ups and trip-related costs."
        action={<PrimaryButton>Add expense</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Fuel MTD", value: "₹2.4L" },
          { label: "Litres filled", value: "3,180" },
          { label: "Avg cost / L", value: "₹96.4" },
          { label: "Other expenses", value: "₹38K" },
        ]}
      />
      <Panel
        title="Recent entries"
        action={
          <div className="flex gap-2">
            <SearchField placeholder="Search vehicle or card" />
            <GhostButton>Cards</GhostButton>
          </div>
        }
      >
        <DataTable
          columns={["Date", "Vehicle", "Type", "Qty / note", "Amount", "Status"]}
          rows={sampleFuel.map((item, index) => [
            item.date,
            item.vehicle,
            item.type,
            item.note,
            item.amount,
            <StatusPill key={`f-${index}`} label={item.status} tone={tone[item.status]} />,
          ])}
        />
      </Panel>
    </div>
  );
}
