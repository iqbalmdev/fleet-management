"use client";

import { DriverModuleWorkspace } from "@/components/driver-shell";

const seed = [
  {
    id: "dr-alert-1",
    vehicle: "BUS-01",
    alert: "Oil change due",
    due: "29 Aug",
    severity: "Warning",
  },
  {
    id: "dr-alert-2",
    vehicle: "BUS-01",
    alert: "Brake pad inspection",
    due: "01 Sep",
    severity: "Info",
  },
  {
    id: "dr-alert-3",
    vehicle: "BUS-01",
    alert: "Tyre pressure check overdue",
    due: "Overdue",
    severity: "Critical",
  },
];

export function DriverAlertsPage() {
  return (
    <DriverModuleWorkspace
      title="Service alerts"
      description="Service reminders and alerts for your assigned vehicle."
      storageKey="fleet_driver_alerts_v1"
      seed={seed}
      formTitle="Report issue"
      listTitle="Active alerts"
      createLabel="Save alert"
      statusKey="severity"
      fields={[
        { name: "vehicle", label: "Vehicle", placeholder: "BUS-01" },
        { name: "alert", label: "Alert", placeholder: "Unusual engine noise" },
        { name: "due", label: "Due / when", placeholder: "Today" },
        {
          name: "severity",
          label: "Severity",
          options: [
            { value: "Info", label: "Info" },
            { value: "Warning", label: "Warning" },
            { value: "Critical", label: "Critical" },
          ],
        },
      ]}
      columns={[
        { key: "vehicle", label: "Vehicle" },
        { key: "alert", label: "Alert" },
        { key: "due", label: "Due" },
        { key: "severity", label: "Severity" },
      ]}
    />
  );
}
