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
  dateOfBirth?: string | null;
  licenceType?: string;
  licenceExpiry?: string;
  experienceYears?: number;
  address?: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  status?: "pending" | "approved" | "active";
};

export type ProtoVehicle = {
  id: string;
  orgId: string;
  code: string;
  plate: string;
  capacity: number;
  vehicleType?: string;
  make?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  chassisNumber?: string;
  engineNumber?: string;
  registrationDate?: string | null;
  odometer?: number | null;
  insuranceExpiry?: string | null;
  fitnessExpiry?: string | null;
  permitExpiry?: string | null;
  status?: "pending" | "available" | "on_trip" | "maintenance";
  /** Set when a maintenance case completes (or from schedules). */
  lastServiceDate?: string | null;
  lastServiceOdometer?: number | null;
  nextServiceDate?: string | null;
  nextServiceOdometer?: number | null;
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
    vehicles: sampleVehicles.map((vehicle, index) => {
      const odometerByCode: Record<string, number> = {
        "BUS-01": 48250,
        "BUS-07": 39100,
        "VAN-04": 49500,
        "BUS-12": 52080,
      };
      const statusByCode: Record<
        string,
        NonNullable<ProtoVehicle["status"]>
      > = {
        "BUS-01": "on_trip",
        "BUS-07": "available",
        "VAN-04": "available",
        "BUS-12": "maintenance",
      };
      return {
        id: `BUS-${String(index + 1).padStart(3, "0")}`,
        orgId: demoLogins.admin.orgId,
        code: vehicle.code,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        odometer: odometerByCode[vehicle.code] ?? null,
        status: statusByCode[vehicle.code] ?? "available",
        lastServiceDate: vehicle.code === "VAN-04" ? "2026-03-15" : null,
        lastServiceOdometer: vehicle.code === "VAN-04" ? 40000 : null,
        nextServiceDate: vehicle.code === "VAN-04" ? "2026-09-15" : null,
        nextServiceOdometer: vehicle.code === "VAN-04" ? 50000 : null,
      };
    }),
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

export function getVehicle(orgId: string, vehicleId: string): ProtoVehicle | undefined {
  return readStore().vehicles.find(
    (item) => item.orgId === orgId && item.id === vehicleId,
  );
}

export function getDriver(orgId: string, driverId: string): ProtoDriver | undefined {
  return readStore().drivers.find(
    (item) => item.orgId === orgId && item.id === driverId,
  );
}

export function updateVehicle(
  orgId: string,
  vehicleId: string,
  patch: Partial<
    Omit<ProtoVehicle, "id" | "orgId">
  >,
): ProtoVehicle {
  const store = readStore();
  const index = store.vehicles.findIndex(
    (item) => item.orgId === orgId && item.id === vehicleId,
  );
  if (index < 0) {
    throw new ProtoError("Vehicle not found", "VEHICLE_NOT_FOUND");
  }
  const current = store.vehicles[index];
  if (
    patch.odometer != null &&
    current.odometer != null &&
    patch.odometer < current.odometer
  ) {
    throw new ProtoError(
      "Odometer cannot be less than the current vehicle reading.",
      "ODOMETER_REGRESSION",
    );
  }
  const updated: ProtoVehicle = { ...current, ...patch };
  store.vehicles[index] = updated;
  writeStore(store);
  return updated;
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
    dateOfBirth?: string | null;
    licenceType?: string;
    licenceExpiry?: string;
    experienceYears?: number;
    address?: string;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
  },
) {
  const store = readStore();
  const email = input.email.toLowerCase().trim();
  const license = input.license.toUpperCase().trim();
  const phone = input.phone.startsWith("+") ? input.phone : `+91${input.phone.replace(/\D/g, "")}`;

  if (store.users.some((user) => user.email.toLowerCase() === email)) {
    throw new ProtoError("An account with this email already exists", "EMAIL_EXISTS");
  }
  if (
    store.drivers.some(
      (driver) => driver.orgId === orgId && driver.license.toUpperCase() === license,
    )
  ) {
    throw new ProtoError("A driver with this licence number already exists", "LICENSE_EXISTS");
  }
  if (store.drivers.some((driver) => driver.orgId === orgId && driver.phone === phone)) {
    throw new ProtoError("A driver with this mobile number already exists", "PHONE_EXISTS");
  }

  const driverId = `DRV-${String(store.nextDriver).padStart(3, "0")}`;
  store.nextDriver += 1;
  store.drivers.push({
    id: driverId,
    orgId,
    name: input.name.trim(),
    license,
    phone,
    email,
    dateOfBirth: input.dateOfBirth ?? null,
    licenceType: input.licenceType,
    licenceExpiry: input.licenceExpiry,
    experienceYears: input.experienceYears,
    address: input.address,
    emergencyContactName: input.emergencyContactName ?? null,
    emergencyContactPhone: input.emergencyContactPhone ?? null,
    status: "approved",
  });

  const userId = `USR-${String(store.nextUser).padStart(4, "0")}`;
  store.nextUser += 1;
  store.users.push({
    id: userId,
    orgId,
    orgName,
    fullName: input.name.trim(),
    email,
    password: input.password,
    designation: "driver",
    role: "driver",
    mobile: phone,
  });

  writeStore(store);
  return { driverId, email };
}

export function createVehicle(
  orgId: string,
  input: {
    code: string;
    plate: string;
    capacity: number;
    vehicleType?: string;
    make?: string;
    model?: string;
    year?: number;
    fuelType?: string;
    chassisNumber?: string;
    engineNumber?: string;
    registrationDate?: string | null;
    odometer?: number | null;
    insuranceExpiry?: string | null;
    fitnessExpiry?: string | null;
    permitExpiry?: string | null;
  },
) {
  const store = readStore();
  const plate = input.plate.toUpperCase().trim();
  const chassis = input.chassisNumber?.toUpperCase().trim();
  const engine = input.engineNumber?.toUpperCase().trim();

  if (store.vehicles.some((vehicle) => vehicle.orgId === orgId && vehicle.plate.toUpperCase() === plate)) {
    throw new ProtoError("A vehicle with this plate number already exists", "PLATE_EXISTS");
  }
  if (
    chassis &&
    store.vehicles.some(
      (vehicle) => vehicle.orgId === orgId && vehicle.chassisNumber?.toUpperCase() === chassis,
    )
  ) {
    throw new ProtoError("A vehicle with this chassis number already exists", "CHASSIS_EXISTS");
  }
  if (
    engine &&
    store.vehicles.some(
      (vehicle) => vehicle.orgId === orgId && vehicle.engineNumber?.toUpperCase() === engine,
    )
  ) {
    throw new ProtoError("A vehicle with this engine number already exists", "ENGINE_EXISTS");
  }

  const id = `BUS-${String(store.nextVehicle).padStart(3, "0")}`;
  store.nextVehicle += 1;
  const vehicle: ProtoVehicle = {
    id,
    orgId,
    code: input.code || plate.replace(/-/g, "").slice(0, 12),
    plate,
    capacity: input.capacity,
    vehicleType: input.vehicleType,
    make: input.make,
    model: input.model,
    year: input.year,
    fuelType: input.fuelType,
    chassisNumber: chassis,
    engineNumber: engine,
    registrationDate: input.registrationDate ?? null,
    odometer: input.odometer ?? null,
    insuranceExpiry: input.insuranceExpiry ?? null,
    fitnessExpiry: input.fitnessExpiry ?? null,
    permitExpiry: input.permitExpiry ?? null,
    status: "available",
  };
  store.vehicles.push(vehicle);
  writeStore(store);
  return vehicle;
}
