# Routewise database design (MongoDB)

**Status:** Phase 1 — schema design (in review)  
**Database name (planned):** `routewise`  
**Hosting (planned):** MongoDB Atlas — one shared cluster, multi-tenant  

This folder is the **source of truth** for data shapes before API or UI wiring.

| Doc | Purpose |
|-----|---------|
| [glossary.md](./glossary.md) | Domain terms + roles + shared enums |
| [collections.md](./collections.md) | Fields, enums, embed vs ref per collection |
| [indexes.md](./indexes.md) | Required indexes (`organizationId` first) |
| [erd.md](./erd.md) | Relationship diagram |

---

## Multi-tenancy

- One product serves many **organizations** (schools, colleges, travel companies, fleets, etc.).
- Web/API **routes are the same** for every organization.
- Isolation is by **`organizationId`** on every business document + enforcement in the API.
- Never query tenant data without `organizationId`.
- Organization **`type`** (`school` \| `college` \| `travel` \| `fleet` \| `other`) describes the customer—it does **not** create separate databases or route trees.

See also: [glossary.md](./glossary.md).

---

## Base fields (all business collections except where noted)

| Field | Type | Notes |
|-------|------|--------|
| `_id` | ObjectId | Primary key |
| `organizationId` | ObjectId | Tenant key (**required**). Omitted only on platform-global docs (none in MVP). |
| `createdAt` | Date | Set on insert |
| `updatedAt` | Date | Set on every update |
| `createdBy` | ObjectId \| null | `users._id` |
| `updatedBy` | ObjectId \| null | `users._id` |
| `deletedAt` | Date \| null | Soft delete; queries default to `deletedAt: null` |
| `version` | number | Optimistic concurrency where needed (default `1`) |
| `idempotencyKey` | string \| null | Reserved for mobile offline sync |

`organizations` is the tenant root: its `_id` is used as `organizationId` elsewhere; it does **not** carry `organizationId` on itself.

`audit_logs` are append-only: no `updatedAt` / soft delete updates in normal flows.

---

## Modeling rules

1. **Embed** small, owned, co-loaded data (e.g. route stops, inspection checklist lines).
2. **Reference** entities that grow without bound or are shared (trips, fuel, vehicles).
3. **Money** stored as integer **minor units** (paise) + `currency` (`INR`).
4. **Files** live in object storage; Mongo stores metadata + `storageKey` / URL only.
5. **Soft delete** by default; hard delete only via admin tooling / retention jobs later.

---

## SOLID / code layout (for later phases)

```
API controllers  →  domain services  →  repository ports  →  Mongo adapters
```

- One repository module per aggregate/collection family.
- Controllers never build raw Mongo filters without injecting `organizationId` from the auth context.
- Zod (or Mongoose) schemas will mirror [collections.md](./collections.md).

---

## SDLC phases (database-related)

| Phase | Work |
|-------|------|
| **1 (this folder)** | Schema docs + review freeze |
| **2** | API DTOs / OpenAPI mapped to collections |
| **3** | Auth, invites, RBAC, `organizationId` middleware |
| **4** | CRUD: organizations, users, vehicles, drivers, assignments |
| **5** | Ops: routes, trips, inspections, maintenance, fuel, docs, bills |
| **6** | Driver mobile against same collections |
| **7** | Reports, aggregations, index tuning, archival |

**Do not create Atlas collections until this design is reviewed.** After approval: create DB → apply [indexes.md](./indexes.md) → optional collection validators.

---

## MVP collection implement order

1. `organizations`, `users`, `invites`, `audit_logs`  
2. `vehicles`, `drivers`, `route_assignments`  
3. `routes`, `trips`  
4. `inspections`, `work_orders`  
5. `fuel_entries`, `expense_claims`, `bill_sanctions`  
6. `documents`, `notifications`  

Optional later: `vendors`, `report_snapshots`, `outbox`.

---

## Mapping from current prototype

| Prototype / UI sample | Collection |
|-----------------------|------------|
| Organization / `orgId` | `organizations` / `organizationId` |
| Admin / driver login users | `users` |
| Drivers page | `drivers` |
| Vehicles page | `vehicles` |
| Routes & assignments + map | `routes`, `route_assignments` |
| Trips | `trips` |
| Inspections | `inspections` |
| Maintenance | `work_orders` (+ history from closed orders) |
| Fuel & expenses | `fuel_entries`, `expense_claims` |
| Bill sanction | `bill_sanctions` |
| Documents | `documents` |
| Notifications | `notifications` |

---

## Review checklist before freeze

- [ ] Every tenant collection has `organizationId` + soft delete policy  
- [ ] Organization `type` includes school / college / travel / fleet / other  
- [ ] Enums match [glossary.md](./glossary.md)  
- [ ] Indexes listed in [indexes.md](./indexes.md)  
- [ ] No unbounded arrays on hot documents  
- [ ] Money uses minor units  
- [ ] File binaries not stored in Mongo  
