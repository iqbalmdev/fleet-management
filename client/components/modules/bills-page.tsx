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
import { sampleBills } from "@/lib/sample-data";

const tone = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
} as const;

export function BillsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="BILL SANCTION"
        title="Pending bill sanctions"
        description="Demo repair and parts invoices awaiting approval."
        action={<PrimaryButton>New bill</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Pending", value: "3" },
          { label: "Approved MTD", value: "24" },
          { label: "Rejected", value: "1" },
          { label: "Amount pending", value: "₹39.3K" },
        ]}
      />
      <Panel
        title="Sanction queue"
        action={
          <div className="flex gap-2">
            <SearchField placeholder="Search vendor or bill" />
            <GhostButton>Export</GhostButton>
          </div>
        }
      >
        <DataTable
          columns={["Bill", "Vendor", "Vehicle", "Amount", "Status"]}
          rows={sampleBills.map((item, index) => [
            item.bill,
            item.vendor,
            item.vehicle,
            item.amount,
            <StatusPill key={`b-${index}`} label={item.status} tone={tone[item.status]} />,
          ])}
        />
      </Panel>
    </div>
  );
}
