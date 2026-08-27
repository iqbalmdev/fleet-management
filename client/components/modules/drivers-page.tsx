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

export function DriversPage() {
  const [drivers, setDrivers] = useState<ProtoDriver[]>([]);
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

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    const session = getStoredSession();
    if (!session) {
      setError("Please sign in again");
      setPending(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    try {
      const created = createDriverAccount(session.user.orgId, session.user.orgName, {
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
        license: String(form.get("license")),
        password: String(form.get("password")),
      });
      setSuccess(`Driver saved. Login: ${created.email}`);
      event.currentTarget.reset();
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
        description="Add drivers with login details (stored in this browser for the prototype)."
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

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Add driver">
          <form onSubmit={onCreate} className="space-y-3">
            {error ? (
              <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
            ) : null}
            <Field name="name" label="Full name" placeholder="Karthik R" />
            <Field name="email" label="Login email" placeholder="driver2@school.edu" type="email" />
            <Field name="phone" label="Phone" placeholder="9876543210" />
            <Field name="license" label="License number" placeholder="TN-DL-204918" />
            <Field name="password" label="Temp password" placeholder="min 6 characters" type="password" />
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
            columns={["Name", "License", "Phone", "Status"]}
            rows={
              drivers.length === 0
                ? [["No drivers yet", "—", "—", <StatusPill key="e" label="Add one" tone="neutral" />]]
                : drivers.map((driver) => [
                    driver.name,
                    driver.license,
                    driver.phone,
                    <StatusPill key={driver.id} label="Login ready" tone="success" />,
                  ])
            }
          />
        </Panel>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <input
        name={name}
        type={type}
        required
        minLength={type === "password" ? 6 : undefined}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50"
      />
    </label>
  );
}
