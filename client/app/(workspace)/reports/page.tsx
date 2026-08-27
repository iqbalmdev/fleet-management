import { exceptions, fleetKpis } from "@/lib/data";
import { Module } from "@/components/module";

export default function ReportsPage() {
  return (
    <Module
      code="M8"
      title="Reports & alerts"
      body="Operational metrics, exports and notifications. GPS telematics and parent tracking stay out of this release."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {fleetKpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
          </article>
        ))}
      </div>
      <ul className="mt-6 space-y-3">
        {exceptions.map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-sm text-slate-500">{item.detail}</p>
          </li>
        ))}
      </ul>
    </Module>
  );
}
