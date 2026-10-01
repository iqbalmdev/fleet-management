/** Lightweight in-app notifications synced to the Notifications module list. */

export type OpsNotificationTone = "Info" | "Warning" | "Critical" | "Success";

export type OpsNotification = {
  id: string;
  orgId: string;
  title: string;
  body: string;
  time: string;
  tone: OpsNotificationTone;
};

const KEY = "fleet_module_notifications_v1";

function relativeTimeLabel(): string {
  return "Just now";
}

export function pushOpsNotification(input: {
  orgId: string;
  title: string;
  body: string;
  tone?: OpsNotificationTone;
}): OpsNotification | null {
  if (typeof window === "undefined") return null;

  const item: OpsNotification = {
    id: `ntf-${Date.now()}`,
    orgId: input.orgId,
    title: input.title,
    body: input.body,
    time: relativeTimeLabel(),
    tone: input.tone ?? "Info",
  };

  try {
    const raw = localStorage.getItem(KEY);
    const rows = raw ? (JSON.parse(raw) as OpsNotification[]) : [];
    const list = Array.isArray(rows) ? rows : [];
    list.unshift({
      id: item.id,
      title: item.title,
      body: item.body,
      time: item.time,
      tone: item.tone,
      // ModuleWorkspace records are flat strings; orgId kept for future filter
      orgId: item.orgId,
    } as OpsNotification);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    localStorage.setItem(
      KEY,
      JSON.stringify([
        {
          id: item.id,
          title: item.title,
          body: item.body,
          time: item.time,
          tone: item.tone,
        },
      ]),
    );
  }

  return item;
}
