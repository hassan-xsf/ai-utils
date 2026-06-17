import type { ResumeData } from "./types";

export const EMPTY_RESUME_DATA: ResumeData = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    website: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  publications: [],
  awards: [],
};

export const DEFAULT_RESUME_DATA: ResumeData = {
  personal: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "(123) 456-7890",
    location: "San Francisco, CA",
    title: "Software Engineer",
    website: "janedoe.dev",
    linkedin: "linkedin.com/in/janedoe",
    github: "github.com/janedoe",
  },
  summary:
    "Results-driven software engineer with 3+ years building scalable web applications. Passionate about clean architecture, developer experience, and open-source.",
  experience: [
    {
      company: "Acme Corporation",
      title: "Software Engineer",
      location: "San Francisco, CA",
      startDate: "Jan 2024",
      endDate: "Present",
      bullets: [
        "Built and maintained microservices handling 50k requests/day using Node.js and PostgreSQL.",
        "Reduced API latency by 40% by introducing query caching with Redis.",
        "Led migration of legacy REST endpoints to GraphQL, improving DX for three frontend teams.",
      ],
    },
    {
      company: "Beta Startup",
      title: "Software Engineering Intern",
      location: "New York, NY",
      startDate: "May 2022",
      endDate: "Aug 2022",
      bullets: [
        "Developed React dashboard for real-time analytics, used daily by 200+ internal users.",
        "Wrote tests raising coverage from 42% to 78%.",
      ],
    },
  ],
  education: [
    {
      institution: "University of Example",
      degree: "Bachelor of Science in Computer Science",
      location: "City, ST",
      startDate: "Aug 2019",
      endDate: "May 2023",
      gpa: "3.85",
    },
  ],
  skills: [
    { category: "Languages", items: "TypeScript, Python, Go, SQL" },
    { category: "Frameworks", items: "React, Next.js, Node.js, FastAPI" },
    { category: "Tools", items: "Git, Docker, PostgreSQL, Redis, AWS" },
  ],
  projects: [
    {
      name: "OpenNotes",
      tech: "Next.js, Supabase, TypeScript",
      date: "2024",
      bullets: [
        "Collaborative markdown note-taking app with real-time sync and full-text search.",
        "500+ GitHub stars; deployed on Vercel serving 2k monthly active users.",
      ],
      url: "github.com/janedoe/opennotes",
    },
  ],
  certifications: [
    { name: "AWS Solutions Architect Associate", issuer: "Amazon Web Services", date: "2024" },
  ],
  publications: [],
  awards: [],
};
