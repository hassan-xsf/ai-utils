import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
          AI <span style={{ color: "var(--accent)" }}>UTILS</span>
        </h1>
        <p className="text-sm text-muted">
          Schedule cron routines that fire any endpoint — automatically, on your schedule.
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <Link href="/sign-in" className="btn btn-primary">Sign in</Link>
          <Link href="/sign-up" className="btn">Create account</Link>
        </div>
      </div>
    </div>
  );
}
