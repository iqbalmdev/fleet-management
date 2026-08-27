"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/auth";
import {
  nextOrgId,
  readStore,
  writeStore,
  type OrgType,
} from "@/lib/store";

export async function createOrganizationAction(formData: FormData) {
  const owner = await getOwnerSession();
  if (!owner) redirect("/owner");

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "school") as OrgType;
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim();
  const ownerPassword = String(formData.get("ownerPassword") ?? "").trim();

  if (!name || !ownerName || !ownerEmail || !ownerPassword) {
    redirect("/owner/orgs?error=missing");
  }

  const store = await readStore();
  const id = nextOrgId(store.organizations);
  store.organizations.push({
    id,
    name,
    type: ["school", "college", "other"].includes(type) ? type : "school",
    ownerName,
    ownerEmail,
    ownerPassword,
    createdAt: new Date().toISOString(),
  });
  await writeStore(store);
  revalidatePath("/owner/orgs");
  redirect(`/owner/orgs?created=${id}`);
}
