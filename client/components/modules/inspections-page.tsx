"use client";

import { ModuleWorkspace } from "@/components/module-workspace";
import { sampleInspections } from "@/lib/sample-data";

const seed = sampleInspections.map((item, index) => ({
  id: `insp-${index + 1}`,
  vehicle: item.vehicle,
  type: item.type,
  inspector: item.inspector,
  date: item.date,
  result: item.result,
}));

export function InspectionsPage() {
  return (
    <ModuleWorkspace
      eyebrow="INSPECTIONS"
      title="Vehicle inspections"
      description="Log inspections and export the checklist history."
      storageKey="fleet_module_inspections_v1"
      seed={seed}
      formTitle="Add inspection"
      listTitle="Inspection log"
      createLabel="Save inspection"
      statusKey="result"
      statusTone={{
        Passed: "success",
        Failed: "danger",
        Overdue: "warning",
      }}
      fields={[
        { name: "vehicle", label: "Vehicle", placeholder: "BUS-01" },
        {
          name: "type",
          label: "Type",
          options: [
            { value: "Pre-trip", label: "Pre-trip" },
            { value: "Weekly", label: "Weekly" },
            { value: "Fitness", label: "Fitness" },
            { value: "Safety audit", label: "Safety audit" },
          ],
        },
        { name: "inspector", label: "Inspector", placeholder: "Dispatcher Asha" },
        { name: "date", label: "Date", placeholder: "27 Aug 06:10" },
        {
          name: "result",
          label: "Result",
          options: [
            { value: "Passed", label: "Passed" },
            { value: "Failed", label: "Failed" },
            { value: "Overdue", label: "Overdue" },
          ],
        },
      ]}
      columns={[
        { key: "vehicle", label: "Vehicle" },
        { key: "type", label: "Type" },
        { key: "inspector", label: "Inspector" },
        { key: "date", label: "Date" },
        { key: "result", label: "Result" },
      ]}
    />
  );
}
