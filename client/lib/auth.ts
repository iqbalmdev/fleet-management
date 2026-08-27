import { cookies } from "next/headers";
import { readStore, type Organization } from "@/lib/store";

export type Role = "app_owner" | "school_owner";

export type Session = {
  kind: Role;
  orgId: string | null;
  orgName: string;
  email: string;
  displayName: string;
};

const SCHOOL_COOKIE = "fleet_session";
const OWNER_COOKIE = "fleet_owner";

const APP_OWNER = {
  email: "owner@fleet.app",
  password: "owner123",
  displayName: "Fleet App Owner",
};

export async function authenticateSchool(
  orgId: string,
  email: string,
  password: string,
): Promise<Session | null> {
  const store = await readStore();
  const org = store.organizations.find(
    (item) => item.id.toLowerCase() === orgId.trim().toLowerCase(),
  );
  if (!org) return null;
  if (org.ownerEmail.toLowerCase() !== email.trim().toLowerCase()) return null;
  if (org.ownerPassword !== password) return null;
  return schoolSession(org);
}

export function schoolSession(org: Organization): Session {
  return {
    kind: "school_owner",
    orgId: org.id,
    orgName: org.name,
    email: org.ownerEmail,
    displayName: org.ownerName,
  };
}

export function authenticateOwner(email: string, password: string): Session | null {
  if (
    email.trim().toLowerCase() !== APP_OWNER.email ||
    password !== APP_OWNER.password
  ) {
    return null;
  }
  return {
    kind: "app_owner",
    orgId: null,
    orgName: "Fleet Platform",
    email: APP_OWNER.email,
    displayName: APP_OWNER.displayName,
  };
}

export async function setSchoolSession(session: Session) {
  const store = await cookies();
  store.set(SCHOOL_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function setOwnerSession(session: Session) {
  const store = await cookies();
  store.set(OWNER_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSchoolSession() {
  const store = await cookies();
  store.delete(SCHOOL_COOKIE);
}

export async function clearOwnerSession() {
  const store = await cookies();
  store.delete(OWNER_COOKIE);
}

export async function getSchoolSession(): Promise<Session | null> {
  return readCookie(SCHOOL_COOKIE);
}

export async function getOwnerSession(): Promise<Session | null> {
  return readCookie(OWNER_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  return (await getSchoolSession()) ?? (await getOwnerSession());
}

async function readCookie(name: string): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(name)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
