import Link from "next/link";
import { FleetMark } from "@/components/fleet-mark";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-dashed border-slate-200 px-8 py-4">
        <FleetMark />
        <Link href="/support" className="text-sm text-slate-600 hover:text-slate-900">
          Support
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-start justify-center px-6 py-10">
        <SignupForm />
      </main>
    </div>
  );
}
