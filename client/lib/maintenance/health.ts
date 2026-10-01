import type {
  MaintenanceRequest,
  MaintenanceSchedule,
  ScheduleDueStatus,
} from "@/lib/maintenance/types";
import { computeScheduleDueStatus, todayIsoDate } from "@/lib/maintenance/schedule";
import type { ProtoVehicle } from "@/lib/prototype-store";

export type VehicleHealthStatus =
  | "good"
  | "attention_required"
  | "maintenance_due"
  | "out_of_service";

export const VEHICLE_HEALTH_LABELS: Record<VehicleHealthStatus, string> = {
  good: "Good",
  attention_required: "Attention required",
  maintenance_due: "Maintenance due",
  out_of_service: "Out of service",
};

/**
 * Derive a simple health badge from real conditions — not an AI score.
 */
export function deriveVehicleHealth(input: {
  vehicle: ProtoVehicle;
  openRequests: MaintenanceRequest[];
  schedules: MaintenanceSchedule[];
}): VehicleHealthStatus {
  const { vehicle, openRequests, schedules } = input;

  if (vehicle.status === "maintenance") return "out_of_service";

  const criticalOpen = openRequests.some(
    (r) =>
      !["completed", "cancelled", "rejected"].includes(r.status) &&
      (r.priority === "critical" || r.vehicleOperationalStatus === "out_of_service"),
  );
  if (criticalOpen) return "out_of_service";

  const activeSchedules = schedules.filter((s) => s.status === "active");
  let worstDue: ScheduleDueStatus = "upcoming";
  for (const schedule of activeSchedules) {
    const due = computeScheduleDueStatus({
      currentOdometer: vehicle.odometer ?? null,
      nextServiceOdometer: schedule.nextServiceOdometer,
      reminderThresholdKm: schedule.reminderThresholdKm,
      todayIso: todayIsoDate(),
      nextServiceDate: schedule.nextServiceDate,
      reminderThresholdDays: schedule.reminderThresholdDays,
    });
    if (due === "overdue") return "maintenance_due";
    if (due === "due" || due === "due_soon") worstDue = due;
  }
  if (worstDue === "due" || worstDue === "due_soon") return "maintenance_due";

  const openHigh = openRequests.some(
    (r) =>
      !["completed", "cancelled", "rejected"].includes(r.status) &&
      (r.priority === "high" || r.vehicleOperationalStatus === "restricted"),
  );
  if (openHigh) return "attention_required";

  const openAny = openRequests.some(
    (r) => !["completed", "cancelled", "rejected"].includes(r.status),
  );
  if (openAny) return "attention_required";

  return "good";
}

export function vehicleHealthTone(
  health: VehicleHealthStatus,
): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (health) {
    case "good":
      return "success";
    case "attention_required":
      return "warning";
    case "maintenance_due":
      return "warning";
    case "out_of_service":
      return "danger";
    default:
      return "neutral";
  }
}
