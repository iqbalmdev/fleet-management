# Entity relationships (ERD)

Multi-tenant: almost every node hangs under **Organization**.  
`organizations.type`: `school` | `college` | `travel` | `fleet` | `other`.  
Solid lines = reference by ObjectId. Embedded structures are noted in field names.

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : has
    ORGANIZATIONS ||--o{ INVITES : has
    ORGANIZATIONS ||--o{ AUDIT_LOGS : has
    ORGANIZATIONS ||--o{ VEHICLES : has
    ORGANIZATIONS ||--o{ DRIVERS : has
    ORGANIZATIONS ||--o{ ROUTES : has
    ORGANIZATIONS ||--o{ ROUTE_ASSIGNMENTS : has
    ORGANIZATIONS ||--o{ TRIPS : has
    ORGANIZATIONS ||--o{ INSPECTIONS : has
    ORGANIZATIONS ||--o{ WORK_ORDERS : has
    ORGANIZATIONS ||--o{ FUEL_ENTRIES : has
    ORGANIZATIONS ||--o{ EXPENSE_CLAIMS : has
    ORGANIZATIONS ||--o{ BILL_SANCTIONS : has
    ORGANIZATIONS ||--o{ DOCUMENTS : has
    ORGANIZATIONS ||--o{ NOTIFICATIONS : has

    USERS ||--o| DRIVERS : driverProfileId
    DRIVERS ||--o| USERS : userId

    ROUTES ||--o{ ROUTE_ASSIGNMENTS : routeId
    VEHICLES ||--o{ ROUTE_ASSIGNMENTS : vehicleId
    DRIVERS ||--o{ ROUTE_ASSIGNMENTS : driverId

    ROUTES ||--o{ TRIPS : routeId
    VEHICLES ||--o{ TRIPS : vehicleId
    DRIVERS ||--o{ TRIPS : driverId
    ROUTE_ASSIGNMENTS ||--o{ TRIPS : routeAssignmentId

    VEHICLES ||--o{ INSPECTIONS : vehicleId
    TRIPS ||--o{ INSPECTIONS : tripId
    DRIVERS ||--o{ INSPECTIONS : driverId

    VEHICLES ||--o{ WORK_ORDERS : vehicleId
    WORK_ORDERS ||--o{ BILL_SANCTIONS : workOrderId

    VEHICLES ||--o{ FUEL_ENTRIES : vehicleId
    DRIVERS ||--o{ FUEL_ENTRIES : driverId

    DRIVERS ||--o{ EXPENSE_CLAIMS : driverId
    VEHICLES ||--o{ EXPENSE_CLAIMS : vehicleId

    VEHICLES ||--o{ BILL_SANCTIONS : vehicleId
    USERS ||--o{ BILL_SANCTIONS : decidedBy

    USERS ||--o{ NOTIFICATIONS : userId

    ORGANIZATIONS {
        ObjectId id PK
        string code UK
        string name
        string type
        string status
    }

    USERS {
        ObjectId id PK
        ObjectId organizationId FK
        string email
        string role
    }

    DRIVERS {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId userId FK
        string licenseNumber
    }

    VEHICLES {
        ObjectId id PK
        ObjectId organizationId FK
        string code
        string plate
    }

    ROUTES {
        ObjectId id PK
        ObjectId organizationId FK
        array stops_embedded
        object shift_embedded
        string name
    }

    ROUTE_ASSIGNMENTS {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId routeId FK
        ObjectId vehicleId FK
        ObjectId driverId FK
    }

    TRIPS {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId routeId FK
        ObjectId vehicleId FK
        ObjectId driverId FK
        ObjectId routeAssignmentId FK
        object timestamps_embedded
        string serviceDate
        string status
    }

    INSPECTIONS {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId vehicleId FK
        ObjectId tripId FK
        ObjectId driverId FK
        array checklist_embedded
        array defects_embedded
    }

    WORK_ORDERS {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId vehicleId FK
        string priority
    }

    FUEL_ENTRIES {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId vehicleId FK
        ObjectId driverId FK
        object receipt_embedded
        number amountMinor
    }

    EXPENSE_CLAIMS {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId driverId FK
        ObjectId vehicleId FK
        object receipt_embedded
        number amountMinor
    }

    BILL_SANCTIONS {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId vehicleId FK
        ObjectId workOrderId FK
        ObjectId decidedBy FK
        string status
        number amountMinor
    }

    DOCUMENTS {
        ObjectId id PK
        ObjectId organizationId FK
        string ownerType
        ObjectId ownerId FK
        object file_embedded
    }

    NOTIFICATIONS {
        ObjectId id PK
        ObjectId organizationId FK
        ObjectId userId FK
        string severity
    }

    INVITES {
        ObjectId id PK
        ObjectId organizationId FK
        string email
        string role
    }

    AUDIT_LOGS {
        ObjectId id PK
        ObjectId organizationId FK
        string action
        string entityType
        object before_snapshot
        object after_snapshot
    }
```

---

## Aggregate boundaries (DDD-style)

| Aggregate | Root collection | Embedded |
|-----------|-----------------|----------|
| Organization | `organizations` | — |
| Identity | `users`, `invites` | — |
| Fleet asset | `vehicles` | — |
| Driver profile | `drivers` | — |
| Route plan | `routes` | `stops`, `shift` |
| Assignment | `route_assignments` | — |
| Trip execution | `trips` | `timestamps` |
| Inspection | `inspections` | `checklist`, `defects` |
| Maintenance | `work_orders` | — |
| Fuel | `fuel_entries` | `receipt` |
| Expense | `expense_claims` | `receipt` |
| Bill | `bill_sanctions` | — |
| Document | `documents` | `file` |
| Notification | `notifications` | — |
| Audit | `audit_logs` | snapshots in `before`/`after` |

---

## Daily operations flow

```mermaid
flowchart LR
  route[Route_plan]
  assign[Route_assignment]
  trip[Trip_today]
  insp[Inspection]
  run[Trip_live_to_completed]
  maint[Work_order_if_defect]
  route --> assign --> trip --> insp --> run
  insp -->|failed| maint
```
