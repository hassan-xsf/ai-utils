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

export function buildCvFromPdfPrompt(extractedText: string, templateName: string): string {
  return `You are a professional CV parser. Convert the raw CV text below into structured JSON.

Return ONLY a valid JSON object — no markdown fences, no explanation.

JSON schema:
${SCHEMA}

Rules:
- Preserve every factual detail exactly as given; do not invent or alter anything
- Match the style priorities of the "${templateName}" template
- Dates: use the format found in the source text
- Group skills into logical categories (Languages, Frameworks, Tools, etc.)

Raw CV text:
${extractedText}`;
}
