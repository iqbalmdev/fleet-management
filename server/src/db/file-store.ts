import { promises as fs } from "fs";
import path from "path";
import type { Bus, Driver, Organization, User } from "../types";

export type FileStore = {
  organizations: Organization[];
  users: User[];
  drivers: Driver[];
  buses: Bus[];
};

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

const empty = (): FileStore => ({
  organizations: [],
  users: [],
  drivers: [],
  buses: [],
});

export async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return { ...empty(), ...(JSON.parse(raw) as FileStore) };
  } catch {
    return empty();
  }
}

export async function writeFileStore(store: FileStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}
