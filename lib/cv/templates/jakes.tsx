import type { ResumeData } from "@/lib/cv/types";

// Faithfully replicates Jake Gutierrez's LaTeX resume.
// CMU Serif loaded externally in resume-preview.tsx.

const FONT = "'CMU Serif', 'Computer Modern', Georgia, 'Times New Roman', serif";

const s = {
  page: {
    fontFamily: FONT,
    fontSize: "11pt", // Base size (\documentclass[11pt])
    color: "#000",
    background: "#fff",
    padding: "0.5in", // Matches \addtolength margins (-0.5in on 1in standard = 0.5in)
    boxSizing: "border-box" as const,
    width: "100%",
    lineHeight: 1.15, // Tighter line-height standard to LaTeX rendering
  },
  name: {
    fontSize: "24pt", // \Huge
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginBottom: "2pt", // Tight spacing beneath name
  },
  contact: {
    textAlign: "center" as const,
    fontSize: "10pt", // \small
    marginBottom: "12pt",
  },
  sectionHeader: {
    fontSize: "12pt", // \large
    fontVariant: "small-caps" as const, // \scshape
    fontWeight: "normal" as const,
    borderBottom: "1px solid #000", // \titlerule
    marginTop: "12pt",
    marginBottom: "6pt",
    paddingBottom: "1pt",
  },
  subList: {
    listStyle: "none" as const,
    margin: 0,
    padding: "0 0 0 0.15in", // leftmargin=0.15in
  },
  subItem: {
    marginBottom: "6pt",
  },
  row: {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "baseline" as const,
  },
  bold: { fontWeight: "bold" as const },
  normalSm: { fontSize: "10pt" }, // \small
  italicSm: { fontStyle: "italic" as const, fontSize: "10pt" }, // \textit{\small}
  bulletList: {
    margin: "2pt 0 0",
    paddingLeft: "20px", // Standard indent mapping to \resumeItemListStart
    listStyleType: "disc" as const,
  },
  bullet: {
    fontSize: "10pt", // \small
    lineHeight: 1.35,
    marginBottom: "2pt",
  },
  skillsBlock: {
    padding: "0 0 0 0.15in", // leftmargin=0.15in
    margin: 0,
    fontSize: "10pt", // \small
    lineHeight: 1.35,
  },
};

function stripProto(u: string) {
  return u.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function ContactLine({ p }: { p: ResumeData["personal"] }) {
  const parts: React.ReactNode[] = [];
  if (p.phone)   parts.push(<span key="ph">{p.phone}</span>);
  if (p.email)   parts.push(<span key="em" style={{ textDecoration: "underline" }}>{p.email}</span>);
  if (p.linkedin) parts.push(<span key="li" style={{ textDecoration: "underline" }}>{stripProto(p.linkedin)}</span>);
  if (p.github)  parts.push(<span key="gh" style={{ textDecoration: "underline" }}>{stripProto(p.github)}</span>);
  if (p.website) parts.push(<span key="ws" style={{ textDecoration: "underline" }}>{stripProto(p.website)}</span>);

  return (
    <div style={s.contact}>
      {parts.map((node, i) => (
        <span key={i}>
          {i > 0 && <span style={{ margin: "0 6px" }}>|</span>}
          {node}
        </span>
      ))}
    </div>
  );
}

export function JakesTemplate({ data }: { data: ResumeData }) {
  const { personal: p, experience, education, skills, projects, certifications, awards } = data;

  return (
    <div style={s.page}>

      {/* ---- HEADING ---- */}
      <div style={s.name}>{p.name}</div>
      <ContactLine p={p} />

      {/* ---- EDUCATION ---- */}
      {education.length > 0 && (
        <>
          <div style={s.sectionHeader}>Education</div>
          <ul style={s.subList}>
            {education.map((e, i) => (
              <li key={i} style={s.subItem}>
                {/* Line 1: Bold Institution & Normal Location */}
                <div style={s.row}>
                  <span style={s.bold}>{e.institution}</span>
                  <span style={{ fontSize: "11pt" }}>{e.location}</span>
                </div>
                {/* Line 2: Italic Degree & Italic Dates */}
                <div style={s.row}>
                  <span style={s.italicSm}>
                    {e.degree}{e.gpa ? `, GPA: ${e.gpa}` : ""}
                  </span>
                  <span style={s.italicSm}>{e.startDate} – {e.endDate}</span>
                </div>
                {e.notes && <div style={s.italicSm}>{e.notes}</div>}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ---- EXPERIENCE ---- */}
      {experience.length > 0 && (
        <>
          <div style={s.sectionHeader}>Experience</div>
          <ul style={s.subList}>
            {experience.map((e, i) => (
              <li key={i} style={s.subItem}>
                {/* Line 1: Bold Title & Normal Dates */}
                <div style={s.row}>
                  <span style={s.bold}>{e.title}</span>
                  <span style={{ fontSize: "11pt" }}>{e.startDate} – {e.endDate}</span>
                </div>
                {/* Line 2: Italic Company & Italic Location */}
                <div style={s.row}>
                  <span style={s.italicSm}>{e.company}</span>
                  <span style={s.italicSm}>{e.location}</span>
                </div>
                {(e?.bullets?.length ?? 0) > 0 && (
                  <ul style={s.bulletList}>
                    {(e?.bullets?.filter(Boolean) ?? []).map((b, j) => (
                      <li key={j} style={s.bullet}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ---- PROJECTS ---- */}
      {projects.length > 0 && (
        <>
          <div style={s.sectionHeader}>Projects</div>
          <ul style={s.subList}>
            {projects.map((pr, i) => (
              <li key={i} style={s.subItem}>
                <div style={s.row}>
                  {/* Left: Small-sized Bold Name & Italic Tech */}
                  <span style={s.normalSm}>
                    <span style={s.bold}>{pr.name}</span>
                    {pr.tech && (
                      <>
                        <span> | </span>
                        <span style={{ fontStyle: "italic" }}>{pr.tech}</span>
                      </>
                    )}
                  </span>
                  {/* Right: Small-sized Dates */}
                  {pr.date && <span style={s.normalSm}>{pr.date}</span>}
                </div>
                {(pr?.bullets?.length ?? 0) > 0 && (
                  <ul style={s.bulletList}>
                    {(pr?.bullets?.filter(Boolean) ?? []).map((b, j) => (
                      <li key={j} style={s.bullet}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ---- TECHNICAL SKILLS ---- */}
      {skills.length > 0 && (
        <>
          <div style={s.sectionHeader}>Technical Skills</div>
          <div style={s.skillsBlock}>
            {skills.map((sk, i) => (
              <div key={i} style={{ marginBottom: "1pt" }}>
                <span style={s.bold}>{sk.category}</span>
                <span>: {sk.items}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- CERTIFICATIONS ---- */}
      {(certifications ?? []).length > 0 && (
        <>
          <div style={s.sectionHeader}>Certifications</div>
          <div style={s.skillsBlock}>
            {certifications!.map((c, i) => (
              <div key={i} style={{ marginBottom: "1pt" }}>
                <span style={s.bold}>{c.name}</span>
                {c.issuer ? ` — ${c.issuer}` : ""}
                {c.date ? `, ${c.date}` : ""}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- AWARDS ---- */}
      {(awards ?? []).length > 0 && (
        <>
          <div style={s.sectionHeader}>Awards</div>
          <div style={s.skillsBlock}>
            {awards!.map((a, i) => (
              <div key={i} style={{ marginBottom: "1pt" }}>
                <span style={s.bold}>{a.name}</span>
                {a.date ? ` — ${a.date}` : ""}
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}