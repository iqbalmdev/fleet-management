"use client";

import { useEffect, useState } from "react";
import { getStoredSession } from "@/lib/api";
import {
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
  formatMoneyMinor,
  formatDateLabel,
  type MaintenanceRequest,
  type WorkOrder,
} from "@/lib/maintenance";
import {
  ensureMaintenanceSeeded,
  getMaintenanceBundle,
  listMaintenanceRequests,
} from "@/lib/maintenance-store";
import {
  ensurePrototypeSeeded,
  getVehicle,
  listDrivers,
  listVehicles,
} from "@/lib/prototype-store";

type HistoryRow = {
  request: MaintenanceRequest;
  workOrder: WorkOrder | null;
  vehicleLabel: string;
};

export function DriverServiceHistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);

  useEffect(() => {
    ensurePrototypeSeeded();
    ensureMaintenanceSeeded();
    const session = getStoredSession();
    if (!session) return;
    const orgId = session.user.orgId;
    const drivers = listDrivers(orgId);
    const matched =
      drivers.find((d) => d.email?.toLowerCase() === session.user.email.toLowerCase()) ??
      drivers[0];
    const vehicles = listVehicles(orgId);

    const completed = listMaintenanceRequests(orgId)
      .filter((r) => r.status === "completed")
      .filter((r) => {
        if (!matched) return true;
        return (
          r.driverId === matched.id ||
          r.createdBy === session.user.id ||
          vehicles.some((v) => v.id === r.vehicleId)
        );
      })
      .slice(0, 20);

    setRows(
      completed.map((request) => {
        const bundle = getMaintenanceBundle(orgId, request.id);
        const vehicle = getVehicle(orgId, request.vehicleId);
        return {
          request,
          workOrder: bundle?.workOrder ?? null,
          vehicleLabel: vehicle?.plate ?? request.vehicleId,
        };
      }),
    );
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Past service history</h1>
        <p className="mt-1 text-sm text-slate-500">
          Completed maintenance from the shared fleet record — not a separate list.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No completed service records yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map(({ request, workOrder, vehicleLabel }) => (
              <li
                key={request.id}
                className="rounded-lg border border-slate-100 px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{request.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateLabel(request.reportedDate)} · {vehicleLabel} ·{" "}
                      {MAINTENANCE_TYPE_LABELS[request.maintenanceType]}
                    </p>
                    {workOrder ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {workOrder.workOrderNumber}
                        {workOrder.serviceCenter ? ` · ${workOrder.serviceCenter}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-emerald-700">
                      {MAINTENANCE_STATUS_LABELS[request.status]}
                    </p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-slate-800">
                      {formatMoneyMinor(
                        workOrder?.actualTotalCostMinor ?? request.estimatedCostMinor,
                      )}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
