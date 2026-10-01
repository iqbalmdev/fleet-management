"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  EmptyState,
  GhostButton,
  InlineAlert,
  ModuleHeader,
  Panel,
  PrimaryButton,
  StatGrid,
  StatusPill,
  DataTable,
} from "@/components/admin-ui";
import { getStoredSession } from "@/lib/api";
import {
  MAINTENANCE_TYPE_LABELS,
  MAINTENANCE_TYPES,
  SCHEDULE_DUE_LABELS,
  deriveVehicleHealth,
  vehicleHealthTone,
  VEHICLE_HEALTH_LABELS,
  type MaintenanceSchedule,
} from "@/lib/maintenance";
import {
  actorFromUser,
  createMaintenanceSchedule,
  ensureMaintenanceSeeded,
  getScheduleDueStatusFor,
  listMaintenanceRequests,
  listSchedules,
  MaintenanceError,
} from "@/lib/maintenance-store";
import { ensurePrototypeSeeded, listVehicles, type ProtoVehicle } from "@/lib/prototype-store";
import type { FieldErrors } from "@/lib/validation/common";
import {
  maintenanceValidationSummary,
  validateScheduleForm,
  type ScheduleFormInput,
} from "@/lib/validation/maintenance";

const EMPTY: ScheduleFormInput = {
  vehicleId: "",
  title: "",
  maintenanceType: "oil_change",
  intervalKm: "10000",
  intervalDays: "180",
  lastServiceDate: "",
  lastServiceOdometer: "",
  reminderThresholdKm: "1000",
  reminderThresholdDays: "14",
};

export function MaintenanceSchedulesPage() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [vehicles, setVehicles] = useState<ProtoVehicle[]>([]);
  const [values, setValues] = useState<ScheduleFormInput>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function load() {
    ensurePrototypeSeeded();
    ensureMaintenanceSeeded();
    const session = getStoredSession();
    if (!session) return;
    const orgId = session.user.orgId;
    const nextSchedules = listSchedules(orgId);
    const nextVehicles = listVehicles(orgId);
    setSchedules(nextSchedules);
    setVehicles(nextVehicles);
  }

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      load();
    });
    return () => {
      active = false;
    };
  }, []);

  const vehicleMap = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v])),
    [vehicles],
  );

  const dueCounts = useMemo(() => {
    let dueSoon = 0;
    let due = 0;
    let overdue = 0;
    for (const schedule of schedules) {
      if (schedule.status !== "active") continue;
      const status = getScheduleDueStatusFor(schedule, vehicleMap.get(schedule.vehicleId));
      if (status === "due_soon") dueSoon += 1;
      if (status === "due") due += 1;
      if (status === "overdue") overdue += 1;
    }
    return { dueSoon, due, overdue, active: schedules.filter((s) => s.status === "active").length };
  }, [schedules, vehicleMap]);

  function setField<K extends keyof ScheduleFormInput>(key: K, value: ScheduleFormInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function onCreate() {
    setPending(true);
    setError(null);
    setSuccess(null);
    const result = validateScheduleForm(values);
    if (!result.ok) {
      setFieldErrors(result.errors);
      setError(maintenanceValidationSummary(result.errors));
      setPending(false);
      return;
    }
    const session = getStoredSession();
    if (!session) {
      setError("Please sign in again.");
      setPending(false);
      return;
    }
    try {
      createMaintenanceSchedule(actorFromUser(session.user), result.data);
      setSuccess("Schedule saved.");
      setValues(EMPTY);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err instanceof MaintenanceError ? err.message : "Failed to save schedule");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="MAINTENANCE"
        title="Preventive schedules"
        description="Track km and date-based service intervals. Whichever threshold hits first wins."
        action={
          <Link
            href="/dashboard/maintenance"
            className="inline-flex h-10 items-center rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            All requests
          </Link>
        }
      />

      <StatGrid
        items={[
          { label: "Active schedules", value: String(dueCounts.active) },
          { label: "Due soon", value: String(dueCounts.dueSoon) },
          { label: "Due", value: String(dueCounts.due) },
          { label: "Overdue", value: String(dueCounts.overdue) },
        ]}
      />

      {success ? <InlineAlert tone="success">{success}</InlineAlert> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Add schedule">
          {error ? (
            <div className="mb-3">
              <InlineAlert tone="danger">{error}</InlineAlert>
            </div>
          ) : null}
          <div className="space-y-3">
            <SelectField
              label="Vehicle *"
              error={fieldErrors.vehicleId}
              value={values.vehicleId}
              onChange={(v) => {
                setField("vehicleId", v);
                const vehicle = vehicles.find((item) => item.id === v);
                if (vehicle?.odometer != null) {
                  setField("lastServiceOdometer", String(vehicle.odometer));
                }
              }}
              options={[
                { value: "", label: "Select vehicle" },
                ...vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.plate} (${v.code})`,
                })),
              ]}
            />
            <Field
              label="Title *"
              error={fieldErrors.title}
              value={values.title}
              onChange={(v) => setField("title", v)}
              placeholder="Engine Oil"
            />
            <SelectField
              label="Type *"
              value={values.maintenanceType}
              onChange={(v) => setField("maintenanceType", v)}
              options={MAINTENANCE_TYPES.map((t) => ({
                value: t,
                label: MAINTENANCE_TYPE_LABELS[t],
              }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Interval km"
                error={fieldErrors.intervalKm}
                value={values.intervalKm}
                onChange={(v) => setField("intervalKm", v)}
                type="number"
              />
              <Field
                label="Interval days"
                error={fieldErrors.intervalDays}
                value={values.intervalDays}
                onChange={(v) => setField("intervalDays", v)}
                type="number"
              />
              <Field
                label="Last service date"
                error={fieldErrors.lastServiceDate}
                value={values.lastServiceDate}
                onChange={(v) => setField("lastServiceDate", v)}
                type="date"
              />
              <Field
                label="Last service odometer"
                error={fieldErrors.lastServiceOdometer}
                value={values.lastServiceOdometer}
                onChange={(v) => setField("lastServiceOdometer", v)}
                type="number"
              />
              <Field
                label="Reminder km"
                value={values.reminderThresholdKm}
                onChange={(v) => setField("reminderThresholdKm", v)}
                type="number"
              />
              <Field
                label="Reminder days"
                value={values.reminderThresholdDays}
                onChange={(v) => setField("reminderThresholdDays", v)}
                type="number"
              />
            </div>
            <PrimaryButton disabled={pending} onClick={onCreate}>
              {pending ? "Saving…" : "Save schedule"}
            </PrimaryButton>
          </div>
        </Panel>

        <Panel title={`Schedules (${schedules.length})`}>
          {schedules.length === 0 ? (
            <EmptyState
              title="No preventive schedules yet"
              description="Add an oil change or inspection interval to start due tracking."
            />
          ) : (
            <DataTable
              columns={["Vehicle", "Title", "Next km", "Next date", "Due", "Health"]}
              rows={schedules.map((schedule) => {
                const vehicle = vehicleMap.get(schedule.vehicleId);
                const due = getScheduleDueStatusFor(schedule, vehicle);
                const health = deriveVehicleHealth({
                  vehicle: vehicle ?? {
                    id: schedule.vehicleId,
                    orgId: schedule.orgId,
                    code: "—",
                    plate: "—",
                    capacity: 0,
                  },
                  openRequests: listMaintenanceRequests(schedule.orgId).filter(
                    (r) => r.vehicleId === schedule.vehicleId,
                  ),
                  schedules: [schedule],
                });
                return [
                  vehicle?.plate ?? schedule.vehicleId,
                  schedule.title,
                  schedule.nextServiceOdometer?.toLocaleString("en-IN") ?? "—",
                  schedule.nextServiceDate ?? "—",
                  <StatusPill
                    key={`${schedule.id}-due`}
                    label={SCHEDULE_DUE_LABELS[due]}
                    tone={
                      due === "overdue"
                        ? "danger"
                        : due === "due" || due === "due_soon"
                          ? "warning"
                          : "success"
                    }
                  />,
                  <StatusPill
                    key={`${schedule.id}-h`}
                    label={VEHICLE_HEALTH_LABELS[health]}
                    tone={vehicleHealthTone(health)}
                  />,
                ];
              })}
            />
          )}
          <div className="mt-4">
            <GhostButton onClick={load}>Refresh due status</GhostButton>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-lg border bg-[#0b1220] px-3 text-sm text-white outline-none focus:border-sky-500/50 ${
          error ? "border-rose-500/60" : "border-white/10"
        }`}
      />
      {error ? <span className="block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  error,
  value,
  onChange,
  options,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full rounded-lg border bg-[#0b1220] px-3 text-sm text-white outline-none focus:border-sky-500/50 ${
          error ? "border-rose-500/60" : "border-white/10"
        }`}
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}
