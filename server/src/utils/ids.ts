import { env } from "../config/env";
import { getSupabase } from "../db/supabase";
import { readFileStore } from "../db/file-store";

async function nextSequentialId(table: "organizations" | "users" | "drivers" | "buses", prefix: string, pad: number, startAt: number) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    const count = store[table].length;
    const n = count + startAt;
    return `${prefix}-${String(n).padStart(pad, "0")}`;
  }

  const { count, error } = await getSupabase()
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Failed to count ${table}: ${error.message}`);
  }

  const n = (count ?? 0) + startAt;
  return `${prefix}-${String(n).padStart(pad, "0")}`;
}

export async function nextOrgId() {
  return nextSequentialId("organizations", "ORG", 4, 1001);
}

export async function nextUserId() {
  return nextSequentialId("users", "USR", 4, 1);
}

export async function nextDriverId() {
  return nextSequentialId("drivers", "DRV", 3, 1);
}

export async function nextBusId() {
  return nextSequentialId("buses", "BUS", 3, 1);
}
