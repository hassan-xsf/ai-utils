import type { CvContext } from "@/lib/cv/types";

const SCHEMA = `{
  personal: { name, email, phone, location, title?, website?, linkedin?, github? },
  experience: Array<{ company, title, location?, startDate, endDate, bullets: string[] }>,
  education: Array<{ institution, degree, location?, startDate, endDate, gpa?, notes? }>,
  skills: Array<{ category: string, items: string }>,
  projects: Array<{ name, tech?, date?, bullets: string[], url? }>,
  certifications?: Array<{ name, issuer?, date? }>,
  publications?: Array<{ authors, title, venue, year }>,
  awards?: Array<{ name, date? }>
}

DO NOT include a "summary" field. The CV must never have a summary/objective/profile section.`;

export function buildCvGeneratePrompt(context: CvContext, templateName: string): string {
  return `You are a professional CV writer. Build a focused, polished CV from the user information below.

Return ONLY a valid JSON object — no markdown fences, no explanation, no trailing text.

JSON schema:
${SCHEMA}

EXTRACTION RULES:
- READ the user context carefully and EXTRACT every real fact present — name, email, phone, location, links, etc. The bio or other fields often mention these in prose. PULL THEM OUT.
- The "personal.name" field MUST be filled with the user's actual name if it appears anywhere in the context (bio, intro line, signature, etc.).
- Email, phone, links: extract any that appear in the context, even in free-form prose.

DO NOT FABRICATE:
- NEVER invent values you cannot find in the context. Do not insert placeholders like "Your Name", "your.email@example.com", "Your Phone Number", "Your GitHub Profile", "John Doe", "Example University", "555-123-4567", etc.
- If a piece of information is genuinely absent from the context, set that field to an empty string "" — never fill it with a placeholder or guess.
- Distinguish between EXTRACTING (good — pull real facts from prose) and FABRICATING (bad — making up values).

CURATION (be selective — quality over quantity):
- Projects: include AT MOST 3 projects, choosing the most impressive and relevant. Skip the rest.
- Experience: include only meaningful roles (skip trivial or very brief ones if there are stronger alternatives). Maximum 4-5 entries.
- Bullets per role/project: 2-4 punchy bullets each. Drop weak bullets — concise beats comprehensive.
- Skills: group into 3-5 logical categories (e.g., Languages, Frameworks, Tools). Pick the most relevant skills for a professional CV — don't list everything.
- Certifications/Awards: include only notable ones.

WRITING STYLE:
- Bullets start with strong action verbs ("Built", "Led", "Reduced", "Designed")
- Include metrics when present in the user context (numbers, percentages, scale)
- Match the style and focus of the "${templateName}" template
- Dates: "Mon YYYY" or "YYYY" format; use "Present" for current roles

User context:
${context.personal ? `Personal Info (use these values exactly in the personal fields):
Name: ${context.personal.name || "(not provided)"}
Email: ${context.personal.email || "(not provided)"}
Phone: ${context.personal.phone || "(not provided)"}
Location: ${context.personal.location || "(not provided)"}
Title: ${context.personal.title || "(not provided)"}
Website: ${context.personal.website || "(not provided)"}
LinkedIn: ${context.personal.linkedin || "(not provided)"}
GitHub: ${context.personal.github || "(not provided)"}
` : ""}Bio: ${context.bio || "(not provided)"}
Skills: ${context.skills || "(not provided)"}
Experience: ${context.experience || "(not provided)"}
Education: ${context.education || "(not provided)"}
Projects: ${context.projects || "(not provided)"}
Certifications: ${context.certifications || "(not provided)"}`;
}
