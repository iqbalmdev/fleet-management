import Link from "next/link";
import { FleetMark } from "@/components/fleet-mark";

export default function SupportPage() {
  return (
    <SimplePage
      title="Help & Support"
      body="Demo workspace credentials: Organization ID enterprise-fleet. Users administrator, dispatcher, driver, or finance. Password fleet123."
    />
  );
}

export function SimplePage({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-dashed border-slate-200 px-8 py-4">
        <FleetMark />
      </header>
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
        <Link href="/login" className="mt-6 inline-block text-sm text-[#2563eb]">
          Back to sign in
        </Link>
      </main>
    </div>
  );
}
