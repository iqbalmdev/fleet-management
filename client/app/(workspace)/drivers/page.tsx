import { drivers } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Module } from "@/components/module";

export default function DriversPage() {
  return (
    <Module
      code="M2"
      title="Drivers & staff"
      body="Profiles, assignments, compliance and availability for the people beside the bus."
    >
      <DataTable
        columns={["Name", "ID", "License", "Status", "Route", "Hours today"]}
        rows={drivers.map((row) => [
          row.name,
          row.id,
          row.license,
          row.status,
          row.route,
          row.hours,
        ])}
      />
    </Module>
  );
}
