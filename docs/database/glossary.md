# Routewise — Domain glossary & roles

Aligned to the [Routewise fleet blueprint](https://schoolfeet.vercel.app/).  
This is the shared language for schema, API, and UI work.

---

## Product terms

| Term | Meaning |
|------|---------|
| **Organization (tenant)** | One customer account using Routewise. All operational data belongs to exactly one organization. |
| **organizationId** | Tenant key on every business document. Required on every query and write. |
| **Organization type** | What kind of fleet the org runs: `school`, `travel`, `college`, `fleet`, or `other`. |
| **Staff user** | Anyone who can sign in (admin, dispatcher, driver, finance). Stored in `users`. |
| **Driver profile** | Operational record for a driver (license, phone, compliance). May link to a `users` login via `userId`. |
| **Vehicle** | Bus/van in the fleet registry (code, plate, capacity, status). |
| **Route** | Planned path with ordered stops and a typical shift window. |
| **Route assignment** | Binding of route + vehicle + driver for a period or pattern. |
| **Trip** | One executed run of a route on a service date (live/completed/cancelled). |
| **Inspection** | Pre-trip or scheduled check with checklist results and defects. |
| **Work order** | Maintenance job (issue, workshop, priority, status). |
| **Service history** | Closed maintenance outcomes for a vehicle (from completed work orders). |
| **Fuel entry** | Fuel fill-up or related fuel cost for a vehicle. |
| **Expense claim** | Driver/staff out-of-pocket claim (toll, parking, etc.). |
| **Bill sanction** | Vendor bill awaiting approval/rejection. |
| **Document** | Compliance file metadata (insurance, RC, license) + storage pointer. |
| **Notification** | In-app alert for a user or role within an organization. |
| **Audit log** | Append-only record of who changed what, when. |

---

## Organization types

Every organization has exactly one `type`. This drives labeling and future feature flags—not separate databases.

| Type | Meaning | Example |
|------|---------|---------|
| `school` | K–12 / school transport | Greenfield Public School |
| `college` | College / university campus fleet | City Engineering College |
| `travel` | Travel / tour operator | South Tours Pvt Ltd |
| `fleet` | General commercial / staff fleet | Acme Logistics |
| `other` | Catch-all when none of the above fit | Custom ops |

Modules (routes, vehicles, drivers, etc.) are the same across types for MVP. Type is stored on `organizations` and returned in session for UI copy (“School fleet” vs “Travel fleet”).

---

## Roles (RBAC)

| Role | Primary job | Typical modules |
|------|-------------|-----------------|
| **admin** | Owns setup, approvals, compliance, reporting | All modules; user invites; settings |
| **dispatcher** | Daily board: routes, assignments, exceptions, trips | Routes, trips, inspections overview, alerts |
| **driver** | Executes trips; inspections; fuel/expense submissions | Own assignments, inspections, fuel, claims, vehicle alerts/history |
| **finance** | Spend review, bill sanctions, reconciliations | Fuel, expenses, bills, reports |

### Access rules (MVP)

1. Every authenticated request resolves `userId`, `role`, `organizationId` (and org `type`).
2. Data access is always filtered by `organizationId`.
3. Drivers additionally filter by their `driverId` for “my” resources where applicable.
4. Cross-organization access is never allowed via the public API.

---

## Status vocabulary (shared enums)

Use these exact values in schemas and APIs unless a migration note says otherwise.

| Domain | Values |
|--------|--------|
| Organization | `active`, `suspended`, `trial` |
| Organization type | `school`, `college`, `travel`, `fleet`, `other` |
| User | `active`, `invited`, `disabled` |
| Vehicle | `available`, `on_trip`, `maintenance`, `retired` |
| Driver profile | `available`, `on_duty`, `off_duty`, `compliance_due` |
| Route | `active`, `inactive` |
| Route assignment | `scheduled`, `active`, `ended` |
| Trip | `scheduled`, `live`, `delayed`, `completed`, `cancelled` |
| Inspection | `passed`, `failed`, `pending`, `overdue` |
| Work order | `pending`, `in_progress`, `critical`, `closed`, `cancelled` |
| Fuel / expense | `draft`, `submitted`, `posted`, `review`, `approved`, `rejected`, `paid` |
| Bill sanction | `pending`, `approved`, `rejected` |
| Document | `valid`, `expiring`, `expired`, `missing_scan` |
| Notification | `unread`, `read`, `archived` |

---

## Out of MVP (do not model as core tables yet)

GPS live telematics streams · parent portal · payroll · predictive ML · marketplace.  
Reserve optional future fields only where noted in [collections.md](./collections.md).
