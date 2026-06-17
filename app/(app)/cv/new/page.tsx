import Link from "next/link";
import { Sparkles, FileUp, User } from "lucide-react";
import { requireUser } from "@/lib/dal";

export default async function NewCvPage() {
  await requireUser();

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Create New CV</h1>
        <p className="text-sm text-muted">Choose how you want to build your CV.</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <OptionCard
          href="/cv/new/scratch"
          icon={<Sparkles size={20} />}
          title="Start from scratch"
          description="Write your CV manually using a LaTeX template as a starting point."
        />
        <OptionCard
          href="/cv/new/pdf"
          icon={<FileUp size={20} />}
          title="Import from PDF"
          description="Paste extracted PDF text and let AI convert it into a clean LaTeX CV."
        />
        <OptionCard
          href="/cv/new/generate"
          icon={<User size={20} />}
          title="From my profile"
          description="Auto-generate a CV from your saved profile context using AI."
        />
      </div>
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
      <div className="panel p-6 flex flex-col gap-3 h-full hover:border-[color:var(--accent)] transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded border border-[color:var(--border-strong)] flex items-center justify-center text-[color:var(--accent)]">
          {icon}
        </div>
        <div>
          <p className="font-semibold tracking-tight">{title}</p>
          <p className="text-sm text-muted mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}
