import { demoLogins, sampleDrivers, sampleVehicles } from "@/lib/sample-data";

export type ProtoUser = {
  id: string;
  orgId: string;
  orgName: string;
  fullName: string;
  email: string;
  password: string;
  designation: string;
  role: "admin" | "driver";
  mobile: string;
};

export type ProtoDriver = {
  id: string;
  orgId: string;
  name: string;
  license: string;
  phone: string;
  email?: string;
};

export type ProtoVehicle = {
  id: string;
  orgId: string;
  code: string;
  plate: string;
  capacity: number;
};

export type ProtoOrg = {
  id: string;
  name: string;
  type: string;
};

type ProtoStore = {
  organizations: ProtoOrg[];
  users: ProtoUser[];
  drivers: ProtoDriver[];
  vehicles: ProtoVehicle[];
  nextOrg: number;
  nextUser: number;
  nextDriver: number;
  nextVehicle: number;
};

const STORE_KEY = "fleetcare_prototype_store_v1";

function seedStore(): ProtoStore {
  return {
    organizations: [
      {
        id: demoLogins.admin.orgId,
        name: "FleetCare Demo School",
        type: "school",
      },
    ],
    users: [
      {
        id: "USR-0001",
        orgId: demoLogins.admin.orgId,
        orgName: "FleetCare Demo School",
        fullName: demoLogins.admin.name,
        email: demoLogins.admin.email,
        password: demoLogins.admin.password,
        designation: "transport_admin",
        role: "admin",
        mobile: "+919876543210",
      },
      {
        id: "USR-0002",
        orgId: demoLogins.driver.orgId,
        orgName: "FleetCare Demo School",
        fullName: demoLogins.driver.name,
        email: demoLogins.driver.email,
        password: demoLogins.driver.password,
        designation: "driver",
        role: "driver",
        mobile: "+919876500001",
      },
    ],
    drivers: sampleDrivers.map((driver, index) => ({
      id: `DRV-${String(index + 1).padStart(3, "0")}`,
      orgId: demoLogins.admin.orgId,
      name: driver.name,
      license: driver.license,
      phone: driver.phone,
      email: index === 0 ? demoLogins.driver.email : undefined,
    })),
    vehicles: sampleVehicles.map((vehicle, index) => ({
      id: `BUS-${String(index + 1).padStart(3, "0")}`,
      orgId: demoLogins.admin.orgId,
      code: vehicle.code,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
    })),
    nextOrg: 1002,
    nextUser: 3,
    nextDriver: sampleDrivers.length + 1,
    nextVehicle: sampleVehicles.length + 1,
  };
}

function readStore(): ProtoStore {
  if (typeof window === "undefined") return seedStore();
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) {
    const seeded = seedStore();
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as ProtoStore;
  } catch {
    const seeded = seedStore();
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeStore(store: ProtoStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function ensurePrototypeSeeded() {
  readStore();
}

export function resetPrototypeStore() {
  const seeded = seedStore();
  writeStore(seeded);
  return seeded;
}

export class ProtoError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

export function signUpAdmin(input: {
  adminName: string;
  organizationName: string;
  organizationType: string;
  mobile: string;
  email: string;
  designation: string;
  password: string;
}) {
  const store = readStore();
  if (store.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ProtoError("An account with this email already exists");
  }

  const orgId = `ORG-${store.nextOrg}`;
  store.nextOrg += 1;
  store.organizations.push({
    id: orgId,
    name: input.organizationName,
    type: input.organizationType,
  });

  const userId = `USR-${String(store.nextUser).padStart(4, "0")}`;
  store.nextUser += 1;
  const user: ProtoUser = {
    id: userId,
    orgId,
    orgName: input.organizationName,
    fullName: input.adminName,
    email: input.email.toLowerCase(),
    password: input.password,
    designation: input.designation,
    role: "admin",
    mobile: input.mobile.startsWith("+") ? input.mobile : `+91${input.mobile}`,
  };
  store.users.push(user);
  writeStore(store);
  return user;
}

export function signIn(input: {
  identifier: string;
  password: string;
  expectedRole?: "admin" | "driver";
}) {
  const store = readStore();
  const trimmed = input.identifier.trim();
  let user: ProtoUser | undefined;

  if (trimmed.includes("@")) {
    user = store.users.find((item) => item.email.toLowerCase() === trimmed.toLowerCase());
  } else {
    const orgId = trimmed.toUpperCase();
    user = store.users.find((item) => item.orgId === orgId && item.role === "admin");
    if (!user) {
      user = store.users.find((item) => item.id.toUpperCase() === orgId);
    }
  }

  if (!user || user.password !== input.password) {
    throw new ProtoError("Invalid Organization ID / Email or password");
  }

  if (input.expectedRole && user.role !== input.expectedRole) {
    throw new ProtoError(
      input.expectedRole === "driver"
        ? "This account is not a driver. Use Admin sign in."
        : "This account is not an admin. Use Driver sign in.",
      "ROLE_MISMATCH",
    );
  }

  return user;
}

export function listDrivers(orgId: string) {
  return readStore().drivers.filter((item) => item.orgId === orgId);
}

export function listVehicles(orgId: string) {
  return readStore().vehicles.filter((item) => item.orgId === orgId);
}

export function createDriverAccount(
  orgId: string,
  orgName: string,
  input: {
    name: string;
    email: string;
    phone: string;
    license: string;
    password: string;
  },
) {
  const store = readStore();
  if (store.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ProtoError("An account with this email already exists");
  }

  const driverId = `DRV-${String(store.nextDriver).padStart(3, "0")}`;
  store.nextDriver += 1;
  const phone = input.phone.startsWith("+") ? input.phone : `+91${input.phone}`;
  store.drivers.push({
    id: driverId,
    orgId,
    name: input.name,
    license: input.license,
    phone,
    email: input.email.toLowerCase(),
  });

  const userId = `USR-${String(store.nextUser).padStart(4, "0")}`;
  store.nextUser += 1;
  store.users.push({
    id: userId,
    orgId,
    orgName,
    fullName: input.name,
    email: input.email.toLowerCase(),
    password: input.password,
    designation: "driver",
    role: "driver",
    mobile: phone,
  });

  writeStore(store);
  return { driverId, email: input.email.toLowerCase() };
}

export function createVehicle(
  orgId: string,
  input: { code: string; plate: string; capacity: number },
) {
  const store = readStore();
  const id = `BUS-${String(store.nextVehicle).padStart(3, "0")}`;
  store.nextVehicle += 1;
  const vehicle: ProtoVehicle = {
    id,
    orgId,
    code: input.code,
    plate: input.plate,
    capacity: input.capacity,
  };
  store.vehicles.push(vehicle);
  writeStore(store);
  return vehicle;
}
