"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeProject,
  ResumeCertification,
  ResumePublication,
  ResumeAward,
} from "@/lib/cv/types";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeForm({ data: rawData, onChange }: ResumeFormProps) {
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const data: ResumeData = {
    ...rawData,
    personal: rawData.personal ?? { name: "", email: "", phone: "", location: "" },
    experience: arr<ResumeExperience>(rawData.experience),
    education: arr<ResumeEducation>(rawData.education),
    skills: arr<ResumeSkill>(rawData.skills),
    projects: arr<ResumeProject>(rawData.projects),
    certifications: arr<ResumeCertification>(rawData.certifications),
    publications: arr<ResumePublication>(rawData.publications),
    awards: arr<ResumeAward>(rawData.awards),
  };

  const [open, setOpen] = useState<string>("personal");
  const toggle = (s: string) => setOpen((prev) => (prev === s ? "" : s));

  const set = (patch: Partial<ResumeData>) => onChange({ ...data, ...patch });
  const setPersonal = (patch: Partial<ResumeData["personal"]>) =>
    set({ personal: { ...data.personal, ...patch } });

  // Experience helpers
  const updateExp = (i: number, patch: Partial<ResumeExperience>) =>
    set({ experience: data.experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) });
  const addExp = () =>
    set({ experience: [...data.experience, { company: "", title: "", location: "", startDate: "", endDate: "", bullets: [] }] });
  const removeExp = (i: number) =>
    set({ experience: data.experience.filter((_, idx) => idx !== i) });

  // Education helpers
  const updateEdu = (i: number, patch: Partial<ResumeEducation>) =>
    set({ education: data.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) });
  const addEdu = () =>
    set({ education: [...data.education, { institution: "", degree: "", location: "", startDate: "", endDate: "", gpa: "", notes: "" }] });
  const removeEdu = (i: number) =>
    set({ education: data.education.filter((_, idx) => idx !== i) });

  // Skills helpers
  const updateSkill = (i: number, patch: Partial<ResumeSkill>) =>
    set({ skills: data.skills.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const addSkill = () => set({ skills: [...data.skills, { category: "", items: "" }] });
  const removeSkill = (i: number) =>
    set({ skills: data.skills.filter((_, idx) => idx !== i) });

  // Projects helpers
  const updateProject = (i: number, patch: Partial<ResumeProject>) =>
    set({ projects: data.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  const addProject = () =>
    set({ projects: [...data.projects, { name: "", tech: "", date: "", bullets: [], url: "" }] });
  const removeProject = (i: number) =>
    set({ projects: data.projects.filter((_, idx) => idx !== i) });

  // Certifications
  const updateCert = (i: number, patch: Partial<ResumeCertification>) =>
    set({ certifications: (data.certifications ?? []).map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  const addCert = () => set({ certifications: [...(data.certifications ?? []), { name: "", issuer: "", date: "" }] });
  const removeCert = (i: number) =>
    set({ certifications: (data.certifications ?? []).filter((_, idx) => idx !== i) });

  // Publications
  const updatePub = (i: number, patch: Partial<ResumePublication>) =>
    set({ publications: (data.publications ?? []).map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  const addPub = () => set({ publications: [...(data.publications ?? []), { authors: "", title: "", venue: "", year: "" }] });
  const removePub = (i: number) =>
    set({ publications: (data.publications ?? []).filter((_, idx) => idx !== i) });

  // Awards
  const updateAward = (i: number, patch: Partial<ResumeAward>) =>
    set({ awards: (data.awards ?? []).map((a, idx) => (idx === i ? { ...a, ...patch } : a)) });
  const addAward = () => set({ awards: [...(data.awards ?? []), { name: "", date: "" }] });
  const removeAward = (i: number) =>
    set({ awards: (data.awards ?? []).filter((_, idx) => idx !== i) });

  return (
    <div className="overflow-y-auto h-full p-3 space-y-2">

      {/* Personal */}
      <Accordion title="Personal Info" open={open === "personal"} onToggle={() => toggle("personal")}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Full Name"><input className="input" value={data.personal.name} onChange={(e) => setPersonal({ name: e.target.value })} placeholder="Jane Doe" /></Field>
          <Field label="Title / Headline"><input className="input" value={data.personal.title ?? ""} onChange={(e) => setPersonal({ title: e.target.value })} placeholder="Software Engineer" /></Field>
          <Field label="Email"><input className="input" value={data.personal.email} onChange={(e) => setPersonal({ email: e.target.value })} placeholder="jane@example.com" /></Field>
          <Field label="Phone"><input className="input" value={data.personal.phone} onChange={(e) => setPersonal({ phone: e.target.value })} placeholder="(123) 456-7890" /></Field>
          <Field label="Location"><input className="input" value={data.personal.location} onChange={(e) => setPersonal({ location: e.target.value })} placeholder="San Francisco, CA" /></Field>
          <Field label="Website"><input className="input" value={data.personal.website ?? ""} onChange={(e) => setPersonal({ website: e.target.value })} placeholder="yoursite.dev" /></Field>
          <Field label="LinkedIn"><input className="input" value={data.personal.linkedin ?? ""} onChange={(e) => setPersonal({ linkedin: e.target.value })} placeholder="linkedin.com/in/you" /></Field>
          <Field label="GitHub"><input className="input" value={data.personal.github ?? ""} onChange={(e) => setPersonal({ github: e.target.value })} placeholder="github.com/you" /></Field>
        </div>
      </Accordion>

      {/* Summary */}
      <Accordion title="Summary" open={open === "summary"} onToggle={() => toggle("summary")}>
        <textarea className="textarea" rows={3} value={data.summary ?? ""} onChange={(e) => set({ summary: e.target.value })} placeholder="A brief professional summary…" />
      </Accordion>

      {/* Experience */}
      <Accordion title={`Experience (${data.experience.length})`} open={open === "experience"} onToggle={() => toggle("experience")}>
        <div className="space-y-3">
          {data.experience.map((e, i) => (
            <div key={i} className="panel p-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: "var(--fg-dim)" }}>Entry {i + 1}</span>
                <button className="btn" onClick={() => removeExp(i)}><Trash2 size={11} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Job Title"><input className="input" value={e.title} onChange={(ev) => updateExp(i, { title: ev.target.value })} placeholder="Software Engineer" /></Field>
                <Field label="Company"><input className="input" value={e.company} onChange={(ev) => updateExp(i, { company: ev.target.value })} placeholder="Acme Corp" /></Field>
                <Field label="Location"><input className="input" value={e.location ?? ""} onChange={(ev) => updateExp(i, { location: ev.target.value })} placeholder="San Francisco, CA" /></Field>
                <Field label="Start Date"><input className="input" value={e.startDate} onChange={(ev) => updateExp(i, { startDate: ev.target.value })} placeholder="Jan 2024" /></Field>
                <Field label="End Date"><input className="input" value={e.endDate} onChange={(ev) => updateExp(i, { endDate: ev.target.value })} placeholder="Present" /></Field>
              </div>
              <Field label="Bullets (one per line)">
                <textarea className="textarea" rows={4} value={(e.bullets ?? []).join("\n")} onChange={(ev) => updateExp(i, { bullets: ev.target.value.split("\n") })} placeholder="• Achieved X by doing Y, resulting in Z" />
              </Field>
            </div>
          ))}
          <button className="btn w-full justify-center" onClick={addExp}><Plus size={12} /> Add Experience</button>
        </div>
      </Accordion>

      {/* Education */}
      <Accordion title={`Education (${data.education.length})`} open={open === "education"} onToggle={() => toggle("education")}>
        <div className="space-y-3">
          {data.education.map((e, i) => (
            <div key={i} className="panel p-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: "var(--fg-dim)" }}>Entry {i + 1}</span>
                <button className="btn" onClick={() => removeEdu(i)}><Trash2 size={11} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Institution"><input className="input" value={e.institution} onChange={(ev) => updateEdu(i, { institution: ev.target.value })} placeholder="University of Example" /></Field>
                <Field label="Degree"><input className="input" value={e.degree} onChange={(ev) => updateEdu(i, { degree: ev.target.value })} placeholder="B.S. Computer Science" /></Field>
                <Field label="Location"><input className="input" value={e.location ?? ""} onChange={(ev) => updateEdu(i, { location: ev.target.value })} placeholder="City, ST" /></Field>
                <Field label="GPA"><input className="input" value={e.gpa ?? ""} onChange={(ev) => updateEdu(i, { gpa: ev.target.value })} placeholder="3.85" /></Field>
                <Field label="Start Date"><input className="input" value={e.startDate} onChange={(ev) => updateEdu(i, { startDate: ev.target.value })} placeholder="Aug 2019" /></Field>
                <Field label="End Date"><input className="input" value={e.endDate} onChange={(ev) => updateEdu(i, { endDate: ev.target.value })} placeholder="May 2023" /></Field>
              </div>
              <Field label="Notes (thesis, advisor, honors…)">
                <input className="input" value={e.notes ?? ""} onChange={(ev) => updateEdu(i, { notes: ev.target.value })} placeholder="Graduated summa cum laude" />
              </Field>
            </div>
          ))}
          <button className="btn w-full justify-center" onClick={addEdu}><Plus size={12} /> Add Education</button>
        </div>
      </Accordion>

      {/* Skills */}
      <Accordion title={`Skills (${data.skills.length})`} open={open === "skills"} onToggle={() => toggle("skills")}>
        <div className="space-y-2">
          {data.skills.map((sk, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input" style={{ width: 110, flexShrink: 0 }} value={sk.category} onChange={(e) => updateSkill(i, { category: e.target.value })} placeholder="Languages" />
              <input className="input flex-1" value={sk.items} onChange={(e) => updateSkill(i, { items: e.target.value })} placeholder="TypeScript, Python, Go" />
              <button className="btn shrink-0" onClick={() => removeSkill(i)}><Trash2 size={11} /></button>
            </div>
          ))}
          <button className="btn w-full justify-center" onClick={addSkill}><Plus size={12} /> Add Skill Row</button>
        </div>
      </Accordion>

      {/* Projects */}
      <Accordion title={`Projects (${data.projects.length})`} open={open === "projects"} onToggle={() => toggle("projects")}>
        <div className="space-y-3">
          {data.projects.map((p, i) => (
            <div key={i} className="panel p-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: "var(--fg-dim)" }}>Project {i + 1}</span>
                <button className="btn" onClick={() => removeProject(i)}><Trash2 size={11} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Name"><input className="input" value={p.name} onChange={(ev) => updateProject(i, { name: ev.target.value })} placeholder="OpenNotes" /></Field>
                <Field label="Tech Stack"><input className="input" value={p.tech ?? ""} onChange={(ev) => updateProject(i, { tech: ev.target.value })} placeholder="Next.js, TypeScript" /></Field>
                <Field label="Date"><input className="input" value={p.date ?? ""} onChange={(ev) => updateProject(i, { date: ev.target.value })} placeholder="2024" /></Field>
                <Field label="URL"><input className="input" value={p.url ?? ""} onChange={(ev) => updateProject(i, { url: ev.target.value })} placeholder="github.com/you/project" /></Field>
              </div>
              <Field label="Bullets (one per line)">
                <textarea className="textarea" rows={3} value={(p.bullets ?? []).join("\n")} onChange={(ev) => updateProject(i, { bullets: ev.target.value.split("\n") })} placeholder="• Built X with Y…" />
              </Field>
            </div>
          ))}
          <button className="btn w-full justify-center" onClick={addProject}><Plus size={12} /> Add Project</button>
        </div>
      </Accordion>

      {/* Certifications */}
      <Accordion title={`Certifications (${(data.certifications ?? []).length})`} open={open === "certifications"} onToggle={() => toggle("certifications")}>
        <div className="space-y-2">
          {(data.certifications ?? []).map((c, i) => (
            <div key={i} className="flex gap-2 items-center flex-wrap">
              <input className="input flex-1" value={c.name} onChange={(e) => updateCert(i, { name: e.target.value })} placeholder="AWS Solutions Architect" />
              <input className="input" style={{ width: 120 }} value={c.issuer ?? ""} onChange={(e) => updateCert(i, { issuer: e.target.value })} placeholder="Issuer" />
              <input className="input" style={{ width: 80 }} value={c.date ?? ""} onChange={(e) => updateCert(i, { date: e.target.value })} placeholder="2024" />
              <button className="btn shrink-0" onClick={() => removeCert(i)}><Trash2 size={11} /></button>
            </div>
          ))}
          <button className="btn w-full justify-center" onClick={addCert}><Plus size={12} /> Add Certification</button>
        </div>
      </Accordion>

      {/* Publications */}
      <Accordion title={`Publications (${(data.publications ?? []).length})`} open={open === "publications"} onToggle={() => toggle("publications")}>
        <div className="space-y-3">
          {(data.publications ?? []).map((p, i) => (
            <div key={i} className="panel p-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: "var(--fg-dim)" }}>Publication {i + 1}</span>
                <button className="btn" onClick={() => removePub(i)}><Trash2 size={11} /></button>
              </div>
              <Field label="Authors"><input className="input" value={p.authors} onChange={(e) => updatePub(i, { authors: e.target.value })} placeholder="Doe, J., Smith, J." /></Field>
              <Field label="Title"><input className="input" value={p.title} onChange={(e) => updatePub(i, { title: e.target.value })} placeholder="Paper title" /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Venue"><input className="input" value={p.venue} onChange={(e) => updatePub(i, { venue: e.target.value })} placeholder="POPL 2024" /></Field>
                <Field label="Year"><input className="input" value={p.year} onChange={(e) => updatePub(i, { year: e.target.value })} placeholder="2024" /></Field>
              </div>
            </div>
          ))}
          <button className="btn w-full justify-center" onClick={addPub}><Plus size={12} /> Add Publication</button>
        </div>
      </Accordion>

      {/* Awards */}
      <Accordion title={`Awards (${(data.awards ?? []).length})`} open={open === "awards"} onToggle={() => toggle("awards")}>
        <div className="space-y-2">
          {(data.awards ?? []).map((a, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input flex-1" value={a.name} onChange={(e) => updateAward(i, { name: e.target.value })} placeholder="Best Paper Award" />
              <input className="input" style={{ width: 80 }} value={a.date ?? ""} onChange={(e) => updateAward(i, { date: e.target.value })} placeholder="2023" />
              <button className="btn shrink-0" onClick={() => removeAward(i)}><Trash2 size={11} /></button>
            </div>
          ))}
          <button className="btn w-full justify-center" onClick={addAward}><Plus size={12} /> Add Award</button>
        </div>
      </Accordion>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="panel">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
        style={{ background: "transparent", cursor: "pointer", color: "var(--fg)" }}
        onClick={onToggle}
        type="button"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
