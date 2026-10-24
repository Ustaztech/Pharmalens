import Link from "next/link";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#063F3C" />
      <circle cx="22" cy="24" r="11" fill="none" stroke="#D9F5EA" strokeWidth="4" />
      <circle cx="22" cy="24" r="4" fill="#D9F5EA" />
      <path d="M29 13.5 37.5 22a5.3 5.3 0 0 1-7.5 7.5L25.5 25l3.5-11.5Z" fill="#fff" stroke="#063F3C" strokeWidth="1.5" />
      <path d="m29.3 17.2 4.8 4.8" stroke="#063F3C" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="logo" aria-label="PharmaLens home">
      <BrandMark className="logo-mark" />
      {!compact && <span>Pharma<span>Lens</span></span>}
    </Link>
  );
}
