import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { TmRoutine, TmRun } from "@/lib/types";
import { History, ArrowLeft } from "lucide-react";
import { RunRow } from "./run-row";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: routines }, { data: runs }] = await Promise.all([
    supabase.from("tm_routines").select("*").eq("user_id", user.id),
    supabase
      .from("tm_runs")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(150),
  ]);

  const routinesById = new Map<string, TmRoutine>(
    ((routines as TmRoutine[] | null) ?? []).map((r) => [r.id, r])
  );
  const list = (runs as TmRun[] | null) ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <Link href="/token-maxxer" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">
        <ArrowLeft size={14} /> Back to Token Maxxer
      </Link>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <History size={22} /> Run history
        </h1>
        <p className="text-sm text-muted">
          Last 30 runs per routine. Manual tests and cron executions shown together.
        </p>
      </header>

      {list.length === 0 && (
        <div className="panel p-10 text-center text-muted text-sm">
          No runs yet — they&apos;ll appear here after the first execution.
        </div>
      )}

      {list.length > 0 && (
        <div className="panel">
          <div className="grid grid-cols-[36px_1fr_120px_90px_90px_180px_28px] gap-3 px-4 py-3 border-b border-border text-xs text-muted">
            <span></span>
            <span>Routine</span>
            <span>Trigger</span>
            <span>Status</span>
            <span>Latency</span>
            <span>Started</span>
            <span></span>
          </div>
          <ul className="divide-y divide-border">
            {list.map((run) => (
              <RunRow
                key={run.id}
                run={run}
                routine={run.routine_id ? routinesById.get(run.routine_id) : undefined}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
