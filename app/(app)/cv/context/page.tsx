import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { CvContext } from "@/lib/cv/types";
import { ContextForm } from "./context-form";

export const dynamic = "force-dynamic";

export default async function ContextPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("cv_contexts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Your Profile / Knowledge Base</h1>
        <p className="text-sm" style={{ color: "var(--fg-dim)" }}>
          This information is used by AI to generate personalized CVs.
        </p>
      </header>

      <div className="panel p-6">
        <ContextForm context={(data as CvContext | null) ?? null} />
      </div>
    </div>
  );
}
