"use server";

import { redirect } from "next/navigation";
import {
  authenticateOwner,
  authenticateSchool,
  clearOwnerSession,
  clearSchoolSession,
  setOwnerSession,
  setSchoolSession,
} from "@/lib/auth";

export async function ownerSignInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const session = authenticateOwner(email, password);
  if (!session) redirect("/owner?error=invalid");
  await setOwnerSession(session);
  redirect("/owner/orgs");
}

export async function ownerSignOutAction() {
  await clearOwnerSession();
  redirect("/owner");
}

export async function schoolSignInAction(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const session = await authenticateSchool(orgId, email, password);
  if (!session) redirect("/login?error=invalid");
  await setSchoolSession(session);
  redirect("/school");
}

export async function schoolSignOutAction() {
  await clearSchoolSession();
  redirect("/login");
}

export async function signOutAction() {
  await clearSchoolSession();
  await clearOwnerSession();
  redirect("/owner");
}
