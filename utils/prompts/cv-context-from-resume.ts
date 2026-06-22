import type { ResumeData } from "@/lib/cv/types";

export function buildContextFromResumePrompt(resume: ResumeData): string {
  return `You are converting a structured resume into a free-form professional knowledge base.

The user will reuse this knowledge base across many future CV variations. Capture the WHOLE picture — keep every fact, but expand and rephrase into rich plain-text prose so future AI tasks have full context.

Return ONLY a valid JSON object — no markdown fences, no explanation — with exactly these fields:

{
  "personal": {
    "name": "full name",
    "email": "email address",
    "phone": "phone number",
    "location": "city/country",
    "title": "professional title or headline",
    "website": "personal website URL",
    "linkedin": "LinkedIn URL",
    "github": "GitHub URL"
  },
  "bio": "A 2-4 sentence professional summary written in first person.",
  "skills": "Plain-text list of skills grouped by category, one category per line.",
  "experience": "Each role as: '<Title> at <Company> (<dates>, <location>)' followed by a paragraph describing responsibilities and achievements. Separate roles with a blank line.",
  "education": "Each entry as: '<Degree>, <Institution> (<dates>, <location>)' followed by GPA or notes if present. Separate entries with a blank line.",
  "projects": "Each project as: '<Name> (<tech stack>, <date>)' followed by a paragraph describing it. Separate projects with a blank line.",
  "certifications": "Each certification on its own line as: '<Name> — <Issuer>, <Date>'."
}

For the personal object: extract values directly from the resume data. If a field is absent, use an empty string "". Never fabricate or guess.

Rules:
- Preserve every factual detail from the resume; do not invent anything
- Expand bullet points into flowing sentences but keep the meaning identical
- If a section is empty in the resume, return an empty string for that field
- Output valid JSON, no trailing commas, no comments

Resume data:
${JSON.stringify(resume, null, 2)}`;
}
