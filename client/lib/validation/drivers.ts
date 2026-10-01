import {
  firstError,
  isEmail,
  isFutureOrTodayDate,
  isNonEmpty,
  isPastOrTodayDate,
  normalizeIndianMobile,
  trim,
  type FieldErrors,
} from "@/lib/validation/common";

export const LICENCE_TYPES = [
  { value: "LMV", label: "LMV — Light Motor Vehicle" },
  { value: "HMV", label: "HMV — Heavy Motor Vehicle" },
  { value: "HPMV", label: "HPMV — Heavy Passenger" },
  { value: "TRANSP", label: "Transport / Badge" },
] as const;

export type DriverFormInput = {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  license: string;
  licenceType: string;
  licenceExpiry: string;
  experienceYears: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  password: string;
  confirmPassword: string;
};

export type ValidatedDriver = {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string | null;
  license: string;
  licenceType: string;
  licenceExpiry: string;
  experienceYears: number;
  address: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  password: string;
};

/** Indian DL loosely: state + series + number, e.g. TN-DL-204918 or TN1420110001234 */
const LICENSE_PATTERN = /^[A-Z]{2}[-\s]?[A-Z0-9]{1,4}[-\s]?\d{4,13}$/i;

export function validateDriverForm(raw: Partial<DriverFormInput>): {
  ok: boolean;
  errors: FieldErrors;
  data?: ValidatedDriver;
} {
  const errors: FieldErrors = {};

  const name = trim(raw.name);
  const phoneRaw = trim(raw.phone);
  const email = trim(raw.email).toLowerCase();
  const dateOfBirth = trim(raw.dateOfBirth);
  const license = trim(raw.license).toUpperCase().replace(/\s+/g, "-");
  const licenceType = trim(raw.licenceType);
  const licenceExpiry = trim(raw.licenceExpiry);
  const experienceRaw = trim(raw.experienceYears);
  const address = trim(raw.address);
  const emergencyContactName = trim(raw.emergencyContactName);
  const emergencyContactPhoneRaw = trim(raw.emergencyContactPhone);
  const password = String(raw.password ?? "");
  const confirmPassword = String(raw.confirmPassword ?? "");

  const nameErr = isNonEmpty(name, "Driver name");
  if (nameErr) errors.name = nameErr;
  else if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  else if (name.length > 80) errors.name = "Name must be under 80 characters.";
  else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) {
    errors.name = "Name can only contain letters, spaces, and . ' -";
  }

  const phone = normalizeIndianMobile(phoneRaw);
  if (!phoneRaw) errors.phone = "Mobile number is required.";
  else if (!phone) errors.phone = "Enter a valid 10-digit Indian mobile (starts with 6–9).";

  if (!email) errors.email = "Email is required for driver login.";
  else if (!isEmail(email)) errors.email = "Enter a valid email address.";
  else if (email.length > 120) errors.email = "Email is too long.";

  if (dateOfBirth) {
    if (!isPastOrTodayDate(dateOfBirth)) {
      errors.dateOfBirth = "Date of birth must be a valid past date.";
    } else {
      const born = new Date(`${dateOfBirth}T00:00:00`);
      const age =
        (Date.now() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 18) errors.dateOfBirth = "Driver must be at least 18 years old.";
      if (age > 75) errors.dateOfBirth = "Please verify date of birth.";
    }
  }

  if (!license) errors.license = "Driving licence number is required.";
  else if (license.length < 8 || license.length > 20) {
    errors.license = "Licence number looks invalid (8–20 characters).";
  } else if (!LICENSE_PATTERN.test(license)) {
    errors.license = "Use a valid licence format (e.g. TN-DL-204918).";
  }

  if (!licenceType) errors.licenceType = "Licence type is required.";
  else if (!LICENCE_TYPES.some((item) => item.value === licenceType)) {
    errors.licenceType = "Select a valid licence type.";
  }

  if (!licenceExpiry) errors.licenceExpiry = "Licence expiry date is required.";
  else if (!isFutureOrTodayDate(licenceExpiry)) {
    errors.licenceExpiry = "Licence expiry must be today or a future date.";
  }

  if (!experienceRaw) errors.experienceYears = "Experience is required.";
  else {
    const years = Number(experienceRaw);
    if (!Number.isFinite(years) || years < 0 || years > 50 || !Number.isInteger(years)) {
      errors.experienceYears = "Enter experience in whole years (0–50).";
    }
  }

  if (!address) errors.address = "Address is required.";
  else if (address.length < 5) errors.address = "Address must be at least 5 characters.";
  else if (address.length > 200) errors.address = "Address must be under 200 characters.";

  if (emergencyContactName && emergencyContactName.length < 2) {
    errors.emergencyContactName = "Emergency contact name is too short.";
  }

  let emergencyPhone: string | null = null;
  if (emergencyContactPhoneRaw) {
    emergencyPhone = normalizeIndianMobile(emergencyContactPhoneRaw);
    if (!emergencyPhone) {
      errors.emergencyContactPhone = "Enter a valid emergency mobile number.";
    } else if (phone && emergencyPhone === phone) {
      errors.emergencyContactPhone = "Emergency number must differ from driver mobile.";
    }
  }

  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  else if (password.length > 64) errors.password = "Password must be under 64 characters.";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Password must include at least one letter and one number.";
  }

  if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: {},
    data: {
      name,
      phone: phone!,
      email,
      dateOfBirth: dateOfBirth || null,
      license,
      licenceType,
      licenceExpiry,
      experienceYears: Number(experienceRaw),
      address,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyPhone,
      password,
    },
  };
}

export function driverValidationSummary(errors: FieldErrors): string {
  return firstError(errors) ?? "Please fix the highlighted fields.";
}
