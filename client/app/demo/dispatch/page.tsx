import { vehicles } from "@/lib/data";
import { readDemoState, releaseRoutes } from "@/app/actions/demo";
import Link from "next/link";

export default async function DispatchPage() {
  const state = await readDemoState();
  const assignable = vehicles.filter((vehicle) => vehicle.id !== "BUS-07");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          STEP 2 · DISPATCH
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Release morning routes</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Assign remaining buses to R04, R09 and R12. BUS-07 stays out of the
          roster while the safety hold is open.
        </p>
      </div>

      {state.bus07Failed && !state.holdCleared ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          BUS-07 is on hold and will not appear on the board.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Bus</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {assignable.map((vehicle) => (
              <tr key={vehicle.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{vehicle.id}</td>
                <td className="px-4 py-3">{vehicle.driver}</td>
                <td className="px-4 py-3">{vehicle.route}</td>
                <td className="px-4 py-3">{vehicle.status}</td>
              </tr>
            ))}
            <tr className="border-t border-slate-100 bg-slate-50 text-slate-400">
              <td className="px-4 py-3">R12</td>
              <td className="px-4 py-3">Relief</td>
              <td className="px-4 py-3">East campus loop</td>
              <td className="px-4 py-3">BUS-04 assigned</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <Link
          href="/demo/inspect"
          className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm"
        >
          Back
        </Link>
        <form action={releaseRoutes}>
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white"
          >
            Release morning routes
          </button>
        </form>
      </div>
    </div>
  );
}
