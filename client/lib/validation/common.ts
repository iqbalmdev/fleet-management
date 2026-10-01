/** Shared validation helpers for FleetCare forms (HTML + JS + store layers). */

export type FieldErrors = Record<string, string>;

export function trim(value: unknown): string {
  return String(value ?? "").trim();
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isNonEmpty(value: string, label: string): string | null {
  if (!value) return `${label} is required.`;
  return null;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Indian mobile: 10 digits starting 6–9, optional +91 / 0 prefix */
export function normalizeIndianMobile(raw: string): string | null {
  let digits = digitsOnly(raw);
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

export function isFutureOrTodayDate(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

export function isPastOrTodayDate(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d.getTime() <= today.getTime();
}

export function yearInRange(year: number, min: number, max: number): boolean {
  return Number.isInteger(year) && year >= min && year <= max;
}

export function firstError(errors: FieldErrors): string | null {
  const key = Object.keys(errors)[0];
  return key ? errors[key] : null;
}
