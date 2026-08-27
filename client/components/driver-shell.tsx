"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bus, ClipboardList, LogOut, MapPin } from "lucide-react";
import { clearSession, getStoredSession, type ApiUser } from "@/lib/api";

export function DriverShell({ children }: { children: ReactNode }) {
  const router = useRouter();
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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
              FleetCare Driver
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {user.fullName} · {user.orgName}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}

export function DriverDashboard() {
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    setUser(getStoredSession()?.user ?? null);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Today&apos;s shift</h1>
        <p className="mt-1 text-sm text-slate-500">
          Driver view — different from the admin FleetCare dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          icon={<Bus className="h-4 w-4" />}
          title="Assigned vehicle"
          value="BUS-01 · TN-09-SC-1102"
        />
        <Card
          icon={<MapPin className="h-4 w-4" />}
          title="Next stop"
          value="Greenfield Gate · 07:40"
        />
        <Card
          icon={<ClipboardList className="h-4 w-4" />}
          title="Checklist"
          value="2 pending items"
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
          Trip plan
        </h2>
        <ul className="mt-4 space-y-3">
          {[
            "Morning pickup — Zone A",
            "School drop — Main campus",
            "Evening return — Zone A",
          ].map((item) => (
            <li
              key={item}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
        <Link
          href="/driver"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white"
        >
          Start trip checklist
        </Link>
      </section>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        Signed in as {user?.email ?? "driver"} · Org {user?.orgId}
      </div>
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
