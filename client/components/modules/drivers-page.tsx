"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  DataTable,
  ModuleHeader,
  Panel,
  StatGrid,
  StatusPill,
} from "@/components/admin-ui";
import { getStoredSession } from "@/lib/api";
import {
  createDriverAccount,
  ensurePrototypeSeeded,
  listDrivers,
  ProtoError,
  type ProtoDriver,
} from "@/lib/prototype-store";
import {
  driverValidationSummary,
  LICENCE_TYPES,
  validateDriverForm,
  type DriverFormInput,
} from "@/lib/validation/drivers";
import type { FieldErrors } from "@/lib/validation/common";

const EMPTY: DriverFormInput = {
  name: "",
  phone: "",
  email: "",
  dateOfBirth: "",
  license: "",
  licenceType: "HMV",
  licenceExpiry: "",
  experienceYears: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  password: "",
  confirmPassword: "",
};

export function DriversPage() {
  const [drivers, setDrivers] = useState<ProtoDriver[]>([]);
  const [values, setValues] = useState<DriverFormInput>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function load() {
    ensurePrototypeSeeded();
    const session = getStoredSession();
    if (!session) return;
    setDrivers(listDrivers(session.user.orgId));
  }

  useEffect(() => {
    load();
  }, []);

  function setField<K extends keyof DriverFormInput>(key: K, value: DriverFormInput[K]) {
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

    const result = validateDriverForm(values);
    if (!result.ok || !result.data) {
      setFieldErrors(result.errors);
      setError(driverValidationSummary(result.errors));
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
      const created = createDriverAccount(session.user.orgId, session.user.orgName, {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        license: result.data.license,
        password: result.data.password,
        dateOfBirth: result.data.dateOfBirth,
        licenceType: result.data.licenceType,
        licenceExpiry: result.data.licenceExpiry,
        experienceYears: result.data.experienceYears,
        address: result.data.address,
        emergencyContactName: result.data.emergencyContactName,
        emergencyContactPhone: result.data.emergencyContactPhone,
      });
      setSuccess(`Driver saved. Login: ${created.email}`);
      setValues(EMPTY);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err instanceof ProtoError ? err.message : "Failed to create driver");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="DRIVERS"
        title="Driver registry"
        description="Register drivers with licence and contact details. Validated at form and save layers."
      />

      <StatGrid
        items={[
          { label: "Total drivers", value: String(drivers.length) },
          { label: "Login ready", value: String(drivers.length) },
          { label: "On duty", value: "2" },
          { label: "License due", value: "1" },
        ]}
      />

      {success ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Add driver">
          <form onSubmit={onCreate} className="space-y-3" noValidate>
            {error ? (
              <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
            ) : null}

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Personal
            </p>
            <Field
              label="Driver name *"
              error={fieldErrors.name}
              value={values.name}
              onChange={(v) => setField("name", v)}
              placeholder="Karthik R"
              autoComplete="name"
              maxLength={80}
              pattern="[A-Za-z][A-Za-z .'\-]*"
              required
            />
            <Field
              label="Mobile number *"
              error={fieldErrors.phone}
              value={values.phone}
              onChange={(v) => setField("phone", v)}
              placeholder="9876543210"
              inputMode="numeric"
              maxLength={13}
              pattern="(\+91)?[6-9]\d{9}"
              required
            />
            <Field
              label="Email (login) *"
              error={fieldErrors.email}
              value={values.email}
              onChange={(v) => setField("email", v)}
              placeholder="driver2@school.edu"
              type="email"
              autoComplete="email"
              maxLength={120}
              required
            />
            <Field
              label="Date of birth"
              error={fieldErrors.dateOfBirth}
              value={values.dateOfBirth}
              onChange={(v) => setField("dateOfBirth", v)}
              type="date"
              max={new Date().toISOString().slice(0, 10)}
            />
            <Field
              label="Address *"
              error={fieldErrors.address}
              value={values.address}
              onChange={(v) => setField("address", v)}
              placeholder="Street, city, PIN"
              maxLength={200}
              required
            />

            <p className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Driving
            </p>
            <Field
              label="Driving licence number *"
              error={fieldErrors.license}
              value={values.license}
              onChange={(v) => setField("license", v.toUpperCase())}
              placeholder="TN-DL-204918"
              maxLength={20}
              pattern="[A-Za-z]{2}[-\s]?[A-Za-z0-9]{1,4}[-\s]?\d{4,13}"
              required
            />
            <SelectField
              label="Licence type *"
              error={fieldErrors.licenceType}
              value={values.licenceType}
              onChange={(v) => setField("licenceType", v)}
              options={LICENCE_TYPES.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              required
            />
            <Field
              label="Licence expiry date *"
              error={fieldErrors.licenceExpiry}
              value={values.licenceExpiry}
              onChange={(v) => setField("licenceExpiry", v)}
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              required
            />
            <Field
              label="Experience (years) *"
              error={fieldErrors.experienceYears}
              value={values.experienceYears}
              onChange={(v) => setField("experienceYears", v)}
              type="number"
              min={0}
              max={50}
              step={1}
              placeholder="5"
              required
            />

            <p className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Emergency
            </p>
            <Field
              label="Emergency contact name"
              error={fieldErrors.emergencyContactName}
              value={values.emergencyContactName}
              onChange={(v) => setField("emergencyContactName", v)}
              placeholder="Parent / spouse"
              maxLength={80}
            />
            <Field
              label="Emergency contact number"
              error={fieldErrors.emergencyContactPhone}
              value={values.emergencyContactPhone}
              onChange={(v) => setField("emergencyContactPhone", v)}
              placeholder="9876500000"
              inputMode="numeric"
              maxLength={13}
            />

            <p className="pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Account
            </p>
            <Field
              label="Password *"
              error={fieldErrors.password}
              value={values.password}
              onChange={(v) => setField("password", v)}
              type="password"
              placeholder="min 6 chars, letter + number"
              minLength={6}
              maxLength={64}
              autoComplete="new-password"
              required
            />
            <Field
              label="Confirm password *"
              error={fieldErrors.confirmPassword}
              value={values.confirmPassword}
              onChange={(v) => setField("confirmPassword", v)}
              type="password"
              placeholder="Re-enter password"
              minLength={6}
              maxLength={64}
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save driver"}
            </button>
          </form>
        </Panel>

        <Panel title="Driver list">
          <DataTable
            columns={["Name", "Licence", "Phone", "Status"]}
            rows={
              drivers.length === 0
                ? [["No drivers yet", "—", "—", <StatusPill key="e" label="Add one" tone="neutral" />]]
                : drivers.map((driver) => [
                    driver.name,
                    driver.license,
                    driver.phone,
                    <StatusPill
                      key={driver.id}
                      label={driver.licenceExpiry ? "Registered" : "Login ready"}
                      tone="success"
                    />,
                  ])
            }
          />
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
  required,
  minLength,
  maxLength,
  min,
  max,
  step,
  pattern,
  inputMode,
  autoComplete,
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
  inputMode?: "numeric" | "text" | "email" | "tel";
  autoComplete?: string;
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
        inputMode={inputMode}
        autoComplete={autoComplete}
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
