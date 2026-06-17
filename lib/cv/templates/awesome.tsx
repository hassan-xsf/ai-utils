import type { ResumeData } from "@/lib/cv/types";

export function AwesomeTemplate({ data }: { data: ResumeData }) {
  const { personal: p, summary, experience, education, skills, projects, certifications } = data;

  const contact = [p.phone, p.email, p.website, p.linkedin, p.github].filter(Boolean).join(" · ");

  return (
    <div style={{ fontFamily: "'Arial', sans-serif", fontSize: "10pt", color: "#222", background: "#fff", padding: "20px 28px", boxSizing: "border-box", width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: "26pt", fontWeight: "bold", letterSpacing: "-0.5px", marginBottom: 2 }}>{p.name}</div>
        {p.title && <div style={{ fontSize: "13pt", color: "#555", fontStyle: "italic", marginBottom: 4 }}>{p.title}</div>}
        <div style={{ fontSize: "9pt", color: "#444" }}>{contact}</div>
      </div>

      <hr style={{ border: "none", borderTop: "1.5px solid #444", margin: "0 0 10px" }} />

      {summary && (
        <Section title="Summary">
          <p style={{ margin: 0, fontSize: "9.5pt", lineHeight: 1.5 }}>{summary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "bold" }}>{e.title}</span>
                <span style={{ fontSize: "9pt", color: "#555" }}>{e.startDate} – {e.endDate}</span>
              </div>
              <div style={{ fontStyle: "italic", fontSize: "9.5pt", color: "#444", marginBottom: 2 }}>
                {e.company}{e.location ? ` — ${e.location}` : ""}
              </div>
              {e?.bullets?.length > 0 && (
                <ul style={{ margin: "2px 0", paddingLeft: 16 }}>
                  {(e?.bullets?.filter(Boolean) ?? []).map((b, j) => <li key={j} style={{ marginBottom: 1, fontSize: "9.5pt" }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{e.degree}</span>
                <span style={{ fontSize: "9pt", color: "#555" }}>{e.startDate} – {e.endDate}</span>
              </div>
              <div style={{ fontStyle: "italic", fontSize: "9.5pt", color: "#444" }}>
                {e.institution}{e.location ? ` — ${e.location}` : ""}{e.gpa ? ` · GPA ${e.gpa}` : ""}
              </div>
            </div>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>
                  <span style={{ fontWeight: "bold" }}>{p.name}</span>
                  {p.tech && <span style={{ fontStyle: "italic", fontSize: "9pt", color: "#555" }}> · {p.tech}</span>}
                </span>
                <span style={{ fontSize: "9pt", color: "#555" }}>{p.date}</span>
              </div>
              {p?.bullets?.length > 0 && (
                <ul style={{ margin: "2px 0", paddingLeft: 16 }}>
                  {(p?.bullets?.filter(Boolean) ?? []).map((b, j) => <li key={j} style={{ marginBottom: 1, fontSize: "9.5pt" }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          {skills.map((sk, i) => (
            <div key={i} style={{ fontSize: "9.5pt", marginBottom: 1 }}>
              <span style={{ fontWeight: "bold" }}>{sk.category}:</span> {sk.items}
            </div>
          ))}
        </Section>
      )}

      {(certifications ?? []).length > 0 && (
        <Section title="Certifications">
          {certifications!.map((c, i) => (
            <div key={i} style={{ fontSize: "9.5pt", marginBottom: 1 }}>
              {c.name}{c.issuer ? ` — ${c.issuer}` : ""}{c.date ? `, ${c.date}` : ""}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: "10.5pt",
        fontWeight: "bold",
        color: "#333",
        borderBottom: "1px solid #bbb",
        paddingBottom: 2,
        marginBottom: 5,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}
