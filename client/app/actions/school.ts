"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSchoolSession } from "@/lib/auth";
import { nextEntityId, readStore, writeStore } from "@/lib/store";

async function requireOrg() {
  const session = await getSchoolSession();
  if (!session?.orgId) redirect("/login");
  return session.orgId;
}

export async function createBusAction(formData: FormData) {
  const orgId = await requireOrg();
  const code = String(formData.get("code") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 0);
  if (!code || !plate) redirect("/school/buses?error=missing");

  const store = await readStore();
  store.buses.push({
    id: nextEntityId("BUS", store.buses.filter((item) => item.orgId === orgId).length),
    orgId,
    code,
    plate,
    capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 40,
  });
  await writeStore(store);
  revalidatePath("/school/buses");
  revalidatePath("/school");
  redirect("/school/buses");
}

export async function createDriverAction(formData: FormData) {
  const orgId = await requireOrg();
  const name = String(formData.get("name") ?? "").trim();
  const license = String(formData.get("license") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name || !license) redirect("/school/drivers?error=missing");

  const store = await readStore();
  store.drivers.push({
    id: nextEntityId("DRV", store.drivers.filter((item) => item.orgId === orgId).length),
    orgId,
    name,
    license,
    phone,
  });
  await writeStore(store);
  revalidatePath("/school/drivers");
  revalidatePath("/school");
  redirect("/school/drivers");
}

export async function assignBusAction(formData: FormData) {
  const orgId = await requireOrg();
  const busId = String(formData.get("busId") ?? "");
  const driverId = String(formData.get("driverId") ?? "");
  if (!busId || !driverId) redirect("/school/assign?error=missing");

  const store = await readStore();
  store.assignments = store.assignments.filter(
    (item) => !(item.orgId === orgId && item.busId === busId),
  );
  store.assignments.push({
    id: nextEntityId("ASN", store.assignments.filter((item) => item.orgId === orgId).length),
    orgId,
    busId,
    driverId,
  });
  await writeStore(store);
  revalidatePath("/school/assign");
  revalidatePath("/school");
  redirect("/school/assign");
}
