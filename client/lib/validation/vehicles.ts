import {
  firstError,
  isNonEmpty,
  isPastOrTodayDate,
  trim,
  yearInRange,
  type FieldErrors,
} from "@/lib/validation/common";

export const VEHICLE_TYPES = [
  { value: "bus", label: "Bus" },
  { value: "van", label: "Van" },
  { value: "cab", label: "Cab" },
  { value: "mini_bus", label: "Mini Bus" },
] as const;

export const FUEL_TYPES = [
  { value: "diesel", label: "Diesel" },
  { value: "petrol", label: "Petrol" },
  { value: "cng", label: "CNG" },
  { value: "ev", label: "EV" },
] as const;

export type VehicleFormInput = {
  plate: string;
  vehicleType: string;
  make: string;
  model: string;
  year: string;
  fuelType: string;
  capacity: string;
  chassisNumber: string;
  engineNumber: string;
  registrationDate: string;
  odometer: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  permitExpiry: string;
};

export type ValidatedVehicle = {
  code: string;
  plate: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  capacity: number;
  chassisNumber: string;
  engineNumber: string;
  registrationDate: string | null;
  odometer: number | null;
  insuranceExpiry: string | null;
  fitnessExpiry: string | null;
  permitExpiry: string | null;
};

/** Indian plate e.g. TN09SC1102 / TN-09-SC-1102 */
const PLATE_PATTERN = /^[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,3}[-\s]?\d{1,4}$/i;
const CHASSIS_PATTERN = /^[A-HJ-NPR-Z0-9]{8,20}$/i;
const ENGINE_PATTERN = /^[A-Z0-9-]{5,25}$/i;

function normalizePlate(raw: string): string {
  return trim(raw).toUpperCase().replace(/\s+/g, "-");
}

function optionalDate(
  value: string,
  field: string,
  errors: FieldErrors,
  opts?: { pastOrToday?: boolean },
) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors[field] = "Enter a valid date.";
    return null;
  }
  if (opts?.pastOrToday && !isPastOrTodayDate(value)) {
    errors[field] = "Date cannot be in the future.";
    return null;
  }
  return value;
}

export function validateVehicleForm(raw: Partial<VehicleFormInput>): {
  ok: boolean;
  errors: FieldErrors;
  data?: ValidatedVehicle;
} {
  const errors: FieldErrors = {};
  const plate = normalizePlate(String(raw.plate ?? ""));
  const vehicleType = trim(raw.vehicleType);
  const make = trim(raw.make);
  const model = trim(raw.model);
  const yearRaw = trim(raw.year);
  const fuelType = trim(raw.fuelType);
  const capacityRaw = trim(raw.capacity);
  const chassisNumber = trim(raw.chassisNumber).toUpperCase();
  const engineNumber = trim(raw.engineNumber).toUpperCase();
  const registrationDate = trim(raw.registrationDate);
  const odometerRaw = trim(raw.odometer);
  const insuranceExpiry = trim(raw.insuranceExpiry);
  const fitnessExpiry = trim(raw.fitnessExpiry);
  const permitExpiry = trim(raw.permitExpiry);

  if (!plate) errors.plate = "Vehicle number (plate) is required.";
  else if (!PLATE_PATTERN.test(plate)) {
    errors.plate = "Use a valid plate format (e.g. TN-09-SC-1102).";
  }

  if (!vehicleType) errors.vehicleType = "Vehicle type is required.";
  else if (!VEHICLE_TYPES.some((item) => item.value === vehicleType)) {
    errors.vehicleType = "Select a valid vehicle type.";
  }

  if (!make) errors.make = "Make is required.";
  else if (make.length < 2 || make.length > 40) {
    errors.make = "Make must be 2–40 characters.";
  }

  if (!model) errors.model = "Model is required.";
  else if (model.length < 1 || model.length > 40) {
    errors.model = "Model must be 1–40 characters.";
  }

  const currentYear = new Date().getFullYear();
  const year = Number(yearRaw);
  if (!yearRaw) errors.year = "Manufacturing year is required.";
  else if (!yearInRange(year, 1990, currentYear + 1)) {
    errors.year = `Year must be between 1990 and ${currentYear + 1}.`;
  }

  if (!fuelType) errors.fuelType = "Fuel type is required.";
  else if (!FUEL_TYPES.some((item) => item.value === fuelType)) {
    errors.fuelType = "Select a valid fuel type.";
  }

  const capacity = Number(capacityRaw);
  if (!capacityRaw) errors.capacity = "Seating capacity is required.";
  else if (!Number.isInteger(capacity) || capacity < 2 || capacity > 80) {
    errors.capacity = "Capacity must be a whole number between 2 and 80.";
  }

  if (!chassisNumber) errors.chassisNumber = "Chassis number is required.";
  else if (!CHASSIS_PATTERN.test(chassisNumber)) {
    errors.chassisNumber = "Chassis number must be 8–20 letters/numbers (no I, O, Q).";
  }

  if (!engineNumber) errors.engineNumber = "Engine number is required.";
  else if (!ENGINE_PATTERN.test(engineNumber)) {
    errors.engineNumber = "Engine number must be 5–25 letters/numbers.";
  }

  const regDate = optionalDate(registrationDate, "registrationDate", errors, {
    pastOrToday: true,
  });

  let odometer: number | null = null;
  if (odometerRaw) {
    odometer = Number(odometerRaw);
    if (!Number.isFinite(odometer) || odometer < 0 || odometer > 2_000_000) {
      errors.odometer = "Odometer must be between 0 and 2,000,000 km.";
    } else if (!Number.isInteger(odometer)) {
      errors.odometer = "Odometer must be a whole number.";
    }
  }

  const insurance = optionalDate(insuranceExpiry, "insuranceExpiry", errors);
  const fitness = optionalDate(fitnessExpiry, "fitnessExpiry", errors);
  const permit = optionalDate(permitExpiry, "permitExpiry", errors);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Derive display code from plate for list compatibility
  const code = plate.replace(/-/g, "").slice(0, 12);

  return {
    ok: true,
    errors: {},
    data: {
      code,
      plate,
      vehicleType,
      make,
      model,
      year,
      fuelType,
      capacity,
      chassisNumber,
      engineNumber,
      registrationDate: regDate,
      odometer,
      insuranceExpiry: insurance,
      fitnessExpiry: fitness,
      permitExpiry: permit,
    },
  };
}

export function vehicleValidationSummary(errors: FieldErrors): string {
  return firstError(errors) ?? "Please fix the highlighted fields.";
}
