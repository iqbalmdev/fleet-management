"use client";

import {
  GhostButton,
  ModuleHeader,
  Panel,
  PrimaryButton,
  StatGrid,
  StatusPill,
} from "@/components/admin-ui";

const notifications = [
  {
    title: "Brake job critical",
    body: "BUS TN-30-AB-1234 needs workshop approval before tomorrow morning shift.",
    time: "12 min ago",
    tone: "danger" as const,
  },
  {
    title: "License expiring",
    body: "Suresh K license expires in 18 days. Ask for renewal scan.",
    time: "1 hr ago",
    tone: "warning" as const,
  },
  {
    title: "Trip delayed",
    body: "Campus Express is running 12 minutes late near Lake Road.",
    time: "2 hr ago",
    tone: "info" as const,
  },
  {
    title: "Bill approved",
    body: "Tyre bill ₹22,000 for BUS-07 was sanctioned by Accounts.",
    time: "Yesterday",
    tone: "success" as const,
  },
];

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="NOTIFICATIONS"
        title="Alerts and updates"
        description="Operational alerts for trips, documents, and approvals."
        action={<PrimaryButton>Mark all read</PrimaryButton>}
      />
      <StatGrid
        items={[
          { label: "Unread", value: "03" },
          { label: "Critical", value: "01" },
          { label: "Today", value: "07" },
          { label: "Muted rules", value: "02" },
        ]}
      />
      <Panel title="Inbox" action={<GhostButton>Preferences</GhostButton>}>
        <ul className="space-y-3">
          {notifications.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <StatusPill label={item.tone} tone={item.tone} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{item.body}</p>
                </div>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
