import { routes } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Module } from "@/components/module";

export default function RoutesPage() {
  return (
    <Module
      code="M3"
      title="Routes & schedules"
      body="Stops, rosters, dispatch plans and live status. The dispatcher’s daily board."
    >
      <DataTable
        columns={["Code", "Name", "Stops", "Vehicle", "Status", "ETA"]}
        rows={routes.map((row) => [
          row.code,
          row.name,
          String(row.stops),
          row.vehicle,
          row.status,
          row.eta,
        ])}
      />
    </Module>
  );
}
