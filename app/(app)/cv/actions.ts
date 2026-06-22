"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal";
import { askAi } from "@/lib/cv/ai";
import { getTemplate } from "@/lib/cv/templates/index";
import { buildCvGeneratePrompt } from "@/utils/prompts/cv-generate";
import { buildContextSystemPrompt } from "@/utils/prompts/cv-context-build";
import { buildCvFromPdfPrompt } from "@/utils/prompts/cv-from-pdf";
import { buildCvAtsOptimizePrompt } from "@/utils/prompts/cv-ats-optimize";
import { buildContextFromResumePrompt } from "@/utils/prompts/cv-context-from-resume";
import type { CvContext, ResumeData } from "@/lib/cv/types";

type ActionState = { ok: boolean; error?: string; data?: unknown };

function parseAiJson(raw: string): ResumeData {
  if (!raw || !raw.trim()) {
    throw new Error("AI returned an empty response");
  }
  let cleaned = raw.trim();
  // Strip ```json ... ``` or ``` ... ``` fences anywhere in the string
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }
  // If there's still surrounding prose, extract the first {...} block
  if (!cleaned.startsWith("{")) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI response did not contain valid JSON");
    }
    cleaned = cleaned.slice(start, end + 1);
  }
  try {
    return JSON.parse(cleaned) as ResumeData;
  } catch (e) {
    throw new Error(
      `Failed to parse AI JSON: ${e instanceof Error ? e.message : "unknown"} — raw start: ${cleaned.slice(0, 120)}`,
    );
  }
}

const CvDocumentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  template_id: z.string().min(1),
  resume_data: z.string().min(1),
});

export async function saveCvDocument(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = CvDocumentSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString()?.trim(),
    template_id: formData.get("template_id")?.toString(),
    resume_data: formData.get("resume_data")?.toString(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let resumeData: ResumeData;
  try {
    resumeData = JSON.parse(parsed.data.resume_data);
  } catch {
    return { ok: false, error: "Invalid resume data" };
  }

  const payload = {
    user_id: user.id,
    name: parsed.data.name,
    template_id: parsed.data.template_id,
    resume_data: resumeData,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("cv_documents")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/cv");
    revalidatePath(`/cv/${parsed.data.id}`);
    return { ok: true, data: { id: parsed.data.id } };
  }

  const { data, error } = await supabase
    .from("cv_documents")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cv");
  return { ok: true, data: { id: data.id } };
}

export async function deleteCvDocument(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id")?.toString();
  if (!id) return;
  await supabase.from("cv_documents").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/cv");
}

const ContextSchema = z.object({
  bio: z.string(),
  skills: z.string(),
  experience: z.string(),
  education: z.string(),
  projects: z.string(),
  certifications: z.string(),
  personal: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    title: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
});

export async function saveContext(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();

  const personalRaw = formData.get("personal")?.toString();
  let personal: Record<string, string> | undefined;
  if (personalRaw) {
    try { personal = JSON.parse(personalRaw); } catch { /* ignore */ }
  }

  const parsed = ContextSchema.safeParse({
    bio: formData.get("bio")?.toString() ?? "",
    skills: formData.get("skills")?.toString() ?? "",
    experience: formData.get("experience")?.toString() ?? "",
    education: formData.get("education")?.toString() ?? "",
    projects: formData.get("projects")?.toString() ?? "",
    certifications: formData.get("certifications")?.toString() ?? "",
    personal,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase.from("cv_contexts").upsert(
    { user_id: user.id, ...parsed.data, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cv");
  return { ok: true };
}

async function fetchUserContext(userId: string): Promise<CvContext | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cv_contexts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data as CvContext | null;
}

export async function generateCvFromContext(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const templateId = formData.get("template_id")?.toString();
  if (!templateId) return { ok: false, error: "template_id is required" };

  const context = await fetchUserContext(user.id);
  if (!context) return { ok: false, error: "No profile found. Save your profile context first." };

  let template;
  try {
    template = getTemplate(templateId);
  } catch {
    return { ok: false, error: "Unknown template" };
  }

  const prompt =
    buildContextSystemPrompt(context) + "\n\n" + buildCvGeneratePrompt(context, template.name);

  try {
    const raw = await askAi(prompt);
    const resumeData = stripPlaceholders(parseAiJson(raw));

    // Merge trusted personal contact info from the user's saved profile.
    // The AI cannot reliably extract name/email/phone/links from prose, so we
    // overwrite any (possibly empty or wrong) AI output with what the user
    // explicitly saved in their profile.
    if (context.personal) {
      const p = context.personal;
      const merge = (aiVal: string, saved: string | undefined) =>
        saved?.trim() ? saved.trim() : aiVal;
      resumeData.personal = {
        ...resumeData.personal,
        name: merge(resumeData.personal.name, p.name),
        email: merge(resumeData.personal.email, p.email),
        phone: merge(resumeData.personal.phone, p.phone),
        location: merge(resumeData.personal.location, p.location),
        title: merge(resumeData.personal.title ?? "", p.title),
        website: merge(resumeData.personal.website ?? "", p.website),
        linkedin: merge(resumeData.personal.linkedin ?? "", p.linkedin),
        github: merge(resumeData.personal.github ?? "", p.github),
      };
    }

    return { ok: true, data: { resumeData } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed" };
  }
}

// Removes common LLM placeholder strings from the resume — defense-in-depth
// against the model fabricating contact details when the user didn't provide
// them. Also unconditionally strips any "summary" field — by product decision
// the CV never includes a summary/objective paragraph.
function stripPlaceholders(data: ResumeData): ResumeData {
  const placeholderPatterns = [
    /^your\s+(name|phone|email|address|location|website|linkedin|github|profile)/i,
    /^your\s+\w+\s+(number|profile|url|address)$/i,
    /your\.email@example\.com/i,
    /example\.com/i,
    /^john\s+doe$/i,
    /^jane\s+doe$/i,
    /^\+?1?\s*\(?555\)?[\s.-]?\d{3}[\s.-]?\d{4}$/i,
    /^123[\s.-]?456[\s.-]?7890$/i,
    /^\[.+\]$/, // [insert email here]
    /^<.+>$/, // <your name>
    /^lorem\s+ipsum/i,
  ];

  const isPlaceholder = (v: string | undefined): boolean => {
    if (!v) return false;
    const trimmed = v.trim();
    if (!trimmed) return false;
    return placeholderPatterns.some((re) => re.test(trimmed));
  };

  const clean = (v: string | undefined): string => (isPlaceholder(v) ? "" : v ?? "");

  return {
    ...data,
    summary: "",
    personal: {
      ...data.personal,
      name: clean(data.personal?.name),
      email: clean(data.personal?.email),
      phone: clean(data.personal?.phone),
      location: clean(data.personal?.location),
      title: clean(data.personal?.title),
      website: clean(data.personal?.website),
      linkedin: clean(data.personal?.linkedin),
      github: clean(data.personal?.github),
    },
  };
}

export async function generateCvFromPdf(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireUser();

  const extractedText = formData.get("extracted_text")?.toString();
  const templateId = formData.get("template_id")?.toString();

  if (!extractedText) return { ok: false, error: "extracted_text is required" };
  if (!templateId) return { ok: false, error: "template_id is required" };

  let template;
  try {
    template = getTemplate(templateId);
  } catch {
    return { ok: false, error: "Unknown template" };
  }

  const prompt = buildCvFromPdfPrompt(extractedText, template.name);

  try {
    const raw = await askAi(prompt);
    const resumeData = stripPlaceholders(parseAiJson(raw));
    return { ok: true, data: { resumeData } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed" };
  }
}

export async function buildContextFromResume(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  await requireUser();

  const resumeDataRaw = formData.get("resume_data")?.toString();
  if (!resumeDataRaw) return { ok: false, error: "resume_data is required" };

  let resume: ResumeData;
  try {
    resume = JSON.parse(resumeDataRaw);
  } catch {
    return { ok: false, error: "Invalid resume data" };
  }

  const prompt = buildContextFromResumePrompt(resume);

  try {
    const raw = await askAi(prompt);
    const context = parseLooseJsonObject(raw) as Partial<CvContext>;
    return { ok: true, data: { context } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed" };
  }
}

// Parses a JSON object from an LLM response that may include code fences,
// surrounding prose, or unescaped control characters (raw newlines/tabs)
// inside string values.
function parseLooseJsonObject(raw: string): unknown {
  let c = raw.trim();
  const fence = c.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) c = fence[1].trim();
  if (!c.startsWith("{")) {
    const start = c.indexOf("{");
    const end = c.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI response did not contain valid JSON");
    c = c.slice(start, end + 1);
  }
  try {
    return JSON.parse(c);
  } catch {
    // Escape raw control chars inside string literals. Walk the JSON tracking
    // whether we're inside a "..." string, and replace literal \n \r \t with
    // their escaped forms only inside strings.
    let out = "";
    let inString = false;
    let escaped = false;
    for (const ch of c) {
      if (inString) {
        if (escaped) {
          out += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          out += ch;
          escaped = true;
          continue;
        }
        if (ch === "\"") {
          out += ch;
          inString = false;
          continue;
        }
        if (ch === "\n") { out += "\\n"; continue; }
        if (ch === "\r") { out += "\\r"; continue; }
        if (ch === "\t") { out += "\\t"; continue; }
        out += ch;
      } else {
        if (ch === "\"") inString = true;
        out += ch;
      }
    }
    return JSON.parse(out);
  }
}

export async function optimizeForAts(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const resumeDataRaw = formData.get("resume_data")?.toString();
  const jobDescription = formData.get("job_description")?.toString();

  if (!resumeDataRaw) return { ok: false, error: "resume_data is required" };
  if (!jobDescription) return { ok: false, error: "job_description is required" };

  let currentData: ResumeData;
  try {
    currentData = JSON.parse(resumeDataRaw);
  } catch {
    return { ok: false, error: "Invalid resume data" };
  }

  const context = await fetchUserContext(user.id);
  if (!context) return { ok: false, error: "No profile found. Save your profile context first." };

  const prompt = buildCvAtsOptimizePrompt(currentData, jobDescription, context);

  try {
    const raw = await askAi(prompt);
    const resumeData = stripPlaceholders(parseAiJson(raw));
    return { ok: true, data: { resumeData } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed" };
  }
}
