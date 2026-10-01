import type { ScheduleDueStatus } from "@/lib/maintenance/types";

export type ScheduleDueInput = {
  currentOdometer: number | null;
  nextServiceOdometer: number | null;
  reminderThresholdKm: number | null;
  todayIso: string;
  nextServiceDate: string | null;
  reminderThresholdDays: number | null;
};

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`);
  const to = new Date(`${toIso}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function dueFromKm(input: ScheduleDueInput): ScheduleDueStatus | null {
  if (input.nextServiceOdometer == null || input.currentOdometer == null) {
    return null;
  }
  const remaining = input.nextServiceOdometer - input.currentOdometer;
  if (remaining < 0) return "overdue";
  if (remaining === 0) return "due";
  const threshold = input.reminderThresholdKm ?? 0;
  if (threshold > 0 && remaining <= threshold) return "due_soon";
  return "upcoming";
}

function dueFromDate(input: ScheduleDueInput): ScheduleDueStatus | null {
  if (!input.nextServiceDate) return null;
  const remainingDays = daysBetween(input.todayIso, input.nextServiceDate);
  if (remainingDays < 0) return "overdue";
  if (remainingDays === 0) return "due";
  const threshold = input.reminderThresholdDays ?? 0;
  if (threshold > 0 && remainingDays <= threshold) return "due_soon";
  return "upcoming";
}

const SEVERITY: Record<ScheduleDueStatus, number> = {
  upcoming: 0,
  due_soon: 1,
  due: 2,
  overdue: 3,
};

/**
 * Whichever rule (km or date) is more urgent wins.
 * Missing rules are ignored.
 */
export function computeScheduleDueStatus(
  input: ScheduleDueInput,
): ScheduleDueStatus {
  const km = dueFromKm(input);
  const date = dueFromDate(input);
  if (!km && !date) return "upcoming";
  if (!km) return date!;
  if (!date) return km;
  return SEVERITY[km] >= SEVERITY[date] ? km : date;
}

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeNextServiceTargets(input: {
  lastServiceDate: string | null;
  lastServiceOdometer: number | null;
  intervalDays: number | null;
  intervalKm: number | null;
}): { nextServiceDate: string | null; nextServiceOdometer: number | null } {
  const nextServiceDate =
    input.lastServiceDate && input.intervalDays
      ? addDaysIso(input.lastServiceDate, input.intervalDays)
      : null;
  const nextServiceOdometer =
    input.lastServiceOdometer != null && input.intervalKm
      ? input.lastServiceOdometer + input.intervalKm
      : null;
  return { nextServiceDate, nextServiceOdometer };
}
