"use client";

import { ModuleWorkspace } from "@/components/module-workspace";

const seed = [
  {
    id: "set-1",
    key: "Timezone",
    value: "Asia/Kolkata (IST)",
    category: "Organization",
  },
  {
    id: "set-2",
    key: "Currency",
    value: "INR (₹)",
    category: "Organization",
  },
  {
    id: "set-3",
    key: "Trip delay alerts",
    value: "Enabled",
    category: "Preferences",
  },
];

export function SettingsPage() {
  return (
    <ModuleWorkspace
      eyebrow="SETTINGS"
      title="Organization settings"
      description="Add settings entries and export the configuration list."
      storageKey="fleet_module_settings_v1"
      seed={seed}
      formTitle="Add setting"
      listTitle="Settings list"
      createLabel="Save setting"
      fields={[
        { name: "key", label: "Setting name", placeholder: "Document expiry reminders" },
        { name: "value", label: "Value", placeholder: "Enabled" },
        {
          name: "category",
          label: "Category",
          options: [
            { value: "Organization", label: "Organization" },
            { value: "Preferences", label: "Preferences" },
            { value: "Security", label: "Security" },
          ],
        },
      ]}
      columns={[
        { key: "key", label: "Setting" },
        { key: "value", label: "Value" },
        { key: "category", label: "Category" },
      ]}
    />
  );
}
