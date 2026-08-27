"use client";

import Link from "next/link";
import { FleetMark } from "@/components/fleet-mark";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-dashed border-slate-200 px-8 py-4">
        <FleetMark />
        <Link href="/login" className="text-sm text-[#2563eb]">
          Sign In
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">
          Email verification skipped
        </h1>
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          This prototype has no backend mail server. Accounts work immediately
          after sign up / with the demo logins.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold text-white"
        >
          Go to Sign In
        </Link>
      </main>
    </div>
  );
}
