import { documents } from "@/lib/data";
import { DataTable } from "@/components/data-table";
import { Module } from "@/components/module";

export default function DocumentsPage() {
  return (
    <Module
      code="M7"
      title="Documents"
      body="Registration, insurance, permits and reminders. School-owned records with an expiry clock."
    >
      <DataTable
        columns={["Document", "Applies to", "Expiry", "Status"]}
        rows={documents.map((row) => [row.name, row.vehicle, row.expiry, row.status])}
      />
    </Module>
  );
}
