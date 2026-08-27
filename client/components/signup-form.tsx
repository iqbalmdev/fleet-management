"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { ApiError, dashboardPathForRole, saveSession, toApiUser } from "@/lib/api";
import { ensurePrototypeSeeded, ProtoError, signUpAdmin } from "@/lib/prototype-store";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    ensurePrototypeSeeded();

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    try {
      const user = signUpAdmin({
        adminName: String(form.get("adminName")),
        organizationName: String(form.get("organizationName")),
        organizationType: String(form.get("organizationType")),
        mobile: String(form.get("mobile")),
        email: String(form.get("email")),
        designation: String(form.get("designation")),
        password,
      });
      saveSession({ token: `local-${user.id}`, user: toApiUser(user) });
      router.push(dashboardPathForRole(user.role));
    } catch (err) {
      setError(err instanceof ProtoError || err instanceof ApiError ? err.message : "Signup failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[480px] px-2 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Admin Registration
      </p>
      <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">
        Create admin account
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Prototype signup — data stays in this browser (no backend server).
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        ) : null}

        <Field label="Admin Name" name="adminName" placeholder="Enter full name" />
        <Field
          label="Organization / School Name"
          name="organizationName"
          placeholder="Enter organization name"
        />

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Organization Type
          <select
            name="organizationType"
            required
            defaultValue="school"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
          >
            <option value="school">School</option>
            <option value="travel">Travel</option>
            <option value="fleet">Fleet</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Mobile Number
          <div className="flex gap-2">
            <span className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
              +91
            </span>
            <input
              name="mobile"
              required
              inputMode="numeric"
              placeholder="9876543210"
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
            />
          </div>
        </label>

        <Field label="Email Address" name="email" type="email" placeholder="Enter email" />

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Designation
          <select
            name="designation"
            required
            defaultValue="transport_admin"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
          >
            <option value="transport_admin">Transport Admin</option>
            <option value="fleet_manager">Fleet Manager</option>
            <option value="owner">Owner</option>
          </select>
        </label>

        <PasswordField
          label="Password"
          name="password"
          show={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
        />
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          show={showConfirm}
          onToggle={() => setShowConfirm((value) => !value)}
        />

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input name="agreeToTerms" type="checkbox" required className="mt-1" />
          <span>
            I agree to{" "}
            <Link href="/terms" className="text-[#2563eb]">
              Terms & Conditions
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create Admin Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#2563eb]">
          Sign In
        </Link>
      </p>
    </section>
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
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
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

function PasswordField({
  label,
  name,
  show,
  onToggle,
}: {
  label: string;
  name: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
      {label}
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={6}
          placeholder={label}
          className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm font-normal"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 px-3 text-slate-400"
          onClick={onToggle}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
