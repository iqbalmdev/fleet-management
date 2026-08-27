"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Driver = {
  id: string;
  name: string;
  license: string;
  phone: string;
};

export function DriversClient() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    try {
      const data = await apiFetch<{ drivers: Driver[] }>("/drivers");
      setDrivers(data.drivers);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load drivers");
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
      await apiFetch("/drivers", {
        method: "POST",
        body: {
          name: form.get("name"),
          license: form.get("license"),
          phone: form.get("phone"),
        },
      });
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save driver");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Add a driver</h1>
        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <Input name="name" label="Full name" placeholder="Karthik R" />
        <Input name="license" label="License number" placeholder="TN-DL-204918" />
        <Input name="phone" label="Phone" placeholder="9876543210" />
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save driver"}
        </button>
      </form>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">License</th>
              <th className="px-4 py-3">Phone</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={3}>
                  No drivers yet.
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{driver.name}</td>
                  <td className="px-4 py-3">{driver.license}</td>
                  <td className="px-4 py-3">{driver.phone}</td>
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
