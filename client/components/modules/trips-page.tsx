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
import { sampleTrips } from "@/lib/sample-data";

const tone = {
  Live: "info",
  Delayed: "warning",
  Completed: "success",
  Cancelled: "danger",
} as const;

export function TripsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="TRIPS"
        title="Trip operations"
        description="Demo live and completed school trips."
        action={<PrimaryButton>Create trip</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Live now", value: "1" },
          { label: "Completed today", value: "1" },
          { label: "Delayed", value: "1" },
          { label: "Cancelled", value: "1" },
        ]}
      />
      <Panel
        title="Trip board"
        action={
          <div className="flex gap-2">
            <SearchField placeholder="Search trip or route" />
            <GhostButton>Live map</GhostButton>
          </div>
        }
      >
        <DataTable
          columns={["Trip", "Route", "Vehicle", "Driver", "ETA", "Status"]}
          rows={sampleTrips.map((item, index) => [
            item.trip,
            item.route,
            item.vehicle,
            item.driver,
            item.eta,
            <StatusPill key={`t-${index}`} label={item.status} tone={tone[item.status]} />,
          ])}
        />
      </Panel>
    </div>
  );
}
