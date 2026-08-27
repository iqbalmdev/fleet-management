import Link from "next/link";
import { FleetMark } from "@/components/fleet-mark";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <FleetMark />
        <div className="flex items-center gap-4 text-sm">
          <Link href="/support" className="text-slate-600">
            Support
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-[#2563eb] px-4 py-2 font-medium text-white"
          >
            Sign in
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">
          SCHOOL FLEET · WEB ADMIN
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight">
          School Fleet <span className="text-slate-400">Operations</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Safer routes, faster dispatch, cleaner records, and a fleet team that
          always knows what needs attention. Built around the Routewise daily
          loop: inspect, dispatch, maintain, reconcile.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white"
          >
            Open workspace
          </Link>
          <a
            href="https://schoolfeet.vercel.app/"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            View blueprint
          </a>
        </div>
        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            ["Web admin", "Command center for transport leadership and dispatch."],
            ["Driver loop", "Pre-trip checklists, trip status, defect holds."],
            ["System of record", "School tenancy, roles, files and audit history."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
