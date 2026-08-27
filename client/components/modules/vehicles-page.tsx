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
  createVehicle,
  ensurePrototypeSeeded,
  listVehicles,
  ProtoError,
  type ProtoVehicle,
} from "@/lib/prototype-store";

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<ProtoVehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function load() {
    ensurePrototypeSeeded();
    const session = getStoredSession();
    if (!session) return;
    setVehicles(listVehicles(session.user.orgId));
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
      const vehicle = createVehicle(session.user.orgId, {
        code: String(form.get("code")),
        plate: String(form.get("plate")),
        capacity: Number(form.get("capacity")),
      });
      setSuccess(`Vehicle ${vehicle.code} saved.`);
      event.currentTarget.reset();
      load();
    } catch (err) {
      setError(err instanceof ProtoError ? err.message : "Failed to create vehicle");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="VEHICLES"
        title="Fleet vehicles"
        description="Add buses and vans (prototype data stays in this browser)."
      />

      <StatGrid
        items={[
          { label: "Total vehicles", value: String(vehicles.length) },
          { label: "Available", value: String(vehicles.length) },
          { label: "On trip", value: "1" },
          { label: "In maintenance", value: "1" },
        ]}
      />

      {success ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Add vehicle">
          <form onSubmit={onCreate} className="space-y-3">
            {error ? (
              <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
            ) : null}
            <Field name="code" label="Vehicle code" placeholder="BUS-01" />
            <Field name="plate" label="Plate number" placeholder="TN-09-SC-1102" />
            <Field name="capacity" label="Capacity" placeholder="42" type="number" />
            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save vehicle"}
            </button>
          </form>
        </Panel>

        <Panel title="Vehicle list">
          <DataTable
            columns={["Code", "Plate", "Capacity", "Status"]}
            rows={
              vehicles.length === 0
                ? [["No vehicles yet", "—", "—", <StatusPill key="e" label="Add one" tone="neutral" />]]
                : vehicles.map((vehicle) => [
                    vehicle.code,
                    vehicle.plate,
                    String(vehicle.capacity),
                    <StatusPill key={vehicle.id} label="Available" tone="success" />,
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
        min={type === "number" ? 1 : undefined}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50"
      />
    </label>
  );
}
