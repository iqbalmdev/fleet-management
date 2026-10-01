/**
 * Frontend maintenance domain store (localStorage).
 * Service-layer rules live here so UI cannot invent totals or illegal transitions.
 */

import {
  calculateMaintenanceTotalMinor,
  calculatePartTotalMinor,
  computeNextServiceTargets,
  computeScheduleDueStatus,
  todayIsoDate,
  type ExpenseType,
  type FileRef,
  type MaintenanceActor,
  type MaintenanceActivity,
  type MaintenanceApproval,
  type MaintenanceAttachment,
  type MaintenanceExpense,
  type MaintenanceInvoice,
  type MaintenanceKpis,
  type MaintenanceRequest,
  type MaintenanceRequestBundle,
  type MaintenanceSchedule,
  type MaintenanceStatus,
  type TaskStatus,
  type Vendor,
  type WorkOrder,
  type WorkOrderPart,
  type WorkOrderTask,
  OPEN_MAINTENANCE_STATUSES,
  assertTransition,
} from "@/lib/maintenance";
import { demoLogins } from "@/lib/sample-data";
import {
  ensurePrototypeSeeded,
  getVehicle,
  listVehicles,
  updateVehicle,
  type ProtoVehicle,
} from "@/lib/prototype-store";
import {
  approveOpsBill,
  createOpsBillFromMaintenance,
} from "@/lib/fleet-ops-store";
import { pushOpsNotification } from "@/lib/ops-notifications";
import type {
  ValidatedInvoice,
  ValidatedMaintenanceRequest,
  ValidatedPart,
  ValidatedSchedule,
  ValidatedVendor,
} from "@/lib/validation/maintenance";

const STORE_KEY = "fleetcare_maintenance_v1";

type SeqMaps = {
  requestByYear: Record<string, number>;
  workOrderByYear: Record<string, number>;
};

type MaintenanceStoreData = {
  requests: MaintenanceRequest[];
  workOrders: WorkOrder[];
  tasks: WorkOrderTask[];
  parts: WorkOrderPart[];
  expenses: MaintenanceExpense[];
  invoices: MaintenanceInvoice[];
  approvals: MaintenanceApproval[];
  activities: MaintenanceActivity[];
  attachments: MaintenanceAttachment[];
  vendors: Vendor[];
  schedules: MaintenanceSchedule[];
  seq: SeqMaps;
  nextEntity: number;
};

export class MaintenanceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function yearOf(date = new Date()): string {
  return String(date.getFullYear());
}

function nextId(store: MaintenanceStoreData, prefix: string): string {
  const id = `${prefix}-${String(store.nextEntity).padStart(5, "0")}`;
  store.nextEntity += 1;
  return id;
}

function nextHumanNumber(
  map: Record<string, number>,
  prefix: string,
  year = yearOf(),
): string {
  const current = map[year] ?? 0;
  const next = current + 1;
  map[year] = next;
  return `${prefix}-${year}-${String(next).padStart(5, "0")}`;
}

function emptyStore(): MaintenanceStoreData {
  return {
    requests: [],
    workOrders: [],
    tasks: [],
    parts: [],
    expenses: [],
    invoices: [],
    approvals: [],
    activities: [],
    attachments: [],
    vendors: [],
    schedules: [],
    seq: { requestByYear: {}, workOrderByYear: {} },
    nextEntity: 1,
  };
}

function seedStore(orgId: string): MaintenanceStoreData {
  const store = emptyStore();
  const adminId = "USR-0001";
  const driverId = "DRV-001";
  const now = nowIso();
  const today = todayIsoDate();

  const vendorWorkshop: Vendor = {
    id: nextId(store, "VND"),
    orgId,
    vendorName: "City Auto Care",
    vendorType: "workshop",
    contactPerson: "Ramesh Kumar",
    phone: "+919876512345",
    email: "service@cityautocare.demo",
    address: "12 Industrial Estate, Chennai",
    gstNumber: "33AAAAA0000A1Z5",
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: adminId,
    updatedBy: adminId,
  };
  const vendorBay: Vendor = {
    id: nextId(store, "VND"),
    orgId,
    vendorName: "Fleet Bay 2",
    vendorType: "authorized_service_center",
    contactPerson: "Priya N",
    phone: "+919876523456",
    email: "bay2@fleet.demo",
    address: "Depot Road, Chennai",
    gstNumber: null,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: adminId,
    updatedBy: adminId,
  };
  store.vendors.push(vendorWorkshop, vendorBay);

  // BUS-001 = BUS-01 brake job (in service)
  const brakeRequestId = nextId(store, "MRQ");
  const brakeWoId = nextId(store, "MWO");
  const brakeRequestNumber = nextHumanNumber(store.seq.requestByYear, "MR");
  const brakeWoNumber = nextHumanNumber(store.seq.workOrderByYear, "WO");

  const brakeRequest: MaintenanceRequest = {
    id: brakeRequestId,
    orgId,
    requestNumber: brakeRequestNumber,
    vehicleId: "BUS-001",
    driverId,
    reportedBy: "USR-0002",
    reportedByName: demoLogins.driver.name,
    reportedDate: today,
    source: "driver_report",
    maintenanceType: "brake_maintenance",
    category: "Safety",
    title: "Brake noise and pull to left",
    description:
      "Vehicle pulls left during braking. Unusual grinding noise from front-left wheel.",
    odometerReading: 48250,
    priority: "high",
    location: "Zone A depot",
    breakdown: false,
    vehicleOperationalStatus: "restricted",
    estimatedCostMinor: 1500000,
    preferredServiceDate: today,
    status: "in_service",
    workOrderId: brakeWoId,
    createdAt: now,
    updatedAt: now,
    createdBy: "USR-0002",
    updatedBy: adminId,
  };

  const brakeWo: WorkOrder = {
    id: brakeWoId,
    orgId,
    workOrderNumber: brakeWoNumber,
    maintenanceRequestId: brakeRequestId,
    vehicleId: "BUS-001",
    vendorId: vendorWorkshop.id,
    serviceCenter: "City Auto Care — Bay 3",
    assignedTechnician: "Senthil M",
    startDate: today,
    expectedCompletionDate: today,
    actualCompletionDate: null,
    checkInDate: today,
    odometerIn: 48250,
    odometerOut: null,
    fuelLevel: "Half",
    vehicleCondition: "Operational with restricted braking",
    existingDamageNotes: "Front-left disc scored",
    receivedBy: "Ramesh Kumar",
    instructions: "Inspect front brakes; replace pads/disc if required.",
    diagnosis:
      "Front-left brake pad worn and brake disc damaged. Right side pads near limit.",
    rootCause: "Worn friction material / delayed pad replacement",
    recommendedAction:
      "Replace front brake pads, replace damaged disc, brake fluid check, wheel alignment",
    technicianNotes: "Parts ordered from stock.",
    workPerformed: null,
    waitingForPart: null,
    waitingQuantity: null,
    waitingSupplier: null,
    waitingExpectedArrival: null,
    waitingNotes: null,
    waitingSince: null,
    estimatedLabourCostMinor: 120000,
    estimatedPartsCostMinor: 380000,
    estimatedOtherCostMinor: 0,
    estimatedTaxMinor: 0,
    estimatedDiscountMinor: 0,
    estimatedTotalCostMinor: 500000,
    actualLabourCostMinor: 0,
    actualPartsCostMinor: 0,
    actualOtherCostMinor: 0,
    actualTaxMinor: 0,
    actualDiscountMinor: 0,
    actualTotalCostMinor: 0,
    verificationResult: null,
    verificationNotes: null,
    verifiedBy: null,
    verifiedAt: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    createdBy: adminId,
    updatedBy: adminId,
  };

  store.requests.push(brakeRequest);
  store.workOrders.push(brakeWo);

  store.tasks.push(
    {
      id: nextId(store, "WOT"),
      orgId,
      workOrderId: brakeWoId,
      taskName: "Replace front brake pads",
      description: "Both sides",
      category: "Brakes",
      assignedTo: "Senthil M",
      status: "in_progress",
      estimatedHours: 1.5,
      actualHours: null,
      labourCostMinor: 60000,
      notes: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nextId(store, "WOT"),
      orgId,
      workOrderId: brakeWoId,
      taskName: "Replace damaged front-left disc",
      description: null,
      category: "Brakes",
      assignedTo: "Senthil M",
      status: "pending",
      estimatedHours: 1,
      actualHours: null,
      labourCostMinor: 40000,
      notes: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nextId(store, "WOT"),
      orgId,
      workOrderId: brakeWoId,
      taskName: "Brake fluid check & wheel alignment",
      description: null,
      category: "Brakes",
      assignedTo: "Senthil M",
      status: "pending",
      estimatedHours: 0.5,
      actualHours: null,
      labourCostMinor: 20000,
      notes: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  );

  store.parts.push({
    id: nextId(store, "WOP"),
    orgId,
    workOrderId: brakeWoId,
    partId: null,
    partName: "Front brake pad set",
    partNumber: "BP-FL-220",
    quantity: 1,
    unitPriceMinor: 220000,
    taxMinor: 0,
    discountMinor: 0,
    totalPriceMinor: 220000,
    supplierId: null,
    warranty: "6 months",
    warrantyExpiryDate: null,
    createdAt: now,
    updatedAt: now,
  });

  store.approvals.push({
    id: nextId(store, "MAP"),
    orgId,
    requestId: brakeRequestId,
    workOrderId: null,
    kind: "maintenance_approval",
    comments: "Safety-critical — approve workshop immediately.",
    reason: null,
    performedBy: adminId,
    performedByName: demoLogins.admin.name,
    performedAt: now,
  });

  store.activities.push(
    {
      id: nextId(store, "MAC"),
      orgId,
      requestId: brakeRequestId,
      workOrderId: null,
      action: "request_created",
      message: "Driver reported brake issue.",
      performedBy: "USR-0002",
      performedByName: demoLogins.driver.name,
      performedAt: now,
    },
    {
      id: nextId(store, "MAC"),
      orgId,
      requestId: brakeRequestId,
      workOrderId: null,
      action: "request_approved",
      message: "Maintenance approved by fleet admin.",
      performedBy: adminId,
      performedByName: demoLogins.admin.name,
      performedAt: now,
    },
    {
      id: nextId(store, "MAC"),
      orgId,
      requestId: brakeRequestId,
      workOrderId: brakeWoId,
      action: "work_order_created",
      message: `Work order ${brakeWoNumber} created.`,
      performedBy: adminId,
      performedByName: demoLogins.admin.name,
      performedAt: now,
    },
    {
      id: nextId(store, "MAC"),
      orgId,
      requestId: brakeRequestId,
      workOrderId: brakeWoId,
      action: "vehicle_checked_in",
      message: "Vehicle checked into City Auto Care.",
      performedBy: adminId,
      performedByName: demoLogins.admin.name,
      performedAt: now,
    },
  );

  // VAN-04 oil service schedule (due soon at 49,500 / 50,000)
  store.schedules.push({
    id: nextId(store, "MSC"),
    orgId,
    vehicleId: "BUS-003",
    title: "Engine Oil",
    maintenanceType: "oil_change",
    intervalKm: 10000,
    intervalDays: 180,
    lastServiceDate: "2026-03-15",
    lastServiceOdometer: 40000,
    nextServiceDate: "2026-09-15",
    nextServiceOdometer: 50000,
    reminderThresholdKm: 1000,
    reminderThresholdDays: 14,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: adminId,
    updatedBy: adminId,
  });

  // Completed periodic service sample on BUS-07
  const doneRequestId = nextId(store, "MRQ");
  const doneWoId = nextId(store, "MWO");
  const doneRequestNumber = nextHumanNumber(store.seq.requestByYear, "MR");
  const doneWoNumber = nextHumanNumber(store.seq.workOrderByYear, "WO");

  store.requests.push({
    id: doneRequestId,
    orgId,
    requestNumber: doneRequestNumber,
    vehicleId: "BUS-002",
    driverId: "DRV-003",
    reportedBy: adminId,
    reportedByName: demoLogins.admin.name,
    reportedDate: "2026-08-12",
    source: "scheduled",
    maintenanceType: "periodic_service",
    category: "Preventive",
    title: "Periodic service",
    description: "Scheduled 40k km service — oil, filters, inspection.",
    odometerReading: 39100,
    priority: "medium",
    location: null,
    breakdown: false,
    vehicleOperationalStatus: "operational",
    estimatedCostMinor: 500000,
    preferredServiceDate: "2026-08-12",
    status: "completed",
    workOrderId: doneWoId,
    createdAt: now,
    updatedAt: now,
    createdBy: adminId,
    updatedBy: adminId,
  });

  store.workOrders.push({
    id: doneWoId,
    orgId,
    workOrderNumber: doneWoNumber,
    maintenanceRequestId: doneRequestId,
    vehicleId: "BUS-002",
    vendorId: vendorBay.id,
    serviceCenter: "Fleet Bay 2",
    assignedTechnician: "Workshop team",
    startDate: "2026-08-12",
    expectedCompletionDate: "2026-08-12",
    actualCompletionDate: "2026-08-12",
    checkInDate: "2026-08-12",
    odometerIn: 39100,
    odometerOut: 39105,
    fuelLevel: null,
    vehicleCondition: "Good",
    existingDamageNotes: null,
    receivedBy: "Priya N",
    instructions: "Full periodic service checklist",
    diagnosis: "Routine service — no major defects",
    rootCause: null,
    recommendedAction: "Complete oil service package",
    technicianNotes: null,
    workPerformed: "Engine oil replacement, oil filter, air filter cleaning, brake inspection",
    waitingForPart: null,
    waitingQuantity: null,
    waitingSupplier: null,
    waitingExpectedArrival: null,
    waitingNotes: null,
    waitingSince: null,
    estimatedLabourCostMinor: 120000,
    estimatedPartsCostMinor: 380000,
    estimatedOtherCostMinor: 0,
    estimatedTaxMinor: 0,
    estimatedDiscountMinor: 0,
    estimatedTotalCostMinor: 500000,
    actualLabourCostMinor: 120000,
    actualPartsCostMinor: 380000,
    actualOtherCostMinor: 0,
    actualTaxMinor: 0,
    actualDiscountMinor: 0,
    actualTotalCostMinor: 500000,
    verificationResult: "pass",
    verificationNotes: "All checklist items ok",
    verifiedBy: adminId,
    verifiedAt: now,
    notes: null,
    createdAt: now,
    updatedAt: now,
    createdBy: adminId,
    updatedBy: adminId,
  });

  store.tasks.push(
    {
      id: nextId(store, "WOT"),
      orgId,
      workOrderId: doneWoId,
      taskName: "Engine oil replacement",
      description: null,
      category: "Service",
      assignedTo: null,
      status: "completed",
      estimatedHours: 0.5,
      actualHours: 0.5,
      labourCostMinor: 40000,
      notes: null,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nextId(store, "WOT"),
      orgId,
      workOrderId: doneWoId,
      taskName: "Oil filter replacement",
      description: null,
      category: "Service",
      assignedTo: null,
      status: "completed",
      estimatedHours: 0.25,
      actualHours: 0.25,
      labourCostMinor: 20000,
      notes: null,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nextId(store, "WOT"),
      orgId,
      workOrderId: doneWoId,
      taskName: "Brake inspection",
      description: null,
      category: "Inspection",
      assignedTo: null,
      status: "completed",
      estimatedHours: 0.5,
      actualHours: 0.5,
      labourCostMinor: 60000,
      notes: null,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  );

  store.parts.push(
    {
      id: nextId(store, "WOP"),
      orgId,
      workOrderId: doneWoId,
      partId: null,
      partName: "Engine Oil 15W-40",
      partNumber: "EO-15W40",
      quantity: 8,
      unitPriceMinor: 35000,
      taxMinor: 0,
      discountMinor: 0,
      totalPriceMinor: 280000,
      supplierId: null,
      warranty: null,
      warrantyExpiryDate: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nextId(store, "WOP"),
      orgId,
      workOrderId: doneWoId,
      partId: null,
      partName: "Oil Filter",
      partNumber: "OF-220",
      quantity: 1,
      unitPriceMinor: 100000,
      taxMinor: 0,
      discountMinor: 0,
      totalPriceMinor: 100000,
      supplierId: null,
      warranty: null,
      warrantyExpiryDate: null,
      createdAt: now,
      updatedAt: now,
    },
  );

  store.activities.push({
    id: nextId(store, "MAC"),
    orgId,
    requestId: doneRequestId,
    workOrderId: doneWoId,
    action: "maintenance_completed",
    message: "Periodic service completed and archived to vehicle history.",
    performedBy: adminId,
    performedByName: demoLogins.admin.name,
    performedAt: now,
  });

  return store;
}

function readStore(): MaintenanceStoreData {
  if (typeof window === "undefined") {
    return seedStore(demoLogins.admin.orgId);
  }
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) {
    const seeded = seedStore(demoLogins.admin.orgId);
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as MaintenanceStoreData;
  } catch {
    const seeded = seedStore(demoLogins.admin.orgId);
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeStore(store: MaintenanceStoreData) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function notify(
  orgId: string,
  title: string,
  body: string,
  tone: "Info" | "Warning" | "Critical" | "Success" = "Info",
) {
  try {
    pushOpsNotification({ orgId, title, body, tone });
  } catch {
    // Notifications are best-effort in the prototype
  }
}

export function ensureMaintenanceSeeded() {
  ensurePrototypeSeeded();
  readStore();
  // Drop legacy ModuleWorkspace maintenance key so list/dashboard never diverge
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("fleet_module_maintenance_v1");
    } catch {
      // ignore
    }
  }
}

export function resetMaintenanceStore() {
  const seeded = seedStore(demoLogins.admin.orgId);
  writeStore(seeded);
  return seeded;
}

function requireAdmin(actor: MaintenanceActor) {
  if (actor.role !== "admin") {
    throw new MaintenanceError("Only fleet admin can perform this action.", "FORBIDDEN");
  }
}

function appendActivity(
  store: MaintenanceStoreData,
  input: Omit<MaintenanceActivity, "id">,
) {
  store.activities.push({ ...input, id: nextId(store, "MAC") });
}

function applyVehicleOperationalImpact(
  orgId: string,
  vehicleId: string,
  operationalStatus: MaintenanceRequest["vehicleOperationalStatus"],
  maintenanceStatus: MaintenanceStatus,
) {
  const vehicle = getVehicle(orgId, vehicleId);
  if (!vehicle) return;

  const underMaintenance =
    operationalStatus === "out_of_service" ||
    [
      "work_order_created",
      "in_service",
      "waiting_for_parts",
      "service_completed",
      "pending_verification",
      "verified",
      "pending_payment_approval",
    ].includes(maintenanceStatus);

  if (underMaintenance && vehicle.status !== "maintenance") {
    updateVehicle(orgId, vehicleId, { status: "maintenance" });
  }
}

function releaseVehicleIfSafe(
  orgId: string,
  vehicleId: string,
  store: MaintenanceStoreData,
) {
  const stillBlocking = store.requests.some(
    (r) =>
      r.orgId === orgId &&
      r.vehicleId === vehicleId &&
      !["completed", "cancelled", "rejected"].includes(r.status) &&
      (r.vehicleOperationalStatus === "out_of_service" ||
        [
          "work_order_created",
          "in_service",
          "waiting_for_parts",
          "service_completed",
          "pending_verification",
          "verified",
          "pending_payment_approval",
        ].includes(r.status)),
  );
  if (!stillBlocking) {
    const vehicle = getVehicle(orgId, vehicleId);
    if (vehicle?.status === "maintenance") {
      updateVehicle(orgId, vehicleId, { status: "available" });
    }
  }
}

function getRequestOrThrow(store: MaintenanceStoreData, orgId: string, requestId: string) {
  const request = store.requests.find((r) => r.orgId === orgId && r.id === requestId);
  if (!request) throw new MaintenanceError("Maintenance request not found.", "NOT_FOUND");
  return request;
}

function getWorkOrderOrThrow(store: MaintenanceStoreData, orgId: string, workOrderId: string) {
  const wo = store.workOrders.find((w) => w.orgId === orgId && w.id === workOrderId);
  if (!wo) throw new MaintenanceError("Work order not found.", "NOT_FOUND");
  return wo;
}

function transitionRequest(
  store: MaintenanceStoreData,
  request: MaintenanceRequest,
  to: MaintenanceStatus,
  actor: MaintenanceActor,
) {
  assertTransition(request.status, to);
  request.status = to;
  request.updatedAt = nowIso();
  request.updatedBy = actor.userId;
}

function emptyWorkOrderCosts(): Pick<
  WorkOrder,
  | "estimatedLabourCostMinor"
  | "estimatedPartsCostMinor"
  | "estimatedOtherCostMinor"
  | "estimatedTaxMinor"
  | "estimatedDiscountMinor"
  | "estimatedTotalCostMinor"
  | "actualLabourCostMinor"
  | "actualPartsCostMinor"
  | "actualOtherCostMinor"
  | "actualTaxMinor"
  | "actualDiscountMinor"
  | "actualTotalCostMinor"
> {
  return {
    estimatedLabourCostMinor: 0,
    estimatedPartsCostMinor: 0,
    estimatedOtherCostMinor: 0,
    estimatedTaxMinor: 0,
    estimatedDiscountMinor: 0,
    estimatedTotalCostMinor: 0,
    actualLabourCostMinor: 0,
    actualPartsCostMinor: 0,
    actualOtherCostMinor: 0,
    actualTaxMinor: 0,
    actualDiscountMinor: 0,
    actualTotalCostMinor: 0,
  };
}

function recalculateActualTotals(
  store: MaintenanceStoreData,
  workOrder: WorkOrder,
) {
  const parts = store.parts.filter((p) => p.workOrderId === workOrder.id);
  const expenses = store.expenses.filter((e) => e.workOrderId === workOrder.id);
  const tasks = store.tasks.filter((t) => t.workOrderId === workOrder.id);

  const partsCost = parts.reduce((sum, p) => sum + p.totalPriceMinor, 0);
  const labourFromTasks = tasks.reduce((sum, t) => sum + t.labourCostMinor, 0);
  const otherCost = expenses.reduce((sum, e) => sum + e.amountMinor, 0);

  workOrder.actualPartsCostMinor = partsCost;
  if (labourFromTasks > 0) {
    workOrder.actualLabourCostMinor = labourFromTasks;
  }
  workOrder.actualOtherCostMinor = otherCost;
  workOrder.actualTotalCostMinor = calculateMaintenanceTotalMinor({
    partsCostMinor: workOrder.actualPartsCostMinor,
    labourCostMinor: workOrder.actualLabourCostMinor,
    otherCostMinor: workOrder.actualOtherCostMinor,
    taxMinor: workOrder.actualTaxMinor,
    discountMinor: workOrder.actualDiscountMinor,
  });
  workOrder.updatedAt = nowIso();
}

// ─── Reads ───────────────────────────────────────────────────────────────────

export function listMaintenanceRequests(orgId: string): MaintenanceRequest[] {
  ensureMaintenanceSeeded();
  return readStore()
    .requests.filter((r) => r.orgId === orgId)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getMaintenanceRequest(
  orgId: string,
  requestId: string,
): MaintenanceRequest | null {
  ensureMaintenanceSeeded();
  return readStore().requests.find((r) => r.orgId === orgId && r.id === requestId) ?? null;
}

export function getMaintenanceBundle(
  orgId: string,
  requestId: string,
): MaintenanceRequestBundle | null {
  ensureMaintenanceSeeded();
  const store = readStore();
  const request = store.requests.find((r) => r.orgId === orgId && r.id === requestId);
  if (!request) return null;

  const workOrder =
    store.workOrders.find((w) => w.maintenanceRequestId === request.id) ?? null;
  const workOrderId = workOrder?.id ?? null;
  const vendor =
    workOrder?.vendorId
      ? store.vendors.find((v) => v.id === workOrder.vendorId) ?? null
      : null;

  return {
    request,
    workOrder,
    tasks: workOrderId
      ? store.tasks.filter((t) => t.workOrderId === workOrderId)
      : [],
    parts: workOrderId
      ? store.parts.filter((p) => p.workOrderId === workOrderId)
      : [],
    expenses: workOrderId
      ? store.expenses.filter((e) => e.workOrderId === workOrderId)
      : [],
    invoices: workOrderId
      ? store.invoices.filter((i) => i.workOrderId === workOrderId)
      : [],
    approvals: store.approvals
      .filter((a) => a.requestId === request.id)
      .sort((a, b) => a.performedAt.localeCompare(b.performedAt)),
    activities: store.activities
      .filter((a) => a.requestId === request.id)
      .sort((a, b) => a.performedAt.localeCompare(b.performedAt)),
    attachments: store.attachments.filter((a) => a.requestId === request.id),
    vendor,
  };
}

export function listVehicleMaintenanceHistory(
  orgId: string,
  vehicleId: string,
): MaintenanceRequest[] {
  ensureMaintenanceSeeded();
  return readStore()
    .requests.filter((r) => r.orgId === orgId && r.vehicleId === vehicleId)
    .slice()
    .sort((a, b) => b.reportedDate.localeCompare(a.reportedDate));
}

export function listVendors(orgId: string): Vendor[] {
  ensureMaintenanceSeeded();
  return readStore().vendors.filter((v) => v.orgId === orgId && v.status === "active");
}

export function listAllVendors(orgId: string): Vendor[] {
  ensureMaintenanceSeeded();
  return readStore().vendors.filter((v) => v.orgId === orgId);
}

export function listSchedules(orgId: string): MaintenanceSchedule[] {
  ensureMaintenanceSeeded();
  return readStore().schedules.filter((s) => s.orgId === orgId);
}

export function getMaintenanceKpis(orgId: string): MaintenanceKpis {
  ensureMaintenanceSeeded();
  ensurePrototypeSeeded();
  const store = readStore();
  const requests = store.requests.filter((r) => r.orgId === orgId);
  const schedules = store.schedules.filter(
    (s) => s.orgId === orgId && s.status === "active",
  );
  const vehicles = listVehicles(orgId);
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const today = todayIsoDate();
  const monthPrefix = today.slice(0, 7);

  let dueSoon = 0;
  let overdueServices = 0;
  for (const schedule of schedules) {
    const vehicle = vehicleMap.get(schedule.vehicleId);
    const due = computeScheduleDueStatus({
      currentOdometer: vehicle?.odometer ?? null,
      nextServiceOdometer: schedule.nextServiceOdometer,
      reminderThresholdKm: schedule.reminderThresholdKm,
      todayIso: today,
      nextServiceDate: schedule.nextServiceDate,
      reminderThresholdDays: schedule.reminderThresholdDays,
    });
    if (due === "due_soon" || due === "due") dueSoon += 1;
    if (due === "overdue") overdueServices += 1;
  }

  const completedThisMonth = requests.filter(
    (r) => r.status === "completed" && r.updatedAt.startsWith(monthPrefix),
  );

  const maintenanceCostThisMonthMinor = completedThisMonth.reduce((sum, r) => {
    const wo = store.workOrders.find((w) => w.id === r.workOrderId);
    return sum + (wo?.actualTotalCostMinor ?? 0);
  }, 0);

  return {
    openRequests: requests.filter((r) =>
      OPEN_MAINTENANCE_STATUSES.includes(r.status),
    ).length,
    vehiclesInService: requests.filter((r) =>
      ["in_service", "waiting_for_parts"].includes(r.status),
    ).length,
    waitingForParts: requests.filter((r) => r.status === "waiting_for_parts").length,
    dueSoon,
    overdueServices,
    completedThisMonth: completedThisMonth.length,
    maintenanceCostThisMonthMinor,
  };
}

export function getScheduleDueStatusFor(
  schedule: MaintenanceSchedule,
  vehicle: ProtoVehicle | undefined,
): ReturnType<typeof computeScheduleDueStatus> {
  return computeScheduleDueStatus({
    currentOdometer: vehicle?.odometer ?? null,
    nextServiceOdometer: schedule.nextServiceOdometer,
    reminderThresholdKm: schedule.reminderThresholdKm,
    todayIso: todayIsoDate(),
    nextServiceDate: schedule.nextServiceDate,
    reminderThresholdDays: schedule.reminderThresholdDays,
  });
}

// ─── Mutations: request lifecycle ────────────────────────────────────────────

export function createMaintenanceRequest(
  actor: MaintenanceActor,
  input: ValidatedMaintenanceRequest,
): MaintenanceRequest {
  ensureMaintenanceSeeded();
  const store = readStore();
  const vehicle = getVehicle(actor.orgId, input.vehicleId);
  if (!vehicle) throw new MaintenanceError("Vehicle not found.", "VEHICLE_NOT_FOUND");

  if (actor.role === "driver") {
    // Drivers may only create driver_report / breakdown sources
    if (input.source !== "driver_report" && input.source !== "breakdown") {
      throw new MaintenanceError(
        "Drivers can only report issues or breakdowns.",
        "FORBIDDEN",
      );
    }
  }

  const id = nextId(store, "MRQ");
  const requestNumber = nextHumanNumber(store.seq.requestByYear, "MR");
  const stamp = nowIso();

  const request: MaintenanceRequest = {
    id,
    orgId: actor.orgId,
    requestNumber,
    vehicleId: input.vehicleId,
    driverId: input.driverId ?? actor.driverId ?? null,
    reportedBy: actor.userId,
    reportedByName: actor.fullName,
    reportedDate: todayIsoDate(),
    source: input.source,
    maintenanceType: input.maintenanceType,
    category: input.category,
    title: input.title,
    description: input.description,
    odometerReading: input.odometerReading,
    priority: input.priority,
    location: input.location,
    breakdown: input.breakdown,
    vehicleOperationalStatus: input.vehicleOperationalStatus,
    estimatedCostMinor: input.estimatedCostMinor,
    preferredServiceDate: input.preferredServiceDate,
    status: "draft",
    workOrderId: null,
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: actor.userId,
    updatedBy: actor.userId,
  };

  store.requests.push(request);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: id,
    workOrderId: null,
    action: "request_created",
    message: `Maintenance request ${requestNumber} created.`,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });

  if (input.odometerReading != null) {
    try {
      updateVehicle(actor.orgId, input.vehicleId, { odometer: input.odometerReading });
    } catch {
      // Keep request; odometer regression is validated at form layer when possible
    }
  }

  applyVehicleOperationalImpact(
    actor.orgId,
    input.vehicleId,
    input.vehicleOperationalStatus,
    request.status,
  );

  writeStore(store);
  notify(
    actor.orgId,
    "Maintenance request created",
    `${requestNumber}: ${request.title}`,
    request.priority === "critical" ? "Critical" : "Info",
  );
  return request;
}

export function updateMaintenanceRequestDraft(
  actor: MaintenanceActor,
  requestId: string,
  input: ValidatedMaintenanceRequest,
): MaintenanceRequest {
  ensureMaintenanceSeeded();
  const store = readStore();
  const request = getRequestOrThrow(store, actor.orgId, requestId);
  if (request.status !== "draft") {
    throw new MaintenanceError("Only draft requests can be edited.", "INVALID_STATE");
  }
  if (actor.role === "driver" && request.createdBy !== actor.userId) {
    throw new MaintenanceError("You can only edit your own drafts.", "FORBIDDEN");
  }

  Object.assign(request, {
    vehicleId: input.vehicleId,
    driverId: input.driverId,
    source: input.source,
    maintenanceType: input.maintenanceType,
    category: input.category,
    title: input.title,
    description: input.description,
    odometerReading: input.odometerReading,
    priority: input.priority,
    location: input.location,
    breakdown: input.breakdown,
    vehicleOperationalStatus: input.vehicleOperationalStatus,
    estimatedCostMinor: input.estimatedCostMinor,
    preferredServiceDate: input.preferredServiceDate,
    updatedAt: nowIso(),
    updatedBy: actor.userId,
  });

  appendActivity(store, {
    orgId: actor.orgId,
    requestId,
    workOrderId: null,
    action: "request_updated",
    message: "Draft maintenance request updated.",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: nowIso(),
  });

  writeStore(store);
  return request;
}

export function submitMaintenanceRequest(
  actor: MaintenanceActor,
  requestId: string,
): MaintenanceRequest {
  ensureMaintenanceSeeded();
  const store = readStore();
  const request = getRequestOrThrow(store, actor.orgId, requestId);
  transitionRequest(store, request, "submitted", actor);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId,
    workOrderId: null,
    action: "request_submitted",
    message: "Maintenance request submitted for review.",
    oldValue: "draft",
    newValue: "submitted",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: nowIso(),
  });
  writeStore(store);
  notify(
    actor.orgId,
    "Maintenance request submitted",
    `${request.requestNumber} is awaiting review.`,
    "Warning",
  );
  return request;
}

export function startMaintenanceReview(
  actor: MaintenanceActor,
  requestId: string,
): MaintenanceRequest {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const request = getRequestOrThrow(store, actor.orgId, requestId);
  transitionRequest(store, request, "under_review", actor);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId,
    workOrderId: null,
    action: "review_started",
    message: "Fleet manager started review.",
    oldValue: "submitted",
    newValue: "under_review",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: nowIso(),
  });
  writeStore(store);
  return request;
}

export function approveMaintenanceRequest(
  actor: MaintenanceActor,
  requestId: string,
  comments?: string | null,
): MaintenanceRequest {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const request = getRequestOrThrow(store, actor.orgId, requestId);
  if (request.status === "rejected") {
    throw new MaintenanceError("Cannot approve a rejected request.", "INVALID_STATE");
  }
  transitionRequest(store, request, "approved", actor);
  store.approvals.push({
    id: nextId(store, "MAP"),
    orgId: actor.orgId,
    requestId,
    workOrderId: null,
    kind: "maintenance_approval",
    comments: comments?.trim() || null,
    reason: null,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: nowIso(),
  });
  appendActivity(store, {
    orgId: actor.orgId,
    requestId,
    workOrderId: null,
    action: "request_approved",
    message: "Maintenance request approved.",
    oldValue: "under_review",
    newValue: "approved",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: nowIso(),
  });
  writeStore(store);
  notify(
    actor.orgId,
    "Maintenance approved",
    `${request.requestNumber} was approved.`,
    "Success",
  );
  return request;
}

export function rejectMaintenanceRequest(
  actor: MaintenanceActor,
  requestId: string,
  reason: string,
): MaintenanceRequest {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new MaintenanceError("Rejection reason is required.", "VALIDATION");
  }
  const store = readStore();
  const request = getRequestOrThrow(store, actor.orgId, requestId);
  transitionRequest(store, request, "rejected", actor);
  store.approvals.push({
    id: nextId(store, "MAP"),
    orgId: actor.orgId,
    requestId,
    workOrderId: null,
    kind: "maintenance_rejection",
    comments: null,
    reason: trimmed,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: nowIso(),
  });
  appendActivity(store, {
    orgId: actor.orgId,
    requestId,
    workOrderId: null,
    action: "request_rejected",
    message: `Maintenance request rejected: ${trimmed}`,
    oldValue: "under_review",
    newValue: "rejected",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: nowIso(),
  });
  releaseVehicleIfSafe(actor.orgId, request.vehicleId, store);
  writeStore(store);
  notify(
    actor.orgId,
    "Maintenance rejected",
    `${request.requestNumber}: ${trimmed}`,
    "Critical",
  );
  return request;
}

export function createWorkOrderFromRequest(
  actor: MaintenanceActor,
  requestId: string,
  input?: {
    vendorId?: string | null;
    serviceCenter?: string | null;
    instructions?: string | null;
    expectedCompletionDate?: string | null;
    estimatedLabourCostMinor?: number;
    estimatedPartsCostMinor?: number;
    estimatedOtherCostMinor?: number;
  },
): WorkOrder {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const request = getRequestOrThrow(store, actor.orgId, requestId);
  if (request.workOrderId) {
    throw new MaintenanceError("Work order already exists for this request.", "CONFLICT");
  }
  transitionRequest(store, request, "work_order_created", actor);

  const stamp = nowIso();
  const id = nextId(store, "MWO");
  const workOrderNumber = nextHumanNumber(store.seq.workOrderByYear, "WO");

  const estimatedLabour = input?.estimatedLabourCostMinor ?? 0;
  const estimatedParts = input?.estimatedPartsCostMinor ?? 0;
  const estimatedOther = input?.estimatedOtherCostMinor ?? 0;
  const estimatedTotal = calculateMaintenanceTotalMinor({
    partsCostMinor: estimatedParts,
    labourCostMinor: estimatedLabour,
    otherCostMinor: estimatedOther,
    taxMinor: 0,
    discountMinor: 0,
  });

  const workOrder: WorkOrder = {
    id,
    orgId: actor.orgId,
    workOrderNumber,
    maintenanceRequestId: request.id,
    vehicleId: request.vehicleId,
    vendorId: input?.vendorId ?? null,
    serviceCenter: input?.serviceCenter ?? null,
    assignedTechnician: null,
    startDate: null,
    expectedCompletionDate: input?.expectedCompletionDate ?? null,
    actualCompletionDate: null,
    checkInDate: null,
    odometerIn: null,
    odometerOut: null,
    fuelLevel: null,
    vehicleCondition: null,
    existingDamageNotes: null,
    receivedBy: null,
    instructions: input?.instructions ?? null,
    diagnosis: null,
    rootCause: null,
    recommendedAction: null,
    technicianNotes: null,
    workPerformed: null,
    waitingForPart: null,
    waitingQuantity: null,
    waitingSupplier: null,
    waitingExpectedArrival: null,
    waitingNotes: null,
    waitingSince: null,
    ...emptyWorkOrderCosts(),
    estimatedLabourCostMinor: estimatedLabour,
    estimatedPartsCostMinor: estimatedParts,
    estimatedOtherCostMinor: estimatedOther,
    estimatedTotalCostMinor: estimatedTotal,
    verificationResult: null,
    verificationNotes: null,
    verifiedBy: null,
    verifiedAt: null,
    notes: null,
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: actor.userId,
    updatedBy: actor.userId,
  };

  store.workOrders.push(workOrder);
  request.workOrderId = id;
  request.updatedAt = stamp;
  request.updatedBy = actor.userId;

  appendActivity(store, {
    orgId: actor.orgId,
    requestId,
    workOrderId: id,
    action: "work_order_created",
    message: `Work order ${workOrderNumber} created.`,
    oldValue: "approved",
    newValue: "work_order_created",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });

  applyVehicleOperationalImpact(
    actor.orgId,
    request.vehicleId,
    request.vehicleOperationalStatus,
    request.status,
  );

  writeStore(store);
  notify(
    actor.orgId,
    "Work order created",
    `${workOrderNumber} created for ${request.requestNumber}.`,
    "Info",
  );
  return workOrder;
}

// ─── Vendors & schedules ─────────────────────────────────────────────────────

export function createVendor(
  actor: MaintenanceActor,
  input: ValidatedVendor,
): Vendor {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const stamp = nowIso();
  const vendor: Vendor = {
    id: nextId(store, "VND"),
    orgId: actor.orgId,
    ...input,
    status: "active",
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: actor.userId,
    updatedBy: actor.userId,
  };
  store.vendors.push(vendor);
  writeStore(store);
  return vendor;
}

export function createMaintenanceSchedule(
  actor: MaintenanceActor,
  input: ValidatedSchedule,
): MaintenanceSchedule {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const vehicle = getVehicle(actor.orgId, input.vehicleId);
  if (!vehicle) throw new MaintenanceError("Vehicle not found.", "VEHICLE_NOT_FOUND");

  const next = computeNextServiceTargets({
    lastServiceDate: input.lastServiceDate,
    lastServiceOdometer: input.lastServiceOdometer,
    intervalDays: input.intervalDays,
    intervalKm: input.intervalKm,
  });

  const stamp = nowIso();
  const schedule: MaintenanceSchedule = {
    id: nextId(store, "MSC"),
    orgId: actor.orgId,
    vehicleId: input.vehicleId,
    title: input.title,
    maintenanceType: input.maintenanceType,
    intervalKm: input.intervalKm,
    intervalDays: input.intervalDays,
    lastServiceDate: input.lastServiceDate,
    lastServiceOdometer: input.lastServiceOdometer,
    nextServiceDate: next.nextServiceDate,
    nextServiceOdometer: next.nextServiceOdometer,
    reminderThresholdKm: input.reminderThresholdKm,
    reminderThresholdDays: input.reminderThresholdDays,
    status: "active",
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: actor.userId,
    updatedBy: actor.userId,
  };
  store.schedules.push(schedule);
  writeStore(store);
  return schedule;
}

// ─── Work order execution helpers (Phase 1 foundation for Phase 2/3 UI) ──────

export function startWorkOrderService(
  actor: MaintenanceActor,
  workOrderId: string,
  checkIn?: {
    odometerIn: number;
    fuelLevel?: string | null;
    vehicleCondition?: string | null;
    existingDamageNotes?: string | null;
    receivedBy?: string | null;
    serviceCenter?: string | null;
  },
): WorkOrder {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const request = getRequestOrThrow(store, actor.orgId, workOrder.maintenanceRequestId);

  transitionRequest(store, request, "in_service", actor);

  const stamp = nowIso();
  workOrder.startDate = stamp.slice(0, 10);
  workOrder.checkInDate = stamp.slice(0, 10);
  workOrder.updatedAt = stamp;
  workOrder.updatedBy = actor.userId;

  if (checkIn) {
    if (workOrder.odometerIn != null && checkIn.odometerIn < workOrder.odometerIn) {
      throw new MaintenanceError("Odometer IN cannot decrease.", "ODOMETER_INVALID");
    }
    workOrder.odometerIn = checkIn.odometerIn;
    workOrder.fuelLevel = checkIn.fuelLevel ?? workOrder.fuelLevel;
    workOrder.vehicleCondition = checkIn.vehicleCondition ?? workOrder.vehicleCondition;
    workOrder.existingDamageNotes =
      checkIn.existingDamageNotes ?? workOrder.existingDamageNotes;
    workOrder.receivedBy = checkIn.receivedBy ?? workOrder.receivedBy;
    if (checkIn.serviceCenter) workOrder.serviceCenter = checkIn.serviceCenter;
    updateVehicle(actor.orgId, workOrder.vehicleId, {
      odometer: checkIn.odometerIn,
      status: "maintenance",
    });
  } else {
    updateVehicle(actor.orgId, workOrder.vehicleId, { status: "maintenance" });
  }

  appendActivity(store, {
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    action: "service_started",
    message: "Vehicle entered service.",
    oldValue: "work_order_created",
    newValue: "in_service",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });

  writeStore(store);
  return workOrder;
}

export function addWorkOrderTask(
  actor: MaintenanceActor,
  workOrderId: string,
  input: {
    taskName: string;
    description?: string | null;
    category?: string | null;
    assignedTo?: string | null;
    estimatedHours?: number | null;
    labourCostMinor?: number;
  },
): WorkOrderTask {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const stamp = nowIso();
  const task: WorkOrderTask = {
    id: nextId(store, "WOT"),
    orgId: actor.orgId,
    workOrderId,
    taskName: input.taskName.trim(),
    description: input.description ?? null,
    category: input.category ?? null,
    assignedTo: input.assignedTo ?? null,
    status: "pending",
    estimatedHours: input.estimatedHours ?? null,
    actualHours: null,
    labourCostMinor: input.labourCostMinor ?? 0,
    notes: null,
    completedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  store.tasks.push(task);
  recalculateActualTotals(store, workOrder);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: workOrder.maintenanceRequestId,
    workOrderId,
    action: "task_added",
    message: `Task added: ${task.taskName}`,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  return task;
}

export function addWorkOrderPart(
  actor: MaintenanceActor,
  workOrderId: string,
  input: ValidatedPart,
): WorkOrderPart {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const totalPriceMinor = calculatePartTotalMinor({
    quantity: input.quantity,
    unitPriceMinor: input.unitPriceMinor,
    taxMinor: input.taxMinor,
    discountMinor: input.discountMinor,
  });
  const stamp = nowIso();
  const part: WorkOrderPart = {
    id: nextId(store, "WOP"),
    orgId: actor.orgId,
    workOrderId,
    partId: null,
    partName: input.partName,
    partNumber: input.partNumber,
    quantity: input.quantity,
    unitPriceMinor: input.unitPriceMinor,
    taxMinor: input.taxMinor,
    discountMinor: input.discountMinor,
    totalPriceMinor,
    supplierId: null,
    warranty: input.warranty,
    warrantyExpiryDate: input.warrantyExpiryDate,
    createdAt: stamp,
    updatedAt: stamp,
  };
  store.parts.push(part);
  recalculateActualTotals(store, workOrder);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: workOrder.maintenanceRequestId,
    workOrderId,
    action: "part_added",
    message: `Part added: ${part.partName} × ${part.quantity}`,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  return part;
}

export function markWaitingForParts(
  actor: MaintenanceActor,
  workOrderId: string,
  input: {
    requiredPart: string;
    quantity: number;
    supplier?: string | null;
    expectedArrivalDate?: string | null;
    notes?: string | null;
  },
): MaintenanceRequest {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const request = getRequestOrThrow(store, actor.orgId, workOrder.maintenanceRequestId);
  transitionRequest(store, request, "waiting_for_parts", actor);
  const stamp = nowIso();
  workOrder.waitingForPart = input.requiredPart.trim();
  workOrder.waitingQuantity = input.quantity;
  workOrder.waitingSupplier = input.supplier ?? null;
  workOrder.waitingExpectedArrival = input.expectedArrivalDate ?? null;
  workOrder.waitingNotes = input.notes ?? null;
  workOrder.waitingSince = stamp;
  workOrder.updatedAt = stamp;
  workOrder.updatedBy = actor.userId;
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    action: "waiting_for_parts",
    message: `Waiting for parts: ${workOrder.waitingForPart}`,
    oldValue: "in_service",
    newValue: "waiting_for_parts",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  notify(
    actor.orgId,
    "Waiting for parts",
    `${workOrder.workOrderNumber}: ${workOrder.waitingForPart}`,
    "Warning",
  );
  return request;
}

export function resumeFromWaitingParts(
  actor: MaintenanceActor,
  workOrderId: string,
): MaintenanceRequest {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const request = getRequestOrThrow(store, actor.orgId, workOrder.maintenanceRequestId);
  transitionRequest(store, request, "in_service", actor);
  const stamp = nowIso();
  workOrder.waitingForPart = null;
  workOrder.waitingQuantity = null;
  workOrder.waitingSupplier = null;
  workOrder.waitingExpectedArrival = null;
  workOrder.waitingNotes = null;
  workOrder.waitingSince = null;
  workOrder.updatedAt = stamp;
  workOrder.updatedBy = actor.userId;
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    action: "parts_available",
    message: "Parts available — work resumed.",
    oldValue: "waiting_for_parts",
    newValue: "in_service",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  return request;
}

export function completeWorkOrderService(
  actor: MaintenanceActor,
  workOrderId: string,
  input: {
    odometerOut: number;
    workPerformed: string;
    technicianComments?: string | null;
    actualLabourCostMinor?: number;
    actualTaxMinor?: number;
    actualDiscountMinor?: number;
  },
): WorkOrder {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const request = getRequestOrThrow(store, actor.orgId, workOrder.maintenanceRequestId);

  const incompleteTasks = store.tasks.filter(
    (t) =>
      t.workOrderId === workOrderId &&
      t.status !== "completed" &&
      t.status !== "cancelled",
  );
  // Auto-complete remaining tasks when service is marked done (workshop sign-off).
  for (const task of incompleteTasks) {
    task.status = "completed";
    task.completedAt = nowIso();
    task.updatedAt = nowIso();
  }

  if (workOrder.odometerIn != null && input.odometerOut < workOrder.odometerIn) {
    throw new MaintenanceError(
      "Odometer OUT cannot be less than odometer IN.",
      "ODOMETER_INVALID",
    );
  }

  transitionRequest(store, request, "service_completed", actor);
  transitionRequest(store, request, "pending_verification", actor);

  const stamp = nowIso();
  workOrder.odometerOut = input.odometerOut;
  workOrder.workPerformed = input.workPerformed.trim();
  workOrder.technicianNotes = input.technicianComments ?? workOrder.technicianNotes;
  workOrder.actualCompletionDate = stamp.slice(0, 10);
  if (input.actualLabourCostMinor != null) {
    workOrder.actualLabourCostMinor = input.actualLabourCostMinor;
  }
  if (input.actualTaxMinor != null) workOrder.actualTaxMinor = input.actualTaxMinor;
  if (input.actualDiscountMinor != null) {
    workOrder.actualDiscountMinor = input.actualDiscountMinor;
  }
  recalculateActualTotals(store, workOrder);
  workOrder.updatedAt = stamp;
  workOrder.updatedBy = actor.userId;

  updateVehicle(actor.orgId, workOrder.vehicleId, { odometer: input.odometerOut });

  appendActivity(store, {
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    action: "service_completed",
    message: "Service completed — pending verification.",
    oldValue: "in_service",
    newValue: "pending_verification",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });

  writeStore(store);
  notify(
    actor.orgId,
    "Service completed",
    `${workOrder.workOrderNumber} ready for verification.`,
    "Info",
  );
  return workOrder;
}

export function verifyWorkOrder(
  actor: MaintenanceActor,
  workOrderId: string,
  input: { result: "pass" | "fail"; notes?: string | null; failureReason?: string | null },
): MaintenanceRequest {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const request = getRequestOrThrow(store, actor.orgId, workOrder.maintenanceRequestId);

  if (input.result === "fail") {
    const reason = (input.failureReason ?? input.notes ?? "").trim();
    if (!reason) {
      throw new MaintenanceError("Failure reason is required.", "VALIDATION");
    }
    transitionRequest(store, request, "in_service", actor);
    workOrder.verificationResult = "fail";
    workOrder.verificationNotes = reason;
    workOrder.verifiedBy = actor.userId;
    workOrder.verifiedAt = nowIso();
    store.approvals.push({
      id: nextId(store, "MAP"),
      orgId: actor.orgId,
      requestId: request.id,
      workOrderId,
      kind: "verification_fail",
      comments: null,
      reason,
      performedBy: actor.userId,
      performedByName: actor.fullName,
      performedAt: nowIso(),
    });
    appendActivity(store, {
      orgId: actor.orgId,
      requestId: request.id,
      workOrderId,
      action: "verification_failed",
      message: `Verification failed: ${reason}`,
      oldValue: "pending_verification",
      newValue: "in_service",
      performedBy: actor.userId,
      performedByName: actor.fullName,
      performedAt: nowIso(),
    });
    writeStore(store);
    return request;
  }

  transitionRequest(store, request, "verified", actor);
  transitionRequest(store, request, "pending_payment_approval", actor);
  const stamp = nowIso();
  workOrder.verificationResult = "pass";
  workOrder.verificationNotes = input.notes ?? null;
  workOrder.verifiedBy = actor.userId;
  workOrder.verifiedAt = stamp;
  store.approvals.push({
    id: nextId(store, "MAP"),
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    kind: "verification_pass",
    comments: input.notes ?? null,
    reason: null,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    action: "verification_passed",
    message: "Work verified — pending payment approval.",
    oldValue: "pending_verification",
    newValue: "pending_payment_approval",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });

  const vendor = workOrder.vendorId
    ? store.vendors.find((v) => v.id === workOrder.vendorId)
    : null;
  const vehicle = getVehicle(actor.orgId, workOrder.vehicleId);
  createOpsBillFromMaintenance({
    orgId: actor.orgId,
    workOrderId: workOrder.id,
    workOrderNumber: workOrder.workOrderNumber,
    vendorName: vendor?.vendorName ?? workOrder.serviceCenter ?? "Workshop",
    vehicleLabel: vehicle?.plate ?? workOrder.vehicleId,
    amountMinor: workOrder.actualTotalCostMinor || workOrder.estimatedTotalCostMinor,
  });

  writeStore(store);
  notify(
    actor.orgId,
    "Verification required payment",
    `${workOrder.workOrderNumber} verified — payment approval needed.`,
    "Warning",
  );
  return request;
}

export function approveMaintenancePayment(
  actor: MaintenanceActor,
  workOrderId: string,
  comments?: string | null,
): MaintenanceRequest {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const request = getRequestOrThrow(store, actor.orgId, workOrder.maintenanceRequestId);

  const hasInvoice = store.invoices.some((i) => i.workOrderId === workOrderId);
  if (!hasInvoice) {
    throw new MaintenanceError(
      "Upload a vendor invoice before approving payment.",
      "INVOICE_REQUIRED",
    );
  }

  transitionRequest(store, request, "completed", actor);

  const stamp = nowIso();
  store.approvals.push({
    id: nextId(store, "MAP"),
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    kind: "payment_approval",
    comments: comments?.trim() || null,
    reason: null,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });

  const lastOdo = workOrder.odometerOut ?? workOrder.odometerIn ?? null;
  updateVehicle(actor.orgId, workOrder.vehicleId, {
    lastServiceDate: workOrder.actualCompletionDate ?? todayIsoDate(),
    lastServiceOdometer: lastOdo,
    status: "available",
  });

  for (const schedule of store.schedules.filter(
    (s) =>
      s.orgId === actor.orgId &&
      s.vehicleId === workOrder.vehicleId &&
      s.status === "active",
  )) {
    schedule.lastServiceDate = workOrder.actualCompletionDate ?? todayIsoDate();
    schedule.lastServiceOdometer = lastOdo;
    const next = computeNextServiceTargets({
      lastServiceDate: schedule.lastServiceDate,
      lastServiceOdometer: schedule.lastServiceOdometer,
      intervalDays: schedule.intervalDays,
      intervalKm: schedule.intervalKm,
    });
    schedule.nextServiceDate = next.nextServiceDate;
    schedule.nextServiceOdometer = next.nextServiceOdometer;
    schedule.updatedAt = stamp;
    schedule.updatedBy = actor.userId;

    updateVehicle(actor.orgId, workOrder.vehicleId, {
      nextServiceDate: next.nextServiceDate,
      nextServiceOdometer: next.nextServiceOdometer,
    });
  }

  releaseVehicleIfSafe(actor.orgId, workOrder.vehicleId, store);

  approveOpsBill(actor.orgId, `bill-wo-${workOrder.id}`);

  appendActivity(store, {
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    action: "maintenance_completed",
    message: "Payment approved — maintenance completed and bill sanctioned.",
    oldValue: "pending_payment_approval",
    newValue: "completed",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });

  writeStore(store);
  notify(
    actor.orgId,
    "Maintenance completed",
    `${request.requestNumber} / ${workOrder.workOrderNumber} completed.`,
    "Success",
  );
  return request;
}

export function cancelMaintenanceRequest(
  actor: MaintenanceActor,
  requestId: string,
  reason: string,
): MaintenanceRequest {
  ensureMaintenanceSeeded();
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new MaintenanceError("Cancellation reason is required.", "VALIDATION");
  }
  const store = readStore();
  const request = getRequestOrThrow(store, actor.orgId, requestId);
  if (actor.role === "driver" && request.createdBy !== actor.userId) {
    throw new MaintenanceError("You can only cancel your own requests.", "FORBIDDEN");
  }
  if (actor.role === "driver" && !["draft", "submitted"].includes(request.status)) {
    throw new MaintenanceError(
      "Drivers can only cancel draft or submitted requests.",
      "FORBIDDEN",
    );
  }
  const from = request.status;
  transitionRequest(store, request, "cancelled", actor);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId,
    workOrderId: request.workOrderId,
    action: "request_cancelled",
    message: `Cancelled: ${trimmed}`,
    oldValue: from,
    newValue: "cancelled",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: nowIso(),
  });
  releaseVehicleIfSafe(actor.orgId, request.vehicleId, store);
  writeStore(store);
  return request;
}

export function updateWorkOrderDiagnosis(
  actor: MaintenanceActor,
  workOrderId: string,
  input: {
    diagnosis: string;
    rootCause?: string | null;
    recommendedAction?: string | null;
    technicianNotes?: string | null;
  },
): WorkOrder {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const stamp = nowIso();
  workOrder.diagnosis = input.diagnosis.trim();
  workOrder.rootCause = input.rootCause?.trim() || null;
  workOrder.recommendedAction = input.recommendedAction?.trim() || null;
  workOrder.technicianNotes = input.technicianNotes?.trim() || null;
  workOrder.updatedAt = stamp;
  workOrder.updatedBy = actor.userId;
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: workOrder.maintenanceRequestId,
    workOrderId,
    action: "diagnosis_updated",
    message: "Diagnosis recorded.",
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  return workOrder;
}

export function updateWorkOrderTaskStatus(
  actor: MaintenanceActor,
  taskId: string,
  status: TaskStatus,
  actualHours?: number | null,
): WorkOrderTask {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const task = store.tasks.find((t) => t.orgId === actor.orgId && t.id === taskId);
  if (!task) throw new MaintenanceError("Task not found.", "NOT_FOUND");
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, task.workOrderId);
  const stamp = nowIso();
  task.status = status;
  task.updatedAt = stamp;
  if (actualHours != null) task.actualHours = actualHours;
  if (status === "completed") task.completedAt = stamp;
  if (status === "cancelled" || status === "pending") task.completedAt = null;
  recalculateActualTotals(store, workOrder);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: workOrder.maintenanceRequestId,
    workOrderId: workOrder.id,
    action: "task_status_changed",
    message: `Task "${task.taskName}" → ${status}`,
    newValue: status,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  return task;
}

export function addWorkOrderExpense(
  actor: MaintenanceActor,
  workOrderId: string,
  input: {
    expenseType: ExpenseType;
    description: string;
    amountMinor: number;
    date: string;
    vendorId?: string | null;
    vendorName?: string | null;
    receipt?: FileRef | null;
  },
): MaintenanceExpense {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  if (input.amountMinor < 0 || !Number.isInteger(input.amountMinor)) {
    throw new MaintenanceError("Expense amount must be non-negative paise.", "VALIDATION");
  }
  const stamp = nowIso();
  const expense: MaintenanceExpense = {
    id: nextId(store, "MEX"),
    orgId: actor.orgId,
    workOrderId,
    expenseType: input.expenseType,
    description: input.description.trim(),
    amountMinor: input.amountMinor,
    vendorId: input.vendorId ?? null,
    vendorName: input.vendorName ?? null,
    receipt: input.receipt ?? null,
    date: input.date,
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: actor.userId,
  };
  store.expenses.push(expense);
  recalculateActualTotals(store, workOrder);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId: workOrder.maintenanceRequestId,
    workOrderId,
    action: "expense_added",
    message: `Expense added: ${expense.description}`,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  return expense;
}

export function addWorkOrderInvoice(
  actor: MaintenanceActor,
  workOrderId: string,
  input: ValidatedInvoice,
  attachment?: FileRef | null,
): MaintenanceInvoice {
  requireAdmin(actor);
  ensureMaintenanceSeeded();
  const store = readStore();
  const workOrder = getWorkOrderOrThrow(store, actor.orgId, workOrderId);
  const request = getRequestOrThrow(store, actor.orgId, workOrder.maintenanceRequestId);

  const allowed: MaintenanceStatus[] = [
    "in_service",
    "service_completed",
    "pending_verification",
    "verified",
    "pending_payment_approval",
  ];
  if (!allowed.includes(request.status)) {
    throw new MaintenanceError(
      "Invoice can only be uploaded after service has started.",
      "INVALID_STATE",
    );
  }

  const stamp = nowIso();
  const invoice: MaintenanceInvoice = {
    id: nextId(store, "MIN"),
    orgId: actor.orgId,
    workOrderId,
    invoiceNumber: input.invoiceNumber,
    invoiceDate: input.invoiceDate,
    vendorId: workOrder.vendorId,
    vendorName: input.vendorName,
    subtotalMinor: input.subtotalMinor,
    taxMinor: input.taxMinor,
    discountMinor: input.discountMinor,
    invoiceTotalMinor: input.invoiceTotalMinor,
    attachment: attachment ?? null,
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: actor.userId,
  };
  store.invoices.push(invoice);

  // Align actual tax/discount/totals with invoice when provided
  workOrder.actualTaxMinor = input.taxMinor;
  workOrder.actualDiscountMinor = input.discountMinor;
  recalculateActualTotals(store, workOrder);
  // Prefer invoice total if parts/labour already captured inconsistently
  if (workOrder.actualTotalCostMinor === 0) {
    workOrder.actualTotalCostMinor = input.invoiceTotalMinor;
  }
  workOrder.updatedAt = stamp;
  workOrder.updatedBy = actor.userId;

  if (attachment) {
    store.attachments.push({
      id: nextId(store, "MAT"),
      orgId: actor.orgId,
      requestId: request.id,
      workOrderId,
      kind: "invoice",
      file: attachment,
      uploadedBy: actor.userId,
      uploadedAt: stamp,
    });
  }

  appendActivity(store, {
    orgId: actor.orgId,
    requestId: request.id,
    workOrderId,
    action: "invoice_uploaded",
    message: `Invoice ${input.invoiceNumber} uploaded.`,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  return invoice;
}

export function addMaintenanceAttachment(
  actor: MaintenanceActor,
  requestId: string,
  input: {
    kind: MaintenanceAttachment["kind"];
    file: FileRef;
    workOrderId?: string | null;
  },
): MaintenanceAttachment {
  ensureMaintenanceSeeded();
  const store = readStore();
  const request = getRequestOrThrow(store, actor.orgId, requestId);
  const stamp = nowIso();
  const attachment: MaintenanceAttachment = {
    id: nextId(store, "MAT"),
    orgId: actor.orgId,
    requestId,
    workOrderId: input.workOrderId ?? request.workOrderId,
    kind: input.kind,
    file: input.file,
    uploadedBy: actor.userId,
    uploadedAt: stamp,
  };
  store.attachments.push(attachment);
  appendActivity(store, {
    orgId: actor.orgId,
    requestId,
    workOrderId: attachment.workOrderId,
    action: "attachment_added",
    message: `Attachment added: ${input.file.fileName}`,
    performedBy: actor.userId,
    performedByName: actor.fullName,
    performedAt: stamp,
  });
  writeStore(store);
  return attachment;
}

export async function fileToFileRef(file: File): Promise<FileRef> {
  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new MaintenanceError("File must be 2 MB or smaller.", "FILE_TOO_LARGE");
  }
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
    throw new MaintenanceError("Only PDF, JPG, or PNG files are allowed.", "FILE_TYPE");
  }
  const localDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
  return {
    storageKey: `local:${Date.now()}-${file.name}`,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    localDataUrl,
  };
}

/** Build an actor from the prototype session user. */
export function actorFromUser(
  user: {
    id: string;
    orgId: string;
    role: "admin" | "driver";
    fullName: string;
  },
  driverId?: string | null,
): MaintenanceActor {
  return {
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
    fullName: user.fullName,
    driverId: driverId ?? null,
  };
}
