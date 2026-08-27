"use client";

import { ModuleHeader, Panel, PrimaryButton, GhostButton } from "@/components/admin-ui";
import { getStoredSession } from "@/lib/api";
import { useEffect, useState } from "react";

export function SettingsPage() {
  const [org, setOrg] = useState("Organization");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = getStoredSession()?.user;
    setOrg(user?.orgName ?? "Organization");
    setEmail(user?.email ?? "");
  }, []);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="SETTINGS"
        title="Organization settings"
        description="Sample profile, notification, and preference controls."
        action={<PrimaryButton>Save changes</PrimaryButton>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Organization profile">
          <div className="space-y-4">
            <Field label="Organization name" value={org} />
            <Field label="Admin email" value={email} />
            <Field label="Timezone" value="Asia/Kolkata (IST)" />
            <Field label="Currency" value="INR (₹)" />
          </div>
        </Panel>

        <Panel title="Preferences" action={<GhostButton>Reset</GhostButton>}>
          <ul className="space-y-3 text-sm text-slate-300">
            {[
              "Email digest for pending bills",
              "Push alerts for delayed trips",
              "Weekly maintenance summary",
              "Document expiry reminders",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span>{item}</span>
                <span className="h-5 w-9 rounded-full bg-sky-500/30 p-0.5">
                  <span className="block h-4 w-4 translate-x-4 rounded-full bg-sky-300" />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Security">
        <div className="flex flex-wrap gap-3">
          <GhostButton>Change password</GhostButton>
          <GhostButton>Manage sessions</GhostButton>
          <GhostButton>Download audit log</GhostButton>
        </div>
      </Panel>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <input
        defaultValue={value}
        className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-slate-200 outline-none focus:border-sky-500/50"
      />
    </label>
  );
}
