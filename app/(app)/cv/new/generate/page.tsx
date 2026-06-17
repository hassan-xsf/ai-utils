import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { CV_TEMPLATES } from "@/lib/cv/templates/index";
import { EMPTY_RESUME_DATA } from "@/lib/cv/resume-data";
import type { CvContext, CvDocument } from "@/lib/cv/types";
import { CvEditor } from "@/app/(app)/cv/components/cv-editor";

export const dynamic = "force-dynamic";

export default async function NewGeneratePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: contextData } = await supabase
    .from("cv_contexts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!contextData) {
    redirect("/cv/context");
  }

  const blankDoc: CvDocument = {
    id: "",
    user_id: user.id,
    name: "Untitled CV",
    template_id: "jakes",
    resume_data: EMPTY_RESUME_DATA,
    created_at: "",
    updated_at: "",
  };

  return (
    <CvEditor
      document={blankDoc}
      context={contextData as CvContext}
      templates={CV_TEMPLATES}
      initialMode="generate"
    />
  );
}
