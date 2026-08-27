import { fleetKpis } from "@/lib/data";
import { readDemoState, restartDemo } from "@/app/actions/demo";

export default async function ClosePage() {
  const state = await readDemoState();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          STEP 5 · DAY CLOSE
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Day closed</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Inspections 16/18, 14 routes released, BUS-07
          {state.holdCleared ? " hold cleared" : " remained on hold"}, fuel slip
          {state.fuelApproved ? " approved" : " still pending"}.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {fleetKpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-400">{kpi.hint}</p>
          </article>
        ))}
      </section>

      <form action={restartDemo}>
        <button
          type="submit"
          className="h-11 rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white"
        >
          Restart demo
        </button>
      </form>
    </div>
  );
}
