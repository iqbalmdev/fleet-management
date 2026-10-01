"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GhostButton,
  InlineAlert,
  ModuleHeader,
  Panel,
  PrimaryButton,
} from "@/components/admin-ui";
import { getStoredSession } from "@/lib/api";
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_SOURCES,
  MAINTENANCE_TYPE_LABELS,
  MAINTENANCE_TYPES,
  VEHICLE_OPERATIONAL_STATUSES,
  formatMoneyMinor,
} from "@/lib/maintenance";
import {
  actorFromUser,
  createMaintenanceRequest,
  ensureMaintenanceSeeded,
  listVendors,
  MaintenanceError,
  submitMaintenanceRequest,
} from "@/lib/maintenance-store";
import {
  ensurePrototypeSeeded,
  listDrivers,
  listVehicles,
  type ProtoDriver,
  type ProtoVehicle,
} from "@/lib/prototype-store";
import type { FieldErrors } from "@/lib/validation/common";
import {
  maintenanceValidationSummary,
  validateMaintenanceRequestForm,
  type MaintenanceRequestFormInput,
} from "@/lib/validation/maintenance";

const STEPS = [
  "Vehicle",
  "Issue",
  "Maintenance info",
  "Priority",
  "Estimate",
  "Review",
] as const;

const EMPTY: MaintenanceRequestFormInput = {
  vehicleId: "",
  driverId: "",
  source: "manual",
  maintenanceType: "corrective",
  category: "",
  title: "",
  description: "",
  odometerReading: "",
  priority: "medium",
  location: "",
  breakdown: false,
  vehicleOperationalStatus: "operational",
  estimatedCostRupees: "",
  preferredServiceDate: "",
};

export function MaintenanceCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<MaintenanceRequestFormInput>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [vehicles, setVehicles] = useState<ProtoVehicle[]>([]);
  const [drivers, setDrivers] = useState<ProtoDriver[]>([]);
  const [vendorCount, setVendorCount] = useState(0);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      ensurePrototypeSeeded();
      ensureMaintenanceSeeded();
      const session = getStoredSession();
      if (!session) return;
      setVehicles(listVehicles(session.user.orgId));
      setDrivers(listDrivers(session.user.orgId));
      setVendorCount(listVendors(session.user.orgId).length);
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === values.vehicleId) ?? null,
    [vehicles, values.vehicleId],
  );

  function setField<K extends keyof MaintenanceRequestFormInput>(
    key: K,
    value: MaintenanceRequestFormInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
    setError(null);
  }

  function validateStep(): boolean {
    const errors: FieldErrors = {};
    if (step === 0 && !values.vehicleId) errors.vehicleId = "Select a vehicle.";
    if (step === 1) {
      if (!values.title.trim()) errors.title = "Title is required.";
      if (!values.description.trim()) errors.description = "Description is required.";
    }
    if (step === 2) {
      if (!values.maintenanceType) errors.maintenanceType = "Select a type.";
      if (!values.source) errors.source = "Select a source.";
    }
    if (step === 3) {
      if (!values.priority) errors.priority = "Select a priority.";
      if (!values.vehicleOperationalStatus) {
        errors.vehicleOperationalStatus = "Select operational status.";
      }
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(maintenanceValidationSummary(errors));
      return false;
    }
    setError(null);
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function save(submitAfter: boolean) {
    setPending(true);
    setError(null);
    const result = validateMaintenanceRequestForm(values);
    if (!result.ok) {
      setFieldErrors(result.errors);
      setError(maintenanceValidationSummary(result.errors));
      setPending(false);
      setStep(1);
      return;
    }

    const session = getStoredSession();
    if (!session) {
      setError("Please sign in again.");
      setPending(false);
      return;
    }

    try {
      const actor = actorFromUser(session.user);
      const request = createMaintenanceRequest(actor, result.data);
      if (submitAfter) {
        submitMaintenanceRequest(actor, request.id);
      }
      router.push(`/dashboard/maintenance/${request.id}`);
    } catch (err) {
      setError(err instanceof MaintenanceError ? err.message : "Failed to create request");
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="MAINTENANCE"
        title="New maintenance request"
        description="Capture the vehicle, issue, priority and estimate before submitting for approval."
        action={
          <Link
            href="/dashboard/maintenance"
            className="inline-flex h-10 items-center rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            Back to list
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <div
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              index === step
                ? "bg-sky-500/20 text-sky-300"
                : index < step
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-white/5 text-slate-500"
            }`}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>

      <Panel title={`Step ${step + 1}: ${STEPS[step]}`}>
        {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

        {step === 0 ? (
          <div className="space-y-3">
            <SelectField
              label="Vehicle *"
              error={fieldErrors.vehicleId}
              value={values.vehicleId}
              onChange={(v) => {
                setField("vehicleId", v);
                const vehicle = vehicles.find((item) => item.id === v);
                if (vehicle?.odometer != null) {
                  setField("odometerReading", String(vehicle.odometer));
                }
              }}
              options={[
                { value: "", label: "Select vehicle" },
                ...vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.plate} · ${v.code}${v.status === "maintenance" ? " (in maintenance)" : ""}`,
                })),
              ]}
            />
            <SelectField
              label="Related driver"
              value={values.driverId}
              onChange={(v) => setField("driverId", v)}
              options={[
                { value: "", label: "None" },
                ...drivers.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
            {selectedVehicle ? (
              <p className="text-sm text-slate-400">
                Current odometer:{" "}
                <span className="text-slate-200">
                  {selectedVehicle.odometer?.toLocaleString("en-IN") ?? "—"} km
                </span>
                {" · "}
                Status:{" "}
                <span className="text-slate-200">{selectedVehicle.status ?? "available"}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <Field
              label="Issue title *"
              error={fieldErrors.title}
              value={values.title}
              onChange={(v) => setField("title", v)}
              placeholder="Brake noise while stopping"
              maxLength={120}
            />
            <TextArea
              label="Description *"
              error={fieldErrors.description}
              value={values.description}
              onChange={(v) => setField("description", v)}
              placeholder="Describe the symptom, when it happens, and any warning lights."
            />
            <Field
              label="Location"
              value={values.location}
              onChange={(v) => setField("location", v)}
              placeholder="Depot / route / roadside"
            />
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={values.breakdown}
                onChange={(event) => {
                  setField("breakdown", event.target.checked);
                  if (event.target.checked) {
                    setField("source", "breakdown");
                    setField("priority", "critical");
                    setField("vehicleOperationalStatus", "out_of_service");
                  }
                }}
                className="h-4 w-4 rounded border-white/20 bg-[#0b1220]"
              />
              Vehicle broke down during operation
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <SelectField
              label="Source *"
              error={fieldErrors.source}
              value={values.source}
              onChange={(v) => setField("source", v)}
              options={MAINTENANCE_SOURCES.map((s) => ({
                value: s,
                label: s.replaceAll("_", " "),
              }))}
            />
            <SelectField
              label="Maintenance type *"
              error={fieldErrors.maintenanceType}
              value={values.maintenanceType}
              onChange={(v) => setField("maintenanceType", v)}
              options={MAINTENANCE_TYPES.map((t) => ({
                value: t,
                label: MAINTENANCE_TYPE_LABELS[t],
              }))}
            />
            <Field
              label="Category"
              value={values.category}
              onChange={(v) => setField("category", v)}
              placeholder="Safety / Preventive / Body"
            />
            <Field
              label="Odometer reading (km)"
              error={fieldErrors.odometerReading}
              value={values.odometerReading}
              onChange={(v) => setField("odometerReading", v)}
              type="number"
              placeholder="48250"
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <SelectField
              label="Priority *"
              error={fieldErrors.priority}
              value={values.priority}
              onChange={(v) => setField("priority", v)}
              options={MAINTENANCE_PRIORITIES.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
              }))}
            />
            <SelectField
              label="Vehicle operational status *"
              error={fieldErrors.vehicleOperationalStatus}
              value={values.vehicleOperationalStatus}
              onChange={(v) => setField("vehicleOperationalStatus", v)}
              options={VEHICLE_OPERATIONAL_STATUSES.map((s) => ({
                value: s,
                label: s.replaceAll("_", " "),
              }))}
            />
            <p className="text-xs text-slate-500">
              Out of service marks the vehicle unavailable for assignment while this case is open.
            </p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <Field
              label="Estimated cost (₹)"
              error={fieldErrors.estimatedCostRupees}
              value={values.estimatedCostRupees}
              onChange={(v) => setField("estimatedCostRupees", v)}
              type="number"
              placeholder="15000"
            />
            <Field
              label="Preferred service date"
              error={fieldErrors.preferredServiceDate}
              value={values.preferredServiceDate}
              onChange={(v) => setField("preferredServiceDate", v)}
              type="date"
            />
            <p className="text-xs text-slate-500">
              {vendorCount} active vendors available. Assign a workshop when creating the work
              order after approval.
            </p>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4 text-sm text-slate-300">
            <ReviewRow label="Vehicle" value={selectedVehicle?.plate ?? "—"} />
            <ReviewRow label="Title" value={values.title || "—"} />
            <ReviewRow label="Description" value={values.description || "—"} />
            <ReviewRow
              label="Type"
              value={
                MAINTENANCE_TYPE_LABELS[
                  values.maintenanceType as keyof typeof MAINTENANCE_TYPE_LABELS
                ] ?? values.maintenanceType
              }
            />
            <ReviewRow label="Source" value={values.source.replaceAll("_", " ")} />
            <ReviewRow label="Priority" value={values.priority} />
            <ReviewRow
              label="Operational status"
              value={values.vehicleOperationalStatus.replaceAll("_", " ")}
            />
            <ReviewRow
              label="Odometer"
              value={values.odometerReading ? `${values.odometerReading} km` : "—"}
            />
            <ReviewRow
              label="Estimate"
              value={
                values.estimatedCostRupees
                  ? formatMoneyMinor(Math.round(Number(values.estimatedCostRupees) * 100))
                  : "—"
              }
            />
            <ReviewRow label="Preferred date" value={values.preferredServiceDate || "—"} />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <GhostButton onClick={back} disabled={step === 0 || pending}>
            Back
          </GhostButton>
          <div className="flex flex-wrap gap-2">
            {step < STEPS.length - 1 ? (
              <PrimaryButton onClick={next}>Continue</PrimaryButton>
            ) : (
              <>
                <GhostButton onClick={() => void save(false)} disabled={pending}>
                  {pending ? "Saving…" : "Save draft"}
                </GhostButton>
                <PrimaryButton onClick={() => void save(true)} disabled={pending}>
                  {pending ? "Submitting…" : "Submit request"}
                </PrimaryButton>
              </>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-white/5 py-2 sm:grid-cols-[160px_1fr]">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="text-slate-200">{value}</p>
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
  maxLength,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`h-11 w-full rounded-lg border bg-[#0b1220] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50 ${
          error ? "border-rose-500/60" : "border-white/10"
        }`}
      />
      {error ? <span className="block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  error,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`w-full rounded-lg border bg-[#0b1220] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50 ${
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
