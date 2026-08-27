export const DEMO_COOKIE = "fleet_demo";

export type DemoState = {
  bus07Failed: boolean;
  holdCleared: boolean;
  dispatched: boolean;
  fuelApproved: boolean;
};

export const defaultDemoState: DemoState = {
  bus07Failed: false,
  holdCleared: false,
  dispatched: false,
  fuelApproved: false,
};

export const demoSteps = [
  { id: "inspect", label: "Inspect", href: "/demo/inspect" },
  { id: "dispatch", label: "Dispatch", href: "/demo/dispatch" },
  { id: "workshop", label: "Workshop", href: "/demo/workshop" },
  { id: "reconcile", label: "Reconcile", href: "/demo/reconcile" },
  { id: "close", label: "Close", href: "/demo/close" },
] as const;

export type DemoPath =
  | "/demo"
  | "/demo/inspect"
  | "/demo/hold"
  | "/demo/dispatch"
  | "/demo/board"
  | "/demo/workshop"
  | "/demo/reconcile"
  | "/demo/close";

export function stepperIdForPath(path: string) {
  if (path.startsWith("/demo/inspect") || path.startsWith("/demo/hold")) return "inspect";
  if (path.startsWith("/demo/dispatch") || path.startsWith("/demo/board")) return "dispatch";
  if (path.startsWith("/demo/workshop")) return "workshop";
  if (path.startsWith("/demo/reconcile")) return "reconcile";
  if (path.startsWith("/demo/close")) return "close";
  return null;
}

export function roleForPath(path: string) {
  if (path.startsWith("/demo/inspect")) return "Driver";
  if (path.startsWith("/demo/dispatch") || path.startsWith("/demo/board")) return "Dispatcher";
  if (path.startsWith("/demo/reconcile")) return "Finance";
  return "Admin";
}

export function parseDemoState(raw: string | undefined): DemoState {
  if (!raw) return { ...defaultDemoState };
  try {
    return { ...defaultDemoState, ...(JSON.parse(raw) as DemoState) };
  } catch {
    return { ...defaultDemoState };
  }
}
