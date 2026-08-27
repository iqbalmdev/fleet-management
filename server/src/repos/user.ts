import { env } from "../config/env";
import { readFileStore, writeFileStore } from "../db/file-store";
import { getSupabase } from "../db/supabase";
import type { Designation, User, UserRole } from "../types";
import { nextUserId } from "../utils/ids";

export type CreateUserInput = {
  orgId: string;
  fullName: string;
  email: string;
  mobile: string;
  designation: Designation;
  passwordHash: string;
  role: UserRole;
  emailVerified?: boolean;
  verificationToken?: string | null;
  verificationExpiresAt?: string | null;
};

export async function createUser(input: CreateUserInput) {
  const id = await nextUserId();
  const row: User = {
    id,
    org_id: input.orgId,
    full_name: input.fullName,
    email: input.email.toLowerCase(),
    mobile: input.mobile,
    designation: input.designation,
    password_hash: input.passwordHash,
    role: input.role,
    email_verified: input.emailVerified ?? true,
    verification_token: input.verificationToken ?? null,
    verification_expires_at: input.verificationExpiresAt ?? null,
    created_at: new Date().toISOString(),
  };

  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    store.users.push(row);
    await writeFileStore(store);
    return row;
  }

  const { data, error } = await getSupabase()
    .from("users")
    .insert({
      id: row.id,
      org_id: row.org_id,
      full_name: row.full_name,
      email: row.email,
      mobile: row.mobile,
      designation: row.designation,
      password_hash: row.password_hash,
      role: row.role,
      email_verified: row.email_verified,
      verification_token: row.verification_token,
      verification_expires_at: row.verification_expires_at,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as User;
}

export async function findUserByEmail(email: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    return store.users.find((item) => item.email === email.toLowerCase()) ?? null;
  }

  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as User | null;
}

export async function findUserByOrgAndId(orgId: string, userId: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    return (
      store.users.find((item) => item.org_id === orgId && item.id === userId) ?? null
    );
  }

  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as User | null;
}

export async function findAdminByOrgId(orgId: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    return (
      store.users.find((item) => item.org_id === orgId && item.role === "admin") ?? null
    );
  }

  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("org_id", orgId)
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as User | null;
}

export async function findUserById(userId: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    return store.users.find((item) => item.id === userId) ?? null;
  }

  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as User | null;
}

export async function findUserByVerificationToken(token: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    return store.users.find((item) => item.verification_token === token) ?? null;
  }

  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("verification_token", token)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as User | null;
}

export async function markEmailVerified(userId: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.email_verified = true;
    user.verification_token = null;
    user.verification_expires_at = null;
    await writeFileStore(store);
    return user;
  }

  const { data, error } = await getSupabase()
    .from("users")
    .update({
      email_verified: true,
      verification_token: null,
      verification_expires_at: null,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as User;
}
