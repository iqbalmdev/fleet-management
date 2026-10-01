"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ConfirmDialog,
  DataTable,
  GhostButton,
  InlineAlert,
  LoadingBlock,
  ModuleHeader,
  Panel,
  PrimaryButton,
  StatusPill,
} from "@/components/admin-ui";
import { MaintenanceWorkshopPanels } from "@/components/modules/maintenance-workshop-panels";
import { getStoredSession } from "@/lib/api";
import {
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
  formatMoneyMinor,
  formatDateLabel,
  formatDateTimeLabel,
  maintenancePriorityTone,
  maintenanceStatusTone,
  type MaintenanceActor,
  type MaintenanceRequestBundle,
  type Vendor,
} from "@/lib/maintenance";
import { todayIsoDate } from "@/lib/maintenance/schedule";
import {
  actorFromUser,
  approveMaintenancePayment,
  approveMaintenanceRequest,
  completeWorkOrderService,
  createWorkOrderFromRequest,
  ensureMaintenanceSeeded,
  getMaintenanceBundle,
  listVendors,
  MaintenanceError,
  markWaitingForParts,
  rejectMaintenanceRequest,
  resumeFromWaitingParts,
  startMaintenanceReview,
  startWorkOrderService,
  submitMaintenanceRequest,
  verifyWorkOrder,
} from "@/lib/maintenance-store";
import {
  ensurePrototypeSeeded,
  getDriver,
  getVehicle,
  type ProtoDriver,
  type ProtoVehicle,
} from "@/lib/prototype-store";

type TabId = "overview" | "workshop" | "approvals" | "activity";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "workshop", label: "Workshop" },
  { id: "approvals", label: "Approvals" },
  { id: "activity", label: "Activity" },
];

const WORKSHOP_EDITABLE = new Set([
  "work_order_created",
  "in_service",
  "waiting_for_parts",
  "service_completed",
  "pending_verification",
  "verified",
  "pending_payment_approval",
]);

export function MaintenanceDetailPage() {
  const params = useParams<{ id: string }>();
  const requestId = params?.id;

  const [bundle, setBundle] = useState<MaintenanceRequestBundle | null>(null);
  const [vehicle, setVehicle] = useState<ProtoVehicle | null>(null);
  const [driver, setDriver] = useState<ProtoDriver | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [actor, setActor] = useState<MaintenanceActor | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveComments, setApproveComments] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [serviceCenter, setServiceCenter] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [failReason, setFailReason] = useState("");
  const [completeWork, setCompleteWork] = useState("");
  const [odometerOut, setOdometerOut] = useState("");
  const [waitPart, setWaitPart] = useState("");
  const [waitQty, setWaitQty] = useState("1");
  const [waitSupplier, setWaitSupplier] = useState("");
  const [waitArrival, setWaitArrival] = useState("");
  const [waitNotes, setWaitNotes] = useState("");
  const [confirmKind, setConfirmKind] = useState<
    null | "reject" | "verify_fail" | "payment"
  >(null);

  function loadBundle() {
    ensurePrototypeSeeded();
    ensureMaintenanceSeeded();
    const session = getStoredSession();
    if (!session || !requestId) return;
    setActor(actorFromUser(session.user));
    const next = getMaintenanceBundle(session.user.orgId, requestId);
    setBundle(next);
    if (next) {
      setVehicle(getVehicle(session.user.orgId, next.request.vehicleId) ?? null);
      setDriver(
        next.request.driverId
          ? getDriver(session.user.orgId, next.request.driverId) ?? null
          : null,
      );
      setVendors(listVendors(session.user.orgId));
      if (next.workOrder?.vendorId) setVendorId(next.workOrder.vendorId);
      if (next.workOrder?.serviceCenter) setServiceCenter(next.workOrder.serviceCenter);
      if (next.workOrder?.odometerOut != null) {
        setOdometerOut(String(next.workOrder.odometerOut));
      } else if (next.workOrder?.odometerIn != null) {
        setOdometerOut(String(next.workOrder.odometerIn));
      }
      if (next.workOrder?.waitingForPart) setWaitPart(next.workOrder.waitingForPart);
    }
  }

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      loadBundle();
    });
    return () => {
      active = false;
    };
    // requestId is the only external input for this load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const request = bundle?.request ?? null;
  const workOrder = bundle?.workOrder ?? null;

  const waitingLabel = workOrder?.waitingSince
    ? `Since ${formatDateTimeLabel(workOrder.waitingSince)}`
    : null;

  async function runAction(action: () => void, okMessage: string) {
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      action();
      setSuccess(okMessage);
      loadBundle();
    } catch (err) {
      setError(err instanceof MaintenanceError ? err.message : "Action failed");
    } finally {
      setPending(false);
    }
  }

  function withActor(fn: (next: MaintenanceActor) => void) {
    const session = getStoredSession();
    if (!session) {
      setError("Please sign in again.");
      return;
    }
    fn(actorFromUser(session.user));
  }

  if (!requestId) {
    return <p className="text-sm text-slate-400">Invalid maintenance link.</p>;
  }

  if (!bundle || !request) {
    return <LoadingBlock label="Loading maintenance request…" />;
  }

  const canEditWorkshop = WORKSHOP_EDITABLE.has(request.status);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="MAINTENANCE"
        title={workOrder?.workOrderNumber ?? request.requestNumber}
        description={`${vehicle?.plate ?? request.vehicleId} · ${request.title}`}
        action={
          <Link
            href="/dashboard/maintenance"
            className="inline-flex h-10 items-center rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            All requests
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusPill
          label={MAINTENANCE_STATUS_LABELS[request.status]}
          tone={maintenanceStatusTone(request.status)}
        />
        <StatusPill
          label={request.priority}
          tone={maintenancePriorityTone(request.priority)}
        />
        {request.breakdown ? <StatusPill label="Breakdown" tone="danger" /> : null}
        {waitingLabel ? (
          <StatusPill label={`Waiting ${waitingLabel}`} tone="warning" />
        ) : null}
        {bundle.invoices.length > 0 ? (
          <StatusPill label="Invoice on file" tone="success" />
        ) : null}
      </div>

      {success ? <InlineAlert tone="success">{success}</InlineAlert> : null}
      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      <Panel title="Actions">
        <div className="flex flex-wrap gap-2">
          {request.status === "draft" ? (
            <PrimaryButton
              disabled={pending}
              onClick={() =>
                withActor((a) =>
                  void runAction(
                    () => submitMaintenanceRequest(a, request.id),
                    "Request submitted.",
                  ),
                )
              }
            >
              Submit
            </PrimaryButton>
          ) : null}

          {request.status === "submitted" ? (
            <PrimaryButton
              disabled={pending}
              onClick={() =>
                withActor((a) =>
                  void runAction(
                    () => startMaintenanceReview(a, request.id),
                    "Review started.",
                  ),
                )
              }
            >
              Start review
            </PrimaryButton>
          ) : null}

          {request.status === "under_review" ? (
            <>
              <PrimaryButton
                disabled={pending}
                onClick={() =>
                  withActor((a) =>
                    void runAction(
                      () => approveMaintenanceRequest(a, request.id, approveComments),
                      "Request approved.",
                    ),
                  )
                }
              >
                Approve
              </PrimaryButton>
              <GhostButton
                disabled={pending || !rejectReason.trim()}
                onClick={() => setConfirmKind("reject")}
              >
                Reject
              </GhostButton>
            </>
          ) : null}

          {request.status === "approved" ? (
            <PrimaryButton
              disabled={pending}
              onClick={() =>
                withActor((a) =>
                  void runAction(
                    () =>
                      createWorkOrderFromRequest(a, request.id, {
                        vendorId: vendorId || null,
                        serviceCenter: serviceCenter || null,
                        estimatedLabourCostMinor: 0,
                        estimatedPartsCostMinor: request.estimatedCostMinor ?? 0,
                      }),
                    "Work order created.",
                  ),
                )
              }
            >
              Create work order
            </PrimaryButton>
          ) : null}

          {request.status === "work_order_created" && workOrder ? (
            <PrimaryButton
              disabled={pending}
              onClick={() =>
                withActor((a) =>
                  void runAction(
                    () =>
                      startWorkOrderService(a, workOrder.id, {
                        odometerIn: request.odometerReading ?? vehicle?.odometer ?? 0,
                        serviceCenter: serviceCenter || workOrder.serviceCenter,
                        receivedBy: "Workshop desk",
                      }),
                    "Service started.",
                  ),
                )
              }
            >
              Check in & start service
            </PrimaryButton>
          ) : null}

          {request.status === "in_service" && workOrder ? (
            <>
              <GhostButton
                disabled={pending || !waitPart.trim()}
                onClick={() =>
                  withActor((a) =>
                    void runAction(
                      () =>
                        markWaitingForParts(a, workOrder.id, {
                          requiredPart: waitPart,
                          quantity: Number(waitQty) || 1,
                          supplier: waitSupplier || null,
                          expectedArrivalDate: waitArrival || null,
                          notes: waitNotes || null,
                        }),
                      "Marked waiting for parts.",
                    ),
                  )
                }
              >
                Waiting for parts
              </GhostButton>
              <PrimaryButton
                disabled={pending || !completeWork.trim() || !odometerOut}
                onClick={() =>
                  withActor((a) =>
                    void runAction(
                      () =>
                        completeWorkOrderService(a, workOrder.id, {
                          odometerOut: Number(odometerOut),
                          workPerformed: completeWork,
                        }),
                      "Service completed — pending verification.",
                    ),
                  )
                }
              >
                Mark service completed
              </PrimaryButton>
            </>
          ) : null}

          {request.status === "waiting_for_parts" && workOrder ? (
            <PrimaryButton
              disabled={pending}
              onClick={() =>
                withActor((a) =>
                  void runAction(
                    () => resumeFromWaitingParts(a, workOrder.id),
                    "Parts available — work resumed.",
                  ),
                )
              }
            >
              Resume service
            </PrimaryButton>
          ) : null}

          {request.status === "pending_verification" && workOrder ? (
            <>
              <PrimaryButton
                disabled={pending}
                onClick={() =>
                  withActor((a) =>
                    void runAction(
                      () =>
                        verifyWorkOrder(a, workOrder.id, {
                          result: "pass",
                          notes: verifyNotes,
                        }),
                      "Verified — pending payment approval. Bill created.",
                    ),
                  )
                }
              >
                Verify pass
              </PrimaryButton>
              <GhostButton
                disabled={pending || !failReason.trim()}
                onClick={() => setConfirmKind("verify_fail")}
              >
                Verify fail
              </GhostButton>
            </>
          ) : null}

          {request.status === "pending_payment_approval" && workOrder ? (
            <PrimaryButton
              disabled={pending}
              onClick={() => setConfirmKind("payment")}
            >
              Approve payment & complete
            </PrimaryButton>
          ) : null}

          {request.status === "completed" ? (
            <p className="text-sm text-slate-500">
              Maintenance completed. History is retained permanently.
            </p>
          ) : null}
        </div>

        {request.status === "under_review" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field
              label="Approval comments"
              value={approveComments}
              onChange={setApproveComments}
            />
            <Field
              label="Rejection reason"
              value={rejectReason}
              onChange={setRejectReason}
            />
          </div>
        ) : null}

        {request.status === "approved" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SelectField
              label="Vendor"
              value={vendorId}
              onChange={setVendorId}
              options={[
                { value: "", label: "Select vendor" },
                ...vendors.map((v) => ({ value: v.id, label: v.vendorName })),
              ]}
            />
            <Field
              label="Service center"
              value={serviceCenter}
              onChange={setServiceCenter}
            />
          </div>
        ) : null}

        {request.status === "in_service" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field
              label="Odometer out (km)"
              value={odometerOut}
              onChange={setOdometerOut}
              type="number"
            />
            <Field
              label="Work performed"
              value={completeWork}
              onChange={setCompleteWork}
            />
            <Field label="Required part (if waiting)" value={waitPart} onChange={setWaitPart} />
            <Field label="Quantity" value={waitQty} onChange={setWaitQty} type="number" />
            <Field label="Supplier" value={waitSupplier} onChange={setWaitSupplier} />
            <Field
              label="Expected arrival"
              value={waitArrival || todayIsoDate()}
              onChange={setWaitArrival}
              type="date"
            />
            <Field label="Waiting notes" value={waitNotes} onChange={setWaitNotes} />
          </div>
        ) : null}

        {request.status === "waiting_for_parts" && workOrder ? (
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100">
            Waiting for <strong>{workOrder.waitingForPart}</strong>
            {workOrder.waitingQuantity != null ? ` × ${workOrder.waitingQuantity}` : ""}
            {workOrder.waitingSupplier ? ` from ${workOrder.waitingSupplier}` : ""}
            {workOrder.waitingExpectedArrival
              ? ` · ETA ${formatDateLabel(workOrder.waitingExpectedArrival)}`
              : ""}
            {waitingLabel ? ` · waiting ${waitingLabel}` : ""}
          </div>
        ) : null}

        {request.status === "pending_verification" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Verification notes" value={verifyNotes} onChange={setVerifyNotes} />
            <Field label="Failure reason" value={failReason} onChange={setFailReason} />
          </div>
        ) : null}

        {request.status === "pending_payment_approval" ? (
          <p className="mt-4 text-xs text-slate-500">
            A pending bill sanction is created on verify. Upload an invoice in the Workshop tab
            before approving payment.
          </p>
        ) : null}
      </Panel>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === item.id
                ? "bg-sky-500/20 text-sky-300"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Request">
            <dl className="space-y-3 text-sm">
              <Detail label="Request no." value={request.requestNumber} />
              <Detail label="Vehicle" value={vehicle?.plate ?? request.vehicleId} />
              <Detail label="Driver" value={driver?.name ?? "—"} />
              <Detail label="Reported by" value={request.reportedByName} />
              <Detail label="Reported" value={formatDateLabel(request.reportedDate)} />
              <Detail label="Source" value={request.source.replaceAll("_", " ")} />
              <Detail
                label="Type"
                value={MAINTENANCE_TYPE_LABELS[request.maintenanceType]}
              />
              <Detail label="Issue" value={request.title} />
              <Detail label="Description" value={request.description} />
              <Detail
                label="Odometer"
                value={
                  request.odometerReading != null
                    ? `${request.odometerReading.toLocaleString("en-IN")} km`
                    : "—"
                }
              />
              <Detail
                label="Operational"
                value={request.vehicleOperationalStatus.replaceAll("_", " ")}
              />
              <Detail
                label="Estimated cost"
                value={formatMoneyMinor(request.estimatedCostMinor)}
              />
            </dl>
          </Panel>

          <Panel title="Work order & cost">
            {workOrder ? (
              <dl className="space-y-3 text-sm">
                <Detail label="Work order" value={workOrder.workOrderNumber} />
                <Detail
                  label="Vendor"
                  value={bundle.vendor?.vendorName ?? workOrder.serviceCenter ?? "—"}
                />
                <Detail label="Technician" value={workOrder.assignedTechnician ?? "—"} />
                <Detail label="Check-in" value={formatDateLabel(workOrder.checkInDate)} />
                <Detail
                  label="Odometer in / out"
                  value={`${workOrder.odometerIn ?? "—"} / ${workOrder.odometerOut ?? "—"}`}
                />
                <Detail label="Diagnosis" value={workOrder.diagnosis ?? "—"} />
                <Detail
                  label="Parts"
                  value={formatMoneyMinor(workOrder.actualPartsCostMinor)}
                />
                <Detail
                  label="Labour"
                  value={formatMoneyMinor(workOrder.actualLabourCostMinor)}
                />
                <Detail
                  label="Other"
                  value={formatMoneyMinor(workOrder.actualOtherCostMinor)}
                />
                <Detail
                  label="Estimated total"
                  value={formatMoneyMinor(workOrder.estimatedTotalCostMinor)}
                />
                <Detail
                  label="Actual total"
                  value={formatMoneyMinor(workOrder.actualTotalCostMinor)}
                />
                <Detail
                  label="Variance"
                  value={formatMoneyMinor(
                    workOrder.actualTotalCostMinor - workOrder.estimatedTotalCostMinor,
                  )}
                />
              </dl>
            ) : (
              <p className="text-sm text-slate-400">
                No work order yet. Approve the request, then create a work order.
              </p>
            )}
          </Panel>
        </div>
      ) : null}

      {tab === "workshop" ? (
        <MaintenanceWorkshopPanels
          bundle={bundle}
          actor={actor}
          canEditWorkshop={canEditWorkshop}
          onChanged={loadBundle}
          onError={setError}
          onSuccess={(message) => {
            setSuccess(message);
            setError(null);
          }}
        />
      ) : null}

      {tab === "approvals" ? (
        <Panel title="Approval history">
          {bundle.approvals.length === 0 ? (
            <p className="text-sm text-slate-400">No approvals recorded yet.</p>
          ) : (
            <DataTable
              columns={["When", "Kind", "By", "Notes"]}
              rows={bundle.approvals.map((item) => [
                formatDateTimeLabel(item.performedAt),
                item.kind.replaceAll("_", " "),
                item.performedByName,
                item.comments || item.reason || "—",
              ])}
            />
          )}
        </Panel>
      ) : null}

      {tab === "activity" ? (
        <Panel title="Activity timeline">
          {bundle.activities.length === 0 ? (
            <p className="text-sm text-slate-400">No activity yet.</p>
          ) : (
            <ol className="space-y-4">
              {bundle.activities.map((item) => (
                <li key={item.id} className="relative border-l border-white/10 pl-4">
                  <span className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-sky-400" />
                  <p className="text-xs text-slate-500">
                    {formatDateTimeLabel(item.performedAt)} · {item.performedByName}
                  </p>
                  <p className="mt-1 text-sm text-slate-200">{item.message}</p>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      ) : null}

      <ConfirmDialog
        open={confirmKind === "reject"}
        title="Reject this request?"
        description={`This will reject ${request.requestNumber}. The reason is kept in approval history.`}
        confirmLabel="Reject request"
        tone="danger"
        pending={pending}
        onCancel={() => setConfirmKind(null)}
        onConfirm={() => {
          setConfirmKind(null);
          withActor((a) =>
            void runAction(
              () => rejectMaintenanceRequest(a, request.id, rejectReason),
              "Request rejected.",
            ),
          );
        }}
      />
      <ConfirmDialog
        open={confirmKind === "verify_fail"}
        title="Fail verification?"
        description="The work order will return to In Service so workshop can continue."
        confirmLabel="Fail verification"
        tone="warning"
        pending={pending}
        onCancel={() => setConfirmKind(null)}
        onConfirm={() => {
          if (!workOrder) return;
          setConfirmKind(null);
          withActor((a) =>
            void runAction(
              () =>
                verifyWorkOrder(a, workOrder.id, {
                  result: "fail",
                  failureReason: failReason,
                }),
              "Verification failed — returned to service.",
            ),
          );
        }}
      />
      <ConfirmDialog
        open={confirmKind === "payment"}
        title="Approve payment and complete?"
        description="Requires an uploaded invoice. This completes maintenance, restores vehicle availability, and sanctions the bill."
        confirmLabel="Approve & complete"
        tone="info"
        pending={pending}
        onCancel={() => setConfirmKind(null)}
        onConfirm={() => {
          if (!workOrder) return;
          setConfirmKind(null);
          withActor((a) =>
            void runAction(
              () => approveMaintenancePayment(a, workOrder.id),
              "Payment approved — maintenance completed. Bill sanctioned.",
            ),
          );
        }}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50"
      />
    </label>
  );
}

function SelectField({
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
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none focus:border-sky-500/50"
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
