import {
  EXPENSE_TYPES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_SOURCES,
  MAINTENANCE_TYPES,
  VEHICLE_OPERATIONAL_STATUSES,
  VENDOR_TYPES,
  type ExpenseType,
  type MaintenancePriority,
  type MaintenanceSource,
  type MaintenanceType,
  type VehicleOperationalStatus,
  type VendorType,
} from "@/lib/maintenance/types";
import {
  firstError,
  isNonEmpty,
  isPastOrTodayDate,
  trim,
  type FieldErrors,
} from "@/lib/validation/common";

export type MaintenanceRequestFormInput = {
  vehicleId: string;
  driverId: string;
  source: string;
  maintenanceType: string;
  category: string;
  title: string;
  description: string;
  odometerReading: string;
  priority: string;
  location: string;
  breakdown: boolean;
  vehicleOperationalStatus: string;
  estimatedCostRupees: string;
  preferredServiceDate: string;
};

export type ValidatedMaintenanceRequest = {
  vehicleId: string;
  driverId: string | null;
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
  estimatedCostMinor: number | null;
  preferredServiceDate: string | null;
};

export type VendorFormInput = {
  vendorName: string;
  vendorType: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
};

export type ValidatedVendor = {
  vendorName: string;
  vendorType: VendorType;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
};

export type ScheduleFormInput = {
  vehicleId: string;
  title: string;
  maintenanceType: string;
  intervalKm: string;
  intervalDays: string;
  lastServiceDate: string;
  lastServiceOdometer: string;
  reminderThresholdKm: string;
  reminderThresholdDays: string;
};

export type ValidatedSchedule = {
  vehicleId: string;
  title: string;
  maintenanceType: MaintenanceType;
  intervalKm: number | null;
  intervalDays: number | null;
  lastServiceDate: string | null;
  lastServiceOdometer: number | null;
  reminderThresholdKm: number | null;
  reminderThresholdDays: number | null;
};

export type PartFormInput = {
  partName: string;
  partNumber: string;
  quantity: string;
  unitPriceRupees: string;
  taxRupees: string;
  discountRupees: string;
  warranty: string;
  warrantyExpiryDate: string;
};

export type ValidatedPart = {
  partName: string;
  partNumber: string | null;
  quantity: number;
  unitPriceMinor: number;
  taxMinor: number;
  discountMinor: number;
  warranty: string | null;
  warrantyExpiryDate: string | null;
};

function asEnum<T extends string>(
  value: string,
  allowed: readonly T[],
  field: string,
  errors: FieldErrors,
  label: string,
): T | null {
  if (!allowed.includes(value as T)) {
    errors[field] = `Select a valid ${label}.`;
    return null;
  }
  return value as T;
}

function optionalNumber(
  raw: string,
  field: string,
  errors: FieldErrors,
  opts: { min?: number; max?: number; integer?: boolean; label: string },
): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    errors[field] = `${opts.label} must be a number.`;
    return null;
  }
  if (opts.integer && !Number.isInteger(n)) {
    errors[field] = `${opts.label} must be a whole number.`;
    return null;
  }
  if (opts.min != null && n < opts.min) {
    errors[field] = `${opts.label} must be at least ${opts.min}.`;
    return null;
  }
  if (opts.max != null && n > opts.max) {
    errors[field] = `${opts.label} must be at most ${opts.max}.`;
    return null;
  }
  return n;
}

function requiredNumber(
  raw: string,
  field: string,
  errors: FieldErrors,
  opts: { min?: number; max?: number; integer?: boolean; label: string },
): number | null {
  if (!raw) {
    errors[field] = `${opts.label} is required.`;
    return null;
  }
  return optionalNumber(raw, field, errors, opts);
}

function rupeesToMinorSafe(
  raw: string,
  field: string,
  errors: FieldErrors,
  label: string,
  required: boolean,
): number | null {
  if (!raw) {
    if (required) errors[field] = `${label} is required.`;
    return required ? null : null;
  }
  const rupees = Number(raw);
  if (!Number.isFinite(rupees) || rupees < 0) {
    errors[field] = `${label} must be a non-negative amount.`;
    return null;
  }
  return Math.round(rupees * 100);
}

export function validateMaintenanceRequestForm(
  raw: MaintenanceRequestFormInput,
): { ok: true; data: ValidatedMaintenanceRequest } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const vehicleId = trim(raw.vehicleId);
  const vehicleErr = isNonEmpty(vehicleId, "Vehicle");
  if (vehicleErr) errors.vehicleId = vehicleErr;

  const title = trim(raw.title);
  const titleErr = isNonEmpty(title, "Title");
  if (titleErr) errors.title = titleErr;
  else if (title.length > 120) errors.title = "Title must be 120 characters or fewer.";

  const description = trim(raw.description);
  const descErr = isNonEmpty(description, "Description");
  if (descErr) errors.description = descErr;

  const source = asEnum(trim(raw.source), MAINTENANCE_SOURCES, "source", errors, "source");
  const maintenanceType = asEnum(
    trim(raw.maintenanceType),
    MAINTENANCE_TYPES,
    "maintenanceType",
    errors,
    "maintenance type",
  );
  const priority = asEnum(
    trim(raw.priority),
    MAINTENANCE_PRIORITIES,
    "priority",
    errors,
    "priority",
  );
  const vehicleOperationalStatus = asEnum(
    trim(raw.vehicleOperationalStatus),
    VEHICLE_OPERATIONAL_STATUSES,
    "vehicleOperationalStatus",
    errors,
    "operational status",
  );

  const odometerReading = optionalNumber(trim(raw.odometerReading), "odometerReading", errors, {
    min: 0,
    max: 2_000_000,
    integer: true,
    label: "Odometer",
  });

  const estimatedCostMinor = rupeesToMinorSafe(
    trim(raw.estimatedCostRupees),
    "estimatedCostRupees",
    errors,
    "Estimated cost",
    false,
  );

  let preferredServiceDate: string | null = null;
  const preferredRaw = trim(raw.preferredServiceDate);
  if (preferredRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredRaw)) {
      errors.preferredServiceDate = "Enter a valid date.";
    } else {
      preferredServiceDate = preferredRaw;
    }
  }

  const driverIdRaw = trim(raw.driverId);
  const category = trim(raw.category) || null;
  const location = trim(raw.location) || null;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      vehicleId,
      driverId: driverIdRaw || null,
      source: source!,
      maintenanceType: maintenanceType!,
      category,
      title,
      description,
      odometerReading,
      priority: priority!,
      location,
      breakdown: Boolean(raw.breakdown),
      vehicleOperationalStatus: vehicleOperationalStatus!,
      estimatedCostMinor,
      preferredServiceDate,
    },
  };
}

export function validateVendorForm(
  raw: VendorFormInput,
): { ok: true; data: ValidatedVendor } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const vendorName = trim(raw.vendorName);
  const nameErr = isNonEmpty(vendorName, "Vendor name");
  if (nameErr) errors.vendorName = nameErr;

  const vendorType = asEnum(trim(raw.vendorType), VENDOR_TYPES, "vendorType", errors, "vendor type");

  const email = trim(raw.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      vendorName,
      vendorType: vendorType!,
      contactPerson: trim(raw.contactPerson) || null,
      phone: trim(raw.phone) || null,
      email: email || null,
      address: trim(raw.address) || null,
      gstNumber: trim(raw.gstNumber) || null,
    },
  };
}

export function validateScheduleForm(
  raw: ScheduleFormInput,
): { ok: true; data: ValidatedSchedule } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const vehicleId = trim(raw.vehicleId);
  if (!vehicleId) errors.vehicleId = "Vehicle is required.";

  const title = trim(raw.title);
  if (!title) errors.title = "Title is required.";

  const maintenanceType = asEnum(
    trim(raw.maintenanceType),
    MAINTENANCE_TYPES,
    "maintenanceType",
    errors,
    "maintenance type",
  );

  const intervalKm = optionalNumber(trim(raw.intervalKm), "intervalKm", errors, {
    min: 1,
    max: 500_000,
    integer: true,
    label: "Interval (km)",
  });
  const intervalDays = optionalNumber(trim(raw.intervalDays), "intervalDays", errors, {
    min: 1,
    max: 3650,
    integer: true,
    label: "Interval (days)",
  });

  if (intervalKm == null && intervalDays == null && !errors.intervalKm && !errors.intervalDays) {
    errors.intervalKm = "Set an interval in km, days, or both.";
  }

  let lastServiceDate: string | null = null;
  const lastDateRaw = trim(raw.lastServiceDate);
  if (lastDateRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lastDateRaw) || !isPastOrTodayDate(lastDateRaw)) {
      errors.lastServiceDate = "Enter a valid past or today date.";
    } else {
      lastServiceDate = lastDateRaw;
    }
  }

  const lastServiceOdometer = optionalNumber(
    trim(raw.lastServiceOdometer),
    "lastServiceOdometer",
    errors,
    { min: 0, max: 2_000_000, integer: true, label: "Last service odometer" },
  );
  const reminderThresholdKm = optionalNumber(
    trim(raw.reminderThresholdKm),
    "reminderThresholdKm",
    errors,
    { min: 0, max: 50_000, integer: true, label: "Reminder threshold (km)" },
  );
  const reminderThresholdDays = optionalNumber(
    trim(raw.reminderThresholdDays),
    "reminderThresholdDays",
    errors,
    { min: 0, max: 365, integer: true, label: "Reminder threshold (days)" },
  );

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      vehicleId,
      title,
      maintenanceType: maintenanceType!,
      intervalKm,
      intervalDays,
      lastServiceDate,
      lastServiceOdometer,
      reminderThresholdKm,
      reminderThresholdDays,
    },
  };
}

export function validatePartForm(
  raw: PartFormInput,
): { ok: true; data: ValidatedPart } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const partName = trim(raw.partName);
  if (!partName) errors.partName = "Part name is required.";

  const quantity = requiredNumber(trim(raw.quantity), "quantity", errors, {
    min: 0.01,
    max: 10_000,
    label: "Quantity",
  });

  const unitPriceMinor = rupeesToMinorSafe(
    trim(raw.unitPriceRupees),
    "unitPriceRupees",
    errors,
    "Unit price",
    true,
  );
  const taxMinor =
    rupeesToMinorSafe(trim(raw.taxRupees), "taxRupees", errors, "Tax", false) ?? 0;
  const discountMinor =
    rupeesToMinorSafe(trim(raw.discountRupees), "discountRupees", errors, "Discount", false) ??
    0;

  let warrantyExpiryDate: string | null = null;
  const warrantyExpiryRaw = trim(raw.warrantyExpiryDate);
  if (warrantyExpiryRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(warrantyExpiryRaw)) {
      errors.warrantyExpiryDate = "Enter a valid date.";
    } else {
      warrantyExpiryDate = warrantyExpiryRaw;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      partName,
      partNumber: trim(raw.partNumber) || null,
      quantity: quantity!,
      unitPriceMinor: unitPriceMinor!,
      taxMinor,
      discountMinor,
      warranty: trim(raw.warranty) || null,
      warrantyExpiryDate,
    },
  };
}

export function validateExpenseForm(input: {
  expenseType: string;
  description: string;
  amountRupees: string;
  date: string;
}): { ok: true; data: { expenseType: ExpenseType; description: string; amountMinor: number; date: string } } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const expenseType = asEnum(
    trim(input.expenseType),
    EXPENSE_TYPES,
    "expenseType",
    errors,
    "expense type",
  );
  const description = trim(input.description);
  if (!description) errors.description = "Description is required.";

  const amountMinor = rupeesToMinorSafe(
    trim(input.amountRupees),
    "amountRupees",
    errors,
    "Amount",
    true,
  );

  const date = trim(input.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = "Enter a valid date.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      expenseType: expenseType!,
      description,
      amountMinor: amountMinor!,
      date,
    },
  };
}

export type InvoiceFormInput = {
  invoiceNumber: string;
  invoiceDate: string;
  vendorName: string;
  subtotalRupees: string;
  taxRupees: string;
  discountRupees: string;
};

export type ValidatedInvoice = {
  invoiceNumber: string;
  invoiceDate: string;
  vendorName: string | null;
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  invoiceTotalMinor: number;
};

export function validateInvoiceForm(
  raw: InvoiceFormInput,
): { ok: true; data: ValidatedInvoice } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const invoiceNumber = trim(raw.invoiceNumber);
  if (!invoiceNumber) errors.invoiceNumber = "Invoice number is required.";

  const invoiceDate = trim(raw.invoiceDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)) {
    errors.invoiceDate = "Enter a valid invoice date.";
  }

  const subtotalMinor = rupeesToMinorSafe(
    trim(raw.subtotalRupees),
    "subtotalRupees",
    errors,
    "Subtotal",
    true,
  );
  const taxMinor =
    rupeesToMinorSafe(trim(raw.taxRupees), "taxRupees", errors, "Tax", false) ?? 0;
  const discountMinor =
    rupeesToMinorSafe(trim(raw.discountRupees), "discountRupees", errors, "Discount", false) ??
    0;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const invoiceTotalMinor = (subtotalMinor ?? 0) + taxMinor - discountMinor;
  if (invoiceTotalMinor < 0) {
    return {
      ok: false,
      errors: { discountRupees: "Discount cannot exceed subtotal + tax." },
    };
  }

  return {
    ok: true,
    data: {
      invoiceNumber,
      invoiceDate,
      vendorName: trim(raw.vendorName) || null,
      subtotalMinor: subtotalMinor!,
      taxMinor,
      discountMinor,
      invoiceTotalMinor,
    },
  };
}

export function maintenanceValidationSummary(errors: FieldErrors): string {
  return firstError(errors) ?? "Please fix the highlighted fields.";
}
