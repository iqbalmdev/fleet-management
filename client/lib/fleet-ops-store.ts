import {
  sampleBills,
  sampleDocuments,
  sampleMaintenance,
  sampleTrips,
} from "@/lib/sample-data";
import { demoLogins } from "@/lib/sample-data";
import {
  ensurePrototypeSeeded,
  getVehicle,
  listDrivers,
  listVehicles,
} from "@/lib/prototype-store";
import {
  MAINTENANCE_STATUS_LABELS,
  formatMoneyMinor,
} from "@/lib/maintenance";
import {
  ensureMaintenanceSeeded,
  getMaintenanceKpis,
  listMaintenanceRequests,
} from "@/lib/maintenance-store";

export type OpsMaintenance = {
  id: string;
  orgId: string;
  vehicle: string;
  issue: string;
  workshop: string;
  due: string;
  priority: "Critical" | "Pending" | "In progress" | "Closed";
  /** Link into maintenance details when from real store */
  requestId?: string;
  statusLabel?: string;
};

export type OpsBill = {
  id: string;
  orgId: string;
  bill: string;
  vendor: string;
  vehicle: string;
  amount: string;
  status: "Pending" | "Approved" | "Rejected";
};

export type OpsTrip = {
  id: string;
  orgId: string;
  trip: string;
  route: string;
  vehicle: string;
  driver: string;
  eta: string;
  status: "Live" | "Delayed" | "Completed" | "Cancelled" | "Scheduled";
};

export type OpsDocument = {
  id: string;
  orgId: string;
  document: string;
  owner: string;
  category: string;
  expiry: string;
  status: "Valid" | "Expiring" | "Expired" | "Missing scan";
};

type FleetOpsStore = {
  maintenance: OpsMaintenance[];
  bills: OpsBill[];
  trips: OpsTrip[];
  documents: OpsDocument[];
};

const OPS_KEY = "fleetcare_fleet_ops_v1";

function seedOps(orgId: string): FleetOpsStore {
  return {
    maintenance: sampleMaintenance.map((item, index) => ({
      id: `mnt-${index + 1}`,
      orgId,
      vehicle: item.vehicle,
      issue: item.issue,
      workshop: item.workshop,
      due: item.due,
      priority: item.priority,
    })),
    bills: sampleBills.map((item, index) => ({
      id: `bill-${index + 1}`,
      orgId,
      bill: item.bill,
      vendor: item.vendor,
      vehicle: item.vehicle,
      amount: item.amount,
      status: item.status,
    })),
    trips: sampleTrips.map((item, index) => ({
      id: `trip-${index + 1}`,
      orgId,
      trip: item.trip,
      route: item.route,
      vehicle: item.vehicle,
      driver: item.driver,
      eta: item.eta,
      status: item.status,
    })),
    documents: sampleDocuments.map((item, index) => ({
      id: `doc-${index + 1}`,
      orgId,
      document: item.document,
      owner: item.owner,
      category: item.category,
      expiry: item.expiry,
      status: item.status,
    })),
  };
}

function readOps(): FleetOpsStore {
  if (typeof window === "undefined") {
    return seedOps(demoLogins.admin.orgId);
  }
  const raw = localStorage.getItem(OPS_KEY);
  if (!raw) {
    const seeded = seedOps(demoLogins.admin.orgId);
    localStorage.setItem(OPS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as FleetOpsStore;
  } catch {
    const seeded = seedOps(demoLogins.admin.orgId);
    localStorage.setItem(OPS_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeOps(store: FleetOpsStore) {
  localStorage.setItem(OPS_KEY, JSON.stringify(store));
}

export function ensureFleetOpsSeeded() {
  readOps();
}

export function getOpsForOrg(orgId: string) {
  const store = readOps();
  return {
    maintenance: store.maintenance.filter((item) => item.orgId === orgId),
    bills: store.bills.filter((item) => item.orgId === orgId),
    trips: store.trips.filter((item) => item.orgId === orgId),
    documents: store.documents.filter((item) => item.orgId === orgId),
  };
}

export type DashboardSnapshot = {
  drivers: number;
  vehicles: number;
  openMaintenance: number;
  pendingBills: number;
  activeTrips: number;
  docExpiry: number;
  breakdowns: number;
  dueSoon: number;
  overdueServices: number;
  maintenanceCostThisMonth: string;
  vehiclesUnderMaintenance: number;
  vehicleStatus: {
    available: number;
    onTrip: number;
    serviceDue: number;
    maintenance: number;
  };
  maintenancePreview: OpsMaintenance[];
  billsPreview: OpsBill[];
  tripsPreview: OpsTrip[];
  documentsPreview: OpsDocument[];
  breakdownsPreview: OpsMaintenance[];
};

function mapPriorityForPreview(
  status: string,
  priority: string,
): OpsMaintenance["priority"] {
  if (status === "completed" || status === "cancelled" || status === "rejected") {
    return "Closed";
  }
  if (priority === "critical") return "Critical";
  if (status === "in_service" || status === "waiting_for_parts") return "In progress";
  return "Pending";
}

export function getDashboardSnapshot(orgId: string): DashboardSnapshot {
  ensurePrototypeSeeded();
  ensureFleetOpsSeeded();
  ensureMaintenanceSeeded();

  const drivers = listDrivers(orgId);
  const vehicles = listVehicles(orgId);
  const ops = getOpsForOrg(orgId);
  const kpis = getMaintenanceKpis(orgId);
  const requests = listMaintenanceRequests(orgId);

  const openRequests = requests.filter(
    (r) => !["completed", "cancelled", "rejected"].includes(r.status),
  );
  const breakdownRequests = requests.filter(
    (r) =>
      (r.breakdown || r.priority === "critical") &&
      !["completed", "cancelled", "rejected"].includes(r.status),
  );

  const maintenancePreview: OpsMaintenance[] = openRequests.slice(0, 4).map((r) => {
    const vehicle = getVehicle(orgId, r.vehicleId);
    return {
      id: r.id,
      orgId: r.orgId,
      vehicle: vehicle?.plate ?? r.vehicleId,
      issue: r.title,
      workshop: r.requestNumber,
      due: r.preferredServiceDate ?? r.reportedDate,
      priority: mapPriorityForPreview(r.status, r.priority),
      requestId: r.id,
      statusLabel: MAINTENANCE_STATUS_LABELS[r.status],
    };
  });

  const breakdownsPreview: OpsMaintenance[] = breakdownRequests.slice(0, 4).map((r) => {
    const vehicle = getVehicle(orgId, r.vehicleId);
    return {
      id: r.id,
      orgId: r.orgId,
      vehicle: vehicle?.plate ?? r.vehicleId,
      issue: r.title,
      workshop: r.requestNumber,
      due: r.preferredServiceDate ?? r.reportedDate,
      priority: "Critical" as const,
      requestId: r.id,
      statusLabel: MAINTENANCE_STATUS_LABELS[r.status],
    };
  });

  const pendingBills = ops.bills.filter((b) => b.status === "Pending").length;
  const activeTrips = ops.trips.filter(
    (t) => t.status === "Live" || t.status === "Delayed",
  ).length;
  const docExpiry = ops.documents.filter(
    (d) => d.status === "Expiring" || d.status === "Expired",
  ).length;

  // Prefer live maintenance counts for vehicle status buckets
  const vehicleStatus = {
    available: vehicles.filter((v) => (v.status ?? "available") === "available").length,
    onTrip: vehicles.filter((v) => v.status === "on_trip").length,
    serviceDue: kpis.dueSoon + kpis.overdueServices,
    maintenance: kpis.vehiclesInService,
  };

  return {
    drivers: drivers.length,
    vehicles: vehicles.length,
    openMaintenance: kpis.openRequests,
    pendingBills,
    activeTrips,
    docExpiry,
    breakdowns: breakdownRequests.length,
    dueSoon: kpis.dueSoon,
    overdueServices: kpis.overdueServices,
    maintenanceCostThisMonth: formatMoneyMinor(kpis.maintenanceCostThisMonthMinor),
    vehiclesUnderMaintenance: kpis.vehiclesInService,
    vehicleStatus,
    maintenancePreview,
    billsPreview: ops.bills.filter((b) => b.status === "Pending").slice(0, 4),
    tripsPreview: ops.trips
      .filter((t) => t.status === "Live" || t.status === "Delayed")
      .slice(0, 4),
    documentsPreview: ops.documents
      .filter((d) => d.status === "Expiring" || d.status === "Expired")
      .slice(0, 4),
    breakdownsPreview,
  };
}

/** For later phases: persist maintenance/bill/trip updates */
export function readFleetOpsStore(): FleetOpsStore {
  return readOps();
}

export function writeFleetOpsStore(store: FleetOpsStore) {
  writeOps(store);
}

/** Create a pending bill sanction from a completed/verified work order. */
export function createOpsBillFromMaintenance(input: {
  orgId: string;
  workOrderId: string;
  workOrderNumber: string;
  vendorName: string;
  vehicleLabel: string;
  amountMinor: number;
}): OpsBill {
  ensureFleetOpsSeeded();
  const store = readOps();
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(input.amountMinor / 100);

  const bill: OpsBill = {
    id: `bill-wo-${input.workOrderId}`,
    orgId: input.orgId,
    bill: `Maintenance ${input.workOrderNumber}`,
    vendor: input.vendorName,
    vehicle: input.vehicleLabel,
    amount,
    status: "Pending",
  };

  const existing = store.bills.findIndex((b) => b.id === bill.id);
  if (existing >= 0) {
    store.bills[existing] = { ...store.bills[existing], ...bill, status: store.bills[existing].status };
  } else {
    store.bills.unshift(bill);
  }
  writeOps(store);
  syncModuleBillRecord(bill);
  return bill;
}

export function approveOpsBill(orgId: string, billId: string): OpsBill | null {
  ensureFleetOpsSeeded();
  const store = readOps();
  const bill = store.bills.find((b) => b.orgId === orgId && b.id === billId);
  if (!bill) return null;
  bill.status = "Approved";
  writeOps(store);
  syncModuleBillRecord(bill);
  return bill;
}

/** Keep Bill Sanction ModuleWorkspace list in sync. */
function syncModuleBillRecord(bill: OpsBill) {
  if (typeof window === "undefined") return;
  const key = "fleet_module_bills_v1";
  const record = {
    id: bill.id,
    bill: bill.bill,
    vendor: bill.vendor,
    vehicle: bill.vehicle,
    amount: bill.amount,
    status: bill.status,
  };
  try {
    const raw = localStorage.getItem(key);
    const rows = raw ? (JSON.parse(raw) as Array<Record<string, string>>) : [];
    const list = Array.isArray(rows) ? rows : [];
    const idx = list.findIndex((r) => r.id === bill.id);
    if (idx >= 0) list[idx] = record;
    else list.unshift(record);
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    localStorage.setItem(key, JSON.stringify([record]));
  }
}
