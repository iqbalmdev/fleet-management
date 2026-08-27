import type { ReactNode } from "react";

export function Module({
  code,
  title,
  body,
  children,
}: {
  code: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">{code}</p>
        <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{body}</p>
      </div>
      {children}
    </div>
  );
}
