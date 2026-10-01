"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  EmptyState,
  GhostButton,
  InlineAlert,
  LoadingBlock,
  ModuleHeader,
  Panel,
  SearchField,
  StatGrid,
  StatusPill,
} from "@/components/admin-ui";
import { getStoredSession } from "@/lib/api";
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
  MAINTENANCE_TYPES,
  formatMoneyMinor,
  type MaintenanceKpis,
  type MaintenancePriority,
  type MaintenanceRequest,
  type MaintenanceStatus,
  type MaintenanceType,
  formatDateLabel,
  maintenancePriorityTone,
  maintenanceStatusTone,
} from "@/lib/maintenance";
import {
  ensureMaintenanceSeeded,
  getMaintenanceKpis,
  listMaintenanceRequests,
} from "@/lib/maintenance-store";
import { ensurePrototypeSeeded, listVehicles, type ProtoVehicle } from "@/lib/prototype-store";

type Filters = {
  search: string;
  vehicleId: string;
  maintenanceType: string;
  priority: string;
  status: string;
};

const EMPTY_FILTERS: Filters = {
  search: "",
  vehicleId: "",
  maintenanceType: "",
  priority: "",
  status: "",
};

export function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [vehicles, setVehicles] = useState<ProtoVehicle[]>([]);
  const [kpis, setKpis] = useState<MaintenanceKpis | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  function load() {
    try {
      ensurePrototypeSeeded();
      ensureMaintenanceSeeded();
      const session = getStoredSession();
      if (!session) {
        setLoadError("Please sign in again.");
        setLoading(false);
        return;
      }
      const orgId = session.user.orgId;
      setRequests(listMaintenanceRequests(orgId));
      setVehicles(listVehicles(orgId));
      setKpis(getMaintenanceKpis(orgId));
      setLoadError(null);
    } catch {
      setLoadError("Could not load maintenance data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (!active) return;
      load();
    };
    queueMicrotask(refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const vehicleMap = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v])),
    [vehicles],
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return requests.filter((request) => {
      const vehicle = vehicleMap.get(request.vehicleId);
      const plate = vehicle?.plate?.toLowerCase() ?? "";
      const code = vehicle?.code?.toLowerCase() ?? "";
      if (filters.vehicleId && request.vehicleId !== filters.vehicleId) return false;
      if (filters.maintenanceType && request.maintenanceType !== filters.maintenanceType) {
        return false;
      }
      if (filters.priority && request.priority !== filters.priority) return false;
      if (filters.status && request.status !== filters.status) return false;
      if (!q) return true;
      return (
        request.requestNumber.toLowerCase().includes(q) ||
        request.title.toLowerCase().includes(q) ||
        plate.includes(q) ||
        code.includes(q) ||
        request.description.toLowerCase().includes(q)
      );
    });
  }, [requests, filters, vehicleMap]);

  if (loading) {
    return <LoadingBlock label="Loading maintenance…" />;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="MAINTENANCE"
        title="Maintenance management"
        description="Track requests from report through workshop completion and payment approval."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/maintenance/schedules"
              className="inline-flex h-10 items-center rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Schedules
            </Link>
            <Link
              href="/dashboard/maintenance/new"
              className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white hover:bg-sky-400"
            >
              New request
            </Link>
          </div>
        }
      />

      {loadError ? <InlineAlert tone="danger">{loadError}</InlineAlert> : null}

      <StatGrid
        items={[
          { label: "Open requests", value: String(kpis?.openRequests ?? "—") },
          { label: "In service", value: String(kpis?.vehiclesInService ?? "—") },
          {
            label: "Waiting for parts",
            value: String(kpis?.waitingForParts ?? "—"),
          },
          {
            label: "Due soon",
            value: String(kpis?.dueSoon ?? "—"),
            hint: kpis ? `${kpis.overdueServices} overdue` : undefined,
          },
          {
            label: "Completed this month",
            value: String(kpis?.completedThisMonth ?? "—"),
          },
          {
            label: "Cost this month",
            value: kpis ? formatMoneyMinor(kpis.maintenanceCostThisMonthMinor) : "—",
          },
        ]}
      />

      <Panel
        title="Filters"
        action={
          <GhostButton onClick={() => setFilters(EMPTY_FILTERS)}>Clear</GhostButton>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SearchField
            placeholder="Search request, vehicle, issue…"
            value={filters.search}
            onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          />
          <FilterSelect
            label="Vehicle"
            value={filters.vehicleId}
            onChange={(vehicleId) => setFilters((prev) => ({ ...prev, vehicleId }))}
            options={[
              { value: "", label: "All vehicles" },
              ...vehicles.map((v) => ({
                value: v.id,
                label: `${v.plate} (${v.code})`,
              })),
            ]}
          />
          <FilterSelect
            label="Type"
            value={filters.maintenanceType}
            onChange={(maintenanceType) =>
              setFilters((prev) => ({ ...prev, maintenanceType }))
            }
            options={[
              { value: "", label: "All types" },
              ...MAINTENANCE_TYPES.map((t) => ({
                value: t,
                label: MAINTENANCE_TYPE_LABELS[t],
              })),
            ]}
          />
          <FilterSelect
            label="Priority"
            value={filters.priority}
            onChange={(priority) => setFilters((prev) => ({ ...prev, priority }))}
            options={[
              { value: "", label: "All priorities" },
              ...MAINTENANCE_PRIORITIES.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
              })),
            ]}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(status) => setFilters((prev) => ({ ...prev, status }))}
            options={[
              { value: "", label: "All statuses" },
              ...MAINTENANCE_STATUSES.map((s) => ({
                value: s,
                label: MAINTENANCE_STATUS_LABELS[s],
              })),
            ]}
          />
        </div>
      </Panel>

      <Panel title={`Requests (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState
            title="No maintenance requests match these filters"
            description="Create a request or clear filters to see the full list."
            action={
              <Link
                href="/dashboard/maintenance/new"
                className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white hover:bg-sky-400"
              >
                Create a request
              </Link>
            }
          />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((request) => {
                const vehicle = vehicleMap.get(request.vehicleId);
                return (
                  <Link
                    key={request.id}
                    href={`/dashboard/maintenance/${request.id}`}
                    className="block rounded-xl border border-white/10 bg-[#0b1220] p-4 hover:border-sky-500/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{request.requestNumber}</p>
                        <p className="mt-1 text-sm text-slate-300">{request.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {vehicle?.plate ?? request.vehicleId} ·{" "}
                          {formatDateLabel(request.updatedAt)}
                        </p>
                      </div>
                      <StatusPill
                        label={MAINTENANCE_STATUS_LABELS[request.status as MaintenanceStatus]}
                        tone={maintenanceStatusTone(request.status as MaintenanceStatus)}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusPill
                        label={request.priority}
                        tone={maintenancePriorityTone(
                          request.priority as MaintenancePriority,
                        )}
                      />
                      <span className="text-xs text-slate-500">
                        {formatMoneyMinor(request.estimatedCostMinor)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-slate-500">
                    {[
                      "Request",
                      "Vehicle",
                      "Type",
                      "Issue",
                      "Priority",
                      "Status",
                      "Est. cost",
                      "Updated",
                      "",
                    ].map((column) => (
                      <th key={column || "actions"} className="px-3 py-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((request) => {
                    const vehicle = vehicleMap.get(request.vehicleId);
                    return (
                      <tr key={request.id} className="border-b border-white/5 last:border-0">
                        <td className="px-3 py-3">
                          <p className="font-medium text-white">{request.requestNumber}</p>
                          <p className="text-xs text-slate-500">
                            {request.source.replaceAll("_", " ")}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-slate-300">
                          {vehicle ? vehicle.plate : request.vehicleId}
                        </td>
                        <td className="px-3 py-3 text-slate-300">
                          {MAINTENANCE_TYPE_LABELS[
                            request.maintenanceType as MaintenanceType
                          ] ?? request.maintenanceType}
                        </td>
                        <td className="max-w-[220px] px-3 py-3 text-slate-300">
                          <span className="line-clamp-2">{request.title}</span>
                        </td>
                        <td className="px-3 py-3">
                          <StatusPill
                            label={request.priority}
                            tone={maintenancePriorityTone(
                              request.priority as MaintenancePriority,
                            )}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <StatusPill
                            label={
                              MAINTENANCE_STATUS_LABELS[request.status as MaintenanceStatus]
                            }
                            tone={maintenanceStatusTone(
                              request.status as MaintenanceStatus,
                            )}
                          />
                        </td>
                        <td className="px-3 py-3 text-slate-300">
                          {formatMoneyMinor(request.estimatedCostMinor)}
                        </td>
                        <td className="px-3 py-3 text-slate-300">
                          {formatDateLabel(request.updatedAt)}
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/dashboard/maintenance/${request.id}`}
                            className="text-sm font-medium text-sky-400 hover:text-sky-300"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block space-y-1.5 text-xs uppercase tracking-[0.12em] text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm normal-case tracking-normal text-slate-200 outline-none focus:border-sky-500/50"
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
