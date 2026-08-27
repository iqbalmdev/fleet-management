import Link from "next/link";

export function FleetMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/owner" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2563eb] text-white">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M5.2 3.2a3.6 3.6 0 0 1 5.6 3 3.6 3.6 0 0 1-.4 1.6M10.8 12.8a3.6 3.6 0 0 1-5.6-3 3.6 3.6 0 0 1 .4-1.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M10.8 3.2 12.4 4.2 11.2 5.8M5.2 12.8 3.6 11.8 4.8 10.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={compact ? "text-sm font-semibold" : "text-base font-semibold"}>
        Fleet
      </span>
    </Link>
  );
}
