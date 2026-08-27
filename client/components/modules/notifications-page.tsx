"use client";

import { ModuleWorkspace } from "@/components/module-workspace";

const seed = [
  {
    id: "ntf-1",
    title: "Brake job critical",
    body: "BUS TN-30-AB-1234 needs workshop approval.",
    time: "12 min ago",
    tone: "Critical",
  },
  {
    id: "ntf-2",
    title: "License expiring",
    body: "Suresh K license expires in 18 days.",
    time: "1 hr ago",
    tone: "Warning",
  },
  {
    id: "ntf-3",
    title: "Trip delayed",
    body: "Campus Express is 12 minutes late.",
    time: "2 hr ago",
    tone: "Info",
  },
];

export function NotificationsPage() {
  return (
    <ModuleWorkspace
      eyebrow="NOTIFICATIONS"
      title="Alerts and updates"
      description="Create operational alerts and export the inbox."
      storageKey="fleet_module_notifications_v1"
      seed={seed}
      formTitle="Add notification"
      listTitle="Inbox"
      createLabel="Save alert"
      statusKey="tone"
      statusTone={{
        Critical: "danger",
        Warning: "warning",
        Info: "info",
        Success: "success",
      }}
      fields={[
        { name: "title", label: "Title", placeholder: "Service due reminder" },
        { name: "body", label: "Message", placeholder: "VAN-04 service is due tomorrow" },
        { name: "time", label: "Time label", placeholder: "Just now" },
        {
          name: "tone",
          label: "Severity",
          options: [
            { value: "Info", label: "Info" },
            { value: "Warning", label: "Warning" },
            { value: "Critical", label: "Critical" },
            { value: "Success", label: "Success" },
          ],
        },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "body", label: "Message" },
        { key: "time", label: "When" },
        { key: "tone", label: "Severity" },
      ]}
    />
  );
}
