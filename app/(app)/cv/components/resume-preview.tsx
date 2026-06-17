"use client";

import { getTemplateComponent } from "@/lib/cv/templates/index";
import type { ResumeData } from "@/lib/cv/types";

interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
}

function normalizeData(data: ResumeData): ResumeData {
  return {
    ...data,
    personal: data.personal ?? { name: "", email: "", phone: "", location: "" },
    experience: data.experience ?? [],
    education: data.education ?? [],
    skills: data.skills ?? [],
    projects: data.projects ?? [],
    certifications: data.certifications ?? [],
    publications: data.publications ?? [],
    awards: data.awards ?? [],
  };
}

export function ResumePreview({ data, templateId }: ResumePreviewProps) {
  const TemplateComponent = getTemplateComponent(templateId);
  const safe = normalizeData(data);

  return (
    <>
      {/* CMU Serif — Computer Modern Unicode, the exact font LaTeX uses */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/computer-modern@0.1.2/cmu-serif.css"
      />
      <style>{`
        @page {
          size: letter;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          body * { visibility: hidden !important; }
          #resume-preview, #resume-preview * { visibility: visible !important; }
          #resume-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 8.5in !important;
            min-height: 11in !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}</style>
      <div
        id="resume-preview"
        style={{
          width: 794,
          minHeight: 1123,
          background: "#fff",
          color: "#000",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        <TemplateComponent data={safe} />
      </div>
    </>
  );
}
