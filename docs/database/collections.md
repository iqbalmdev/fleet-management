# Collections

Field types use TypeScript-ish notation.  
`ObjectId` = MongoDB ObjectId. Dates are UTC `Date`.  
Unless noted, every collection includes [base fields](./README.md#base-fields-all-business-collections-except-where-noted).

Legend: **R** = required on create · **E** = embedded · **Ref** = reference by id

---

## 1. `organizations` (tenant root)

No `organizationId` field — `_id` **is** the tenant id.

| Field | Type | | Notes |
|-------|------|-|-------|
| `name` | string | R | Display name |
| `code` | string | R | Short code, unique globally (e.g. `ORG-1001`) |
| `type` | `"school" \| "college" \| "travel" \| "fleet" \| "other"` | R | What kind of org (not a separate DB) |
| `timezone` | string | R | Default `Asia/Kolkata` |
| `currency` | string | R | Default `INR` |
| `status` | organization status enum | R | See glossary |
| `createdAt` / `updatedAt` | Date | R | |
| `deletedAt` | Date \| null | | Soft delete |

---

## 2. `users`

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | Ref → `organizations` |
| `email` | string | R | Unique per organization |
| `passwordHash` | string | R | Never store plaintext |
| `fullName` | string | R | |
| `mobile` | string \| null | | |
| `designation` | string \| null | | |
| `role` | `"admin" \| "dispatcher" \| "driver" \| "finance"` | R | |
| `status` | user status enum | R | |
| `driverProfileId` | ObjectId \| null | | Ref → `drivers` when role is driver |
| `lastLoginAt` | Date \| null | | |

**Unique:** `(organizationId, email)` where `deletedAt` is null.

---

## 3. `invites`

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `email` | string | R | |
| `role` | role enum | R | Same as users |
| `tokenHash` | string | R | Store hash only |
| `expiresAt` | Date | R | |
| `acceptedAt` | Date \| null | | |
| `invitedBy` | ObjectId | R | Ref → `users` |

---

## 4. `audit_logs` (append-only)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `actorUserId` | ObjectId \| null | | System actions may be null |
| `action` | string | R | e.g. `vehicle.create` |
| `entityType` | string | R | e.g. `vehicles` |
| `entityId` | ObjectId \| null | | |
| `before` | object \| null | | Redact secrets |
| `after` | object \| null | | Redact secrets |
| `ip` | string \| null | | |
| `createdAt` | Date | R | No updates |

Do not soft-delete audit rows in MVP.

---

## 5. `vehicles` (M1)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `code` | string | R | e.g. `BUS-01` |
| `plate` | string | R | |
| `type` | string | R | e.g. `school_bus`, `staff_van` |
| `capacity` | number | R | Seats |
| `status` | vehicle status enum | R | |
| `notes` | string \| null | | |

**Unique:** `(organizationId, code)`, `(organizationId, plate)` where not deleted.

---

## 6. `drivers` (M2)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `userId` | ObjectId \| null | | Ref → `users` (login link) |
| `name` | string | R | |
| `phone` | string | R | |
| `email` | string \| null | | |
| `licenseNumber` | string | R | |
| `licenseExpiresOn` | Date \| null | | |
| `status` | driver status enum | R | |
| `notes` | string \| null | | |

**Unique:** `(organizationId, licenseNumber)` where not deleted.

---

## 7. `routes` (M3) — **embed stops**

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `name` | string | R | e.g. Zone A Morning |
| `shift` | object **E** | R | `{ start: "06:30", end: "08:10" }` (local time strings) |
| `stops` | Stop[] **E** | R | Ordered; max ~50 recommended |
| `status` | `"active" \| "inactive"` | R | |

### Embedded `Stop`

| Field | Type | | Notes |
|-------|------|-|-------|
| `id` | string | R | Stable id within route (uuid) |
| `seq` | number | R | 1-based order |
| `name` | string | R | |
| `lat` | number \| null | | Optional for map |
| `lng` | number \| null | | |
| `windowStart` | string \| null | | Local time |
| `windowEnd` | string \| null | | |

---

## 8. `route_assignments` (M3)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `routeId` | ObjectId | R | Ref → `routes` |
| `vehicleId` | ObjectId \| null | | Ref → `vehicles` |
| `driverId` | ObjectId \| null | | Ref → `drivers` |
| `effectiveFrom` | Date | R | |
| `effectiveTo` | Date \| null | | Null = open-ended |
| `status` | assignment status enum | R | |

---

## 9. `trips` (M3 execution)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `routeId` | ObjectId | R | |
| `routeAssignmentId` | ObjectId \| null | | |
| `vehicleId` | ObjectId | R | |
| `driverId` | ObjectId | R | |
| `serviceDate` | string | R | `YYYY-MM-DD` in organization timezone |
| `status` | trip status enum | R | |
| `timestamps` | object **E** | | `{ scheduledStart, startedAt, completedAt }` Dates \| null |
| `delayMinutes` | number \| null | | |
| `notes` | string \| null | | |

---

## 10. `inspections` (M4)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `vehicleId` | ObjectId | R | |
| `tripId` | ObjectId \| null | | |
| `driverId` | ObjectId \| null | | Who performed |
| `inspectorName` | string \| null | | Free text if not a user |
| `type` | `"pre_trip" \| "weekly" \| "fitness" \| "safety_audit"` | R | |
| `result` | inspection result enum | R | |
| `inspectedAt` | Date | R | |
| `checklist` | ChecklistItem[] **E** | R | |
| `defects` | Defect[] **E** | | |

### Embedded `ChecklistItem`

| Field | Type |
|-------|------|
| `key` | string |
| `label` | string |
| `ok` | boolean |
| `note` | string \| null |

### Embedded `Defect`

| Field | Type |
|-------|------|
| `code` | string \| null |
| `description` | string |
| `severity` | `"low" \| "medium" \| "high" \| "critical"` |

---

## 11. `work_orders` (M5)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `vehicleId` | ObjectId | R | |
| `title` | string | R | Issue summary |
| `description` | string \| null | | |
| `workshop` | string \| null | | Free text vendor name (MVP) |
| `vendorId` | ObjectId \| null | | Future `vendors` ref |
| `priority` | `"pending" \| "in_progress" \| "critical" \| "closed" \| "cancelled"` | R | Aligns with UI |
| `dueOn` | Date \| null | | |
| `completedAt` | Date \| null | | |
| `costMinor` | number \| null | | Paise |
| `currency` | string | | Default organization currency |

Closed work orders **are** the service history source; driver “past service history” reads `priority: closed` (or `completedAt != null`) filtered by `vehicleId`.

---

## 12. `fuel_entries` (M6)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `vehicleId` | ObjectId | R | |
| `driverId` | ObjectId \| null | | Who logged |
| `filledOn` | Date | R | |
| `station` | string \| null | | |
| `fuelType` | `"diesel" \| "petrol" \| "cng" \| "other"` | R | |
| `litres` | number \| null | | |
| `amountMinor` | number | R | Paise |
| `currency` | string | R | |
| `odometer` | number \| null | | |
| `status` | fuel/expense status enum | R | |
| `receipt` | FileRef **E** \| null | | |

### Embedded `FileRef`

| Field | Type |
|-------|------|
| `storageKey` | string |
| `fileName` | string |
| `mimeType` | string |
| `sizeBytes` | number |

---

## 13. `expense_claims` (M6)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `driverId` | ObjectId | R | |
| `vehicleId` | ObjectId \| null | | |
| `claimDate` | Date | R | |
| `type` | `"toll" \| "parking" \| "meal" \| "other"` | R | |
| `note` | string \| null | | |
| `amountMinor` | number | R | |
| `currency` | string | R | |
| `status` | fuel/expense status enum | R | |
| `receipt` | FileRef **E** \| null | | |

---

## 14. `bill_sanctions` (M6 finance)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `title` | string | R | |
| `vendorName` | string | R | |
| `vehicleId` | ObjectId \| null | | |
| `workOrderId` | ObjectId \| null | | |
| `amountMinor` | number | R | |
| `currency` | string | R | |
| `status` | bill status enum | R | |
| `decidedAt` | Date \| null | | |
| `decidedBy` | ObjectId \| null | | Ref → `users` |
| `notes` | string \| null | | |

---

## 15. `documents` (M7)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `title` | string | R | |
| `category` | `"vehicle" \| "driver" \| "ops"` | R | |
| `ownerType` | `"vehicle" \| "driver" \| "organization" \| "route"` | R | |
| `ownerId` | ObjectId \| null | | Id of owner entity |
| `expiresOn` | Date \| null | | |
| `status` | document status enum | R | |
| `file` | FileRef **E** \| null | | |

---

## 16. `notifications` (M8)

| Field | Type | | Notes |
|-------|------|-|-------|
| `organizationId` | ObjectId | R | |
| `userId` | ObjectId \| null | | Null = role broadcast |
| `role` | role enum \| null | | Target role if no userId |
| `title` | string | R | |
| `body` | string | R | |
| `severity` | `"info" \| "warning" \| "critical" \| "success"` | R | |
| `status` | notification status enum | R | |
| `entityType` | string \| null | | Deep link hint |
| `entityId` | ObjectId \| null | | |
| `readAt` | Date \| null | | |

---

## Optional (not MVP freeze)

| Collection | When |
|------------|------|
| `vendors` | When workshops need shared master data |
| `report_snapshots` | Cached dashboard aggregates |
| `outbox` | Reliable email/push dispatch |

---

## Embed vs ref summary

| Data | Choice | Why |
|------|--------|-----|
| Route stops | Embed | Small, owned by route, always loaded together |
| Inspection checklist / defects | Embed | Belong to one inspection |
| File metadata | Embed | Tiny; binary elsewhere |
| Vehicle / driver on trip | Ref | Shared, many trips |
| Fuel history on vehicle | Separate collection | Unbounded growth |
| Service history | Derived from closed `work_orders` | Avoid duplicate source of truth |
