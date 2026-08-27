import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/auth";
import { readStore } from "@/lib/store";
import { createOrganizationAction } from "@/app/actions/owner";
import { ownerSignOutAction } from "@/app/actions/auth";
import { FleetMark } from "@/components/fleet-mark";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const owner = await getOwnerSession();
  if (!owner) redirect("/owner");
  const { created, error } = await searchParams;
  const store = await readStore();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
        <div>
          <FleetMark compact />
          <p className="mt-1 text-xs text-slate-500">Single source of truth · organizations</p>
        </div>
        <form action={ownerSignOutAction}>
          <button type="submit" className="text-sm text-slate-500">
            Sign out
          </button>
        </form>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[1fr_1.1fr]">
        <section className="h-fit rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-semibold">Create organization</h1>
          <p className="mt-1 text-sm text-slate-500">
            Issues an Organization ID. Share it with the school owner plus their
            email and password.
          </p>
          {error === "missing" ? (
            <p className="mt-3 text-sm text-red-700">Fill every field.</p>
          ) : null}
          <form action={createOrganizationAction} className="mt-5 space-y-3">
            <Field label="Organization name" name="name" placeholder="Greenfield Public School" />
            <label className="block space-y-1.5 text-sm font-medium">
              Type
              <select
                name="type"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
              >
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="other">Other campus</option>
              </select>
            </label>
            <Field label="School owner name" name="ownerName" placeholder="Asha Menon" />
            <Field
              label="School owner email"
              name="ownerEmail"
              type="email"
              placeholder="asha@greenfield.edu"
            />
            <Field
              label="Temporary password"
              name="ownerPassword"
              type="password"
              placeholder="Set a password they will use"
            />
            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white"
            >
              Create organization
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Issued organizations</h2>
          {created ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Organization ID <strong>{created}</strong> is ready. School owner
              signs in at /login with this ID, their email, and password.
            </p>
          ) : null}
          {store.organizations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
              No organizations yet. Create the first school or college.
            </p>
          ) : (
            store.organizations.map((org) => (
              <article
                key={org.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {org.type}
                    </p>
                    <h3 className="font-semibold">{org.name}</h3>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-semibold text-[#2563eb]">
                    {org.id}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {org.ownerName} · {org.ownerEmail}
                </p>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
      />
    </label>
  );
}
