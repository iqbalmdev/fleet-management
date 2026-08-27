"use client";

import { DriverModuleWorkspace } from "@/components/driver-shell";

const seed = [
  {
    id: "dr-hist-1",
    date: "12 Aug",
    vehicle: "BUS-01",
    service: "Full service",
    workshop: "Fleet Bay 2",
    cost: "₹8,400",
  },
  {
    id: "dr-hist-2",
    date: "03 Jul",
    vehicle: "BUS-01",
    service: "Brake pads",
    workshop: "City Auto Care",
    cost: "₹6,200",
  },
  {
    id: "dr-hist-3",
    date: "18 May",
    vehicle: "BUS-01",
    service: "Tyre replacement",
    workshop: "MRF Hub",
    cost: "₹22,000",
  },
];

export function DriverServiceHistoryPage() {
  return (
    <DriverModuleWorkspace
      title="Past service history"
      description="Service history for your assigned vehicle. Add entries after workshop visits."
      storageKey="fleet_driver_service_history_v1"
      seed={seed}
      formTitle="Add service record"
      listTitle="Vehicle history"
      createLabel="Save record"
      fields={[
        { name: "date", label: "Date", placeholder: "27 Aug" },
        { name: "vehicle", label: "Vehicle", placeholder: "BUS-01" },
        { name: "service", label: "Service", placeholder: "Oil change" },
        { name: "workshop", label: "Workshop", placeholder: "Fleet Bay 2" },
        { name: "cost", label: "Cost", placeholder: "₹2,500" },
      ]}
      columns={[
        { key: "date", label: "Date" },
        { key: "vehicle", label: "Vehicle" },
        { key: "service", label: "Service" },
        { key: "workshop", label: "Workshop" },
        { key: "cost", label: "Cost" },
      ]}
    />
  );
}
