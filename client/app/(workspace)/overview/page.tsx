import Link from "next/link";
import { exceptions, fleetKpis } from "@/lib/data";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          SYSTEM MAP / 00
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Make every route predictable.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Morning dispatch, inspections, maintenance, fuel and compliance in one
          school-scoped workspace — aligned with the{" "}
          <a
            className="text-[#2563eb] underline"
            href="https://schoolfeet.vercel.app/"
          >
            Routewise operating model
          </a>
          .
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {fleetKpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-400">{kpi.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold">Live exceptions</h2>
          </div>
          <ul>
            {exceptions.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>
                <Severity value={item.severity} />
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <LinkCard href="/routes" title="Dispatch board" body="Routes, rosters, delayed runs." />
          <LinkCard href="/inspections" title="Pre-trip queue" body="Engine, brakes, tyres, electrical, fluids." />
          <LinkCard href="/maintenance" title="Workshop" body="Work orders and vehicle holds." />
        </div>
      </section>
    </div>
  );
}

function Severity({ value }: { value: string }) {
  const tone =
    value === "high"
      ? "bg-red-50 text-red-800"
      : value === "medium"
        ? "bg-amber-50 text-amber-800"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {value}
    </span>
  );
}

function LinkCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-200"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </Link>
  );
}
