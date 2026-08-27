import { fuelRows } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Module } from "@/components/module";

export default function FuelPage() {
  return (
    <Module
      code="M6"
      title="Fuel & expenses"
      body="Transactions, receipts, approvals and budgets. Finance reviews spend without leaving the workspace."
    >
      <DataTable
        columns={["Date", "Vehicle", "Litres", "Amount", "Status"]}
        rows={fuelRows.map((row) => [
          row.date,
          row.vehicle,
          String(row.litres),
          row.amount,
          row.status,
        ])}
      />
    </Module>
  );
}
