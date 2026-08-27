import Link from "next/link";
import { FleetMark } from "@/components/fleet-mark";
import { ownerSignInAction } from "@/app/actions/auth";

export default async function OwnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-dashed border-slate-200 px-8 py-4">
        <FleetMark />
        <Link href="/login" className="text-sm text-slate-600">
          School owner sign in
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          APP OWNER · LEVEL 1
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Platform admin
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create organizations (schools, colleges). School owners then sign in
          with the organization ID you issue.
        </p>
        <form action={ownerSignInAction} className="mt-8 space-y-4">
          {error === "invalid" ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
              App owner credentials were not recognised.
            </p>
          ) : null}
          <label className="block space-y-1.5 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              defaultValue="owner@fleet.app"
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              required
              defaultValue="owner123"
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
            />
          </label>
          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white"
          >
            Enter platform
          </button>
        </form>
        <p className="mt-6 text-xs text-slate-400">
          Demo: owner@fleet.app / owner123
        </p>
      </main>
    </div>
  );
}
