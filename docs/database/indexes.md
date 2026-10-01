# Indexes

All tenant queries **must** include `organizationId`.  
Compound indexes put `organizationId` first unless noted.

Convention: partial filter `deletedAt: null` where soft delete applies (create as partial unique indexes in Atlas/migration).

---

## `organizations`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `organizations_code_unique` | `{ code: 1 }` | yes | Global org codes |
| `organizations_status` | `{ status: 1 }` | no | Admin ops |
| `organizations_type` | `{ type: 1 }` | no | Filter by school/college/travel/fleet |

---

## `users`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `users_org_email` | `{ organizationId: 1, email: 1 }` | yes | Partial: not deleted |
| `users_org_role` | `{ organizationId: 1, role: 1 }` | no | |
| `users_org_driver_profile` | `{ organizationId: 1, driverProfileId: 1 }` | no | Sparse |

---

## `invites`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `invites_token_hash` | `{ tokenHash: 1 }` | yes | Lookup on accept |
| `invites_org_email` | `{ organizationId: 1, email: 1 }` | no | |
| `invites_expires` | `{ expiresAt: 1 }` | no | Cleanup job |

---

## `audit_logs`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `audit_org_created` | `{ organizationId: 1, createdAt: -1 }` | no | Timeline |
| `audit_org_entity` | `{ organizationId: 1, entityType: 1, entityId: 1, createdAt: -1 }` | no | Entity history |

---

## `vehicles`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `vehicles_org_code` | `{ organizationId: 1, code: 1 }` | yes | Partial: not deleted |
| `vehicles_org_plate` | `{ organizationId: 1, plate: 1 }` | yes | Partial: not deleted |
| `vehicles_org_status` | `{ organizationId: 1, status: 1 }` | no | |

---

## `drivers`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `drivers_org_license` | `{ organizationId: 1, licenseNumber: 1 }` | yes | Partial: not deleted |
| `drivers_org_user` | `{ organizationId: 1, userId: 1 }` | no | Sparse |
| `drivers_org_status` | `{ organizationId: 1, status: 1 }` | no | |

---

## `routes`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `routes_org_name` | `{ organizationId: 1, name: 1 }` | yes | Partial: not deleted |
| `routes_org_status` | `{ organizationId: 1, status: 1 }` | no | |

---

## `route_assignments`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `ra_org_route` | `{ organizationId: 1, routeId: 1, status: 1 }` | no | |
| `ra_org_driver` | `{ organizationId: 1, driverId: 1, status: 1 }` | no | Driver “my routes” |
| `ra_org_vehicle` | `{ organizationId: 1, vehicleId: 1, status: 1 }` | no | |

---

## `trips`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `trips_org_date_status` | `{ organizationId: 1, serviceDate: -1, status: 1 }` | no | Dispatch board |
| `trips_org_driver_date` | `{ organizationId: 1, driverId: 1, serviceDate: -1 }` | no | Driver day view |
| `trips_org_vehicle_date` | `{ organizationId: 1, vehicleId: 1, serviceDate: -1 }` | no | |
| `trips_org_route_date` | `{ organizationId: 1, routeId: 1, serviceDate: -1 }` | no | |

Optional uniqueness later: `(organizationId, routeId, vehicleId, serviceDate)` if business rules require one trip per combo.

---

## `inspections`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `insp_org_vehicle_time` | `{ organizationId: 1, vehicleId: 1, inspectedAt: -1 }` | no | |
| `insp_org_result` | `{ organizationId: 1, result: 1, inspectedAt: -1 }` | no | |
| `insp_org_trip` | `{ organizationId: 1, tripId: 1 }` | no | Sparse |

---

## `work_orders`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `wo_org_priority` | `{ organizationId: 1, priority: 1, dueOn: 1 }` | no | Board |
| `wo_org_vehicle` | `{ organizationId: 1, vehicleId: 1, completedAt: -1 }` | no | Service history |

---

## `fuel_entries`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `fuel_org_filled` | `{ organizationId: 1, filledOn: -1 }` | no | |
| `fuel_org_vehicle` | `{ organizationId: 1, vehicleId: 1, filledOn: -1 }` | no | |
| `fuel_org_status` | `{ organizationId: 1, status: 1 }` | no | |

---

## `expense_claims`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `exp_org_driver_date` | `{ organizationId: 1, driverId: 1, claimDate: -1 }` | no | |
| `exp_org_status` | `{ organizationId: 1, status: 1 }` | no | |

---

## `bill_sanctions`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `bills_org_status` | `{ organizationId: 1, status: 1, createdAt: -1 }` | no | |
| `bills_org_vehicle` | `{ organizationId: 1, vehicleId: 1 }` | no | Sparse |

---

## `documents`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `docs_org_status_expiry` | `{ organizationId: 1, status: 1, expiresOn: 1 }` | no | Reminders |
| `docs_org_owner` | `{ organizationId: 1, ownerType: 1, ownerId: 1 }` | no | |

---

## `notifications`

| Name | Keys | Unique | Notes |
|------|------|--------|-------|
| `notif_org_user_status` | `{ organizationId: 1, userId: 1, status: 1, createdAt: -1 }` | no | Inbox |
| `notif_org_role_status` | `{ organizationId: 1, role: 1, status: 1, createdAt: -1 }` | no | Sparse on role |

---

## Migration note

Create indexes via a versioned script (e.g. `server/scripts/ensure-indexes.ts`) so local and Atlas stay aligned. Do not rely on “indexes appear somehow in production.”
