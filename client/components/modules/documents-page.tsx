"use client";

import {
  DataTable,
  GhostButton,
  ModuleHeader,
  Panel,
  PrimaryButton,
  SearchField,
  StatGrid,
  StatusPill,
} from "@/components/admin-ui";
import { sampleDocuments } from "@/lib/sample-data";

const tone = {
  Valid: "success",
  Expiring: "warning",
  Expired: "danger",
  "Missing scan": "warning",
} as const;

export function DocumentsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="DOCUMENTS"
        title="Fleet documents"
        description="Demo insurance, fitness, permits, and driver paperwork."
        action={<PrimaryButton>Upload document</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Total files", value: String(sampleDocuments.length) },
          { label: "Expiring soon", value: "1" },
          { label: "Expired", value: "1" },
          { label: "Missing", value: "1" },
        ]}
      />
      <Panel
        title="Document vault"
        action={
          <div className="flex gap-2">
            <SearchField placeholder="Search document" />
            <GhostButton>Folders</GhostButton>
          </div>
        }
      >
        <DataTable
          columns={["Document", "Owner", "Category", "Expiry", "Status"]}
          rows={sampleDocuments.map((item, index) => [
            item.document,
            item.owner,
            item.category,
            item.expiry,
            <StatusPill key={`d-${index}`} label={item.status} tone={tone[item.status]} />,
          ])}
        />
      </Panel>
    </div>
  );
}
