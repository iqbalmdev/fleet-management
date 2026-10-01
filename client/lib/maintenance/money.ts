import { CURRENCY_MINOR_PER_MAJOR } from "@/lib/maintenance/labels";
import type { MoneyMinor } from "@/lib/maintenance/types";

/** Convert rupees (major) to paise (minor). Rejects non-finite input. */
export function rupeesToMinor(rupees: number): MoneyMinor {
  if (!Number.isFinite(rupees)) {
    throw new Error("Invalid money amount");
  }
  return Math.round(rupees * CURRENCY_MINOR_PER_MAJOR);
}

export function minorToRupees(minor: MoneyMinor): number {
  return minor / CURRENCY_MINOR_PER_MAJOR;
}

/** Format paise as Indian rupee display string, e.g. ₹5,000.00 */
export function formatMoneyMinor(minor: MoneyMinor | null | undefined): string {
  const value = (minor ?? 0) / CURRENCY_MINOR_PER_MAJOR;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function assertNonNegativeMoney(minor: MoneyMinor, label: string): void {
  if (!Number.isInteger(minor) || minor < 0) {
    throw new Error(`${label} must be a non-negative whole number of paise.`);
  }
}

/** subtotal = qty × unit; total = subtotal + tax − discount */
export function calculatePartTotalMinor(input: {
  quantity: number;
  unitPriceMinor: MoneyMinor;
  taxMinor: MoneyMinor;
  discountMinor: MoneyMinor;
}): MoneyMinor {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("Part quantity must be greater than zero.");
  }
  assertNonNegativeMoney(input.unitPriceMinor, "Unit price");
  assertNonNegativeMoney(input.taxMinor, "Tax");
  assertNonNegativeMoney(input.discountMinor, "Discount");

  const subtotal = Math.round(input.quantity * input.unitPriceMinor);
  const total = subtotal + input.taxMinor - input.discountMinor;
  if (total < 0) {
    throw new Error("Part total cannot be negative after discount.");
  }
  return total;
}

export function calculateMaintenanceTotalMinor(input: {
  partsCostMinor: MoneyMinor;
  labourCostMinor: MoneyMinor;
  otherCostMinor: MoneyMinor;
  taxMinor: MoneyMinor;
  discountMinor: MoneyMinor;
}): MoneyMinor {
  assertNonNegativeMoney(input.partsCostMinor, "Parts cost");
  assertNonNegativeMoney(input.labourCostMinor, "Labour cost");
  assertNonNegativeMoney(input.otherCostMinor, "Other cost");
  assertNonNegativeMoney(input.taxMinor, "Tax");
  assertNonNegativeMoney(input.discountMinor, "Discount");

  const total =
    input.partsCostMinor +
    input.labourCostMinor +
    input.otherCostMinor +
    input.taxMinor -
    input.discountMinor;

  if (total < 0) {
    throw new Error("Maintenance total cannot be negative after discount.");
  }
  return total;
}

export function costVarianceMinor(
  estimatedMinor: MoneyMinor,
  actualMinor: MoneyMinor,
): MoneyMinor {
  return actualMinor - estimatedMinor;
}
