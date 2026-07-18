import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 rounded-md" aria-label="Mighty Miners — на главную">
      <svg aria-hidden="true" viewBox="0 0 56 42" className="h-9 w-12 shrink-0">
        <path d="M2 35 15 5l13 24L41 5l13 30h-9L40 22 28 40 16 22l-5 13Z" fill="none" stroke="#527a43" strokeWidth="1.6" />
        <path d="m7 34 10-23m-6 24 9-18m-4 18 7-12m4 12L41 7m-9 28 12-22m-7 22 10-15m-5 15 8-9" fill="none" stroke="#8ca37f" strokeWidth="1" />
      </svg>
      {!compact && (
        <span className="text-[15px] font-extrabold leading-[0.95] tracking-[0.14em] text-ink">
          MIGHTY
          <br />
          MINERS
        </span>
      )}
    </Link>
  );
}
