import Link from "next/link";
import { LayoutDashboard, Zap, LogOut, Settings } from "lucide-react";
import { requireUser } from "@/lib/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const email = user.email ?? "anon@local";

  return (
    <div className="relative z-10 min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-[color:var(--border)] flex flex-col">
        <div className="px-5 py-5 border-b border-[color:var(--border)]">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight block">
            AI <span style={{ color: "var(--accent)" }}>Utils</span>
          </Link>
          <div className="text-[11px] text-muted mt-0.5">v0.1 alpha</div>
        </div>
        <nav className="px-3 py-4 flex-1 space-y-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={15} />}>Dashboard</NavLink>
          <NavLink href="/token-maxxer" icon={<Zap size={15} />}>Token Maxxer</NavLink>
          <NavLink href="/settings" icon={<Settings size={15} />}>Settings</NavLink>
        </nav>
        <div className="px-3 py-3 border-t border-[color:var(--border)] space-y-2">
          <div className="px-2">
            <div className="text-[11px] text-muted">Signed in as</div>
            <div className="text-xs truncate" title={email}>{email}</div>
          </div>
          <form action="/auth/sign-out" method="post">
            <button type="submit" className="btn w-full justify-center">
              <LogOut size={12} /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded text-sm text-muted hover:text-[color:var(--accent)] hover:bg-[rgba(151,0,13,0.06)] transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
