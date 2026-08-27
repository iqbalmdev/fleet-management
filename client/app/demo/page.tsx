import { startPreTrip } from "@/app/actions/demo";

export default function DemoStartPage() {
  return (
    <div className="max-w-xl space-y-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
        STEP 0 · MORNING BOARD
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Morning board for 18 buses.
      </h1>
      <p className="text-sm leading-6 text-slate-600">
        Walk one operational day: inspect, dispatch, workshop, reconcile, close.
        No login. You are on Enterprise School Transport.
      </p>
      <form action={startPreTrip}>
        <button
          type="submit"
          className="h-11 rounded-lg bg-[#2563eb] px-5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
        >
          Start pre-trip
        </button>
      </form>
    </div>
  );
}
