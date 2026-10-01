import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CapacitorNativeShell } from "@/components/capacitor-native-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fleet — School Fleet Operations",
  description:
    "Safer routes, faster dispatch, and a fleet team that always knows what needs attention.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-slate-900">
        <CapacitorNativeShell />
        {children}
      </body>
    </html>
  );
}
