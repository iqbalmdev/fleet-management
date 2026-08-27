import Link from "next/link";
import { workOrders } from "@/lib/data";
import { clearHold, goReconcile, readDemoState } from "@/app/actions/demo";

export default async function WorkshopPage() {
  const state = await readDemoState();
  const primary = workOrders.find((order) => order.id === "WO-331");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          STEP 3 · WORKSHOP
        </p>
        <h1 className="mt-1 text-2xl font-semibold">WO-331 · Front brake pads</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          {primary?.vehicle} is in the bay at {primary?.vendor}. Clear the hold
          when the vehicle is safe to return, then reconcile fuel.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Work order</p>
        <p className="mt-1 text-lg font-semibold">{primary?.id}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">Vehicle</dt>
            <dd>{primary?.vehicle}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Issue</dt>
            <dd>{primary?.issue}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Vendor</dt>
            <dd>{primary?.vendor}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Due</dt>
            <dd>{primary?.due}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm">
          Hold:{" "}
          {state.holdCleared ? (
            <span className="font-medium text-emerald-700">Cleared</span>
          ) : (
            <span className="font-medium text-red-700">Open</span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/demo/board"
          className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm"
        >
          Back
        </Link>
        {!state.holdCleared ? (
          <form action={clearHold}>
            <button
              type="submit"
              className="h-11 rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white"
            >
              Clear hold, then reconcile
            </button>
          </form>
        ) : (
          <form action={goReconcile}>
            <button
              type="submit"
              className="h-11 rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white"
            >
              Reconcile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
