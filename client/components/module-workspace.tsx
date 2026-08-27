"use client";

import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  DataTable,
  ModuleHeader,
  Panel,
  StatGrid,
  StatusPill,
} from "@/components/admin-ui";

export type ModuleField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  options?: Array<{ value: string; label: string }>;
};

export type ModuleRecord = Record<string, string> & { id: string };

type ModuleWorkspaceProps = {
  eyebrow: string;
  title: string;
  description: string;
  storageKey: string;
  seed: ModuleRecord[];
  fields: ModuleField[];
  columns: Array<{ key: string; label: string }>;
  statusKey?: string;
  statusTone?: Record<string, "neutral" | "success" | "warning" | "danger" | "info">;
  stats?: Array<{ label: string; value: (rows: ModuleRecord[]) => string; hint?: string }>;
  formTitle?: string;
  listTitle?: string;
  createLabel?: string;
  extra?: ReactNode | ((rows: ModuleRecord[]) => ReactNode);
  boardViews?: Array<"list" | "map">;
  mapTitle?: string;
  mapContent?: (rows: ModuleRecord[]) => ReactNode;
};

function readRecords(storageKey: string, seed: ModuleRecord[]) {
  if (typeof window === "undefined") return seed;
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    localStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(raw) as ModuleRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seed;
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }
}

function writeRecords(storageKey: string, rows: ModuleRecord[]) {
  localStorage.setItem(storageKey, JSON.stringify(rows));
}

function exportCsv(filename: string, columns: Array<{ key: string; label: string }>, rows: ModuleRecord[]) {
  const header = columns.map((column) => column.label).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((column) => `"${String(row[column.key] ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([[header, body].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ModuleWorkspace({
  eyebrow,
  title,
  description,
  storageKey,
  seed,
  fields,
  columns,
  statusKey,
  statusTone,
  stats,
  formTitle = "Add record",
  listTitle = "Records",
  createLabel = "Save",
  extra,
  boardViews,
  mapTitle = "Map view",
  mapContent,
}: ModuleWorkspaceProps) {
  const formId = useId();
  const [rows, setRows] = useState<ModuleRecord[]>(seed);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const views = boardViews ?? (mapContent ? (["list", "map"] as const) : (["list"] as const));
  const [boardView, setBoardView] = useState<"list" | "map">(views[0] ?? "list");

  useEffect(() => {
    setRows(readRecords(storageKey, seed));
    // Intentionally only re-load when storage key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const computedStats = useMemo(() => {
    if (!stats) {
      return [
        { label: "Total", value: String(rows.length) },
        { label: "Created here", value: String(rows.length) },
        { label: "Export", value: "CSV" },
        { label: "Status", value: "Live" },
      ];
    }
    return stats.map((item) => ({
      label: item.label,
      value: item.value(rows),
      hint: item.hint,
    }));
  }, [rows, stats]);

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const next: ModuleRecord = { id: `${Date.now()}` };
    for (const field of fields) {
      const value = String(form.get(field.name) ?? "").trim();
      if (!value) {
        setError(`Please fill in ${field.label}.`);
        setPending(false);
        return;
      }
      next[field.name] = value;
    }

    const updated = [next, ...rows];
    writeRecords(storageKey, updated);
    setRows(updated);
    event.currentTarget.reset();
    setMessage("Saved successfully.");
    setPending(false);
  }

  function scrollToForm() {
    document.getElementById(formId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={scrollToForm}
              className="h-10 rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white hover:bg-sky-400"
            >
              {formTitle}
            </button>
            <button
              type="button"
              onClick={() => exportCsv(`${eyebrow.toLowerCase().replaceAll(" ", "-")}.csv`, columns, rows)}
              className="h-10 rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Export CSV
            </button>
          </div>
        }
      />

      <StatGrid items={computedStats} />

      {message ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      {/* Create form first — same pattern as Drivers / Vehicles */}
      <div id={formId} className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title={formTitle}>
          <p className="mb-4 text-xs text-slate-500">
            Fill the fields below and save. New records appear in the list on the right.
          </p>
          <form onSubmit={onCreate} className="space-y-3">
            {error ? (
              <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
            ) : null}
            {fields.map((field) =>
              field.options ? (
                <label key={field.name} className="block space-y-1.5 text-sm text-slate-300">
                  {field.label}
                  <select
                    name={field.name}
                    required
                    defaultValue={field.options[0]?.value}
                    className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none focus:border-sky-500/50"
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label key={field.name} className="block space-y-1.5 text-sm text-slate-300">
                  {field.label}
                  <input
                    name={field.name}
                    type={field.type ?? "text"}
                    required
                    placeholder={field.placeholder}
                    className="h-11 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50"
                  />
                </label>
              ),
            )}
            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-60"
            >
              {pending ? "Saving…" : createLabel}
            </button>
          </form>
        </Panel>

        <Panel
          title={boardView === "map" ? mapTitle : listTitle}
          action={
            mapContent && views.length > 1 ? (
              <div className="flex rounded-lg border border-white/10 p-0.5">
                {views.map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setBoardView(view)}
                    className={`rounded-md px-3 py-1 text-xs font-medium capitalize ${
                      boardView === view
                        ? "bg-sky-500/20 text-sky-300"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            ) : undefined
          }
        >
          {boardView === "map" && mapContent ? (
            mapContent(rows)
          ) : (
            <DataTable
              columns={columns.map((column) => column.label)}
              rows={
                rows.length === 0
                  ? [
                      [
                        "No records yet — use the form to add one",
                        ...columns.slice(1).map(() => "—"),
                      ] as ReactNode[],
                    ]
                  : rows.map((row) =>
                      columns.map((column) => {
                        const value = row[column.key] ?? "—";
                        if (statusKey && column.key === statusKey) {
                          return (
                            <StatusPill
                              key={`${row.id}-${column.key}`}
                              label={value}
                              tone={statusTone?.[value] ?? "neutral"}
                            />
                          );
                        }
                        return value;
                      }),
                    )
              }
            />
          )}
        </Panel>
      </div>

      {typeof extra === "function" ? extra(rows) : extra}
    </div>
  );
}
