import { vehicles } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Module } from "@/components/module";

export default function FleetPage() {
  return (
    <Module
      code="M1"
      title="Fleet registry"
      body="Vehicles, capacity, routes, status and ownership. Intake → assignment → action → approval → audit."
    >
      <DataTable
        columns={["ID", "Plate", "Capacity", "Status", "Route", "Driver", "Next service"]}
        rows={vehicles.map((row) => [
          row.id,
          row.plate,
          String(row.capacity),
          row.status,
          row.route,
          row.driver,
          row.nextService,
        ])}
      />
    </Module>
  );
}
