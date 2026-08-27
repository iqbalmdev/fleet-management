"use client";

import { ModuleWorkspace } from "@/components/module-workspace";
import { RouteBoardMap } from "@/components/route-board-map";
import { sampleAssignments, sampleRoutes } from "@/lib/sample-data";

const seed = [
  ...sampleRoutes.map((item, index) => ({
    id: `route-${index + 1}`,
    route: item.route,
    shift: item.shift,
    stops: item.stops,
    vehicle: sampleAssignments[index]?.vehicle ?? "—",
    driver: sampleAssignments[index]?.driver ?? "Unassigned",
    status: item.status,
  })),
];

export function RoutesPage() {
  return (
    <ModuleWorkspace
      eyebrow="ROUTES & ASSIGNMENTS"
      title="Routes and assignments"
      description="Create routes, assign vehicles/drivers, and export the board."
      storageKey="fleet_module_routes_v1"
      seed={seed}
      formTitle="Add route"
      listTitle="Route board"
      createLabel="Save assignment"
      statusKey="status"
      statusTone={{
        Live: "success",
        Scheduled: "info",
        "Needs driver": "warning",
      }}
      fields={[
        { name: "route", label: "Route name", placeholder: "Zone A Morning" },
        { name: "shift", label: "Shift timing", placeholder: "06:30–08:10" },
        { name: "stops", label: "Stops", placeholder: "12", type: "number" },
        { name: "vehicle", label: "Vehicle", placeholder: "BUS-01" },
        { name: "driver", label: "Driver", placeholder: "Karthik R" },
        {
          name: "status",
          label: "Status",
          options: [
            { value: "Scheduled", label: "Scheduled" },
            { value: "Live", label: "Live" },
            { value: "Needs driver", label: "Needs driver" },
          ],
        },
      ]}
      columns={[
        { key: "route", label: "Route" },
        { key: "shift", label: "Shift" },
        { key: "vehicle", label: "Vehicle" },
        { key: "driver", label: "Driver" },
        { key: "status", label: "Status" },
      ]}
      stats={[
        { label: "Routes", value: (rows) => String(rows.length) },
        {
          label: "Assigned",
          value: (rows) => String(rows.filter((row) => row.driver !== "Unassigned").length),
        },
        {
          label: "Needs driver",
          value: (rows) => String(rows.filter((row) => row.status === "Needs driver").length),
        },
        { label: "Stops", value: (rows) => String(rows.reduce((sum, row) => sum + Number(row.stops || 0), 0)) },
      ]}
      boardViews={["list", "map"]}
      mapTitle="Route map"
      mapContent={(rows) => <RouteBoardMap rows={rows} />}
    />
  );
}
