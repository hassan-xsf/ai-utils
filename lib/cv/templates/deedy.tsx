import type { ResumeData } from "@/lib/cv/types";

// Faithfully replicates the "resume-openfont" LaTeX template.
// Requires a clean sans-serif font like Lato, Raleway, or Helvetica.

const FONT = "'Lato', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const s = {
  page: {
    fontFamily: FONT,
    fontSize: "10pt",
    color: "#333", // Standard body text
    background: "#fff",
    padding: "0.5in", // Matches standard LaTeX margin settings
    boxSizing: "border-box" as const,
    width: "100%",
    lineHeight: 1.4,
  },
  name: {
    fontSize: "26pt",
    fontWeight: 300, // Light/Regular weight as seen in the image
    textAlign: "center" as const,
    color: "#000",
    marginBottom: "2pt",
    letterSpacing: "0.5px",
  },
  contact: {
    textAlign: "center" as const,
    fontSize: "9pt",
    color: "#555",
    marginBottom: "16pt",
  },
  sectionHeader: {
    fontSize: "14pt",
    fontWeight: 300,
    textTransform: "uppercase" as const,
    color: "#777", // Thin grey appearance
    marginTop: "16pt",
    marginBottom: "6pt",
    letterSpacing: "0.5px",
  },
  row: {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "baseline" as const,
  },
  bold: { fontWeight: 600, color: "#222" },
  uppercase: { textTransform: "uppercase" as const },
  subItem: {
    marginBottom: "10pt",
  },
  bulletList: {
    margin: "4pt 0 0",
    paddingLeft: "18px",
    listStyleType: "disc" as const,
  },
  bullet: {
    fontSize: "10pt",
    lineHeight: 1.4,
    marginBottom: "2pt",
  },
  skillsBlock: {
    fontSize: "10pt",
    lineHeight: 1.5,
  },
};

// SVG for the external link icon used in Projects
const ExternalLinkIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: "4px", display: "inline-block", verticalAlign: "text-bottom" }}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

function formatUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function ContactLine({ p }: { p: ResumeData["personal"] }) {
  const parts: React.ReactNode[] = [];
  if (p.email)   parts.push(<span key="em" style={{ textDecoration: "underline" }}>{p.email}</span>);
  if (p.phone)   parts.push(<span key="ph">{p.phone}</span>);
  if (p.linkedin) parts.push(<span key="li" style={{ textDecoration: "underline" }}>{formatUrl(p.linkedin)}</span>);
  if (p.github)  parts.push(<span key="gh" style={{ textDecoration: "underline" }}>{formatUrl(p.github)}</span>);
  if (p.website) parts.push(<span key="ws" style={{ textDecoration: "underline" }}>{formatUrl(p.website)}</span>);

  return (
    <div style={s.contact}>
      {parts.map((node, i) => (
        <span key={i}>
          {i > 0 && <span style={{ margin: "0 4px" }}>|</span>}
          {node}
        </span>
      ))}
    </div>
  );
}

export function DeedyTemplate({ data }: { data: ResumeData }) {
  const { personal: p, experience, education, skills, projects } = data;

  return (
    <div style={s.page}>

      {/* ---- PROFILE ---- */}
      <div style={s.name}>{p.name}</div>
      <ContactLine p={p} />

      {/* ---- EDUCATION ---- */}
      {education.length > 0 && (
        <>
          <div style={s.sectionHeader}>Education</div>
          <div>
            {education.map((e, i) => (
              <div key={i} style={s.subItem}>
                <div style={s.row}>
                  <span style={s.bold}>{e.degree}</span>
                  <span style={{ color: "#555" }}>
                    {e.location}{e.location && e.endDate ? " | " : ""}{e.endDate}
                  </span>
                </div>
                {e.institution && (
                  <div style={{ ...s.uppercase, fontSize: "9.5pt", marginTop: "1pt" }}>
                    {e.institution}
                  </div>
                )}
                {e.notes && (
                  <div style={{ marginTop: "1pt" }}>
                    {e.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- WORK EXPERIENCE ---- */}
      {experience.length > 0 && (
        <>
          <div style={s.sectionHeader}>Work Experience</div>
          <div>
            {experience.map((e, i) => (
              <div key={i} style={s.subItem}>
                <div style={s.row}>
                  <div>
                    <span style={{ ...s.bold, ...s.uppercase }}>{e.company}</span>
                    {e.company && e.title && <span style={s.uppercase}> | </span>}
                    <span style={s.uppercase}>{e.title}</span>
                  </div>
                  <span style={{ color: "#555" }}>
                    {e.location}{e.location && e.startDate ? " | " : ""}{e.startDate}{e.startDate && e.endDate ? " – " : ""}{e.endDate}
                  </span>
                </div>
                {(e?.bullets?.length ?? 0) > 0 && (
                  <ul style={s.bulletList}>
                    {(e?.bullets?.filter(Boolean) ?? []).map((b, j) => (
                      <li key={j} style={s.bullet}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- PROJECTS ---- */}
      {projects.length > 0 && (
        <>
          <div style={s.sectionHeader}>Projects</div>
          <div>
            {projects.map((pr, i) => (
              <div key={i} style={s.subItem}>
                <div style={s.row}>
                  <div style={{ ...s.bold, ...s.uppercase }}>
                    {pr.name}
                    {pr.url && <ExternalLinkIcon />}
                  </div>
                  {pr.tech && (
                    <span style={{ ...s.uppercase, fontSize: "9.5pt", color: "#222" }}>
                      {pr.tech}
                    </span>
                  )}
                </div>
                {/* Render project bullets as a cohesive paragraph to match LaTeX image */}
                {(pr?.bullets?.length ?? 0) > 0 && (
                  <div style={{ marginTop: "2pt" }}>
                    {(pr?.bullets?.filter(Boolean) ?? []).join(" ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- SKILLS ---- */}
      {skills.length > 0 && (
        <>
          <div style={s.sectionHeader}>Skills</div>
          <div style={s.skillsBlock}>
            {skills.map((sk, i) => (
              <div key={i} style={{ marginBottom: "2pt" }}>
                <span style={{ ...s.bold, ...s.uppercase }}>{sk.category}: </span>
                <span>{sk.items}</span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}