import type { CvContext } from "@/lib/cv/types";

const SCHEMA = `{
  personal: { name, email, phone, location, title?, website?, linkedin?, github? },
  summary?: string,
  experience: Array<{ company, title, location?, startDate, endDate, bullets: string[] }>,
  education: Array<{ institution, degree, location?, startDate, endDate, gpa?, notes? }>,
  skills: Array<{ category: string, items: string }>,
  projects: Array<{ name, tech?, date?, bullets: string[], url? }>,
  certifications?: Array<{ name, issuer?, date? }>,
  publications?: Array<{ authors, title, venue, year }>,
  awards?: Array<{ name, date? }>
}`;

export function buildCvGeneratePrompt(context: CvContext, templateName: string): string {
  return `You are a professional CV writer. Build a complete, polished CV from the user information below.

Return ONLY a valid JSON object — no markdown fences, no explanation, no trailing text.

JSON schema:
${SCHEMA}

Rules:
- Use only information present in the user context; never fabricate
- Write concise, professional bullet points with strong action verbs and metrics
- Match the style and focus of the "${templateName}" template
- Dates: "Mon YYYY" or "YYYY" format; use "Present" for current roles
- If a field has no data, omit optional fields or leave arrays empty

User context:
Bio: ${context.bio || "(not provided)"}
Skills: ${context.skills || "(not provided)"}
Experience: ${context.experience || "(not provided)"}
Education: ${context.education || "(not provided)"}
Projects: ${context.projects || "(not provided)"}
Certifications: ${context.certifications || "(not provided)"}`;
}
