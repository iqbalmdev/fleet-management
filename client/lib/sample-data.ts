export const sampleDrivers = [
  { name: "Karthik R", license: "TN-DL-204918", phone: "+91 98765 00001", vehicle: "BUS-01", status: "On duty" as const },
  { name: "Meena S", license: "TN-DL-118204", phone: "+91 98765 04421", vehicle: "VAN-04", status: "Available" as const },
  { name: "Suresh K", license: "TN-DL-550291", phone: "+91 98765 09118", vehicle: "BUS-07", status: "License due" as const },
  { name: "Arun P", license: "TN-DL-991203", phone: "+91 98765 07710", vehicle: "—", status: "Off duty" as const },
];

export const sampleVehicles = [
  { code: "BUS-01", plate: "TN-30-AB-1234", type: "School bus", capacity: 42, driver: "Karthik R", status: "On trip" as const },
  { code: "BUS-07", plate: "TN-09-SC-1102", type: "School bus", capacity: 36, driver: "Suresh K", status: "Available" as const },
  { code: "VAN-04", plate: "TN-30-CD-5678", type: "Staff van", capacity: 12, driver: "Meena S", status: "Service due" as const },
  { code: "BUS-12", plate: "TN-22-FL-9081", type: "School bus", capacity: 48, driver: "—", status: "Maintenance" as const },
];

export const sampleRoutes = [
  { route: "Zone A Morning", shift: "06:30–08:10", stops: "12", status: "Live" as const },
  { route: "Campus Express", shift: "07:00–08:00", stops: "6", status: "Scheduled" as const },
  { route: "Zone B Evening", shift: "15:30–17:20", stops: "10", status: "Needs driver" as const },
  { route: "Staff Shuttle", shift: "09:00–10:00", stops: "4", status: "Scheduled" as const },
];

export const sampleAssignments = [
  { route: "Zone A Morning", vehicle: "BUS-01", driver: "Karthik R" },
  { route: "Campus Express", vehicle: "VAN-04", driver: "Meena S" },
  { route: "Zone C Midday", vehicle: "BUS-07", driver: "Suresh K" },
  { route: "Staff Shuttle", vehicle: "—", driver: "Unassigned" },
];

export const sampleMaintenance = [
  { vehicle: "BUS TN-30-AB-1234", issue: "Brake replacement", workshop: "City Auto Care", due: "27 Aug", priority: "Critical" as const },
  { vehicle: "VAN TN-30-CD-5678", issue: "Service due", workshop: "Fleet Bay 2", due: "29 Aug", priority: "Pending" as const },
  { vehicle: "BUS-12", issue: "AC compressor", workshop: "CoolTech", due: "01 Sep", priority: "In progress" as const },
  { vehicle: "BUS-03", issue: "Tyre rotation", workshop: "Fleet Bay 1", due: "Done", priority: "Closed" as const },
];

export const sampleInspections = [
  { vehicle: "BUS-01", type: "Pre-trip", inspector: "Dispatcher Asha", date: "27 Aug 06:10", result: "Passed" as const },
  { vehicle: "VAN-04", type: "Fitness", inspector: "RTO Desk", date: "26 Aug", result: "Failed" as const },
  { vehicle: "BUS-07", type: "Weekly", inspector: "Karthik R", date: "25 Aug", result: "Passed" as const },
  { vehicle: "BUS-12", type: "Safety audit", inspector: "Ops Lead", date: "24 Aug", result: "Overdue" as const },
];

export const sampleBills = [
  { bill: "Repair Bill", vendor: "City Auto Care", vehicle: "TN-30-AB-1234", amount: "₹18,500", status: "Pending" as const },
  { bill: "Service Bill", vendor: "Fleet Bay 2", vehicle: "TN-30-CD-5678", amount: "₹12,200", status: "Pending" as const },
  { bill: "Parts Bill", vendor: "AutoMart", vehicle: "BUS-12", amount: "₹8,600", status: "Pending" as const },
  { bill: "Tyre Bill", vendor: "MRF Hub", vehicle: "BUS-07", amount: "₹22,000", status: "Approved" as const },
  { bill: "AC Repair", vendor: "CoolTech", vehicle: "BUS-03", amount: "₹6,400", status: "Rejected" as const },
];

export const sampleFuel = [
  { date: "27 Aug", vehicle: "BUS-01", type: "Diesel", note: "42 L", amount: "₹4,050", status: "Posted" as const },
  { date: "26 Aug", vehicle: "VAN-04", type: "Petrol", note: "18 L", amount: "₹1,890", status: "Posted" as const },
  { date: "26 Aug", vehicle: "BUS-07", type: "Toll", note: "ORR trip", amount: "₹320", status: "Review" as const },
  { date: "25 Aug", vehicle: "BUS-12", type: "Parking", note: "Campus lot", amount: "₹150", status: "Posted" as const },
];

export const sampleDocuments = [
  { document: "Insurance policy", owner: "BUS-01", category: "Vehicle", expiry: "12 Dec 2026", status: "Valid" as const },
  { document: "Fitness certificate", owner: "VAN-04", category: "Vehicle", expiry: "04 Sep 2026", status: "Expiring" as const },
  { document: "Driving license", owner: "Karthik R", category: "Driver", expiry: "18 Jan 2027", status: "Valid" as const },
  { document: "Route permit", owner: "Zone A", category: "Ops", expiry: "01 Aug 2026", status: "Expired" as const },
  { document: "RC book", owner: "BUS-12", category: "Vehicle", expiry: "—", status: "Missing scan" as const },
];

export const sampleTrips = [
  { trip: "TRP-2401", route: "Zone A Morning", vehicle: "BUS-01", driver: "Karthik R", eta: "07:55", status: "Live" as const },
  { trip: "TRP-2402", route: "Campus Express", vehicle: "VAN-04", driver: "Meena S", eta: "08:05", status: "Delayed" as const },
  { trip: "TRP-2388", route: "Zone B Evening", vehicle: "BUS-07", driver: "Suresh K", eta: "Done", status: "Completed" as const },
  { trip: "TRP-2380", route: "Staff Shuttle", vehicle: "BUS-03", driver: "Arun P", eta: "—", status: "Cancelled" as const },
];

export const demoLogins = {
  admin: {
    orgId: "ORG-1001",
    email: "admin@fleetcare.demo",
    password: "Admin@123",
    name: "Asha Verma",
  },
  driver: {
    orgId: "ORG-1001",
    email: "driver@fleetcare.demo",
    password: "Driver@123",
    name: "Karthik R",
  },
};
