export interface ResumePersonal {
  name: string;
  email: string;
  phone: string;
  location: string;
  title?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ResumeExperience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  notes?: string;
}

export interface ResumeSkill {
  category: string;
  items: string;
}

export interface ResumeProject {
  name: string;
  tech?: string;
  date?: string;
  bullets: string[];
  url?: string;
}

export interface ResumeCertification {
  name: string;
  issuer?: string;
  date?: string;
}

export interface ResumePublication {
  authors: string;
  title: string;
  venue: string;
  year: string;
}

export interface ResumeAward {
  name: string;
  date?: string;
}

export interface ResumeData {
  personal: ResumePersonal;
  summary?: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  certifications?: ResumeCertification[];
  publications?: ResumePublication[];
  awards?: ResumeAward[];
}

export type CvDocument = {
  id: string;
  user_id: string;
  name: string;
  template_id: string;
  resume_data: ResumeData;
  created_at: string;
  updated_at: string;
};

export type CvContext = {
  user_id?: string;
  bio: string;
  skills: string;
  experience: string;
  education: string;
  projects: string;
  certifications: string;
  updated_at?: string;
};

export type CvTemplate = {
  id: string;
  name: string;
  description: string;
};
