interface CvContext {
  bio: string;
  skills: string;
  experience: string;
  education: string;
  projects: string;
  certifications: string;
}

export function buildContextSystemPrompt(context: CvContext): string {
  return `You are assisting a user with their CV. Below is their complete professional knowledge base. Use this as the authoritative source of truth for all CV-related tasks. Never fabricate information not present here.

=== USER KNOWLEDGE BASE ===

BIO
${context.bio}

SKILLS
${context.skills}

EXPERIENCE
${context.experience}

EDUCATION
${context.education}

PROJECTS
${context.projects}

CERTIFICATIONS
${context.certifications}

=== END OF USER KNOWLEDGE BASE ===`;
}
