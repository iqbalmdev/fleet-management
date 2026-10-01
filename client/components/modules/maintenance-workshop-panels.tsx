"use client";

import { useState } from "react";
import {
  DataTable,
  GhostButton,
  Panel,
  PrimaryButton,
  StatusPill,
} from "@/components/admin-ui";
import {
  EXPENSE_TYPES,
  TASK_STATUSES,
  costVarianceMinor,
  formatMoneyMinor,
  formatDateLabel,
  type FileRef,
  type MaintenanceActor,
  type MaintenanceRequestBundle,
  type TaskStatus,
} from "@/lib/maintenance";
import {
  addMaintenanceAttachment,
  addWorkOrderExpense,
  addWorkOrderInvoice,
  addWorkOrderPart,
  addWorkOrderTask,
  fileToFileRef,
  MaintenanceError,
  updateWorkOrderDiagnosis,
  updateWorkOrderTaskStatus,
} from "@/lib/maintenance-store";
import { todayIsoDate } from "@/lib/maintenance/schedule";
import {
  maintenanceValidationSummary,
  validateExpenseForm,
  validateInvoiceForm,
  validatePartForm,
} from "@/lib/validation/maintenance";

type Props = {
  bundle: MaintenanceRequestBundle;
  actor: MaintenanceActor | null;
  canEditWorkshop: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
};

export function MaintenanceWorkshopPanels({
  bundle,
  actor,
  canEditWorkshop,
  onChanged,
  onError,
  onSuccess,
}: Props) {
  const workOrder = bundle.workOrder;
  if (!workOrder) {
    return (
      <Panel title="Workshop">
        <p className="text-sm text-slate-400">
          Create a work order to manage diagnosis, tasks, parts, expenses and invoices.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <DiagnosisPanel
        bundle={bundle}
        actor={actor}
        canEdit={canEditWorkshop}
        onChanged={onChanged}
        onError={onError}
        onSuccess={onSuccess}
      />
      <TasksPanel
        bundle={bundle}
        actor={actor}
        canEdit={canEditWorkshop}
        onChanged={onChanged}
        onError={onError}
        onSuccess={onSuccess}
      />
      <PartsPanel
        bundle={bundle}
        actor={actor}
        canEdit={canEditWorkshop}
        onChanged={onChanged}
        onError={onError}
        onSuccess={onSuccess}
      />
      <ExpensesPanel
        bundle={bundle}
        actor={actor}
        canEdit={canEditWorkshop}
        onChanged={onChanged}
        onError={onError}
        onSuccess={onSuccess}
      />
      <InvoicePanel
        bundle={bundle}
        actor={actor}
        canEdit={canEditWorkshop}
        onChanged={onChanged}
        onError={onError}
        onSuccess={onSuccess}
      />
      <DocumentsPanel
        bundle={bundle}
        actor={actor}
        onChanged={onChanged}
        onError={onError}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function DiagnosisPanel({
  bundle,
  actor,
  canEdit,
  onChanged,
  onError,
  onSuccess,
}: {
  bundle: MaintenanceRequestBundle;
  actor: MaintenanceActor | null;
  canEdit: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
}) {
  const wo = bundle.workOrder!;
  const [diagnosis, setDiagnosis] = useState(wo.diagnosis ?? "");
  const [rootCause, setRootCause] = useState(wo.rootCause ?? "");
  const [recommendedAction, setRecommendedAction] = useState(wo.recommendedAction ?? "");
  const [technicianNotes, setTechnicianNotes] = useState(wo.technicianNotes ?? "");

  return (
    <Panel title="Diagnosis">
      {canEdit ? (
        <div className="space-y-3">
          <TextArea label="Diagnosis" value={diagnosis} onChange={setDiagnosis} />
          <Field label="Root cause" value={rootCause} onChange={setRootCause} />
          <TextArea
            label="Recommended action"
            value={recommendedAction}
            onChange={setRecommendedAction}
          />
          <TextArea
            label="Technician notes"
            value={technicianNotes}
            onChange={setTechnicianNotes}
          />
          <PrimaryButton
            onClick={() => {
              if (!actor) return;
              try {
                updateWorkOrderDiagnosis(actor, wo.id, {
                  diagnosis,
                  rootCause,
                  recommendedAction,
                  technicianNotes,
                });
                onSuccess("Diagnosis saved.");
                onChanged();
              } catch (err) {
                onError(err instanceof MaintenanceError ? err.message : "Failed to save diagnosis");
              }
            }}
          >
            Save diagnosis
          </PrimaryButton>
        </div>
      ) : (
        <dl className="space-y-2 text-sm text-slate-300">
          <Row label="Diagnosis" value={wo.diagnosis ?? "—"} />
          <Row label="Root cause" value={wo.rootCause ?? "—"} />
          <Row label="Recommended" value={wo.recommendedAction ?? "—"} />
          <Row label="Notes" value={wo.technicianNotes ?? "—"} />
        </dl>
      )}
    </Panel>
  );
}

function TasksPanel({
  bundle,
  actor,
  canEdit,
  onChanged,
  onError,
  onSuccess,
}: {
  bundle: MaintenanceRequestBundle;
  actor: MaintenanceActor | null;
  canEdit: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
}) {
  const wo = bundle.workOrder!;
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("");
  const [labourRupees, setLabourRupees] = useState("");
  const [hours, setHours] = useState("");

  return (
    <Panel title={`Tasks (${bundle.tasks.length})`}>
      {bundle.tasks.length === 0 ? (
        <p className="mb-4 text-sm text-slate-400">No tasks yet.</p>
      ) : (
        <DataTable
          columns={["Task", "Category", "Status", "Labour", ""]}
          rows={bundle.tasks.map((task) => [
            task.taskName,
            task.category ?? "—",
            <StatusPill
              key={`${task.id}-st`}
              label={task.status}
              tone={
                task.status === "completed"
                  ? "success"
                  : task.status === "in_progress"
                    ? "info"
                    : task.status === "cancelled"
                      ? "neutral"
                      : "warning"
              }
            />,
            formatMoneyMinor(task.labourCostMinor),
            canEdit ? (
              <select
                key={`${task.id}-sel`}
                value={task.status}
                className="h-8 rounded border border-white/10 bg-[#0b1220] px-2 text-xs text-slate-200"
                onChange={(event) => {
                  if (!actor) return;
                  try {
                    updateWorkOrderTaskStatus(
                      actor,
                      task.id,
                      event.target.value as TaskStatus,
                    );
                    onSuccess("Task status updated.");
                    onChanged();
                  } catch (err) {
                    onError(err instanceof MaintenanceError ? err.message : "Update failed");
                  }
                }}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              "—"
            ),
          ])}
        />
      )}

      {canEdit ? (
        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
          <Field label="Task name *" value={taskName} onChange={setTaskName} />
          <Field label="Category" value={category} onChange={setCategory} />
          <Field
            label="Labour (₹)"
            value={labourRupees}
            onChange={setLabourRupees}
            type="number"
          />
          <Field label="Est. hours" value={hours} onChange={setHours} type="number" />
          <div className="md:col-span-2">
            <PrimaryButton
              onClick={() => {
                if (!actor || !taskName.trim()) {
                  onError("Task name is required.");
                  return;
                }
                try {
                  addWorkOrderTask(actor, wo.id, {
                    taskName,
                    category: category || null,
                    labourCostMinor: labourRupees
                      ? Math.round(Number(labourRupees) * 100)
                      : 0,
                    estimatedHours: hours ? Number(hours) : null,
                  });
                  setTaskName("");
                  setCategory("");
                  setLabourRupees("");
                  setHours("");
                  onSuccess("Task added.");
                  onChanged();
                } catch (err) {
                  onError(err instanceof MaintenanceError ? err.message : "Failed to add task");
                }
              }}
            >
              Add task
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function PartsPanel({
  bundle,
  actor,
  canEdit,
  onChanged,
  onError,
  onSuccess,
}: {
  bundle: MaintenanceRequestBundle;
  actor: MaintenanceActor | null;
  canEdit: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
}) {
  const wo = bundle.workOrder!;
  const [partName, setPartName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [tax, setTax] = useState("0");
  const [discount, setDiscount] = useState("0");

  return (
    <Panel title={`Parts (${bundle.parts.length})`}>
      {bundle.parts.length === 0 ? (
        <p className="mb-4 text-sm text-slate-400">No parts yet.</p>
      ) : (
        <DataTable
          columns={["Part", "No.", "Qty", "Unit", "Tax", "Disc.", "Total"]}
          rows={bundle.parts.map((part) => [
            part.partName,
            part.partNumber ?? "—",
            String(part.quantity),
            formatMoneyMinor(part.unitPriceMinor),
            formatMoneyMinor(part.taxMinor),
            formatMoneyMinor(part.discountMinor),
            formatMoneyMinor(part.totalPriceMinor),
          ])}
        />
      )}

      {canEdit ? (
        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-3">
          <Field label="Part name *" value={partName} onChange={setPartName} />
          <Field label="Part number" value={partNumber} onChange={setPartNumber} />
          <Field label="Quantity *" value={quantity} onChange={setQuantity} type="number" />
          <Field label="Unit price (₹) *" value={unitPrice} onChange={setUnitPrice} type="number" />
          <Field label="Tax (₹)" value={tax} onChange={setTax} type="number" />
          <Field label="Discount (₹)" value={discount} onChange={setDiscount} type="number" />
          <div className="md:col-span-3">
            <PrimaryButton
              onClick={() => {
                if (!actor) return;
                const result = validatePartForm({
                  partName,
                  partNumber,
                  quantity,
                  unitPriceRupees: unitPrice,
                  taxRupees: tax,
                  discountRupees: discount,
                  warranty: "",
                  warrantyExpiryDate: "",
                });
                if (!result.ok) {
                  onError(maintenanceValidationSummary(result.errors));
                  return;
                }
                try {
                  addWorkOrderPart(actor, wo.id, result.data);
                  setPartName("");
                  setPartNumber("");
                  setQuantity("1");
                  setUnitPrice("");
                  setTax("0");
                  setDiscount("0");
                  onSuccess("Part added.");
                  onChanged();
                } catch (err) {
                  onError(err instanceof MaintenanceError ? err.message : "Failed to add part");
                }
              }}
            >
              Add part
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function ExpensesPanel({
  bundle,
  actor,
  canEdit,
  onChanged,
  onError,
  onSuccess,
}: {
  bundle: MaintenanceRequestBundle;
  actor: MaintenanceActor | null;
  canEdit: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
}) {
  const wo = bundle.workOrder!;
  const [expenseType, setExpenseType] = useState("miscellaneous");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIsoDate());

  return (
    <Panel title={`Other expenses (${bundle.expenses.length})`}>
      {bundle.expenses.length === 0 ? (
        <p className="mb-4 text-sm text-slate-400">No additional expenses yet.</p>
      ) : (
        <DataTable
          columns={["Type", "Description", "Date", "Amount"]}
          rows={bundle.expenses.map((expense) => [
            expense.expenseType.replaceAll("_", " "),
            expense.description,
            formatDateLabel(expense.date),
            formatMoneyMinor(expense.amountMinor),
          ])}
        />
      )}

      {canEdit ? (
        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
          <SelectField
            label="Expense type"
            value={expenseType}
            onChange={setExpenseType}
            options={EXPENSE_TYPES.map((t) => ({
              value: t,
              label: t.replaceAll("_", " "),
            }))}
          />
          <Field label="Amount (₹) *" value={amount} onChange={setAmount} type="number" />
          <Field label="Description *" value={description} onChange={setDescription} />
          <Field label="Date *" value={date} onChange={setDate} type="date" />
          <div className="md:col-span-2">
            <PrimaryButton
              onClick={() => {
                if (!actor) return;
                const result = validateExpenseForm({
                  expenseType,
                  description,
                  amountRupees: amount,
                  date,
                });
                if (!result.ok) {
                  onError(maintenanceValidationSummary(result.errors));
                  return;
                }
                try {
                  addWorkOrderExpense(actor, wo.id, result.data);
                  setDescription("");
                  setAmount("");
                  onSuccess("Expense added.");
                  onChanged();
                } catch (err) {
                  onError(
                    err instanceof MaintenanceError ? err.message : "Failed to add expense",
                  );
                }
              }}
            >
              Add expense
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function InvoicePanel({
  bundle,
  actor,
  canEdit,
  onChanged,
  onError,
  onSuccess,
}: {
  bundle: MaintenanceRequestBundle;
  actor: MaintenanceActor | null;
  canEdit: boolean;
  onChanged: () => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
}) {
  const wo = bundle.workOrder!;
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayIsoDate());
  const [vendorName, setVendorName] = useState(bundle.vendor?.vendorName ?? "");
  const [subtotal, setSubtotal] = useState("");
  const [tax, setTax] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const variance = costVarianceMinor(
    wo.estimatedTotalCostMinor,
    wo.actualTotalCostMinor,
  );

  return (
    <Panel title="Invoice & cost variance">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <CostCard label="Estimated" value={formatMoneyMinor(wo.estimatedTotalCostMinor)} />
        <CostCard label="Actual" value={formatMoneyMinor(wo.actualTotalCostMinor)} />
        <CostCard
          label="Variance"
          value={`${variance >= 0 ? "+" : ""}${formatMoneyMinor(variance)}`}
          tone={variance > 0 ? "danger" : variance < 0 ? "success" : "neutral"}
        />
      </div>

      {bundle.invoices.length > 0 ? (
        <DataTable
          columns={["Invoice #", "Date", "Vendor", "Total", "File"]}
          rows={bundle.invoices.map((invoice) => [
            invoice.invoiceNumber,
            formatDateLabel(invoice.invoiceDate),
            invoice.vendorName ?? "—",
            formatMoneyMinor(invoice.invoiceTotalMinor),
            invoice.attachment?.localDataUrl ? (
              <a
                key={invoice.id}
                href={invoice.attachment.localDataUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300"
              >
                {invoice.attachment.fileName}
              </a>
            ) : (
              invoice.attachment?.fileName ?? "—"
            ),
          ])}
        />
      ) : (
        <p className="mb-4 text-sm text-slate-400">No invoice uploaded yet.</p>
      )}

      {canEdit ? (
        <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
          <Field
            label="Invoice number *"
            value={invoiceNumber}
            onChange={setInvoiceNumber}
          />
          <Field
            label="Invoice date *"
            value={invoiceDate}
            onChange={setInvoiceDate}
            type="date"
          />
          <Field label="Vendor" value={vendorName} onChange={setVendorName} />
          <Field
            label="Subtotal (₹) *"
            value={subtotal}
            onChange={setSubtotal}
            type="number"
          />
          <Field label="Tax (₹)" value={tax} onChange={setTax} type="number" />
          <Field
            label="Discount (₹)"
            value={discount}
            onChange={setDiscount}
            type="number"
          />
          <label className="block space-y-1.5 text-sm text-slate-300 md:col-span-2">
            Attachment (PDF / JPG / PNG, max 2 MB)
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-3 file:py-2 file:text-sky-300"
            />
          </label>
          <div className="md:col-span-2">
            <PrimaryButton
              disabled={uploading}
              onClick={() => {
                if (!actor) return;
                const result = validateInvoiceForm({
                  invoiceNumber,
                  invoiceDate,
                  vendorName,
                  subtotalRupees: subtotal,
                  taxRupees: tax,
                  discountRupees: discount,
                });
                if (!result.ok) {
                  onError(maintenanceValidationSummary(result.errors));
                  return;
                }
                void (async () => {
                  setUploading(true);
                  onError(null);
                  try {
                    let attachment: FileRef | null = null;
                    if (file) attachment = await fileToFileRef(file);
                    addWorkOrderInvoice(actor, wo.id, result.data, attachment);
                    setInvoiceNumber("");
                    setSubtotal("");
                    setTax("0");
                    setDiscount("0");
                    setFile(null);
                    onSuccess("Invoice saved.");
                    onChanged();
                  } catch (err) {
                    onError(
                      err instanceof MaintenanceError
                        ? err.message
                        : "Failed to upload invoice",
                    );
                  } finally {
                    setUploading(false);
                  }
                })();
              }}
            >
              {uploading ? "Uploading…" : "Save invoice"}
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function DocumentsPanel({
  bundle,
  actor,
  onChanged,
  onError,
  onSuccess,
}: {
  bundle: MaintenanceRequestBundle;
  actor: MaintenanceActor | null;
  onChanged: () => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
}) {
  const [kind, setKind] = useState("issue_photo");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <Panel title={`Documents (${bundle.attachments.length})`}>
      {bundle.attachments.length === 0 ? (
        <p className="mb-4 text-sm text-slate-400">No attachments yet.</p>
      ) : (
        <DataTable
          columns={["Kind", "File", "Uploaded"]}
          rows={bundle.attachments.map((item) => [
            item.kind.replaceAll("_", " "),
            item.file.localDataUrl ? (
              <a
                key={item.id}
                href={item.file.localDataUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300"
              >
                {item.file.fileName}
              </a>
            ) : (
              item.file.fileName
            ),
            formatDateLabel(item.uploadedAt),
          ])}
        />
      )}

      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-2">
        <SelectField
          label="Document kind"
          value={kind}
          onChange={setKind}
          options={[
            "issue_photo",
            "condition_photo",
            "estimate",
            "quotation",
            "job_card",
            "receipt",
            "warranty",
            "service_report",
            "other",
          ].map((k) => ({ value: k, label: k.replaceAll("_", " ") }))}
        />
        <label className="block space-y-1.5 text-sm text-slate-300">
          File
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-3 file:py-2 file:text-sky-300"
          />
        </label>
        <div>
          <GhostButton
            disabled={uploading || !file}
            onClick={() => {
              if (!actor || !file) return;
              void (async () => {
                setUploading(true);
                try {
                  const ref = await fileToFileRef(file);
                  addMaintenanceAttachment(actor, bundle.request.id, {
                    kind: kind as Parameters<typeof addMaintenanceAttachment>[2]["kind"],
                    file: ref,
                    workOrderId: bundle.workOrder?.id ?? null,
                  });
                  setFile(null);
                  onSuccess("Attachment uploaded.");
                  onChanged();
                } catch (err) {
                  onError(
                    err instanceof MaintenanceError ? err.message : "Upload failed",
                  );
                } finally {
                  setUploading(false);
                }
              })();
            }}
          >
            {uploading ? "Uploading…" : "Upload document"}
          </GhostButton>
        </div>
      </div>
    </Panel>
  );
}

function CostCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "danger";
}) {
  const color =
    tone === "danger"
      ? "text-rose-300"
      : tone === "success"
        ? "text-emerald-300"
        : "text-white";
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={`mt-2 text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd>{value}</dd>
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
        className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none focus:border-sky-500/50"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-300">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white outline-none focus:border-sky-500/50"
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
