"use client";

import { ModuleWorkspace } from "@/components/module-workspace";
import { sampleTrips } from "@/lib/sample-data";

const seed = sampleTrips.map((item, index) => ({
  id: `trip-${index + 1}`,
  trip: item.trip,
  route: item.route,
  vehicle: item.vehicle,
  driver: item.driver,
  eta: item.eta,
  status: item.status,
}));

export function TripsPage() {
  return (
    <ModuleWorkspace
      eyebrow="TRIPS"
      title="Trip operations"
      description="Create trips and export the operations board."
      storageKey="fleet_module_trips_v1"
      seed={seed}
      formTitle="Add trip"
      listTitle="Trip board"
      createLabel="Save trip"
      statusKey="status"
      statusTone={{
        Live: "info",
        Delayed: "warning",
        Completed: "success",
        Cancelled: "danger",
      }}
      fields={[
        { name: "trip", label: "Trip ID", placeholder: "TRP-2405" },
        { name: "route", label: "Route", placeholder: "Zone A Morning" },
        { name: "vehicle", label: "Vehicle", placeholder: "BUS-01" },
        { name: "driver", label: "Driver", placeholder: "Karthik R" },
        { name: "eta", label: "ETA", placeholder: "07:55" },
        {
          name: "status",
          label: "Status",
          options: [
            { value: "Live", label: "Live" },
            { value: "Delayed", label: "Delayed" },
            { value: "Completed", label: "Completed" },
            { value: "Cancelled", label: "Cancelled" },
          ],
        },
      ]}
      columns={[
        { key: "trip", label: "Trip" },
        { key: "route", label: "Route" },
        { key: "vehicle", label: "Vehicle" },
        { key: "driver", label: "Driver" },
        { key: "eta", label: "ETA" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
