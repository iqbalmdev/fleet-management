import Link from "next/link";
import { FleetMark } from "@/components/fleet-mark";
import { SchoolLoginForm } from "@/components/school-login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-dashed border-slate-200 px-8 py-4">
        <FleetMark />
        <Link href="/support" className="text-sm text-slate-600 hover:text-slate-900">
          Support
        </Link>
      </header>

      <main className="grid flex-1 gap-10 px-8 py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-center">
        <section className="relative min-h-[520px] overflow-hidden rounded-2xl bg-slate-900 lg:h-[calc(100vh-7.5rem)]">
          <img
            src="/login-hero.png?v=2"
            alt="School bus in the workshop"
            className="h-full w-full object-cover object-center"
          />
        </section>
        <SchoolLoginForm error={error} />
      </main>
    </div>
  );
}
