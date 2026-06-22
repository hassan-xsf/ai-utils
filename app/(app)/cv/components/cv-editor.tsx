"use client";

import { useState, useActionState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Download, LayoutTemplate, ChevronDown, ChevronUp, FileUp, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import {
  saveCvDocument,
  saveContext,
  generateCvFromContext,
  generateCvFromPdf,
  optimizeForAts,
  buildContextFromResume,
} from "@/app/(app)/cv/actions";
import { TemplatePicker } from "./template-picker";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { EMPTY_RESUME_DATA } from "@/lib/cv/resume-data";
import type { CvDocument, CvContext, CvTemplate, ResumeData } from "@/lib/cv/types";

interface CvEditorProps {
  document: CvDocument;
  context: CvContext | null;
  templates: CvTemplate[];
  initialMode?: "pdf" | "generate" | "ats";
}

type Tab = "form" | "json" | "ai" | "context";
type PdfStage = "idle" | "loading" | "extracting" | "ai" | "done";
const INIT_STATE = { ok: false as boolean, error: undefined as string | undefined, data: undefined as unknown };

export function CvEditor({ document: doc, context, templates, initialMode }: CvEditorProps) {
  const router = useRouter();

  const safeData = (doc.resume_data && Object.keys(doc.resume_data).length > 0)
    ? doc.resume_data
    : EMPTY_RESUME_DATA;

  const [resumeData, setResumeData] = useState<ResumeData>(safeData);
  const [name, setName] = useState(doc.name);
  const [templateId, setTemplateId] = useState(doc.template_id);
  const [activeTab, setActiveTab] = useState<Tab>(initialMode ? "ai" : "form");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(safeData, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(
    initialMode === "pdf" ? "pdf" : initialMode === "generate" ? "gen" : initialMode === "ats" ? "ats" : null,
  );
  const [atsJd, setAtsJd] = useState("");
  const [pdfStage, setPdfStage] = useState<PdfStage>("idle");
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfPageProgress, setPdfPageProgress] = useState<{ current: number; total: number } | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfDragOver, setPdfDragOver] = useState(false);

  const [saveState, saveFn, savePending] = useActionState(
    async (_prev: typeof INIT_STATE, fd: FormData) =>
      (await saveCvDocument(_prev, fd)) as typeof INIT_STATE,
    INIT_STATE
  );

  const [ctxState, ctxFn, ctxPending] = useActionState(
    async (_prev: typeof INIT_STATE, fd: FormData) =>
      (await saveContext(_prev, fd)) as typeof INIT_STATE,
    INIT_STATE
  );

  const [genState, genFn, genPending] = useActionState(
    async (_prev: typeof INIT_STATE, fd: FormData) =>
      (await generateCvFromContext(_prev, fd)) as typeof INIT_STATE,
    INIT_STATE
  );

  const [atsState, atsFn, atsPending] = useActionState(
    async (_prev: typeof INIT_STATE, fd: FormData) =>
      (await optimizeForAts(_prev, fd)) as typeof INIT_STATE,
    INIT_STATE
  );

  const [pdfGenState, pdfGenFn, pdfGenPending] = useActionState(
    async (_prev: typeof INIT_STATE, fd: FormData) =>
      (await generateCvFromPdf(_prev, fd)) as typeof INIT_STATE,
    INIT_STATE
  );

  const [ctxFillState, ctxFillFn, ctxFillPending] = useActionState(
    async (_prev: typeof INIT_STATE, fd: FormData) =>
      (await buildContextFromResume(_prev, fd)) as typeof INIT_STATE,
    INIT_STATE
  );

  // Local copy of profile fields so the AI fill can mutate them client-side
  const [ctxFields, setCtxFields] = useState({
    bio: context?.bio ?? "",
    skills: context?.skills ?? "",
    experience: context?.experience ?? "",
    education: context?.education ?? "",
    projects: context?.projects ?? "",
    certifications: context?.certifications ?? "",
  });

  const [personalFields, setPersonalFields] = useState({
    name: context?.personal?.name ?? "",
    email: context?.personal?.email ?? "",
    phone: context?.personal?.phone ?? "",
    location: context?.personal?.location ?? "",
    title: context?.personal?.title ?? "",
    website: context?.personal?.website ?? "",
    linkedin: context?.personal?.linkedin ?? "",
    github: context?.personal?.github ?? "",
  });

  useEffect(() => {
    if (ctxFillState.ok && ctxFillState.data) {
      const c = (ctxFillState.data as { context: Partial<typeof ctxFields> }).context;
      setCtxFields((prev) => ({
        bio: typeof c.bio === "string" ? c.bio : prev.bio,
        skills: typeof c.skills === "string" ? c.skills : prev.skills,
        experience: typeof c.experience === "string" ? c.experience : prev.experience,
        education: typeof c.education === "string" ? c.education : prev.education,
        projects: typeof c.projects === "string" ? c.projects : prev.projects,
        certifications: typeof c.certifications === "string" ? c.certifications : prev.certifications,
      }));
    }
  }, [ctxFillState]);

  // Redirect after first save
  useEffect(() => {
    if (saveState.ok && saveState.data) {
      const newId = (saveState.data as { id: string }).id;
      if (!doc.id && newId) router.push(`/cv/${newId}`);
    }
  }, [saveState, doc.id, router]);

  // Apply AI-generated resume data
  useEffect(() => {
    if (genState.ok && genState.data) {
      const rd = (genState.data as { resumeData: ResumeData }).resumeData;
      if (rd) setResumeData(rd);
    }
  }, [genState]);

  useEffect(() => {
    if (atsState.ok && atsState.data) {
      const rd = (atsState.data as { resumeData: ResumeData }).resumeData;
      if (rd) setResumeData(rd);
    }
  }, [atsState]);

  useEffect(() => {
    if (pdfGenState.ok && pdfGenState.data) {
      const rd = (pdfGenState.data as { resumeData: ResumeData }).resumeData;
      if (rd) {
        setResumeData(rd);
        setPdfStage("done");
        setActiveTab("form");
      }
    }
    if (pdfGenState.error) {
      setPdfStage("idle");
    }
  }, [pdfGenState]);

  async function processPdfFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Please select a PDF file.");
      return;
    }
    setPdfError(null);
    setPdfFileName(file.name);
    setPdfPageProgress(null);
    setPdfStage("loading");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfStage("extracting");
      setPdfPageProgress({ current: 0, total: pdf.numPages });
      const texts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        texts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
        setPdfPageProgress({ current: i, total: pdf.numPages });
      }
      setPdfStage("ai");
      const fd = new FormData();
      fd.set("extracted_text", texts.join("\n"));
      fd.set("template_id", templateId);
      startTransition(() => pdfGenFn(fd));
    } catch (err) {
      setPdfStage("idle");
      setPdfError(err instanceof Error ? err.message : "Failed to extract PDF");
    }
  }

  function handlePdfFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processPdfFile(file);
    // Reset input so re-selecting the same file fires onChange again
    e.target.value = "";
  }

  function resetPdfFlow() {
    setPdfStage("idle");
    setPdfFileName(null);
    setPdfPageProgress(null);
    setPdfError(null);
  }

  const toggleSection = (s: string) => setOpenSection((prev) => (prev === s ? null : s));

  function switchTab(tab: Tab) {
    if (tab === "json") setJsonText(JSON.stringify(resumeData, null, 2));
    setActiveTab(tab);
    setJsonError(null);
  }

  // Live JSON editor: debounce-apply on each edit
  function onJsonChange(value: string) {
    setJsonText(value);
    if (!value.trim()) {
      setJsonError(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      setResumeData(normalizeIncoming(parsed));
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-0px)] min-h-0">
      {showTemplatePicker && (
        <TemplatePicker
          templates={templates}
          currentId={templateId}
          onSelect={(tpl) => { setTemplateId(tpl.id); setShowTemplatePicker(false); }}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Left panel */}
      <div className="flex flex-col lg:w-1/2 min-h-0 border-r" style={{ borderColor: "var(--border)" }}>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            style={{ maxWidth: 200 }}
            placeholder="CV name"
          />
          <button className="btn shrink-0" onClick={() => setShowTemplatePicker(true)}>
            <LayoutTemplate size={13} />
            {templates.find((t) => t.id === templateId)?.name ?? "Template"}
          </button>
          <form className="ml-auto" action={saveFn}>
            <input type="hidden" name="id" value={doc.id ?? ""} />
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="template_id" value={templateId} />
            <input type="hidden" name="resume_data" value={JSON.stringify(resumeData)} />
            <button type="submit" className="btn btn-primary shrink-0" disabled={savePending}>
              <Save size={13} />
              {savePending ? "Saving…" : "Save"}
            </button>
          </form>
        </div>

        {saveState.error && (
          <div className="px-3 py-1 text-xs shrink-0" style={{ color: "var(--danger)" }}>{saveState.error}</div>
        )}
        {saveState.ok && saveState !== INIT_STATE && !saveState.error && (
          <div className="px-3 py-1 text-xs shrink-0" style={{ color: "var(--success)" }}>Saved.</div>
        )}

        {/* Tabs */}
        <div className="flex border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          {(["form", "json", "ai", "context"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className="px-4 py-2 text-xs font-medium transition-colors"
              style={{
                color: activeTab === tab ? "var(--accent)" : "var(--fg-dim)",
                borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {tab === "form" ? "Editor" : tab === "json" ? "JSON" : tab === "ai" ? "AI Tools" : "Profile"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === "form" && (
            <ResumeForm data={resumeData} onChange={setResumeData} />
          )}

          {activeTab === "json" && (
            <div className="flex flex-col h-full p-3 gap-2">
              <div className="flex items-center justify-between shrink-0">
                <p className="text-xs" style={{ color: "var(--fg-dim)" }}>
                  Edits apply live to the preview. Paste any resume JSON to import.
                </p>
                <span className="text-xs" style={{ color: jsonError ? "var(--danger)" : "var(--success)" }}>
                  {jsonError ? "Invalid JSON" : "Synced"}
                </span>
              </div>
              <textarea
                className="textarea flex-1 font-mono text-xs"
                style={{ resize: "none", minHeight: 0 }}
                value={jsonText}
                onChange={(e) => onJsonChange(e.target.value)}
                spellCheck={false}
              />
              {jsonError && (
                <p className="text-xs shrink-0" style={{ color: "var(--danger)" }}>{jsonError}</p>
              )}
              <div className="flex gap-2 shrink-0">
                <button className="btn" onClick={() => { setJsonText(JSON.stringify(resumeData, null, 2)); setJsonError(null); }}>
                  Reset from current
                </button>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="p-4 space-y-3 overflow-y-auto h-full">
              <AiSection title="Generate from profile" open={openSection === "gen"} onToggle={() => toggleSection("gen")}>
                <p className="text-xs mb-3" style={{ color: "var(--fg-dim)" }}>
                  Uses your saved profile to generate a full CV.
                </p>
                <form action={genFn}>
                  <input type="hidden" name="template_id" value={templateId} />
                  <button type="submit" className="btn btn-primary" disabled={genPending}>
                    {genPending ? "Generating…" : "Generate CV"}
                  </button>
                </form>
                {genState.error && <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>{genState.error}</p>}
                {genState.ok && genState !== INIT_STATE && !genState.error && (
                  <p className="text-xs mt-2" style={{ color: "var(--success)" }}>CV updated from profile.</p>
                )}
              </AiSection>

              <AiSection title="Import from PDF" open={openSection === "pdf"} onToggle={() => toggleSection("pdf")}>
                <p className="text-xs mb-3" style={{ color: "var(--fg-dim)" }}>
                  Upload your existing CV as a PDF. We&apos;ll extract the text and convert it into structured data.
                </p>

                <PdfDropZone
                  stage={pdfStage}
                  fileName={pdfFileName}
                  pageProgress={pdfPageProgress}
                  error={pdfError ?? pdfGenState.error}
                  dragOver={pdfDragOver}
                  onDragOver={(e) => { e.preventDefault(); setPdfDragOver(true); }}
                  onDragLeave={() => setPdfDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setPdfDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) void processPdfFile(file);
                  }}
                  onFileChange={handlePdfFile}
                  onReset={resetPdfFlow}
                />
              </AiSection>

              <AiSection title="Optimize for ATS" open={openSection === "ats"} onToggle={() => toggleSection("ats")}>
                <p className="text-xs mb-3" style={{ color: "var(--fg-dim)" }}>
                  Paste a job description to tailor your CV for ATS systems.
                </p>
                <form className="space-y-3" action={atsFn}>
                  <input type="hidden" name="resume_data" value={JSON.stringify(resumeData)} />
                  <textarea
                    name="job_description"
                    value={atsJd}
                    onChange={(e) => setAtsJd(e.target.value)}
                    className="textarea"
                    rows={5}
                    placeholder="Paste job description here…"
                  />
                  <button type="submit" className="btn btn-primary" disabled={atsPending || !atsJd.trim()}>
                    {atsPending ? "Optimizing…" : "Optimize"}
                  </button>
                </form>
                {atsState.error && <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>{atsState.error}</p>}
                {atsState.ok && atsState !== INIT_STATE && !atsState.error && (
                  <p className="text-xs mt-2" style={{ color: "var(--success)" }}>CV optimized for ATS.</p>
                )}
              </AiSection>
            </div>
          )}

          {activeTab === "context" && (
            <div className="p-4 overflow-y-auto h-full">
              <div className="panel p-3 mb-4 flex items-start gap-3">
                <Sparkles size={14} style={{ color: "var(--accent)" }} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">Auto-fill from this CV</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fg-dim)" }}>
                    Convert the current CV into a rich profile knowledge base that future CVs can reuse.
                  </p>
                </div>
                <button
                  className="btn btn-primary shrink-0"
                  type="button"
                  disabled={ctxFillPending}
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("resume_data", JSON.stringify(resumeData));
                    startTransition(() => ctxFillFn(fd));
                  }}
                >
                  {ctxFillPending ? "Generating…" : "Auto-fill"}
                </button>
              </div>
              {ctxFillState.error && (
                <p className="text-xs mb-3" style={{ color: "var(--danger)" }}>{ctxFillState.error}</p>
              )}

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  fd.set("personal", JSON.stringify(personalFields));
                  startTransition(() => ctxFn(fd));
                }}
              >
                <div className="space-y-2">
                  <p className="label">Personal Info</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["name", "email", "phone", "location", "title", "website", "linkedin", "github"] as const).map((field) => (
                      <div key={field} className="space-y-0.5">
                        <label className="label capitalize">{field}</label>
                        <input
                          type="text"
                          className="input"
                          value={personalFields[field]}
                          onChange={(e) => setPersonalFields((prev) => ({ ...prev, [field]: e.target.value }))}
                          placeholder={field === "linkedin" ? "linkedin.com/in/…" : field === "github" ? "github.com/…" : `Your ${field}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {(["bio", "skills", "experience", "education", "projects", "certifications"] as const).map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="label capitalize">{field}</label>
                    <textarea
                      name={field}
                      value={ctxFields[field]}
                      onChange={(e) => setCtxFields((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="textarea"
                      rows={field === "experience" || field === "education" ? 5 : 3}
                      placeholder={`Your ${field}…`}
                    />
                  </div>
                ))}
                <button type="submit" className="btn btn-primary" disabled={ctxPending}>
                  {ctxPending ? "Saving…" : "Save Profile"}
                </button>
                {ctxState.error && <p className="text-xs" style={{ color: "var(--danger)" }}>{ctxState.error}</p>}
                {ctxState.ok && ctxState !== INIT_STATE && !ctxState.error && (
                  <p className="text-xs" style={{ color: "var(--success)" }}>Profile saved.</p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — live preview */}
      <div className="flex flex-col lg:w-1/2 min-h-0">
        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <span className="text-xs" style={{ color: "var(--fg-dim)" }}>Live Preview</span>
          <button className="btn ml-auto" onClick={() => window.print()}>
            <Download size={13} /> Download PDF
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto flex justify-center py-6" style={{ background: "var(--bg-muted, #1a1a1a)" }}>
          <ResumePreview data={resumeData} templateId={templateId} />
        </div>
      </div>
    </div>
  );
}

// Maps common alternative field names (from AI dumps, other resume JSON
// schemas) onto our ResumeData shape so users can paste arbitrary JSON.
function normalizeIncoming(raw: unknown): ResumeData {
  const r = (raw ?? {}) as Record<string, unknown>;
  const toStrArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  const joinArr = (v: unknown): string =>
    Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v : "";

  const personalRaw = (r.personal ?? r.basics ?? {}) as Record<string, unknown>;
  const personal = {
    name: String(personalRaw.name ?? ""),
    email: String(personalRaw.email ?? ""),
    phone: String(personalRaw.phone ?? ""),
    location: String(personalRaw.location ?? personalRaw.address ?? ""),
    title: String(personalRaw.title ?? personalRaw.label ?? ""),
    website: String(personalRaw.website ?? personalRaw.url ?? ""),
    linkedin: String(personalRaw.linkedin ?? ""),
    github: String(personalRaw.github ?? ""),
  };

  const experience = Array.isArray(r.experience)
    ? (r.experience as Array<Record<string, unknown>>).map((e) => ({
        company: String(e.company ?? e.organization ?? ""),
        title: String(e.title ?? e.position ?? e.role ?? ""),
        location: String(e.location ?? ""),
        startDate: String(e.startDate ?? e.start ?? ""),
        endDate: String(e.endDate ?? e.end ?? ""),
        bullets: toStrArr(e.bullets ?? e.responsibilities ?? e.highlights ?? e.description),
      }))
    : [];

  const education = Array.isArray(r.education)
    ? (r.education as Array<Record<string, unknown>>).map((e) => ({
        institution: String(e.institution ?? e.school ?? ""),
        degree: String(e.degree ?? e.studyType ?? "") +
          (e.minor ? `, Minor in ${e.minor}` : ""),
        location: String(e.location ?? ""),
        startDate: String(e.startDate ?? e.start ?? ""),
        endDate: String(e.endDate ?? e.end ?? ""),
        gpa: e.gpa ? String(e.gpa) : undefined,
        notes: e.notes ? String(e.notes) : undefined,
      }))
    : [];

  // Skills can be: array of {category, items} | array of strings | object of arrays
  let skills: ResumeData["skills"] = [];
  if (Array.isArray(r.skills)) {
    skills = (r.skills as unknown[]).map((sk) => {
      if (typeof sk === "string") return { category: "", items: sk };
      const s = sk as Record<string, unknown>;
      return {
        category: String(s.category ?? s.name ?? ""),
        items: joinArr(s.items ?? s.keywords ?? s.list),
      };
    });
  } else if (r.skills && typeof r.skills === "object") {
    skills = Object.entries(r.skills as Record<string, unknown>).map(([k, v]) => ({
      category: k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim(),
      items: joinArr(v),
    }));
  }

  const projects = Array.isArray(r.projects)
    ? (r.projects as Array<Record<string, unknown>>).map((p) => ({
        name: String(p.name ?? p.title ?? ""),
        tech: joinArr(p.tech ?? p.technologies ?? p.stack),
        date: String(p.date ?? p.duration ?? ""),
        bullets: toStrArr(p.bullets ?? p.description ?? p.highlights),
        url: p.url ? String(p.url) : undefined,
      }))
    : [];

  const certifications = Array.isArray(r.certifications)
    ? (r.certifications as Array<Record<string, unknown>>).map((c) => ({
        name: String(c.name ?? ""),
        issuer: c.issuer ? String(c.issuer) : undefined,
        date: c.date ? String(c.date) : undefined,
      }))
    : [];

  const awards = Array.isArray(r.awards)
    ? (r.awards as Array<Record<string, unknown>>).map((a) => ({
        name: String(a.name ?? a.title ?? ""),
        date: a.date ? String(a.date) : undefined,
      }))
    : [];

  const publications = Array.isArray(r.publications)
    ? (r.publications as Array<Record<string, unknown>>).map((p) => ({
        authors: String(p.authors ?? ""),
        title: String(p.title ?? p.name ?? ""),
        venue: String(p.venue ?? p.publisher ?? ""),
        year: String(p.year ?? p.releaseDate ?? ""),
      }))
    : [];

  return {
    personal,
    summary: typeof r.summary === "string" ? r.summary : "",
    experience,
    education,
    skills,
    projects,
    certifications,
    publications,
    awards,
  };
}

interface PdfDropZoneProps {
  stage: PdfStage;
  fileName: string | null;
  pageProgress: { current: number; total: number } | null;
  error: string | null | undefined;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

function PdfDropZone({
  stage, fileName, pageProgress, error, dragOver,
  onDragOver, onDragLeave, onDrop, onFileChange, onReset,
}: PdfDropZoneProps) {
  const isProcessing = stage === "loading" || stage === "extracting" || stage === "ai";

  const stageLabel: Record<PdfStage, string> = {
    idle: "",
    loading: "Loading PDF…",
    extracting: pageProgress
      ? `Extracting text — page ${pageProgress.current} of ${pageProgress.total}`
      : "Extracting text…",
    ai: "Parsing CV with AI…",
    done: "CV updated from PDF",
  };

  const progressPct =
    stage === "loading" ? 10
      : stage === "extracting" && pageProgress
        ? 10 + (pageProgress.current / Math.max(pageProgress.total, 1)) * 60
        : stage === "extracting" ? 30
        : stage === "ai" ? 80
        : stage === "done" ? 100
        : 0;

  return (
    <div className="space-y-3">
      {/* Drop / upload zone */}
      {!isProcessing && stage !== "done" && (
        <label
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-md border-2 border-dashed transition-colors p-6"
          style={{
            borderColor: dragOver ? "var(--accent)" : "var(--border)",
            background: dragOver ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
          }}
        >
          <FileUp size={24} style={{ color: "var(--accent)" }} />
          <div className="text-center">
            <p className="text-sm font-medium">
              {dragOver ? "Drop PDF to upload" : "Drop PDF here or click to browse"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--fg-dim)" }}>
              PDF files only · processed locally before AI extraction
            </p>
          </div>
          <input
            type="file"
            accept="application/pdf"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="rounded-md border p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{fileName}</p>
              <p className="text-xs" style={{ color: "var(--fg-dim)" }}>{stageLabel[stage]}</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: "var(--accent)" }}
            />
          </div>
          <ul className="space-y-1 text-xs" style={{ color: "var(--fg-dim)" }}>
            <StageItem label="Load PDF" active={stage === "loading"} done={stage !== "loading"} />
            <StageItem label="Extract text" active={stage === "extracting"} done={stage === "ai"} />
            <StageItem label="Parse with AI" active={stage === "ai"} done={false} />
          </ul>
        </div>
      )}

      {/* Done state */}
      {stage === "done" && !error && (
        <div className="rounded-md border p-4 flex items-center gap-2" style={{ borderColor: "var(--success)", color: "var(--success)" }}>
          <CheckCircle2 size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">CV imported successfully</p>
            <p className="text-xs truncate" style={{ color: "var(--fg-dim)" }}>{fileName}</p>
          </div>
          <button className="btn" onClick={onReset} type="button">
            Upload another
          </button>
        </div>
      )}

      {/* Error state */}
      {error && stage !== "ai" && (
        <div className="rounded-md border p-3 flex items-start gap-2" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}

function StageItem({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 size={11} style={{ color: "var(--success)" }} />
      ) : active ? (
        <Loader2 size={11} className="animate-spin" style={{ color: "var(--accent)" }} />
      ) : (
        <span className="inline-block w-2.5 h-2.5 rounded-full border" style={{ borderColor: "var(--border)" }} />
      )}
      <span style={{ color: done ? "var(--fg)" : active ? "var(--fg)" : "var(--fg-dim)" }}>{label}</span>
    </li>
  );
}

function AiSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
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
