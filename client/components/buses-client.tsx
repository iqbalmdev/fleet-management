"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Bus = {
  id: string;
  code: string;
  plate: string;
  capacity: number;
};

export function BusesClient() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    try {
      const data = await apiFetch<{ buses: Bus[] }>("/buses");
      setBuses(data.buses);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load buses");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await apiFetch("/buses", {
        method: "POST",
        body: {
          code: form.get("code"),
          plate: form.get("plate"),
          capacity: Number(form.get("capacity")),
        },
      });
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save bus");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Add a bus</h1>
        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <Input name="code" label="Bus code" placeholder="BUS-01" />
        <Input name="plate" label="Plate number" placeholder="TN-09-SC-1102" />
        <Input name="capacity" label="Capacity" placeholder="42" />
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save bus"}
        </button>
      </form>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Plate</th>
              <th className="px-4 py-3">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {buses.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={3}>
                  No buses yet.
                </td>
              </tr>
            ) : (
              buses.map((bus) => (
                <tr key={bus.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{bus.code}</td>
                  <td className="px-4 py-3">{bus.plate}</td>
                  <td className="px-4 py-3">{bus.capacity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Input({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      {label}
      <input
        name={name}
        required
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
      />
    </label>
  );
}
