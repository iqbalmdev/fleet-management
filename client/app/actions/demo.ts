"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  DEMO_COOKIE,
  defaultDemoState,
  parseDemoState,
  type DemoState,
} from "@/lib/demo-flow";

async function writeState(next: DemoState) {
  const store = await cookies();
  store.set(DEMO_COOKIE, JSON.stringify(next), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });
}

export async function readDemoState(): Promise<DemoState> {
  const store = await cookies();
  return parseDemoState(store.get(DEMO_COOKIE)?.value);
}

export async function patchDemoState(patch: Partial<DemoState>) {
  const current = await readDemoState();
  await writeState({ ...current, ...patch });
}

export async function startPreTrip() {
  await writeState({ ...defaultDemoState });
  redirect("/demo/inspect");
}

export async function passBus01() {
  await patchDemoState({ bus07Failed: false });
  redirect("/demo/dispatch");
}

export async function failBus07() {
  await patchDemoState({ bus07Failed: true, holdCleared: false });
  redirect("/demo/hold");
}

export async function openWorkOrder() {
  redirect("/demo/workshop");
}

export async function releaseRoutes() {
  await patchDemoState({ dispatched: true });
  redirect("/demo/board");
}

export async function continueFromBoard() {
  const state = await readDemoState();
  if (state.bus07Failed && !state.holdCleared) {
    redirect("/demo/workshop");
  }
  redirect("/demo/reconcile");
}

export async function clearHold() {
  await patchDemoState({ holdCleared: true });
  redirect("/demo/reconcile");
}

export async function goReconcile() {
  redirect("/demo/reconcile");
}

export async function approveFuel() {
  await patchDemoState({ fuelApproved: true });
  revalidatePath("/demo/reconcile");
}

export async function closeDay() {
  redirect("/demo/close");
}

export async function restartDemo() {
  await writeState({ ...defaultDemoState });
  redirect("/demo");
}
