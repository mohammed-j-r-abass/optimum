export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#23305E" />
      <path d="M14 46h12v-9h12v-9h12" stroke="#E8B04A" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="18" r="5" fill="#D9643A" />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-display text-xl font-semibold ${light ? 'text-sidebar-foreground' : 'text-ink'}`}>
        Opti<span className="text-clay">mum</span>
      </span>
    </span>
  );
}
