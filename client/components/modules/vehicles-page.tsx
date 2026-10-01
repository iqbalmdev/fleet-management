"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  DataTable,
  ModuleHeader,
  Panel,
  StatGrid,
  StatusPill,
} from "@/components/admin-ui";
import { getStoredSession } from "@/lib/api";
import {
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
  VEHICLE_HEALTH_LABELS,
  deriveVehicleHealth,
  vehicleHealthTone,
  type MaintenanceRequest,
} from "@/lib/maintenance";
import {
  ensureMaintenanceSeeded,
  listMaintenanceRequests,
  listSchedules,
  listVehicleMaintenanceHistory,
} from "@/lib/maintenance-store";
import {
  createVehicle,
  ensurePrototypeSeeded,
  listVehicles,
  ProtoError,
  type ProtoVehicle,
} from "@/lib/prototype-store";
import type { FieldErrors } from "@/lib/validation/common";
import {
  FUEL_TYPES,
  validateVehicleForm,
  VEHICLE_TYPES,
  vehicleValidationSummary,
  type VehicleFormInput,
} from "@/lib/validation/vehicles";

const EMPTY: VehicleFormInput = {
  plate: "",
  vehicleType: "bus",
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  fuelType: "diesel",
  capacity: "",
  chassisNumber: "",
  engineNumber: "",
  registrationDate: "",
  odometer: "",
  insuranceExpiry: "",
  fitnessExpiry: "",
  permitExpiry: "",
};

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<ProtoVehicle[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<MaintenanceRequest[]>([]);
  const [values, setValues] = useState<VehicleFormInput>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  function load() {
    ensurePrototypeSeeded();
    ensureMaintenanceSeeded();
    const session = getStoredSession();
    if (!session) return;
    setOrgId(session.user.orgId);
    setVehicles(listVehicles(session.user.orgId));
    setRequests(listMaintenanceRequests(session.user.orgId));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!orgId || !selectedId) {
      setHistory([]);
      return;
    }
    setHistory(listVehicleMaintenanceHistory(orgId, selectedId));
  }, [orgId, selectedId]);

  const schedules = useMemo(() => {
    if (!orgId) return [];
    return listSchedules(orgId);
  }, [orgId, vehicles, requests]);

  const healthByVehicle = useMemo(() => {
    const map = new Map<string, ReturnType<typeof deriveVehicleHealth>>();
    for (const vehicle of vehicles) {
      map.set(
        vehicle.id,
        deriveVehicleHealth({
          vehicle,
          openRequests: requests.filter((r) => r.vehicleId === vehicle.id),
          schedules: schedules.filter((s) => s.vehicleId === vehicle.id),
        }),
      );
    }
    return map;
  }, [vehicles, requests, schedules]);

  const statusCounts = useMemo(() => {
    let available = 0;
    let onTrip = 0;
    let maintenance = 0;
    for (const v of vehicles) {
      if (v.status === "maintenance") maintenance += 1;
      else if (v.status === "on_trip") onTrip += 1;
      else available += 1;
    }
    return { available, onTrip, maintenance };
  }, [vehicles]);

  function setField<K extends keyof VehicleFormInput>(key: K, value: VehicleFormInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    const result = validateVehicleForm(values);
    if (!result.ok || !result.data) {
      setFieldErrors(result.errors);
      setError(vehicleValidationSummary(result.errors));
      setPending(false);
      return;
    }

    const session = getStoredSession();
    if (!session) {
      setError("Please sign in again");
      setPending(false);
      return;
    }

    try {
      const vehicle = createVehicle(session.user.orgId, result.data);
      setSuccess(`Vehicle ${vehicle.plate} saved.`);
      setValues(EMPTY);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err instanceof ProtoError ? err.message : "Failed to create vehicle");
    } finally {
      setPending(false);
    }
  }

  const selected = vehicles.find((v) => v.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="VEHICLES"
        title="Fleet vehicles"
        description="Register buses, vans and cabs with identification, health and maintenance history."
      />

      <StatGrid
        items={[
          { label: "Total vehicles", value: String(vehicles.length) },
          { label: "Available", value: String(statusCounts.available) },
          { label: "On trip", value: String(statusCounts.onTrip) },
          { label: "In maintenance", value: String(statusCounts.maintenance) },
        ]}
      />

      {success ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Add vehicle">
          <form onSubmit={onCreate} className="space-y-3" noValidate>
            {error ? (
              <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
            ) : null}

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Basic information
            </p>
            <Field
              label="Vehicle number (plate) *"
              error={fieldErrors.plate}
              value={values.plate}
              onChange={(v) => setField("plate", v.toUpperCase())}
              placeholder="TN-09-SC-1102"
              maxLength={15}
              pattern="[A-Za-z]{2}[-\s]?\d{1,2}[-\s]?[A-Za-z]{1,3}[-\s]?\d{1,4}"
              required
            />
            <SelectField
              label="Vehicle type *"
              error={fieldErrors.vehicleType}
              value={values.vehicleType}
              onChange={(v) => setField("vehicleType", v)}
              options={VEHICLE_TYPES.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              required
            />
            <Field
              label="Make *"
              error={fieldErrors.make}
              value={values.make}
              onChange={(v) => setField("make", v)}
              placeholder="Tata / Ashok Leyland"
              maxLength={40}
              required
            />
            <Field
              label="Model *"
              error={fieldErrors.model}
              value={values.model}
              onChange={(v) => setField("model", v)}
              placeholder="LP 410"
              maxLength={40}
              required
            />
            <Field
              label="Year *"
              error={fieldErrors.year}
              value={values.year}
              onChange={(v) => setField("year", v)}
              type="number"
              required
            />
            <SelectField
              label="Fuel type *"
              error={fieldErrors.fuelType}
              value={values.fuelType}
              onChange={(v) => setField("fuelType", v)}
              options={FUEL_TYPES.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              required
            />
            <Field
              label="Capacity *"
              error={fieldErrors.capacity}
              value={values.capacity}
              onChange={(v) => setField("capacity", v)}
              type="number"
              required
            />
            <Field
              label="Chassis number *"
              error={fieldErrors.chassisNumber}
              value={values.chassisNumber}
              onChange={(v) => setField("chassisNumber", v.toUpperCase())}
              required
            />
            <Field
              label="Engine number *"
              error={fieldErrors.engineNumber}
              value={values.engineNumber}
              onChange={(v) => setField("engineNumber", v.toUpperCase())}
              required
            />
            <Field
              label="Registration date"
              error={fieldErrors.registrationDate}
              value={values.registrationDate}
              onChange={(v) => setField("registrationDate", v)}
              type="date"
            />
            <Field
              label="Current odometer (km)"
              error={fieldErrors.odometer}
              value={values.odometer}
              onChange={(v) => setField("odometer", v)}
              type="number"
            />
            <Field
              label="Insurance expiry"
              error={fieldErrors.insuranceExpiry}
              value={values.insuranceExpiry}
              onChange={(v) => setField("insuranceExpiry", v)}
              type="date"
            />
            <Field
              label="Fitness expiry"
              error={fieldErrors.fitnessExpiry}
              value={values.fitnessExpiry}
              onChange={(v) => setField("fitnessExpiry", v)}
              type="date"
            />
            <Field
              label="Permit expiry"
              error={fieldErrors.permitExpiry}
              value={values.permitExpiry}
              onChange={(v) => setField("permitExpiry", v)}
              type="date"
            />

            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save vehicle"}
            </button>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="Vehicle list">
            <DataTable
              columns={["Plate", "Type", "Odometer", "Status", "Health", ""]}
              rows={
                vehicles.length === 0
                  ? [["No vehicles yet", "—", "—", "—", "—", "—"]]
                  : vehicles.map((vehicle) => {
                      const health = healthByVehicle.get(vehicle.id) ?? "good";
                      return [
                        vehicle.plate,
                        vehicle.vehicleType ?? "—",
                        vehicle.odometer?.toLocaleString("en-IN") ?? "—",
                        <StatusPill
                          key={`${vehicle.id}-st`}
                          label={vehicle.status ?? "available"}
                          tone={
                            vehicle.status === "maintenance"
                              ? "danger"
                              : vehicle.status === "on_trip"
                                ? "info"
                                : "success"
                          }
                        />,
                        <StatusPill
                          key={`${vehicle.id}-h`}
                          label={VEHICLE_HEALTH_LABELS[health]}
                          tone={vehicleHealthTone(health)}
                        />,
                        <button
                          key={`${vehicle.id}-hist`}
                          type="button"
                          onClick={() => setSelectedId(vehicle.id)}
                          className="text-sm font-medium text-sky-400 hover:text-sky-300"
                        >
                          History
                        </button>,
                      ];
                    })
              }
            />
          </Panel>

          <Panel
            title={
              selected
                ? `Maintenance history · ${selected.plate}`
                : "Maintenance history"
            }
          >
            {!selected ? (
              <p className="text-sm text-slate-400">
                Select History on a vehicle to view completed and open maintenance records.
              </p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-400">No maintenance records for this vehicle.</p>
            ) : (
              <DataTable
                columns={["Date", "Request", "Type", "Issue", "Status", ""]}
                rows={history.map((item) => [
                  item.reportedDate,
                  item.requestNumber,
                  MAINTENANCE_TYPE_LABELS[item.maintenanceType],
                  item.title,
                  <StatusPill
                    key={`${item.id}-st`}
                    label={MAINTENANCE_STATUS_LABELS[item.status]}
                    tone="info"
                  />,
                  <Link
                    key={`${item.id}-open`}
                    href={`/dashboard/maintenance/${item.id}`}
                    className="text-sm font-medium text-sky-400 hover:text-sky-300"
                  >
                    Open
                  </Link>,
                ])}
              />
            )}
            {selected ? (
              <p className="mt-3 text-xs text-slate-500">
                Last service: {selected.lastServiceDate ?? "—"}
                {selected.lastServiceOdometer != null
                  ? ` @ ${selected.lastServiceOdometer.toLocaleString("en-IN")} km`
                  : ""}
                {" · "}
                Next: {selected.nextServiceDate ?? "—"}
                {selected.nextServiceOdometer != null
                  ? ` / ${selected.nextServiceOdometer.toLocaleString("en-IN")} km`
                  : ""}
              </p>
            ) : null}
          </Panel>
        </div>
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
  required,
  minLength,
  maxLength,
  min,
  max,
  step,
  pattern,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  step?: number;
  pattern?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        placeholder={placeholder}
        className={`h-11 w-full rounded-lg border bg-[#0b1220] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50 ${
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
  required,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`h-11 w-full rounded-lg border bg-[#0b1220] px-3 text-sm text-white outline-none focus:border-sky-500/50 ${
          error ? "border-rose-500/60" : "border-white/10"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}
