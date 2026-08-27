import { env } from "../config/env";
import { readFileStore, writeFileStore } from "../db/file-store";
import { getSupabase } from "../db/supabase";
import type { Driver } from "../types";
import { nextDriverId } from "../utils/ids";

export async function listDriversByOrg(orgId: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    return store.drivers.filter((item) => item.org_id === orgId);
  }

  const { data, error } = await getSupabase()
    .from("drivers")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Driver[];
}

export async function createDriver(input: {
  orgId: string;
  name: string;
  license: string;
  phone: string;
}) {
  const id = await nextDriverId();
  const row: Driver = {
    id,
    org_id: input.orgId,
    name: input.name,
    license: input.license,
    phone: input.phone,
    created_at: new Date().toISOString(),
  };

  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    store.drivers.push(row);
    await writeFileStore(store);
    return row;
  }

  const { data, error } = await getSupabase()
    .from("drivers")
    .insert({
      id: row.id,
      org_id: row.org_id,
      name: row.name,
      license: row.license,
      phone: row.phone,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Driver;
}
