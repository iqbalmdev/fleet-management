/** Vehicle Maintenance domain types (frontend prototype). */

export const MAINTENANCE_TYPES = [
  "preventive",
  "corrective",
  "breakdown_repair",
  "periodic_service",
  "oil_change",
  "tyre_maintenance",
  "battery_maintenance",
  "brake_maintenance",
  "engine_maintenance",
  "transmission_maintenance",
  "electrical_maintenance",
  "ac_maintenance",
  "body_repair",
  "accident_repair",
  "inspection",
  "other",
] as const;

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_SOURCES = [
  "manual",
  "driver_report",
  "scheduled",
  "inspection",
  "breakdown",
] as const;

export type MaintenanceSource = (typeof MAINTENANCE_SOURCES)[number];

export const MAINTENANCE_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number];

export const VEHICLE_OPERATIONAL_STATUSES = [
  "operational",
  "restricted",
  "out_of_service",
] as const;
export type VehicleOperationalStatus = (typeof VEHICLE_OPERATIONAL_STATUSES)[number];

/**
 * Canonical lifecycle for a maintenance case (request → work → close).
 * Do not allow arbitrary jumps — use transitions.ts.
 */
export const MAINTENANCE_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "work_order_created",
  "in_service",
  "waiting_for_parts",
  "service_completed",
  "pending_verification",
  "verified",
  "pending_payment_approval",
  "completed",
  "cancelled",
] as const;

export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const VENDOR_TYPES = [
  "workshop",
  "authorized_service_center",
  "tyre_shop",
  "battery_shop",
  "spare_parts_supplier",
  "towing_service",
  "other",
] as const;
export type VendorType = (typeof VENDOR_TYPES)[number];

export const VENDOR_STATUSES = ["active", "inactive"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export const SCHEDULE_DUE_STATUSES = [
  "upcoming",
  "due_soon",
  "due",
  "overdue",
] as const;
export type ScheduleDueStatus = (typeof SCHEDULE_DUE_STATUSES)[number];

export const SCHEDULE_STATUSES = ["active", "paused", "completed"] as const;
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

export const ATTACHMENT_KINDS = [
  "issue_photo",
  "condition_photo",
  "estimate",
  "quotation",
  "job_card",
  "invoice",
  "receipt",
  "warranty",
  "service_report",
  "other",
] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const EXPENSE_TYPES = [
  "towing",
  "transport",
  "inspection_fee",
  "emergency_mechanic",
  "cleaning",
  "consumables",
  "miscellaneous",
] as const;
export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export const VERIFICATION_RESULTS = ["pass", "fail"] as const;
export type VerificationResult = (typeof VERIFICATION_RESULTS)[number];

export const APPROVAL_KINDS = [
  "maintenance_approval",
  "maintenance_rejection",
  "verification_pass",
  "verification_fail",
  "payment_approval",
  "payment_rejection",
] as const;
export type ApprovalKind = (typeof APPROVAL_KINDS)[number];

/** Money in minor units (paise). */
export type MoneyMinor = number;

export type FileRef = {
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Prototype-only local preview (data URL). Never send to a real API as-is. */
  localDataUrl?: string | null;
};

export type MaintenanceActor = {
  userId: string;
  orgId: string;
  role: "admin" | "driver";
  fullName: string;
  driverId?: string | null;
};

export type MaintenanceAttachment = {
  id: string;
  orgId: string;
  requestId: string;
  workOrderId: string | null;
  kind: AttachmentKind;
  file: FileRef;
  uploadedBy: string;
  uploadedAt: string;
};

export type MaintenanceActivity = {
  id: string;
  orgId: string;
  requestId: string;
  workOrderId: string | null;
  action: string;
  message: string;
  oldValue?: string | null;
  newValue?: string | null;
  performedBy: string;
  performedByName: string;
  performedAt: string;
};

export type MaintenanceApproval = {
  id: string;
  orgId: string;
  requestId: string;
  workOrderId: string | null;
  kind: ApprovalKind;
  comments: string | null;
  reason: string | null;
  performedBy: string;
  performedByName: string;
  performedAt: string;
};

export type Vendor = {
  id: string;
  orgId: string;
  vendorName: string;
  vendorType: VendorType;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type MaintenanceRequest = {
  id: string;
  orgId: string;
  requestNumber: string;
  vehicleId: string;
  driverId: string | null;
  reportedBy: string;
  reportedByName: string;
  reportedDate: string;
  source: MaintenanceSource;
  maintenanceType: MaintenanceType;
  category: string | null;
  title: string;
  description: string;
  odometerReading: number | null;
  priority: MaintenancePriority;
  location: string | null;
  breakdown: boolean;
  vehicleOperationalStatus: VehicleOperationalStatus;
  estimatedCostMinor: MoneyMinor | null;
  preferredServiceDate: string | null;
  status: MaintenanceStatus;
  workOrderId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type WorkOrder = {
  id: string;
  orgId: string;
  workOrderNumber: string;
  maintenanceRequestId: string;
  vehicleId: string;
  vendorId: string | null;
  serviceCenter: string | null;
  assignedTechnician: string | null;
  startDate: string | null;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  checkInDate: string | null;
  odometerIn: number | null;
  odometerOut: number | null;
  fuelLevel: string | null;
  vehicleCondition: string | null;
  existingDamageNotes: string | null;
  receivedBy: string | null;
  instructions: string | null;
  diagnosis: string | null;
  rootCause: string | null;
  recommendedAction: string | null;
  technicianNotes: string | null;
  workPerformed: string | null;
  waitingForPart: string | null;
  waitingQuantity: number | null;
  waitingSupplier: string | null;
  waitingExpectedArrival: string | null;
  waitingNotes: string | null;
  waitingSince: string | null;
  estimatedLabourCostMinor: MoneyMinor;
  estimatedPartsCostMinor: MoneyMinor;
  estimatedOtherCostMinor: MoneyMinor;
  estimatedTaxMinor: MoneyMinor;
  estimatedDiscountMinor: MoneyMinor;
  estimatedTotalCostMinor: MoneyMinor;
  actualLabourCostMinor: MoneyMinor;
  actualPartsCostMinor: MoneyMinor;
  actualOtherCostMinor: MoneyMinor;
  actualTaxMinor: MoneyMinor;
  actualDiscountMinor: MoneyMinor;
  actualTotalCostMinor: MoneyMinor;
  verificationResult: VerificationResult | null;
  verificationNotes: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type WorkOrderTask = {
  id: string;
  orgId: string;
  workOrderId: string;
  taskName: string;
  description: string | null;
  category: string | null;
  assignedTo: string | null;
  status: TaskStatus;
  estimatedHours: number | null;
  actualHours: number | null;
  labourCostMinor: MoneyMinor;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkOrderPart = {
  id: string;
  orgId: string;
  workOrderId: string;
  partId: string | null;
  partName: string;
  partNumber: string | null;
  quantity: number;
  unitPriceMinor: MoneyMinor;
  taxMinor: MoneyMinor;
  discountMinor: MoneyMinor;
  totalPriceMinor: MoneyMinor;
  supplierId: string | null;
  warranty: string | null;
  warrantyExpiryDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceExpense = {
  id: string;
  orgId: string;
  workOrderId: string;
  expenseType: ExpenseType;
  description: string;
  amountMinor: MoneyMinor;
  vendorId: string | null;
  vendorName: string | null;
  receipt: FileRef | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type MaintenanceInvoice = {
  id: string;
  orgId: string;
  workOrderId: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendorId: string | null;
  vendorName: string | null;
  subtotalMinor: MoneyMinor;
  taxMinor: MoneyMinor;
  discountMinor: MoneyMinor;
  invoiceTotalMinor: MoneyMinor;
  attachment: FileRef | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type MaintenanceSchedule = {
  id: string;
  orgId: string;
  vehicleId: string;
  title: string;
  maintenanceType: MaintenanceType;
  intervalKm: number | null;
  intervalDays: number | null;
  lastServiceDate: string | null;
  lastServiceOdometer: number | null;
  nextServiceDate: string | null;
  nextServiceOdometer: number | null;
  reminderThresholdKm: number | null;
  reminderThresholdDays: number | null;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type MaintenanceRequestBundle = {
  request: MaintenanceRequest;
  workOrder: WorkOrder | null;
  tasks: WorkOrderTask[];
  parts: WorkOrderPart[];
  expenses: MaintenanceExpense[];
  invoices: MaintenanceInvoice[];
  approvals: MaintenanceApproval[];
  activities: MaintenanceActivity[];
  attachments: MaintenanceAttachment[];
  vendor: Vendor | null;
};

export type MaintenanceKpis = {
  openRequests: number;
  vehiclesInService: number;
  waitingForParts: number;
  dueSoon: number;
  overdueServices: number;
  completedThisMonth: number;
  maintenanceCostThisMonthMinor: MoneyMinor;
};
