"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bus, Fuel, MapPinned, Receipt, UserPlus, Wrench } from "lucide-react";
import { getStoredSession } from "@/lib/api";
import {
  getDashboardSnapshot,
  type DashboardSnapshot,
  type OpsBill,
  type OpsDocument,
  type OpsMaintenance,
  type OpsTrip,
} from "@/lib/fleet-ops-store";

const priorityTone: Record<
  string,
  { text: string; dot: string }
> = {
  Critical: { text: "text-rose-300", dot: "bg-rose-400" },
  Pending: { text: "text-amber-300", dot: "bg-amber-400" },
  "In progress": { text: "text-sky-300", dot: "bg-sky-400" },
  Closed: { text: "text-slate-400", dot: "bg-slate-500" },
};

export function AdminDashboard() {
  const [name, setName] = useState("Admin");
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);

  function refresh() {
    const session = getStoredSession();
    if (!session) return;
    setSnapshot(getDashboardSnapshot(session.user.orgId));
  }

  useEffect(() => {
    setName(getStoredSession()?.user.fullName ?? "Admin");
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (!snapshot) {
    return (
      <div className="text-sm text-slate-400">Loading dashboard…</div>
    );
  }

  const primaryKpis = [
    { label: "Drivers", value: snapshot.drivers, href: "/dashboard/drivers" },
    { label: "Vehicles", value: snapshot.vehicles, href: "/dashboard/vehicles" },
    {
      label: "Maintenance",
      value: snapshot.openMaintenance,
      href: "/dashboard/maintenance",
    },
    {
      label: "Pending Bills",
      value: snapshot.pendingBills,
      href: "/dashboard/bills",
    },
  ];

  const secondaryKpis = [
    {
      label: "Active Trips",
      value: snapshot.activeTrips,
      href: "/dashboard/trips",
    },
    {
      label: "Under maintenance",
      value: snapshot.vehiclesUnderMaintenance,
      href: "/dashboard/maintenance",
    },
    {
      label: "Service due soon",
      value: snapshot.dueSoon,
      href: "/dashboard/maintenance/schedules",
    },
    {
      label: "Overdue services",
      value: snapshot.overdueServices,
      href: "/dashboard/maintenance/schedules",
    },
  ];

  const costKpi = {
    label: "Maint. cost (month)",
    valueLabel: snapshot.maintenanceCostThisMonth,
    href: "/dashboard/maintenance",
  };

  const vehicleStatus = [
    {
      label: "Available",
      value: snapshot.vehicleStatus.available,
      color: "bg-emerald-400",
    },
    {
      label: "On Trip",
      value: snapshot.vehicleStatus.onTrip,
      color: "bg-sky-400",
    },
    {
      label: "Service Due",
      value: snapshot.vehicleStatus.serviceDue,
      color: "bg-amber-400",
    },
    {
      label: "Maintenance",
      value: snapshot.vehicleStatus.maintenance,
      color: "bg-rose-400",
    },
  ];

  const quickActions = [
    { label: "Add driver", href: "/dashboard/drivers", icon: UserPlus },
    { label: "Add vehicle", href: "/dashboard/vehicles", icon: Bus },
    { label: "Trips", href: "/dashboard/trips", icon: MapPinned },
    { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    { label: "Fuel & expenses", href: "/dashboard/fuel", icon: Fuel },
    { label: "Bill sanction", href: "/dashboard/bills", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">DASHBOARD</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Welcome back, {name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live counts from your fleet data in this browser.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryKpis.map((item) => (
          <KpiLink key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {secondaryKpis.map((item) => (
          <KpiLink key={item.label} {...item} subtle />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiLink
          label="Doc Expiry"
          value={snapshot.docExpiry}
          href="/dashboard/documents"
          subtle
        />
        <KpiLink
          label="Breakdowns"
          value={snapshot.breakdowns}
          href="/dashboard/maintenance"
          subtle
        />
        <Link
          href={costKpi.href}
          className="block rounded-xl border border-white/5 bg-[#0f172a] px-5 py-4 transition hover:border-sky-500/30 hover:bg-white/[0.02] sm:col-span-2"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            {costKpi.label}
          </p>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-white">
            {costKpi.valueLabel}
          </p>
        </Link>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#111827] p-5">
        <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-200">
          QUICK ACTIONS
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/5"
              >
                <Icon className="h-3.5 w-3.5 text-sky-400" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-200">
            VEHICLE STATUS
          </h2>
          <Link
            href="/dashboard/vehicles"
            className="text-xs font-semibold text-sky-300 hover:text-sky-200"
          >
            View fleet
          </Link>
        </div>
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
              <span className="text-lg font-semibold tabular-nums text-white">
                {String(item.value).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelList
          title="Maintenance tracker"
          href="/dashboard/maintenance"
          empty="No open work orders"
        >
          {snapshot.maintenancePreview.map((item) => (
            <MaintenanceRow key={item.id} item={item} />
          ))}
        </PanelList>

        <PanelList
          title="Pending bill sanctions"
          href="/dashboard/bills"
          empty="No pending bills"
        >
          {snapshot.billsPreview.map((item) => (
            <BillRow key={item.id} item={item} />
          ))}
        </PanelList>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelList title="Active trips" href="/dashboard/trips" empty="No active trips">
          {snapshot.tripsPreview.map((item) => (
            <TripRow key={item.id} item={item} />
          ))}
        </PanelList>

        <PanelList
          title="Document expiry"
          href="/dashboard/documents"
          empty="No expiring documents"
        >
          {snapshot.documentsPreview.map((item) => (
            <DocumentRow key={item.id} item={item} />
          ))}
        </PanelList>
      </div>

      {snapshot.breakdownsPreview.length > 0 ? (
        <section className="rounded-xl border border-rose-500/20 bg-[#111827] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-[0.12em] text-rose-200">
              BREAKDOWNS
            </h2>
            <Link
              href="/dashboard/maintenance"
              className="text-xs font-semibold text-sky-300 hover:text-sky-200"
            >
              VIEW ALL
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {snapshot.breakdownsPreview.map((item) => (
              <MaintenanceRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function KpiLink({
  label,
  value,
  href,
  subtle,
}: {
  label: string;
  value: number;
  href: string;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl border px-5 py-4 transition hover:border-sky-500/30 hover:bg-white/[0.02] ${
        subtle ? "border-white/5 bg-[#0f172a]" : "border-white/10 bg-[#111827]"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-white">
        {String(value).padStart(2, "0")}
      </p>
    </Link>
  );
}

function PanelList({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children)
    ? (children as React.ReactElement[]).length > 0
    : Boolean(children);

  return (
    <section className="rounded-xl border border-white/10 bg-[#111827] p-5">
      <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-200">{title}</h2>
      <ul className="mt-4 space-y-3">
        {hasItems ? (
          children
        ) : (
          <li className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-xs text-slate-500">
            {empty}
          </li>
        )}
      </ul>
      <Link
        href={href}
        className="mt-4 flex h-10 w-full items-center justify-center rounded-md border border-white/10 text-xs font-semibold tracking-[0.12em] text-slate-300 hover:bg-white/5"
      >
        VIEW ALL
      </Link>
    </section>
  );
}

function MaintenanceRow({ item }: { item: OpsMaintenance }) {
  const tone = priorityTone[item.priority] ?? priorityTone.Pending;
  const href = item.requestId
    ? `/dashboard/maintenance/${item.requestId}`
    : "/dashboard/maintenance";
  return (
    <li className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
      <Link href={href} className="block hover:opacity-90">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">{item.vehicle}</p>
            <p className="mt-1 text-xs text-slate-400">{item.issue}</p>
            {item.statusLabel ? (
              <p className="mt-1 text-[11px] text-slate-500">{item.statusLabel}</p>
            ) : null}
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone.text}`}>
            <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
            {item.priority}
          </span>
        </div>
      </Link>
    </li>
  );
}

function BillRow({ item }: { item: OpsBill }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-sm text-slate-300">{item.bill}</p>
        <p className="text-xs text-slate-500">{item.vendor}</p>
      </div>
      <span className="text-sm font-semibold tabular-nums text-white">{item.amount}</span>
    </li>
  );
}

function TripRow({ item }: { item: OpsTrip }) {
  return (
    <li className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{item.trip}</p>
          <p className="mt-1 text-xs text-slate-400">
            {item.route} · {item.vehicle}
          </p>
        </div>
        <span className="text-xs font-medium text-sky-300">{item.status}</span>
      </div>
    </li>
  );
}

function DocumentRow({ item }: { item: OpsDocument }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-sm text-slate-300">{item.document}</p>
        <p className="text-xs text-slate-500">{item.owner}</p>
      </div>
      <span
        className={`text-xs font-medium ${
          item.status === "Expired" ? "text-rose-300" : "text-amber-300"
        }`}
      >
        {item.status}
      </span>
    </li>
  );
}
