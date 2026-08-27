"use client";

import { ModuleWorkspace } from "@/components/module-workspace";
import { sampleFuel } from "@/lib/sample-data";

const seed = sampleFuel.map((item, index) => ({
  id: `fuel-${index + 1}`,
  date: item.date,
  vehicle: item.vehicle,
  type: item.type,
  note: item.note,
  amount: item.amount,
  status: item.status,
}));

export function FuelPage() {
  return (
    <ModuleWorkspace
      eyebrow="FUEL & EXPENSES"
      title="Fuel and expenses"
      description="Log fill-ups or expenses and export the ledger."
      storageKey="fleet_module_fuel_v1"
      seed={seed}
      formTitle="Add fuel / expense"
      listTitle="Recent entries"
      createLabel="Save expense"
      statusKey="status"
      statusTone={{
        Posted: "success",
        Review: "warning",
      }}
      fields={[
        { name: "date", label: "Date", placeholder: "27 Aug" },
        { name: "vehicle", label: "Vehicle", placeholder: "BUS-01" },
        {
          name: "type",
          label: "Type",
          options: [
            { value: "Diesel", label: "Diesel" },
            { value: "Petrol", label: "Petrol" },
            { value: "Toll", label: "Toll" },
            { value: "Parking", label: "Parking" },
            { value: "Other", label: "Other" },
          ],
        },
        { name: "note", label: "Qty / note", placeholder: "42 L" },
        { name: "amount", label: "Amount", placeholder: "₹4,050" },
        {
          name: "status",
          label: "Status",
          options: [
            { value: "Posted", label: "Posted" },
            { value: "Review", label: "Review" },
          ],
        },
      ]}
      columns={[
        { key: "date", label: "Date" },
        { key: "vehicle", label: "Vehicle" },
        { key: "type", label: "Type" },
        { key: "note", label: "Qty / note" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
