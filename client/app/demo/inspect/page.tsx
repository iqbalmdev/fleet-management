import { failBus07, passBus01 } from "@/app/actions/demo";

const checks = ["ENGINE", "BRAKES", "TYRES", "ELECTRICAL", "FLUIDS"] as const;

export default function InspectPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          STEP 1 · PRE-TRIP
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Pre-trip inspection</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Sign BUS-01 through. Fail BUS-07 on brakes — that vehicle cannot be
          dispatched until workshop clears the hold.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs text-slate-400">BUS-01 · Karthik R</p>
          <h2 className="mt-1 text-lg font-semibold">TN-09-SC-1102</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {checks.map((item) => (
              <li key={item} className="flex items-center justify-between">
                <span>{item}</span>
                <span className="text-[#2563eb]">✓</span>
              </li>
            ))}
          </ul>
          <form action={passBus01} className="mt-6">
            <button
              type="submit"
              className="h-10 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white"
            >
              Pass and go to dispatch
            </button>
          </form>
        </article>

        <article className="rounded-xl border border-red-200 bg-white p-6">
          <p className="text-xs text-red-500">BUS-07 · unassigned</p>
          <h2 className="mt-1 text-lg font-semibold">TN-09-SC-2218</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {checks.map((item) => (
              <li key={item} className="flex items-center justify-between">
                <span>{item}</span>
                <span className={item === "BRAKES" ? "text-red-600" : "text-[#2563eb]"}>
                  {item === "BRAKES" ? "Fail" : "✓"}
                </span>
              </li>
            ))}
          </ul>
          <form action={failBus07} className="mt-6">
            <button
              type="submit"
              className="h-10 w-full rounded-lg border border-red-300 text-sm font-semibold text-red-800"
            >
              Fail brakes — safety hold
            </button>
          </form>
        </article>
      </div>
    </div>
  );
}
