import { env } from "../config/env";
import { readFileStore, writeFileStore } from "../db/file-store";
import { getSupabase } from "../db/supabase";
import type { Bus } from "../types";
import { nextBusId } from "../utils/ids";

export async function listBusesByOrg(orgId: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    return store.buses.filter((item) => item.org_id === orgId);
  }

  const { data, error } = await getSupabase()
    .from("buses")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Bus[];
}

export async function createBus(input: {
  orgId: string;
  code: string;
  plate: string;
  capacity: number;
}) {
  const id = await nextBusId();
  const row: Bus = {
    id,
    org_id: input.orgId,
    code: input.code,
    plate: input.plate,
    capacity: input.capacity,
    created_at: new Date().toISOString(),
  };

  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    store.buses.push(row);
    await writeFileStore(store);
    return row;
  }

  const { data, error } = await getSupabase()
    .from("buses")
    .insert({
      id: row.id,
      org_id: row.org_id,
      code: row.code,
      plate: row.plate,
      capacity: row.capacity,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Bus;
}
