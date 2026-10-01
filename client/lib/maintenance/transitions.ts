import type { MaintenanceStatus } from "@/lib/maintenance/types";

/** Allowed status transitions for the maintenance lifecycle. */
export const MAINTENANCE_TRANSITIONS: Record<
  MaintenanceStatus,
  readonly MaintenanceStatus[]
> = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_review", "cancelled"],
  under_review: ["approved", "rejected", "cancelled"],
  approved: ["work_order_created", "cancelled"],
  rejected: [],
  work_order_created: ["in_service", "cancelled"],
  in_service: ["waiting_for_parts", "service_completed", "cancelled"],
  waiting_for_parts: ["in_service", "cancelled"],
  service_completed: ["pending_verification"],
  pending_verification: ["verified", "in_service"],
  verified: ["pending_payment_approval"],
  pending_payment_approval: ["completed", "verified"],
  completed: [],
  cancelled: [],
};

export function canTransition(
  from: MaintenanceStatus,
  to: MaintenanceStatus,
): boolean {
  return MAINTENANCE_TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: MaintenanceStatus,
  to: MaintenanceStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid status transition: ${from} → ${to}`);
  }
}

/** Statuses that still count as “open” for KPI cards. */
export const OPEN_MAINTENANCE_STATUSES: readonly MaintenanceStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "work_order_created",
  "in_service",
  "waiting_for_parts",
  "service_completed",
  "pending_verification",
  "verified",
  "pending_payment_approval",
];

export const IN_SERVICE_STATUSES: readonly MaintenanceStatus[] = [
  "in_service",
  "waiting_for_parts",
  "service_completed",
  "pending_verification",
];

export function isTerminalStatus(status: MaintenanceStatus): boolean {
  return status === "completed" || status === "cancelled" || status === "rejected";
}
