"use client";

import { ModuleWorkspace } from "@/components/module-workspace";
import { sampleDocuments } from "@/lib/sample-data";

const seed = sampleDocuments.map((item, index) => ({
  id: `doc-${index + 1}`,
  document: item.document,
  owner: item.owner,
  category: item.category,
  expiry: item.expiry,
  status: item.status,
}));

export function DocumentsPage() {
  return (
    <ModuleWorkspace
      eyebrow="DOCUMENTS"
      title="Fleet documents"
      description="Add document records and export the vault."
      storageKey="fleet_module_documents_v1"
      seed={seed}
      formTitle="Add document"
      listTitle="Document vault"
      createLabel="Save document"
      statusKey="status"
      statusTone={{
        Valid: "success",
        Expiring: "warning",
        Expired: "danger",
        "Missing scan": "warning",
      }}
      fields={[
        { name: "document", label: "Document", placeholder: "Insurance policy" },
        { name: "owner", label: "Owner", placeholder: "BUS-01" },
        {
          name: "category",
          label: "Category",
          options: [
            { value: "Vehicle", label: "Vehicle" },
            { value: "Driver", label: "Driver" },
            { value: "Ops", label: "Ops" },
          ],
        },
        { name: "expiry", label: "Expiry", placeholder: "12 Dec 2026" },
        {
          name: "status",
          label: "Status",
          options: [
            { value: "Valid", label: "Valid" },
            { value: "Expiring", label: "Expiring" },
            { value: "Expired", label: "Expired" },
            { value: "Missing scan", label: "Missing scan" },
          ],
        },
      ]}
      columns={[
        { key: "document", label: "Document" },
        { key: "owner", label: "Owner" },
        { key: "category", label: "Category" },
        { key: "expiry", label: "Expiry" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
