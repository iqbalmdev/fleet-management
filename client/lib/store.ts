import { promises as fs } from "fs";
import path from "path";

export type OrgType = "school" | "college" | "other";

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  createdAt: string;
};

export type Bus = {
  id: string;
  orgId: string;
  code: string;
  plate: string;
  capacity: number;
};

export type Driver = {
  id: string;
  orgId: string;
  name: string;
  license: string;
  phone: string;
};

export type Assignment = {
  id: string;
  orgId: string;
  busId: string;
  driverId: string;
};

export type Store = {
  organizations: Organization[];
  buses: Bus[];
  drivers: Driver[];
  assignments: Assignment[];
};

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

const emptyStore = (): Store => ({
  organizations: [],
  buses: [],
  drivers: [],
  assignments: [],
});

export async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return { ...emptyStore(), ...(JSON.parse(raw) as Store) };
  } catch {
    return emptyStore();
  }
}

export async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

export function nextOrgId(existing: Organization[]) {
  const n = existing.length + 1;
  return `ORG-${String(1000 + n)}`;
}

export function nextEntityId(prefix: string, count: number) {
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}
