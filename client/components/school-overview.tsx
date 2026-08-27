"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredSession, type ApiUser } from "@/lib/api";
import { ensurePrototypeSeeded, listDrivers, listVehicles } from "@/lib/prototype-store";

export function SchoolOverview() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [counts, setCounts] = useState({ buses: 0, drivers: 0 });

  useEffect(() => {
    ensurePrototypeSeeded();
    const session = getStoredSession();
    setUser(session?.user ?? null);
    if (session?.user.orgId) {
      setCounts({
        buses: listVehicles(session.user.orgId).length,
        drivers: listDrivers(session.user.orgId).length,
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{user?.orgName ?? "Organization"}</h1>
        <p className="text-sm text-slate-500">Organization ID {user?.orgId}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card href="/dashboard/vehicles" label="Vehicles" value={String(counts.buses)} />
        <Card href="/dashboard/drivers" label="Drivers" value={String(counts.drivers)} />
      </div>
    </div>
  );
}

function Card({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </Link>
  );
}
