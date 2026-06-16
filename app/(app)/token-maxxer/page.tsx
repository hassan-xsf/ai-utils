import Link from "next/link";
import { History } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { TmPreset, TmRoutine } from "@/lib/types";
import { PresetsSection } from "./config-card";
import { RoutinesSection } from "./routines-section";
import { ManualTestButton } from "./manual-test";

export const dynamic = "force-dynamic";

export default async function TokenMaxxerPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: presetsData }, { data: routinesData }, { count: runCount }] = await Promise.all([
    supabase.from("tm_presets").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("tm_routines").select("*").eq("user_id", user.id).order("time_of_day"),
    supabase.from("tm_runs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const presets = (presetsData as TmPreset[] | null) ?? [];
  const routines = (routinesData as TmRoutine[] | null) ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Token Maxxer</h1>
          <p className="text-sm text-muted">Utilize 100% of your Claude. Schedule daily routines per endpoint preset.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/token-maxxer/history" className="btn">
            <History size={12} /> Run history
          </Link>
          {presets.length > 0 && <ManualTestButton presets={presets} />}
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Presets" value={String(presets.length)} />
        <Stat label="Routines" value={String(routines.length)} />
        <Stat label="Total runs" value={String(runCount ?? 0)} />
      </section>

      <PresetsSection presets={presets} />
      <RoutinesSection routines={routines} presets={presets} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-xl mt-1 font-semibold ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
  );
}
