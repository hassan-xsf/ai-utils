import Link from "next/link";
import { Zap, ArrowRight, Lock } from "lucide-react";
import { requireUser } from "@/lib/dal";

export default async function DashboardPage() {
  await requireUser();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted">Welcome back. Pick a utility to get started.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <Stat label="Account status" value="Active" accent />
        <Stat label="Plan" value="Free" />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Modules</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <ModuleCard
            href="/token-maxxer"
            title="Token Maxxer"
            subtitle="Utilize 100% of your Claude"
            description="Schedule cron routines that ping any endpoint on your chosen times and days. Works great with Claude Routines to keep your sessions active."
            icon={<Zap size={18} />}
            status="ready"
          />
          <ModuleCard
            href="#"
            title="More utilities"
            subtitle="Coming soon"
            description="Additional AI utilities will appear here as they ship."
            icon={<Lock size={18} />}
            status="locked"
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-2xl mt-1 font-semibold ${accent ? "text-[color:var(--accent)]" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function ModuleCard({
  href, title, subtitle, description, icon, status,
}: {
  href: string; title: string; subtitle: string; description: string;
  icon: React.ReactNode; status: "ready" | "locked";
}) {
  const locked = status === "locked";
  const Inner = (
    <div className={`panel p-5 h-full flex flex-col gap-3 transition-colors ${!locked ? "hover:border-[color:var(--accent)]" : "opacity-60"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded border border-[color:var(--border-strong)] flex items-center justify-center text-[color:var(--accent)]">
            {icon}
          </div>
          <div>
            <div className="font-semibold tracking-tight">{title}</div>
            <div className="text-xs text-muted">{subtitle}</div>
          </div>
        </div>
        <span className={`badge ${locked ? "" : "badge-ok"}`}>{locked ? "Locked" : "Ready"}</span>
      </div>
      <p className="text-sm text-muted">{description}</p>
      {!locked && (
        <div className="text-xs text-[color:var(--accent)] flex items-center gap-1 mt-auto pt-2">
          Open module <ArrowRight size={12} />
        </div>
      )}
    </div>
  );
  if (locked) return Inner;
  return <Link href={href}>{Inner}</Link>;
}
