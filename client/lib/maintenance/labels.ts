import type { MaintenanceStatus, MaintenanceType, ScheduleDueStatus } from "@/lib/maintenance/types";

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  preventive: "Preventive Maintenance",
  corrective: "Corrective Maintenance",
  breakdown_repair: "Breakdown Repair",
  periodic_service: "Periodic Service",
  oil_change: "Oil Change",
  tyre_maintenance: "Tyre Maintenance",
  battery_maintenance: "Battery Maintenance",
  brake_maintenance: "Brake Maintenance",
  engine_maintenance: "Engine Maintenance",
  transmission_maintenance: "Transmission Maintenance",
  electrical_maintenance: "Electrical Maintenance",
  ac_maintenance: "AC Maintenance",
  body_repair: "Body Repair",
  accident_repair: "Accident Repair",
  inspection: "Inspection",
  other: "Other",
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  work_order_created: "Work Order Created",
  in_service: "In Service",
  waiting_for_parts: "Waiting for Parts",
  service_completed: "Service Completed",
  pending_verification: "Pending Verification",
  verified: "Verified",
  pending_payment_approval: "Pending Payment Approval",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SCHEDULE_DUE_LABELS: Record<ScheduleDueStatus, string> = {
  upcoming: "Upcoming",
  due_soon: "Due Soon",
  due: "Due",
  overdue: "Overdue",
};

export const CURRENCY_CODE = "INR";
export const CURRENCY_MINOR_PER_MAJOR = 100;
