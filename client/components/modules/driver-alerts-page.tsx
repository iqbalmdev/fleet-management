"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredSession } from "@/lib/api";
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
  MAINTENANCE_TYPES,
  SCHEDULE_DUE_LABELS,
  formatDateLabel,
  type MaintenanceRequest,
} from "@/lib/maintenance";
import {
  actorFromUser,
  createMaintenanceRequest,
  ensureMaintenanceSeeded,
  getScheduleDueStatusFor,
  listMaintenanceRequests,
  listSchedules,
  MaintenanceError,
  submitMaintenanceRequest,
} from "@/lib/maintenance-store";
import {
  ensurePrototypeSeeded,
  listDrivers,
  listVehicles,
  type ProtoDriver,
  type ProtoVehicle,
} from "@/lib/prototype-store";
import {
  maintenanceValidationSummary,
  validateMaintenanceRequestForm,
  type MaintenanceRequestFormInput,
} from "@/lib/validation/maintenance";

export function DriverAlertsPage() {
  const [vehicles, setVehicles] = useState<ProtoVehicle[]>([]);
  const [driver, setDriver] = useState<ProtoDriver | null>(null);
  const [myRequests, setMyRequests] = useState<MaintenanceRequest[]>([]);
  const [dueItems, setDueItems] = useState<
    Array<{ title: string; vehicle: string; due: string; tone: string }>
  >([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [maintenanceType, setMaintenanceType] = useState("corrective");
  const [breakdown, setBreakdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function load() {
    ensurePrototypeSeeded();
    ensureMaintenanceSeeded();
    const session = getStoredSession();
    if (!session) return;
    const orgId = session.user.orgId;
    const drivers = listDrivers(orgId);
    const matched =
      drivers.find((d) => d.email?.toLowerCase() === session.user.email.toLowerCase()) ??
      drivers[0] ??
      null;
    setDriver(matched);
    const vehicleList = listVehicles(orgId);
    setVehicles(vehicleList);
    if (!vehicleId && vehicleList[0]) setVehicleId(vehicleList[0].id);

    const requests = listMaintenanceRequests(orgId).filter(
      (r) =>
        r.createdBy === session.user.id ||
        (matched && r.driverId === matched.id) ||
        r.source === "driver_report",
    );
    setMyRequests(requests.slice(0, 8));

    const schedules = listSchedules(orgId);
    const due = schedules
      .filter((s) => s.status === "active")
      .map((s) => {
        const vehicle = vehicleList.find((v) => v.id === s.vehicleId);
        const status = getScheduleDueStatusFor(s, vehicle);
        return {
          title: s.title,
          vehicle: vehicle?.plate ?? s.vehicleId,
          due: SCHEDULE_DUE_LABELS[status],
          tone: status,
        };
      })
      .filter((item) => item.tone !== "upcoming");
    setDueItems(due);
  }

  useEffect(() => {
    load();
  }, []);

  const formDefaults = useMemo(
    () => ({
      source: breakdown ? "breakdown" : "driver_report",
      vehicleOperationalStatus: breakdown ? "out_of_service" : "restricted",
    }),
    [breakdown],
  );

  function onSubmit() {
    setPending(true);
    setError(null);
    setSuccess(null);
    const session = getStoredSession();
    if (!session) {
      setError("Please sign in again.");
      setPending(false);
      return;
    }

    const input: MaintenanceRequestFormInput = {
      vehicleId,
      driverId: driver?.id ?? "",
      source: formDefaults.source,
      maintenanceType,
      category: "",
      title,
      description,
      odometerReading: "",
      priority: breakdown ? "critical" : priority,
      location: "",
      breakdown,
      vehicleOperationalStatus: formDefaults.vehicleOperationalStatus,
      estimatedCostRupees: "",
      preferredServiceDate: "",
    };

    const result = validateMaintenanceRequestForm(input);
    if (!result.ok) {
      setError(maintenanceValidationSummary(result.errors));
      setPending(false);
      return;
    }

    try {
      const actor = actorFromUser(session.user, driver?.id);
      const request = createMaintenanceRequest(actor, result.data);
      submitMaintenanceRequest(actor, request.id);
      setSuccess(`Reported ${request.requestNumber}. Fleet admin will review.`);
      setTitle("");
      setDescription("");
      setBreakdown(false);
      load();
    } catch (err) {
      setError(err instanceof MaintenanceError ? err.message : "Failed to report issue");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Service alerts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Due reminders for your fleet and a quick way to report vehicle issues.
        </p>
      </div>

      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Due / overdue services</h2>
        {dueItems.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No due services right now.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {dueItems.map((item, index) => (
              <li
                key={`${item.vehicle}-${item.title}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.vehicle}</p>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    item.tone === "overdue" ? "text-rose-600" : "text-amber-600"
                  }`}
                >
                  {item.due}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Report an issue</h2>
        <div className="mt-3 space-y-3">
          <label className="block text-sm text-slate-600">
            Vehicle
            <select
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} ({v.code})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-600">
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Brake noise"
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
            />
          </label>
          <label className="block text-sm text-slate-600">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="What happened?"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-slate-600">
            Type
            <select
              value={maintenanceType}
              onChange={(event) => setMaintenanceType(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
            >
              {MAINTENANCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MAINTENANCE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-600">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              disabled={breakdown}
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm disabled:bg-slate-50"
            >
              {MAINTENANCE_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={breakdown}
              onChange={(event) => setBreakdown(event.target.checked)}
            />
            Vehicle broke down (marks critical / out of service)
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={onSubmit}
            className="h-11 w-full rounded-lg bg-sky-600 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Your recent reports</h2>
        {myRequests.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No reports yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {myRequests.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.requestNumber} · {formatDateLabel(item.reportedDate)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {MAINTENANCE_STATUS_LABELS[item.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
