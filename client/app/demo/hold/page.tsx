import Link from "next/link";
import { openWorkOrder } from "@/app/actions/demo";

export default function HoldPage() {
  return (
    <div className="max-w-xl space-y-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-red-500">
        STEP 1B · SAFETY HOLD
      </p>
      <h1 className="text-2xl font-semibold">BUS-07 cannot be assigned.</h1>
      <p className="text-sm leading-6 text-slate-600">
        Pre-trip failed on brakes. Pad wear is beyond limit. The vehicle stays
        in the yard until a work order is opened and workshop clears the hold.
      </p>
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
        Held: TN-09-SC-2218 · Front brake pads · Due today 16:00
      </div>
      <div className="flex flex-wrap gap-3">
        <form action={openWorkOrder}>
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white"
          >
            Open work order
          </button>
        </form>
        <Link
          href="/demo/dispatch"
          className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-medium"
        >
          Dispatch the rest of the fleet
        </Link>
      </div>
    </div>
  );
}
