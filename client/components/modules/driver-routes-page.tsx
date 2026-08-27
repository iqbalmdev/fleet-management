"use client";

import { DriverModuleWorkspace } from "@/components/driver-shell";

const seed = [
  {
    id: "dr-route-1",
    route: "Zone A Morning",
    shift: "06:30–08:10",
    vehicle: "BUS-01",
    stops: "12",
    status: "Assigned",
  },
  {
    id: "dr-route-2",
    route: "Zone A Evening",
    shift: "15:30–17:20",
    vehicle: "BUS-01",
    stops: "12",
    status: "Assigned",
  },
];

export function DriverRoutesPage() {
  return (
    <DriverModuleWorkspace
      title="Route assignment"
      description="Your assigned routes for this vehicle. Add notes if dispatch changes the plan."
      storageKey="fleet_driver_routes_v1"
      seed={seed}
      formTitle="Log route note"
      listTitle="My assignments"
      createLabel="Save note"
      statusKey="status"
      fields={[
        { name: "route", label: "Route", placeholder: "Zone A Morning" },
        { name: "shift", label: "Shift", placeholder: "06:30–08:10" },
        { name: "vehicle", label: "Vehicle", placeholder: "BUS-01" },
        { name: "stops", label: "Stops", placeholder: "12", type: "number" },
        {
          name: "status",
          label: "Status",
          options: [
            { value: "Assigned", label: "Assigned" },
            { value: "In progress", label: "In progress" },
            { value: "Completed", label: "Completed" },
          ],
        },
      ]}
      columns={[
        { key: "route", label: "Route" },
        { key: "shift", label: "Shift" },
        { key: "vehicle", label: "Vehicle" },
        { key: "stops", label: "Stops" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
