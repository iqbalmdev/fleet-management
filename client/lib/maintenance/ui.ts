import type { MaintenancePriority, MaintenanceStatus } from "@/lib/maintenance";

export function maintenanceStatusTone(
  status: MaintenanceStatus,
): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "completed":
      return "success";
    case "rejected":
    case "cancelled":
      return "danger";
    case "in_service":
    case "waiting_for_parts":
    case "pending_verification":
    case "pending_payment_approval":
      return "warning";
    case "approved":
    case "work_order_created":
    case "verified":
    case "submitted":
    case "under_review":
    case "service_completed":
      return "info";
    default:
      return "neutral";
  }
}

export function maintenancePriorityTone(
  priority: MaintenancePriority,
): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (priority) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "neutral";
  }
}

export function formatDateLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return iso;
}

export function formatDateTimeLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
