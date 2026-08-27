"use client";

import { DriverModuleWorkspace } from "@/components/driver-shell";

const seed = [
  {
    id: "dr-reimb-1",
    date: "26 Aug",
    type: "Toll",
    note: "ORR trip",
    amount: "₹320",
    status: "Pending",
  },
  {
    id: "dr-reimb-2",
    date: "25 Aug",
    type: "Parking",
    note: "Campus lot",
    amount: "₹150",
    status: "Paid",
  },
];

export function DriverReimbursementsPage() {
  return (
    <DriverModuleWorkspace
      title="Reimbursement"
      description="Submit toll, parking, and other out-of-pocket claims for approval."
      storageKey="fleet_driver_reimb_v1"
      seed={seed}
      formTitle="New claim"
      listTitle="My claims"
      createLabel="Submit claim"
      statusKey="status"
      fields={[
        { name: "date", label: "Date", placeholder: "27 Aug" },
        {
          name: "type",
          label: "Type",
          options: [
            { value: "Toll", label: "Toll" },
            { value: "Parking", label: "Parking" },
            { value: "Meal", label: "Meal" },
            { value: "Other", label: "Other" },
          ],
        },
        { name: "note", label: "Note", placeholder: "ORR trip" },
        { name: "amount", label: "Amount", placeholder: "₹320" },
        {
          name: "status",
          label: "Status",
          options: [
            { value: "Pending", label: "Pending" },
            { value: "Paid", label: "Paid" },
            { value: "Rejected", label: "Rejected" },
          ],
        },
      ]}
      columns={[
        { key: "date", label: "Date" },
        { key: "type", label: "Type" },
        { key: "note", label: "Note" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
