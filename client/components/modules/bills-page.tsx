"use client";

import { ModuleWorkspace } from "@/components/module-workspace";
import { sampleBills } from "@/lib/sample-data";

const seed = sampleBills.map((item, index) => ({
  id: `bill-${index + 1}`,
  bill: item.bill,
  vendor: item.vendor,
  vehicle: item.vehicle,
  amount: item.amount,
  status: item.status,
}));

export function BillsPage() {
  return (
    <ModuleWorkspace
      eyebrow="BILL SANCTION"
      title="Pending bill sanctions"
      description="Create bills for approval and export the sanction queue."
      storageKey="fleet_module_bills_v1"
      seed={seed}
      formTitle="Add bill"
      listTitle="Sanction queue"
      createLabel="Save bill"
      statusKey="status"
      statusTone={{
        Pending: "warning",
        Approved: "success",
        Rejected: "danger",
      }}
      fields={[
        { name: "bill", label: "Bill name", placeholder: "Repair Bill" },
        { name: "vendor", label: "Vendor", placeholder: "City Auto Care" },
        { name: "vehicle", label: "Vehicle", placeholder: "TN-30-AB-1234" },
        { name: "amount", label: "Amount", placeholder: "₹18,500" },
        {
          name: "status",
          label: "Status",
          options: [
            { value: "Pending", label: "Pending" },
            { value: "Approved", label: "Approved" },
            { value: "Rejected", label: "Rejected" },
          ],
        },
      ]}
      columns={[
        { key: "bill", label: "Bill" },
        { key: "vendor", label: "Vendor" },
        { key: "vehicle", label: "Vehicle" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
