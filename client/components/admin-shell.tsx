"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bus,
  ClipboardCheck,
  FileText,
  Fuel,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Route,
  Search,
  Settings,
  ShieldAlert,
  UserRound,
  Users,
  Wrench,
  Receipt,
  BarChart3,
} from "lucide-react";
import { clearSession, getStoredSession, type ApiUser } from "@/lib/api";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/drivers", label: "Drivers", icon: Users },
  { href: "/dashboard/vehicles", label: "Vehicles", icon: Bus },
  { href: "/dashboard/routes", label: "Routes & Assignments", icon: Route },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/inspections", label: "Inspections", icon: ClipboardCheck },
  { href: "/dashboard/bills", label: "Bill Sanction", icon: Receipt },
  { href: "/dashboard/fuel", label: "Fuel & Expenses", icon: Fuel },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/trips", label: "Trips", icon: MapPinned },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user.role !== "admin") {
      router.replace("/driver");
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
      <div className="flex min-h-screen items-center justify-center bg-[#0b1220] text-sm text-slate-400">
        Loading FleetCare…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#0f172a] px-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-sky-400" />
          <span className="text-sm font-semibold tracking-[0.12em]">FLEETCARE</span>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="relative rounded-md p-2 text-slate-300 hover:bg-white/5">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold">
              3
            </span>
          </button>
          <button
            type="button"
            className="hidden items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 sm:flex"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
          <div className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs">
            <UserRound className="h-3.5 w-3.5 text-sky-300" />
            Admin
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-64 flex-col border-r border-white/10 bg-[#0f172a] md:flex">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-sm font-semibold tracking-wide">FLEETCARE</p>
          <p className="mt-1 text-xs text-slate-400">School & Travel Management</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-sky-500/15 text-sky-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-slate-400">Role: Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="pt-14 md:pl-64">
        <div className="px-5 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
