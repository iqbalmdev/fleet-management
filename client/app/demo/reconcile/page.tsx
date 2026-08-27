import Link from "next/link";
import { fuelRows } from "@/lib/data";
import { approveFuel, closeDay, readDemoState } from "@/app/actions/demo";

export default async function ReconcilePage() {
  const state = await readDemoState();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          STEP 4 · RECONCILE
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Fuel & expenses</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Approve the pending slip for BUS-18, then close the day.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Litres</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {fuelRows.map((row) => {
              const pending = row.vehicle === "BUS-18";
              const status = pending && state.fuelApproved ? "Approved" : row.status;
              return (
                <tr key={`${row.vehicle}-${row.date}`} className="border-t border-slate-100">
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.vehicle}</td>
                  <td className="px-4 py-3">{row.litres}</td>
                  <td className="px-4 py-3">{row.amount}</td>
                  <td className="px-4 py-3">{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/demo/workshop"
          className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm"
        >
          Back
        </Link>
        {!state.fuelApproved ? (
          <form action={approveFuel}>
            <button
              type="submit"
              className="h-11 rounded-lg border border-[#2563eb] px-5 text-sm font-semibold text-[#2563eb]"
            >
              Approve BUS-18 slip
            </button>
          </form>
        ) : null}
        <form action={closeDay}>
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white"
          >
            Close day
          </button>
        </form>
      </div>
    </div>
  );
}
