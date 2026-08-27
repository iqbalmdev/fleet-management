"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { ApiError, dashboardPathForRole, saveSession, toApiUser } from "@/lib/api";
import { ensurePrototypeSeeded, ProtoError, signIn } from "@/lib/prototype-store";

export function SchoolLoginForm({ error }: { error?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"admin" | "driver">("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    error === "invalid" ? "Credentials are not correct." : null,
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    ensurePrototypeSeeded();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const remember = form.get("remember") === "on";

    try {
      const user = signIn({
        identifier: String(form.get("identifier")),
        password: String(form.get("password")),
        expectedRole: mode,
      });
      saveSession({ token: `local-${user.id}`, user: toApiUser(user) }, remember);
      router.push(dashboardPathForRole(user.role));
    } catch (err) {
      setFormError(
        err instanceof ProtoError || err instanceof ApiError ? err.message : "Sign in failed",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-[420px] flex-col justify-center px-2 py-4">
      <h1 className="text-[32px] font-semibold tracking-tight text-slate-950">
        Welcome Back!
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {mode === "admin"
          ? "Admin sign in with Organization ID or Email."
          : "Driver sign in with your email and password."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("admin");
            setFormError(null);
          }}
          className={`h-10 rounded-md text-sm font-medium ${
            mode === "admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("driver");
            setFormError(null);
          }}
          className={`h-10 rounded-md text-sm font-medium ${
            mode === "driver" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Driver
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {formError ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>
        ) : null}

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          {mode === "admin" ? "Organization ID or Email" : "Driver Email"}
          <input
            name="identifier"
            type={mode === "driver" ? "email" : "text"}
            required
            placeholder={
              mode === "admin" ? "ORG-1001 or admin@fleetcare.demo" : "driver@fleetcare.demo"
            }
            className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal"
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Password
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter Password"
              className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm font-normal"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-slate-400"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input name="remember" type="checkbox" defaultChecked />
            Remember Me
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
        >
          {pending ? "Signing in…" : mode === "admin" ? "Sign In as Admin" : "Sign In as Driver"}
        </button>
      </form>

      {mode === "admin" ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an admin account?{" "}
          <Link href="/signup" className="font-medium text-[#2563eb]">
            Sign Up
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-slate-500">
          Driver accounts are created by your organization admin.
        </p>
      )}

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Demo logins (prototype)</p>
        {mode === "admin" ? (
          <p className="mt-1">
            Org <span className="font-medium">ORG-1001</span> or{" "}
            <span className="font-medium">admin@fleetcare.demo</span> /{" "}
            <span className="font-medium">Admin@123</span>
          </p>
        ) : (
          <p className="mt-1">
            <span className="font-medium">driver@fleetcare.demo</span> /{" "}
            <span className="font-medium">Driver@123</span>
          </p>
        )}
      </div>
    </section>
  );
}
