import Link from "next/link";
import { FileText, Pencil, Sparkles, FileUp, User, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { CvDocument } from "@/lib/cv/types";
import { deleteCvDocument } from "./actions";

export const dynamic = "force-dynamic";

export default async function CvPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("cv_documents")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const documents = (data as CvDocument[] | null) ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">CV Builder</h1>
        <p className="text-sm text-muted">Build, edit, and export AI-powered CVs.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Create a CV</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <OptionCard
            href="/cv/new/scratch"
            icon={<Sparkles size={18} />}
            title="Start from scratch"
            description="Write your CV manually using a LaTeX template as a starting point."
          />
          <OptionCard
            href="/cv/new/pdf"
            icon={<FileUp size={18} />}
            title="Import from PDF"
            description="Paste extracted PDF text and let AI convert it into a clean LaTeX CV."
          />
          <OptionCard
            href="/cv/new/generate"
            icon={<User size={18} />}
            title="From my profile"
            description="Auto-generate a CV from your saved profile context using AI."
          />
        </div>
      </section>

      {documents.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">Your CVs</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <CvCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OptionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="panel p-5 h-full flex flex-col gap-3 hover:border-accent transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded border border-(--border-strong) flex items-center justify-center text-accent">
            {icon}
          </div>
        </div>
        <div>
          <p className="font-semibold tracking-tight">{title}</p>
          <p className="text-sm text-muted mt-1">{description}</p>
        </div>
        <div className="text-xs text-accent flex items-center gap-1 mt-auto pt-1">
          Get started <ArrowRight size={11} />
        </div>
      </div>
    </Link>
  );
}

function CvCard({ doc }: { doc: CvDocument }) {
  const updatedAt = new Date(doc.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="panel p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={15} className="text-muted shrink-0" />
          <span className="font-medium truncate">{doc.name}</span>
        </div>
        <span className="badge shrink-0">{doc.template_id}</span>
      </div>
      <p className="text-xs text-muted">Updated {updatedAt}</p>
      <div className="flex items-center gap-2 mt-auto pt-1">
        <Link href={`/cv/${doc.id}`} className="btn btn-primary flex-1 justify-center">
          <Pencil size={12} /> Edit
        </Link>
        <form action={deleteCvDocument}>
          <input type="hidden" name="id" value={doc.id} />
          <button type="submit" className="btn btn-danger">Delete</button>
        </form>
      </div>
    </div>
  );
}
