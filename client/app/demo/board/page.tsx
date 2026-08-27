import Link from "next/link";
import { routes } from "@/lib/data";
import { continueFromBoard, readDemoState } from "@/app/actions/demo";

export default async function BoardPage() {
  const state = await readDemoState();
  const holdOpen = state.bus07Failed && !state.holdCleared;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          STEP 2B · LIVE BOARD
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Morning routes are live</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          R12 is running 11 minutes late at stop 4. Everything else is on time.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">ETA</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.code} className="border-t border-slate-100">
                <td className="px-4 py-3">{route.code}</td>
                <td className="px-4 py-3">{route.name}</td>
                <td className="px-4 py-3">{route.vehicle}</td>
                <td className="px-4 py-3">{route.status}</td>
                <td
                  className={
                    route.code === "R12" ? "px-4 py-3 font-medium text-amber-700" : "px-4 py-3"
                  }
                >
                  {route.eta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/demo/dispatch"
          className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm"
        >
          Back
        </Link>
        <form action={continueFromBoard}>
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white"
          >
            {holdOpen ? "Continue to workshop" : "Reconcile"}
          </button>
        </form>
      </div>
    </div>
  );
}
