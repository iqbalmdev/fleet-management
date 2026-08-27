"use client";

import { DriverModuleWorkspace } from "@/components/driver-shell";

const seed = [
  {
    id: "dr-fuel-1",
    date: "27 Aug",
    station: "IOCL Greenfield",
    litres: "42",
    amount: "₹4,050",
    status: "Submitted",
  },
  {
    id: "dr-fuel-2",
    date: "24 Aug",
    station: "HP Campus Road",
    litres: "38",
    amount: "₹3,680",
    status: "Approved",
  },
];

export function DriverFuelPage() {
  return (
    <DriverModuleWorkspace
      title="Fuel expense"
      description="Log fill-ups for your assigned vehicle and export your fuel sheet."
      storageKey="fleet_driver_fuel_v1"
      seed={seed}
      formTitle="Add fuel entry"
      listTitle="My fuel logs"
      createLabel="Submit fuel"
      statusKey="status"
      fields={[
        { name: "date", label: "Date", placeholder: "27 Aug" },
        { name: "station", label: "Station", placeholder: "IOCL Greenfield" },
        { name: "litres", label: "Litres", placeholder: "42", type: "number" },
        { name: "amount", label: "Amount", placeholder: "₹4,050" },
        {
          name: "status",
          label: "Status",
          options: [
            { value: "Submitted", label: "Submitted" },
            { value: "Approved", label: "Approved" },
            { value: "Review", label: "Review" },
          ],
        },
      ]}
      columns={[
        { key: "date", label: "Date" },
        { key: "station", label: "Station" },
        { key: "litres", label: "Litres" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
