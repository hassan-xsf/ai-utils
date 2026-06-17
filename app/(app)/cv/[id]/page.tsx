import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { CV_TEMPLATES } from "@/lib/cv/templates/index";
import type { CvDocument, CvContext } from "@/lib/cv/types";
import { CvEditor } from "@/app/(app)/cv/components/cv-editor";

export const dynamic = "force-dynamic";

export default async function CvEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: docData }, { data: contextData }] = await Promise.all([
    supabase
      .from("cv_documents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("cv_contexts").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!docData) notFound();

  return (
    <CvEditor
      document={docData as CvDocument}
      context={(contextData as CvContext | null) ?? null}
      templates={CV_TEMPLATES}
    />
  );
}
