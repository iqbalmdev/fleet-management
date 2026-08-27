import type { ProtoUser } from "@/lib/prototype-store";

export type ApiUser = {
  id: string;
  orgId: string;
  orgName: string;
  fullName: string;
  email: string;
  designation: string;
  role: "admin" | "driver";
};

export type AuthSession = {
  token: string;
  user: ApiUser;
};

const TOKEN_KEY = "fleet_token";
const USER_KEY = "fleet_user";
const AUTH_FLAG = "fleet_auth";

export function toApiUser(user: ProtoUser): ApiUser {
  return {
    id: user.id,
    orgId: user.orgId,
    orgName: user.orgName,
    fullName: user.fullName,
    email: user.email,
    designation: user.designation,
    role: user.role,
  };
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;
  try {
    return { token, user: JSON.parse(rawUser) as ApiUser };
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession, remember = true) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  const maxAge = remember ? 60 * 60 * 12 : undefined;
  const base = maxAge
    ? `path=/; max-age=${maxAge}; SameSite=Lax`
    : `path=/; SameSite=Lax`;
  document.cookie = `${AUTH_FLAG}=1; ${base}`;
  document.cookie = `fleet_role=${session.user.role}; ${base}`;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${AUTH_FLAG}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `fleet_role=; path=/; max-age=0; SameSite=Lax`;
}

export function dashboardPathForRole(role: ApiUser["role"]) {
  return role === "driver" ? "/driver" : "/dashboard";
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** @deprecated Prototype no longer calls a backend. Kept for compatibility. */
export async function apiFetch<T>(_path: string, _options?: unknown): Promise<T> {
  throw new ApiError("Backend disabled — this is a client-only prototype", 501);
}
