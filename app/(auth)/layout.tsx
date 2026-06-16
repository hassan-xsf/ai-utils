import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <header className="px-6 py-5 border-b border-[color:var(--border)]">
        <Link href="/" className="mono text-sm tracking-widest uppercase">
          <span className="text-muted">// </span>
          <span>AI <span style={{ color: "var(--accent)" }}>UTILS</span></span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
