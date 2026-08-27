import { inspections } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Module } from "@/components/module";

export default function InspectionsPage() {
  return (
    <Module
      code="M4"
      title="Inspections"
      body="Pre-trip checks, defects, sign-off and audit trail. Engine, brakes, tyres, electrical, fluids."
    >
      <DataTable
        columns={["Vehicle", "Driver", "Result", "Notes", "Time"]}
        rows={inspections.map((row) => [
          row.vehicle,
          row.driver,
          row.result,
          row.items,
          row.time,
        ])}
      />
    </Module>
  );
}
