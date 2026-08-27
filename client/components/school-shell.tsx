"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FleetMark } from "@/components/fleet-mark";
import { clearSession, getStoredSession, type ApiUser } from "@/lib/api";

const links = [
  { href: "/school", label: "Overview" },
  { href: "/school/buses", label: "Buses" },
  { href: "/school/drivers", label: "Drivers" },
];

export function SchoolShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login");
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
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm text-slate-500">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-slate-200 bg-white px-4 py-5 md:flex md:flex-col">
        <FleetMark compact />
        <p className="mt-6 px-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400">
          {user.orgId}
        </p>
        <p className="px-2 text-xs text-slate-500">{user.orgName}</p>
        <nav className="mt-4 flex-1 space-y-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-500"
        >
          Sign out
        </button>
      </aside>
      <div className="md:pl-56">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Admin</p>
          <p className="text-sm text-slate-700">
            {user.fullName} · {user.email}
          </p>
        </header>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
