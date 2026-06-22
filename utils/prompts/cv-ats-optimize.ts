import type { CvContext, ResumeData } from "@/lib/cv/types";

export function buildCvAtsOptimizePrompt(
  currentData: ResumeData,
  jobDescription: string,
  context: CvContext,
): string {
  return `You are a CV optimizer specializing in ATS (Applicant Tracking System) optimization.

Return ONLY a modified version of the resume JSON below, optimized for the job description.
No markdown fences, no explanation — return only the JSON object.

Rules:
- Mirror exact keywords, tools, and skills from the job description naturally throughout
- Only add skills or experiences present in the user context; never fabricate
- Reorder bullet points to surface the most relevant experience first
- Keep the JSON structure identical — do not add or remove top-level keys
- DROP any "summary" field — set it to an empty string. The CV must never contain a summary/objective/profile paragraph.
- Return valid JSON only

Job Description:
${jobDescription}

User Context (source of truth):
Bio: ${context.bio || "(not provided)"}
Skills: ${context.skills || "(not provided)"}
Experience: ${context.experience || "(not provided)"}
Education: ${context.education || "(not provided)"}
Projects: ${context.projects || "(not provided)"}
Certifications: ${context.certifications || "(not provided)"}

Current Resume JSON:
${JSON.stringify(currentData, null, 2)}`;
}
