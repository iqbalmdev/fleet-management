import type { ReactNode } from "react";

export function ModuleHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  const cols =
    items.length <= 3
      ? "sm:grid-cols-2 xl:grid-cols-3"
      : items.length === 5
        ? "sm:grid-cols-2 xl:grid-cols-5"
        : "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6";
  return (
    <div className={`grid gap-4 ${cols}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-[#111827] px-5 py-4"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-white">{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs text-slate-500">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#111827]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-[0.12em] text-slate-200">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-slate-500/15 text-slate-300",
    success: "bg-emerald-500/15 text-emerald-300",
    warning: "bg-amber-500/15 text-amber-300",
    danger: "bg-rose-500/15 text-rose-300",
    info: "bg-sky-500/15 text-sky-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {label}
    </span>
  );
}

export function PrimaryButton({
  children,
  type = "button",
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-10 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  type = "button",
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-10 rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Array<ReactNode>>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-slate-500">
            {columns.map((column) => (
              <th key={column} className="px-3 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-white/5 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-3 text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      className="h-10 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-sky-500/50 sm:w-64"
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center">
      <p className="text-sm font-medium text-slate-200">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-white/10 bg-[#111827] px-4 py-16">
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function InlineAlert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "danger" | "warning";
  children: ReactNode;
}) {
  const styles = {
    info: "border-sky-500/30 bg-sky-500/10 text-sky-100",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    danger: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  };
  return (
    <p className={`rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}>{children}</p>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "info";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  const confirmClass =
    tone === "danger"
      ? "bg-rose-500 hover:bg-rose-400"
      : tone === "warning"
        ? "bg-amber-500 hover:bg-amber-400"
        : "bg-sky-500 hover:bg-sky-400";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#111827] p-5 shadow-xl"
      >
        <h3 id="confirm-dialog-title" className="text-base font-semibold text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <GhostButton onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </GhostButton>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`h-10 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60 ${confirmClass}`}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
