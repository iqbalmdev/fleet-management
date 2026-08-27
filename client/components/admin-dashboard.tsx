"use client";

import { getStoredSession } from "@/lib/api";
import { useEffect, useState } from "react";

const stats = [
  { label: "Drivers", value: "48" },
  { label: "Vehicles", value: "32" },
  { label: "Maintenance", value: "05" },
  { label: "Pending Bills", value: "08" },
];

const vehicleStatus = [
  { label: "Available", value: "18", color: "bg-emerald-400" },
  { label: "On Trip", value: "08", color: "bg-sky-400" },
  { label: "Service Due", value: "01", color: "bg-amber-400" },
  { label: "Maintenance", value: "05", color: "bg-rose-400" },
];

const maintenance = [
  {
    vehicle: "Bus TN-30-AB-1234",
    issue: "Brake replacement",
    status: "Critical",
    tone: "text-rose-300",
    dot: "bg-rose-400",
  },
  {
    vehicle: "Van TN-30-CD-5678",
    issue: "Service due",
    status: "Pending",
    tone: "text-amber-300",
    dot: "bg-amber-400",
  },
];

const bills = [
  { label: "Repair Bill", amount: "₹18,500" },
  { label: "Service Bill", amount: "₹12,200" },
  { label: "Parts Bill", amount: "₹8,600" },
];

export function AdminDashboard() {
  const [name, setName] = useState("Admin");

  useEffect(() => {
    setName(getStoredSession()?.user.fullName ?? "Admin");
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">DASHBOARD</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Welcome back, {name}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-[#111827] px-5 py-4"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-white/10 bg-[#111827] p-5">
        <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-200">
          VEHICLE STATUS
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {vehicleStatus.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                {item.label}
              </div>
              <span className="text-lg font-semibold tabular-nums text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-[#111827] p-5">
          <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-200">
            Maintenance Tracker
          </h2>
          <ul className="mt-4 space-y-3">
            {maintenance.map((item) => (
              <li
                key={item.vehicle}
                className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.vehicle}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.issue}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${item.tone}`}>
                    <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 w-full rounded-md border border-white/10 py-2 text-xs font-semibold tracking-[0.12em] text-slate-300 hover:bg-white/5"
          >
            VIEW ALL
          </button>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#111827] p-5">
          <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-200">
            Pending Bill Sanctions
          </h2>
          <ul className="mt-4 space-y-3">
            {bills.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="text-sm font-semibold tabular-nums text-white">{item.amount}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 w-full rounded-md border border-white/10 py-2 text-xs font-semibold tracking-[0.12em] text-slate-300 hover:bg-white/5"
          >
            VIEW ALL
          </button>
        </section>
      </div>
    </div>
  );
}
