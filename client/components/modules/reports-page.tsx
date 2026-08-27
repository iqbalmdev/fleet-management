"use client";

import { ModuleWorkspace } from "@/components/module-workspace";

const seed = [
  {
    id: "rep-1",
    name: "Fleet utilization",
    period: "This month",
    owner: "Ops",
    format: "PDF",
  },
  {
    id: "rep-2",
    name: "Fuel efficiency",
    period: "Last 30 days",
    owner: "Finance",
    format: "CSV",
  },
  {
    id: "rep-3",
    name: "Driver attendance",
    period: "This week",
    owner: "HR",
    format: "PDF",
  },
  {
    id: "rep-4",
    name: "Maintenance cost",
    period: "Q2",
    owner: "Workshop",
    format: "XLSX",
  },
];

export function ReportsPage() {
  return (
    <ModuleWorkspace
      eyebrow="REPORTS"
      title="Reports center"
      description="Create report definitions and export the library."
      storageKey="fleet_module_reports_v1"
      seed={seed}
      formTitle="Add report"
      listTitle="Report library"
      createLabel="Save report"
      fields={[
        { name: "name", label: "Report name", placeholder: "Trip punctuality" },
        { name: "period", label: "Period", placeholder: "This month" },
        { name: "owner", label: "Owner", placeholder: "Ops" },
        {
          name: "format",
          label: "Format",
          options: [
            { value: "PDF", label: "PDF" },
            { value: "CSV", label: "CSV" },
            { value: "XLSX", label: "XLSX" },
          ],
        },
      ]}
      columns={[
        { key: "name", label: "Report" },
        { key: "period", label: "Period" },
        { key: "owner", label: "Owner" },
        { key: "format", label: "Format" },
      ]}
    />
  );
}
