"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bus,
  ClipboardList,
  Fuel,
  History,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Receipt,
  Wallet,
} from "lucide-react";
import { clearSession, getStoredSession, type ApiUser } from "@/lib/api";

const driverNav = [
  { href: "/driver", label: "Today's shift", icon: LayoutDashboard },
  { href: "/driver/routes", label: "Route assignment", icon: MapPinned },
  { href: "/driver/fuel", label: "Fuel expense", icon: Fuel },
  { href: "/driver/reimbursements", label: "Reimbursement", icon: Wallet },
  { href: "/driver/alerts", label: "Service alerts", icon: AlertTriangle },
  { href: "/driver/history", label: "Service history", icon: History },
];

export function DriverShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user.role !== "driver") {
      router.replace("/dashboard");
      return;
    }
    setUser(session.user);
  }, [router]);

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading driver workspace…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
            FleetCare Driver
          </p>
          <p className="text-sm text-slate-600">
            {user.fullName} · {user.orgName}
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-semibold">Driver workspace</p>
          <p className="mt-1 text-xs text-slate-500">Route · Fuel · Service</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {driverNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                  active
                    ? "bg-sky-50 font-medium text-sky-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          Vehicle BUS-01 · TN-09-SC-1102
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white px-2 py-2 md:hidden">
        {driverNav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] ${
                active ? "bg-sky-50 text-sky-700" : "text-slate-500"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      <main className="px-5 pb-24 pt-[4.5rem] md:ml-60 md:pb-8">{children}</main>
    </div>
  );
}

export function DriverDashboard() {
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    setUser(getStoredSession()?.user ?? null);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Today&apos;s shift</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your route, vehicle, and checklist for this run.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card icon={<Bus className="h-4 w-4" />} title="Assigned vehicle" value="BUS-01 · TN-09-SC-1102" />
        <Card icon={<MapPinned className="h-4 w-4" />} title="Next stop" value="Greenfield Gate · 07:40" />
        <Card icon={<ClipboardList className="h-4 w-4" />} title="Checklist" value="2 pending items" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { href: "/driver/routes", label: "View route assignment", icon: MapPinned },
            { href: "/driver/fuel", label: "Log fuel expense", icon: Fuel },
            { href: "/driver/reimbursements", label: "Submit reimbursement", icon: Receipt },
            { href: "/driver/alerts", label: "Service alerts", icon: AlertTriangle },
            { href: "/driver/history", label: "Service history", icon: History },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50"
              >
                <Icon className="h-4 w-4 text-sky-600" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Trip plan
        </h2>
        <ul className="mt-4 space-y-3">
          {["Morning pickup — Zone A", "School drop — Main campus", "Evening return — Zone A"].map(
            (item) => (
              <li
                key={item}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </li>
            ),
          )}
        </ul>
      </section>

      <p className="text-sm text-slate-500">
        Signed in as {user?.email ?? "driver"} · Org {user?.orgId}
      </p>
    </div>
  );
}

function Card({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

type DriverField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  options?: Array<{ value: string; label: string }>;
};

type DriverRecord = Record<string, string> & { id: string };

export function DriverModuleWorkspace({
  title,
  description,
  storageKey,
  seed,
  fields,
  columns,
  formTitle = "Add entry",
  listTitle = "Records",
  createLabel = "Save",
  statusKey,
}: {
  title: string;
  description: string;
  storageKey: string;
  seed: DriverRecord[];
  fields: DriverField[];
  columns: Array<{ key: string; label: string }>;
  formTitle?: string;
  listTitle?: string;
  createLabel?: string;
  statusKey?: string;
}) {
  const [rows, setRows] = useState<DriverRecord[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      localStorage.setItem(storageKey, JSON.stringify(seed));
      setRows(seed);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as DriverRecord[];
      setRows(Array.isArray(parsed) && parsed.length > 0 ? parsed : seed);
    } catch {
      setRows(seed);
    }
  }, [storageKey, seed]);

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: DriverRecord = { id: `${Date.now()}` };
    for (const field of fields) {
      next[field.name] = String(form.get(field.name) ?? "").trim();
    }
    const updated = [next, ...rows];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setRows(updated);
    event.currentTarget.reset();
    setMessage("Saved.");
  }

  function onExport() {
    const header = columns.map((c) => c.label).join(",");
    const body = rows
      .map((row) =>
        columns.map((c) => `"${String(row[c.key] ?? "").replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([[header, body].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </button>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">{formTitle}</h2>
          <form onSubmit={onCreate} className="mt-4 space-y-3">
            {fields.map((field) =>
              field.options ? (
                <label key={field.name} className="block space-y-1.5 text-sm text-slate-600">
                  {field.label}
                  <select
                    name={field.name}
                    required
                    defaultValue={field.options[0]?.value}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-400"
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label key={field.name} className="block space-y-1.5 text-sm text-slate-600">
                  {field.label}
                  <input
                    name={field.name}
                    type={field.type ?? "text"}
                    required
                    placeholder={field.placeholder}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
                  />
                </label>
              ),
            )}
            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700"
            >
              {createLabel}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">{listTitle}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  {columns.map((column) => (
                    <th key={column.key} className="px-2 py-2 font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-2 py-6 text-slate-400">
                      No records yet
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50">
                      {columns.map((column) => {
                        const value = row[column.key] ?? "—";
                        const isStatus = statusKey === column.key;
                        return (
                          <td key={`${row.id}-${column.key}`} className="px-2 py-3 text-slate-700">
                            {isStatus ? (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
