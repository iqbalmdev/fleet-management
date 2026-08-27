"use client";

import { ModuleWorkspace } from "@/components/module-workspace";
import { sampleMaintenance } from "@/lib/sample-data";

const seed = sampleMaintenance.map((item, index) => ({
  id: `mnt-${index + 1}`,
  vehicle: item.vehicle,
  issue: item.issue,
  workshop: item.workshop,
  due: item.due,
  priority: item.priority,
}));

export function MaintenancePage() {
  return (
    <ModuleWorkspace
      eyebrow="MAINTENANCE"
      title="Maintenance tracker"
      description="Create work orders and export workshop jobs."
      storageKey="fleet_module_maintenance_v1"
      seed={seed}
      formTitle="Add work order"
      listTitle="Work orders"
      createLabel="Save work order"
      statusKey="priority"
      statusTone={{
        Critical: "danger",
        Pending: "warning",
        "In progress": "info",
        Closed: "success",
      }}
      fields={[
        { name: "vehicle", label: "Vehicle", placeholder: "BUS TN-30-AB-1234" },
        { name: "issue", label: "Issue", placeholder: "Brake replacement" },
        { name: "workshop", label: "Workshop", placeholder: "City Auto Care" },
        { name: "due", label: "Due date", placeholder: "29 Aug" },
        {
          name: "priority",
          label: "Priority",
          options: [
            { value: "Pending", label: "Pending" },
            { value: "In progress", label: "In progress" },
            { value: "Critical", label: "Critical" },
            { value: "Closed", label: "Closed" },
          ],
        },
      ]}
      columns={[
        { key: "vehicle", label: "Vehicle" },
        { key: "issue", label: "Issue" },
        { key: "workshop", label: "Workshop" },
        { key: "due", label: "Due" },
        { key: "priority", label: "Priority" },
      ]}
    />
  );
}
