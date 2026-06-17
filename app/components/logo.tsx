export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tag/label shape */}
      <path
        d="M4 10C4 8.895 4.895 8 6 8h12l10 8-10 8H6C4.895 24 4 23.105 4 22V10z"
        stroke="var(--accent)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Dot inside tag */}
      <circle cx="9" cy="16" r="2" fill="var(--accent)" />
      {/* Arrow/chevron lines suggesting trigger */}
      <path d="M18 12l4 4-4 4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={28} />
      <span className="font-semibold tracking-tight text-foreground">
        AI <span style={{ color: "var(--accent)" }}>UTILS</span>
      </span>
    </div>
  );
}
