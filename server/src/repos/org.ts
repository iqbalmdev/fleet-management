import { env } from "../config/env";
import { readFileStore, writeFileStore } from "../db/file-store";
import { getSupabase } from "../db/supabase";
import type { Organization, OrgType } from "../types";
import { nextOrgId } from "../utils/ids";

export async function createOrganization(input: { name: string; type: OrgType }) {
  const id = await nextOrgId();

  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    const org: Organization = {
      id,
      name: input.name,
      type: input.type,
      created_at: new Date().toISOString(),
    };
    store.organizations.push(org);
    await writeFileStore(store);
    return org;
  }

  const { data, error } = await getSupabase()
    .from("organizations")
    .insert({ id, name: input.name, type: input.type })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Organization;
}

export async function findOrganizationById(id: string) {
  if (env.DATA_BACKEND === "file") {
    const store = await readFileStore();
    return store.organizations.find((item) => item.id === id) ?? null;
  }

  const { data, error } = await getSupabase()
    .from("organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Organization | null;
}
