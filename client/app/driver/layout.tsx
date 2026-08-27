import type { ReactNode } from "react";
import { DriverShell } from "@/components/driver-shell";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return <DriverShell>{children}</DriverShell>;
}
