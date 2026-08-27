export const fleetKpis = [
  { label: "Buses on duty", value: "18", hint: "of 22 assigned" },
  { label: "Routes live", value: "14", hint: "2 delayed" },
  { label: "Open defects", value: "5", hint: "1 safety hold" },
  { label: "Inspections today", value: "16/18", hint: "2 pending sign-off" },
];

export const exceptions = [
  {
    id: "EX-104",
    severity: "high",
    title: "Brake warning — BUS-07",
    detail: "Pre-trip failed. Vehicle held until workshop clears.",
    owner: "Maintenance",
  },
  {
    id: "EX-105",
    severity: "medium",
    title: "Route R12 running 11 min late",
    detail: "Stop 4 congestion. Dispatcher notified parents via SMS.",
    owner: "Dispatch",
  },
  {
    id: "EX-106",
    severity: "low",
    title: "Insurance renewal in 12 days",
    detail: "TN-09-SC-2218 — document reminder.",
    owner: "Admin",
  },
];

export const vehicles = [
  {
    id: "BUS-01",
    plate: "TN-09-SC-1102",
    capacity: 42,
    status: "On route",
    route: "R04 Morning North",
    driver: "Karthik R",
    nextService: "18 Aug",
  },
  {
    id: "BUS-07",
    plate: "TN-09-SC-2218",
    status: "Held",
    capacity: 36,
    route: "—",
    driver: "Unassigned",
    nextService: "Today",
  },
  {
    id: "BUS-12",
    plate: "TN-09-SC-3340",
    status: "Standby",
    capacity: 28,
    route: "Relief",
    driver: "Priya N",
    nextService: "02 Sep",
  },
  {
    id: "BUS-18",
    plate: "TN-09-SC-4481",
    status: "On route",
    capacity: 50,
    route: "R09 Airport corridor",
    driver: "Imran K",
    nextService: "21 Aug",
  },
];

export const drivers = [
  {
    name: "Karthik R",
    id: "DRV-204",
    license: "Valid · 2028",
    status: "On trip",
    route: "R04",
    hours: "4.2h",
  },
  {
    name: "Priya N",
    id: "DRV-211",
    license: "Valid · 2027",
    status: "Available",
    route: "—",
    hours: "0.0h",
  },
  {
    name: "Imran K",
    id: "DRV-218",
    license: "Review · medical due",
    status: "On trip",
    route: "R09",
    hours: "3.8h",
  },
  {
    name: "Sana F",
    id: "DRV-220",
    license: "Valid · 2029",
    status: "Off duty",
    route: "—",
    hours: "0.0h",
  },
];

export const routes = [
  {
    code: "R04",
    name: "Morning North",
    stops: 12,
    vehicle: "BUS-01",
    status: "In progress",
    eta: "On time",
  },
  {
    code: "R09",
    name: "Airport corridor",
    stops: 9,
    vehicle: "BUS-18",
    status: "In progress",
    eta: "On time",
  },
  {
    code: "R12",
    name: "East campus loop",
    stops: 15,
    vehicle: "BUS-04",
    status: "Delayed",
    eta: "+11 min",
  },
  {
    code: "R02",
    name: "South residential",
    stops: 11,
    vehicle: "BUS-03",
    status: "Complete",
    eta: "Done 08:42",
  },
];

export const inspections = [
  {
    vehicle: "BUS-01",
    driver: "Karthik R",
    result: "Pass",
    items: "Engine, brakes, tyres, electrical, fluids",
    time: "05:42",
  },
  {
    vehicle: "BUS-07",
    driver: "Workshop",
    result: "Fail",
    items: "Brakes — pad wear beyond limit",
    time: "05:51",
  },
  {
    vehicle: "BUS-18",
    driver: "Imran K",
    result: "Pass",
    items: "All checks signed",
    time: "05:38",
  },
  {
    vehicle: "BUS-12",
    driver: "Priya N",
    result: "Pending",
    items: "Standby — not started",
    time: "—",
  },
];

export const workOrders = [
  {
    id: "WO-331",
    vehicle: "BUS-07",
    issue: "Front brake pads",
    vendor: "City Coach Works",
    status: "In workshop",
    due: "Today 16:00",
  },
  {
    id: "WO-328",
    vehicle: "BUS-03",
    issue: "AC compressor",
    vendor: "CoolRide",
    status: "Parts ordered",
    due: "19 Aug",
  },
  {
    id: "WO-319",
    vehicle: "BUS-01",
    issue: "Scheduled 10k service",
    vendor: "In-house",
    status: "Scheduled",
    due: "18 Aug",
  },
];

export const fuelRows = [
  {
    date: "15 Aug",
    vehicle: "BUS-01",
    litres: 84,
    amount: "₹7,140",
    status: "Approved",
  },
  {
    date: "15 Aug",
    vehicle: "BUS-18",
    litres: 96,
    amount: "₹8,160",
    status: "Pending",
  },
  {
    date: "14 Aug",
    vehicle: "BUS-04",
    litres: 72,
    amount: "₹6,120",
    status: "Approved",
  },
];

export const documents = [
  {
    name: "Fitness certificate",
    vehicle: "BUS-07",
    expiry: "27 Aug 2026",
    status: "Due soon",
  },
  {
    name: "Insurance",
    vehicle: "Fleet policy",
    expiry: "12 Sep 2026",
    status: "Valid",
  },
  {
    name: "Permit — R12 corridor",
    vehicle: "BUS-04",
    expiry: "03 Oct 2026",
    status: "Valid",
  },
  {
    name: "Pollution certificate",
    vehicle: "BUS-01",
    expiry: "02 Aug 2026",
    status: "Overdue",
  },
];
