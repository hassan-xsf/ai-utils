import Link from "next/link";
import { Zap, ArrowRight, FileText, Sparkles, FileUp, User, History, Settings } from "lucide-react";
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
        <div className="grid md:grid-cols-2 gap-4 items-start">

          <div className="panel p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded border border-(--border-strong) flex items-center justify-center text-accent">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="font-semibold tracking-tight">Auto Trigger</div>
                  <div className="text-xs text-muted">Schedule cron routines for any endpoint</div>
                </div>
              </div>
              <span className="badge badge-ok">Ready</span>
            </div>

            <div className="divider" />

            <div className="flex flex-col gap-1">
              <SubAction href="/token-maxxer" icon={<Settings size={13} />} label="Manage routines" description="Configure presets and schedules" />
              <SubAction href="/token-maxxer/history" icon={<History size={13} />} label="Run history" description="View past execution logs" />
            </div>

            <Link href="/token-maxxer" className="text-xs text-accent flex items-center gap-1 mt-auto pt-1">
              Open module <ArrowRight size={11} />
            </Link>
          </div>

          <div className="panel p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded border border-(--border-strong) flex items-center justify-center text-accent">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="font-semibold tracking-tight">CV Builder</div>
                  <div className="text-xs text-muted">AI-powered resume editor</div>
                </div>
              </div>
              <span className="badge badge-ok">Ready</span>
            </div>

            <div className="divider" />

            <div className="flex flex-col gap-1">
              <SubAction href="/cv/new/scratch" icon={<Sparkles size={13} />} label="Start from scratch" description="Write using a LaTeX template" />
              <SubAction href="/cv/new/pdf" icon={<FileUp size={13} />} label="Import from PDF" description="Let AI convert your PDF to LaTeX" />
              <SubAction href="/cv/new/generate" icon={<User size={13} />} label="From my profile" description="Auto-generate from saved context" />
            </div>

            <Link href="/cv" className="text-xs text-accent flex items-center gap-1 mt-auto pt-1">
              Open module <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-2xl mt-1 font-semibold ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
  );
}

function SubAction({ href, icon, label, description }: {
  href: string; icon: React.ReactNode; label: string; description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[rgba(241,199,10,0.05)] hover:border-accent border border-transparent transition-colors"
    >
      <span className="text-accent shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-sm font-medium leading-tight">{label}</div>
        <div className="text-xs text-muted truncate">{description}</div>
      </div>
      <ArrowRight size={11} className="text-muted ml-auto shrink-0" />
    </Link>
  );
}
