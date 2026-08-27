import { workOrders } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Module } from "@/components/module";

export default function MaintenancePage() {
  return (
    <Module
      code="M5"
      title="Maintenance"
      body="Work orders, vendors, parts and service history. A failed inspection becomes a hold until cleared."
    >
      <DataTable
        columns={["WO", "Vehicle", "Issue", "Vendor", "Status", "Due"]}
        rows={workOrders.map((row) => [
          row.id,
          row.vehicle,
          row.issue,
          row.vendor,
          row.status,
          row.due,
        ])}
      />
    </Module>
  );
}
