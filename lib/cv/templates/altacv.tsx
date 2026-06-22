import type { ResumeData } from "@/lib/cv/types";

export function AltaCvTemplate({ data }: { data: ResumeData }) {
  const { personal: p, experience, education, skills, projects, certifications, awards } = data;

  return (
    <div style={{ fontFamily: "'Arial', sans-serif", fontSize: "9.5pt", color: "#000", background: "#fff", padding: "0", boxSizing: "border-box", width: "100%" }}>
      {/* Header */}
      <div style={{ background: "#2d2d2d", color: "#fff", padding: "16px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "22pt", fontWeight: "bold", marginBottom: 2 }}>{p.name}</div>
        {p.title && <div style={{ fontSize: "12pt", color: "#ccc", marginBottom: 4 }}>{p.title}</div>}
        <div style={{ fontSize: "8.5pt", color: "#bbb" }}>
          {[p.email, p.phone, p.website].filter(Boolean).join(" · ")}
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: "flex" }}>
        {/* Left sidebar: 30% */}
        <div style={{ width: "30%", flexShrink: 0, background: "#f5f5f5", padding: "14px 12px", borderRight: "1px solid #e0e0e0" }}>
          <SideSection title="Contact">
            {[
              p.linkedin && <div key="li" style={{ fontSize: "8.5pt", marginBottom: 2 }}>{p.linkedin}</div>,
              p.github && <div key="gh" style={{ fontSize: "8.5pt", marginBottom: 2 }}>{p.github}</div>,
              p.location && <div key="loc" style={{ fontSize: "8.5pt", marginBottom: 2 }}>{p.location}</div>,
            ].filter(Boolean)}
          </SideSection>

          {skills.length > 0 && (
            <SideSection title="Skills">
              {skills.map((sk, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <div style={{ fontWeight: "bold", fontSize: "8.5pt" }}>{sk.category}</div>
                  <div style={{ fontSize: "8.5pt", color: "#444" }}>{sk.items}</div>
                </div>
              ))}
            </SideSection>
          )}

          {education.length > 0 && (
            <SideSection title="Education">
              {education.map((e, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: "bold", fontSize: "8.5pt" }}>{e.degree}</div>
                  <div style={{ fontSize: "8.5pt" }}>{e.institution}</div>
                  <div style={{ fontSize: "8pt", color: "#666" }}>{e.startDate} – {e.endDate}</div>
                  {e.gpa && <div style={{ fontSize: "8pt", color: "#666" }}>GPA {e.gpa}</div>}
                </div>
              ))}
            </SideSection>
          )}

          {(certifications ?? []).length > 0 && (
            <SideSection title="Certifications">
              {certifications!.map((c, i) => (
                <div key={i} style={{ fontSize: "8.5pt", marginBottom: 3 }}>
                  <div>{c.name}</div>
                  {c.date && <div style={{ color: "#666" }}>{c.date}</div>}
                </div>
              ))}
            </SideSection>
          )}
        </div>

        {/* Right main: 70% */}
        <div style={{ flex: 1, padding: "14px 16px" }}>
          {experience.length > 0 && (
            <MainSection title="Experience">
              {experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: "bold" }}>{e.title}</span>
                    <span style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic" }}>{e.startDate} – {e.endDate}</span>
                  </div>
                  <div style={{ fontStyle: "italic", fontSize: "9pt", color: "#555", marginBottom: 2 }}>
                    {e.company}{e.location ? `, ${e.location}` : ""}
                  </div>
                  {e?.bullets?.length > 0 && (
                    <ul style={{ margin: "2px 0", paddingLeft: 14 }}>
                      {(e?.bullets?.filter(Boolean) ?? []).map((b, j) => <li key={j} style={{ marginBottom: 1, fontSize: "9pt" }}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </MainSection>
          )}

          {projects.length > 0 && (
            <MainSection title="Projects">
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: "bold" }}>{p.name}</div>
                  {p.tech && <div style={{ fontSize: "8.5pt", fontStyle: "italic", color: "#555" }}>{p.tech}</div>}
                  {p?.bullets?.length > 0 && (
                    <ul style={{ margin: "2px 0", paddingLeft: 14 }}>
                      {(p?.bullets?.filter(Boolean) ?? []).map((b, j) => <li key={j} style={{ fontSize: "9pt" }}>{b}</li>)}
                    </ul>
                  )}
                  {p.url && <div style={{ fontSize: "8.5pt", color: "#777" }}>{p.url}</div>}
                </div>
              ))}
            </MainSection>
          )}

          {(awards ?? []).length > 0 && (
            <MainSection title="Achievements">
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {awards!.map((a, i) => (
                  <li key={i} style={{ fontSize: "9.5pt", marginBottom: 2 }}>
                    {a.name}{a.date ? ` — ${a.date}` : ""}
                  </li>
                ))}
              </ul>
            </MainSection>
          )}
        </div>
      </div>
    </div>
  );
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase" as const, color: "#555", letterSpacing: "0.08em", borderBottom: "1px solid #ccc", paddingBottom: 2, marginBottom: 5 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: "9.5pt", fontWeight: "bold", textTransform: "uppercase" as const, color: "#333", letterSpacing: "0.06em", borderBottom: "1px solid #ddd", paddingBottom: 2, marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}
