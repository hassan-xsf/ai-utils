import type { ResumeData } from "@/lib/cv/types";

export function AcademicTemplate({ data }: { data: ResumeData }) {
  const {
    personal: p,
    summary,
    experience,
    education,
    skills,
    projects,
    publications,
    awards,
    certifications,
  } = data;

  const contactLine = [p.phone, p.email, p.website, p.linkedin, p.github, p.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <div style={{
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: "10.5pt",
      color: "#000",
      background: "#fff",
      padding: "20px 28px",
      boxSizing: "border-box",
      width: "100%",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: "20pt", fontWeight: "bold", marginBottom: 4 }}>{p.name}</div>
        {p.title && (
          <div style={{ fontSize: "11pt", fontStyle: "italic", marginBottom: 2 }}>{p.title}</div>
        )}
        {education[0] && (
          <div style={{ fontSize: "10pt", marginBottom: 2 }}>
            {education[0].institution}{education[0].location ? `, ${education[0].location}` : ""}
          </div>
        )}
        {contactLine && (
          <div style={{ fontSize: "9.5pt", color: "#333" }}>{contactLine}</div>
        )}
      </div>

      {summary && (
        <Section title="Research Interests">
          <p style={{ margin: 0, fontSize: "10pt", lineHeight: 1.6, textAlign: "justify" }}>{summary}</p>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{e.degree}</span>
                <span style={{ fontSize: "9.5pt" }}>{e.startDate} – {e.endDate}</span>
              </div>
              <div>{e.institution}{e.location ? `, ${e.location}` : ""}</div>
              {e.gpa && <div style={{ fontStyle: "italic", fontSize: "9.5pt" }}>GPA: {e.gpa}</div>}
              {e.notes && <div style={{ fontStyle: "italic", fontSize: "9.5pt" }}>{e.notes}</div>}
            </div>
          ))}
        </Section>
      )}

      {(publications ?? []).length > 0 && (
        <Section title="Publications">
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {publications!.map((pub, i) => (
              <li key={i} style={{ marginBottom: 6, fontSize: "10pt", lineHeight: 1.5 }}>
                {pub.authors} ({pub.year}). {pub.title}.{" "}
                <span style={{ fontStyle: "italic" }}>{pub.venue}</span>.
              </li>
            ))}
          </ol>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Research &amp; Teaching Experience">
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{e.title}</span>
                <span style={{ fontSize: "9.5pt" }}>{e.startDate} – {e.endDate}</span>
              </div>
              <div style={{ fontStyle: "italic" }}>{e.company}{e.location ? `, ${e.location}` : ""}</div>
              {(e?.bullets?.length ?? 0) > 0 && (
                <ul style={{ margin: "3px 0", paddingLeft: 18 }}>
                  {(e?.bullets?.filter(Boolean) ?? []).map((b, j) => (
                    <li key={j} style={{ marginBottom: 2, fontSize: "10pt" }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((pr, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{pr.name}</span>
                {pr.date && <span style={{ fontSize: "9.5pt" }}>{pr.date}</span>}
              </div>
              {pr.tech && (
                <div style={{ fontStyle: "italic", fontSize: "9.5pt" }}>{pr.tech}</div>
              )}
              {(pr?.bullets?.length ?? 0) > 0 && (
                <ul style={{ margin: "3px 0", paddingLeft: 18 }}>
                  {(pr?.bullets?.filter(Boolean) ?? []).map((b, j) => (
                    <li key={j} style={{ marginBottom: 2, fontSize: "10pt" }}>{b}</li>
                  ))}
                </ul>
              )}
              {pr.url && (
                <div style={{ fontSize: "9.5pt", color: "#444" }}>{pr.url}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Technical Skills">
          {skills.map((sk, i) => (
            <div key={i} style={{ fontSize: "10pt", marginBottom: 2 }}>
              <span style={{ fontWeight: "bold" }}>{sk.category}:</span> {sk.items}
            </div>
          ))}
        </Section>
      )}

      {(awards ?? []).length > 0 && (
        <Section title="Awards &amp; Fellowships">
          {awards!.map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "10pt", marginBottom: 2 }}>
              <span>{a.name}</span>
              <span>{a.date}</span>
            </div>
          ))}
        </Section>
      )}

      {(certifications ?? []).length > 0 && (
        <Section title="Certifications">
          {certifications!.map((c, i) => (
            <div key={i} style={{ fontSize: "10pt", marginBottom: 2 }}>
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
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: "11pt",
        fontWeight: "bold",
        fontVariant: "small-caps",
        borderBottom: "1px solid #000",
        paddingBottom: 2,
        marginBottom: 6,
        letterSpacing: "0.04em",
      }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {children}
    </div>
  );
}
