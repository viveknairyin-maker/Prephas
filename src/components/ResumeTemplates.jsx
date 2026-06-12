import { useState } from "react";

// Helper function to extract and format links cleanly
function getLinksArray(links) {
  if (!links) return [];
  const list = [];
  if (links.linkedin) list.push({ label: "LinkedIn", val: links.linkedin });
  if (links.github) list.push({ label: "GitHub", val: links.github });
  if (links.portfolio) list.push({ label: "Portfolio", val: links.portfolio });
  if (links.leetcode) list.push({ label: "LeetCode", val: links.leetcode });
  return list;
}

// ─── Default resume data used when no real data is passed ───────────────────
export const BLANK_RESUME = {
  personalInfo: {
    name: "Your Name",
    email: "you@email.com",
    phone: "+91 00000 00000",
    linkedin: "linkedin.com/in/yourname",
    location: "City, India",
  },
  summary:
    "A motivated professional with a passion for building great products and solving real-world problems. Seeking opportunities to grow and contribute.",
  experience: [
    {
      company: "Company Name",
      role: "Your Role",
      duration: "Jan 2023 – Present",
      bullets: [
        "Led development of key product features serving thousands of users.",
        "Collaborated with cross-functional teams to deliver projects on time.",
        "Improved system performance by 30% through targeted optimizations.",
      ],
    },
  ],
  education: [
    {
      institution: "University Name",
      degree: "B.Tech / B.Sc / Your Degree",
      year: "2020 – 2024",
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "Firebase", "Git", "Figma"],
  projects: [
    {
      name: "Project Name",
      description:
        "Built a full-stack application that solves a real problem for real users.",
      link: "github.com/yourname/project",
    },
  ],
};

// ─── Template definitions ────────────────────────────────────────────────────
export const TEMPLATES = [
  { id: "classic", label: "Classic Pro", role: "Software Engineer" },
  { id: "modern", label: "Modern Edge", role: "Data Analyst" },
  { id: "minimal", label: "Clean Minimal", role: "Fresher / Graduate" },
  { id: "bold", label: "Bold Executive", role: "Product Manager" },
  { id: "sidebar", label: "Sidebar Split", role: "Designer / Creative" },
];

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 — Classic Pro (Traditional, recruiter-trusted layout)
// ══════════════════════════════════════════════════════════════════════════════
export function ClassicTemplate({ data, editable, onEdit }) {
  const d = data;
  const field = (section, key, fallback) =>
    editable ? (
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onEdit(section, key, e.target.innerText)}
        style={{ outline: "none", borderBottom: "1px dashed #ccc", minWidth: 40, display: "inline-block" }}
      >
        {fallback}
      </span>
    ) : (
      <span>{fallback}</span>
    );

  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Georgia', serif", color: "#000", background: "#fff", padding: "40px 48px", maxWidth: 760, margin: "0 auto", fontSize: 13, lineHeight: 1.6 }} className="text-left">
      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 28, fontWeight: "bold", letterSpacing: 2, textTransform: "uppercase" }}>
          {field("personalInfo", "name", d.personalInfo?.name || "Your Name")}
        </div>
        {d.personalInfo?.role && (
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#666", marginTop: 4 }}>
            {d.personalInfo.role}
          </div>
        )}
        <div style={{ fontSize: 12, marginTop: 6, color: "#333", display: "flex", justifyContent: "center", gap: 15, flexWrap: "wrap" }}>
          {d.personalInfo?.email && <span>{field("personalInfo", "email", d.personalInfo.email)}</span>}
          {d.personalInfo?.phone && (
            <>
              <span>|</span>
              <span>{field("personalInfo", "phone", d.personalInfo.phone)}</span>
            </>
          )}
          {d.personalInfo?.location && (
            <>
              <span>|</span>
              <span>{field("personalInfo", "location", d.personalInfo.location)}</span>
            </>
          )}
          {linksArr.map((link, idx) => (
            <span key={idx} style={{ display: "inline-flex", gap: 4 }}>
              <span>|</span>
              <span className="select-all"><strong>{link.label}:</strong> {link.val}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {d.summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>Professional Summary</SectionTitle>
          <p style={{ margin: 0 }} className="whitespace-pre-wrap">{d.summary}</p>
        </div>
      )}

      {/* Experience */}
      {d.experience && d.experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>Experience</SectionTitle>
          {d.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{exp.role}</strong>
                <span style={{ color: "#555" }}>{exp.duration}</span>
              </div>
              <div style={{ fontStyle: "italic", marginBottom: 4 }}>{exp.company}</div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
                  {exp.bullets.filter(b => b).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {d.education && d.education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>Education</SectionTitle>
          {d.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span><strong>{edu.degree}</strong> — {edu.institution}</span>
              <span style={{ color: "#555" }}>{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {d.projects && d.projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>Projects</SectionTitle>
          {d.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong>{p.name}</strong>
                {p.link && <span style={{ color: "#555", fontSize: 11, marginLeft: 8 }} className="select-all">{p.link}</span>}
              </div>
              <div style={{ color: "#444" }}>{p.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {d.skills && d.skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>Skills</SectionTitle>
          <p style={{ margin: 0 }}>{d.skills.join(" · ")}</p>
        </div>
      )}

      {/* Certifications */}
      {d.certifications && d.certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>Certifications</SectionTitle>
          {d.certifications.map((cert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span><strong>{cert.name}</strong> {cert.authority ? `— ${cert.authority}` : ''}</span>
              <span style={{ color: "#555" }}>{cert.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {d.languages && d.languages.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle>Languages</SectionTitle>
          <p style={{ margin: 0 }}>
            {d.languages.map(l => `${l.name} (${l.level})`).join(" · ")}
          </p>
        </div>
      )}

      {/* Achievements */}
      {d.achievements && d.achievements.length > 0 && (
        <div>
          <SectionTitle>Achievements</SectionTitle>
          <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
            {d.achievements.filter(ach => ach).map((ach, i) => <li key={i}>{ach}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — Modern Edge (Clean, bold name, metrics-friendly)
// ══════════════════════════════════════════════════════════════════════════════
export function ModernTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Arial', sans-serif", color: "#000", background: "#fff", padding: "0", maxWidth: 760, margin: "0 auto", fontSize: 13 }} className="text-left">
      {/* Top bar */}
      <div style={{ background: "#000", color: "#fff", padding: "28px 40px" }}>
        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase" }}>{d.personalInfo?.name || "Your Name"}</div>
        {d.personalInfo?.role && (
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#aaa", marginTop: 2 }}>{d.personalInfo.role}</div>
        )}
        <div style={{ fontSize: 12, marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap", opacity: 0.85 }}>
          {d.personalInfo?.email && <span>{d.personalInfo.email}</span>}
          {d.personalInfo?.phone && <span>{d.personalInfo.phone}</span>}
          {d.personalInfo?.location && <span>{d.personalInfo.location}</span>}
          {linksArr.map((link, idx) => (
            <span key={idx} className="select-all">{link.label}: {link.val}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "28px 40px" }}>
        {/* Summary */}
        {d.summary && (
          <div style={{ marginBottom: 20, padding: "12px 16px", border: "1px solid #000" }}>
            <p style={{ margin: 0, lineHeight: 1.7 }} className="whitespace-pre-wrap">{d.summary}</p>
          </div>
        )}

        {/* Experience */}
        {d.experience && d.experience.length > 0 && (
          <ModernSection title="Experience">
            {d.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{exp.role}</span>
                  <span style={{ fontSize: 11, background: "#000", color: "#fff", padding: "2px 8px" }}>{exp.duration}</span>
                </div>
                <div style={{ color: "#444", fontSize: 12, marginBottom: 4 }}>{exp.company}</div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
                    {exp.bullets.filter(b => b).map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </ModernSection>
        )}

        {/* Two-col: Skills + Education */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 20 }}>
          <div>
            {d.skills && d.skills.length > 0 && (
              <ModernSection title="Skills">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {d.skills.map((s, i) => (
                    <span key={i} style={{ border: "1px solid #000", padding: "2px 10px", fontSize: 11 }}>{s}</span>
                  ))}
                </div>
              </ModernSection>
            )}

            {d.languages && d.languages.length > 0 && (
              <ModernSection title="Languages" style={{ marginTop: 20 }}>
                {d.languages.map((l, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <strong>{l.name}</strong>
                    <span style={{ color: "#555" }}>{l.level}</span>
                  </div>
                ))}
              </ModernSection>
            )}
          </div>

          <div>
            {d.education && d.education.length > 0 && (
              <ModernSection title="Education">
                {d.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                    <div style={{ color: "#444" }}>{edu.institution}</div>
                    <div style={{ fontSize: 11, color: "#666" }}>{edu.year}</div>
                  </div>
                ))}
              </ModernSection>
            )}

            {d.certifications && d.certifications.length > 0 && (
              <ModernSection title="Certifications" style={{ marginTop: 20 }}>
                {d.certifications.map((cert, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{cert.name}</div>
                    {cert.authority && <div style={{ color: "#444" }}>{cert.authority}</div>}
                    <div style={{ fontSize: 11, color: "#666" }}>{cert.year}</div>
                  </div>
                ))}
              </ModernSection>
            )}
          </div>
        </div>

        {/* Projects */}
        {d.projects && d.projects.length > 0 && (
          <ModernSection title="Projects" style={{ marginTop: 20 }}>
            {d.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: "3px solid #000" }}>
                <div style={{ fontWeight: 700 }}>
                  {p.name} {p.link && <span style={{ fontSize: 10, fontWeight: 400, color: "#555" }} className="select-all">— {p.link}</span>}
                </div>
                <div>{p.description}</div>
              </div>
            ))}
          </ModernSection>
        )}

        {/* Achievements */}
        {d.achievements && d.achievements.length > 0 && (
          <ModernSection title="Achievements" style={{ marginTop: 20 }}>
            <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
              {d.achievements.filter(ach => ach).map((ach, i) => <li key={i} style={{ marginBottom: 2 }}>{ach}</li>)}
            </ul>
          </ModernSection>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 — Clean Minimal (Perfect for freshers, lots of whitespace)
// ══════════════════════════════════════════════════════════════════════════════
export function MinimalTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', sans-serif", color: "#111", background: "#fff", padding: "48px 52px", maxWidth: 760, margin: "0 auto", fontSize: 13, lineHeight: 1.7 }} className="text-left">
      {/* Name */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: -1 }}>{d.personalInfo?.name || "Your Name"}</div>
        {d.personalInfo?.role && (
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#666", marginTop: 2 }}>{d.personalInfo.role}</div>
        )}
        <div style={{ width: 40, height: 3, background: "#000", margin: "10px 0" }} />
        <div style={{ display: "flex", gap: 15, fontSize: 12, color: "#555", flexWrap: "wrap" }}>
          {d.personalInfo?.email && <span>{d.personalInfo.email}</span>}
          {d.personalInfo?.phone && <span>{d.personalInfo.phone}</span>}
          {d.personalInfo?.location && <span>{d.personalInfo.location}</span>}
          {linksArr.map((link, idx) => (
            <span key={idx} className="select-all">{link.label}: {link.val}</span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {d.summary && <div style={{ marginBottom: 28, fontSize: 13, color: "#333" }} className="whitespace-pre-wrap">{d.summary}</div>}

      {/* Education first for freshers */}
      {d.education && d.education.length > 0 && (
        <MinimalSection title="Education">
          {d.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                <div style={{ color: "#555" }}>{edu.institution}</div>
              </div>
              <div style={{ color: "#888", fontSize: 12 }}>{edu.year}</div>
            </div>
          ))}
        </MinimalSection>
      )}

      {/* Experience */}
      {d.experience && d.experience.length > 0 && (
        <MinimalSection title="Experience">
          {d.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{exp.role} — {exp.company}</span>
                <span style={{ color: "#888", fontSize: 12 }}>{exp.duration}</span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: "6px 0 0 16px", padding: 0, color: "#444" }} className="list-disc">
                  {exp.bullets.filter(b => b).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </MinimalSection>
      )}

      {/* Projects */}
      {d.projects && d.projects.length > 0 && (
        <MinimalSection title="Projects">
          {d.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                {p.link && <span style={{ color: "#888", fontSize: 11, marginLeft: 8 }} className="select-all">{p.link}</span>}
              </div>
              <div style={{ color: "#444" }}>{p.description}</div>
            </div>
          ))}
        </MinimalSection>
      )}

      {/* Skills */}
      {d.skills && d.skills.length > 0 && (
        <MinimalSection title="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {d.skills.map((s, i) => (
              <span key={i} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", padding: "3px 12px", fontSize: 12, borderRadius: 2 }}>{s}</span>
            ))}
          </div>
        </MinimalSection>
      )}

      {/* Certifications */}
      {d.certifications && d.certifications.length > 0 && (
        <MinimalSection title="Certifications">
          {d.certifications.map((cert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{cert.name}</span>
                {cert.authority && <span style={{ color: "#555", marginLeft: 6 }}>| {cert.authority}</span>}
              </div>
              <div style={{ color: "#888", fontSize: 12 }}>{cert.year}</div>
            </div>
          ))}
        </MinimalSection>
      )}

      {/* Languages */}
      {d.languages && d.languages.length > 0 && (
        <MinimalSection title="Languages">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {d.languages.map((l, i) => (
              <span key={i} style={{ fontSize: 12, color: "#444" }}>
                <strong>{l.name}</strong> ({l.level})
              </span>
            ))}
          </div>
        </MinimalSection>
      )}

      {/* Achievements */}
      {d.achievements && d.achievements.length > 0 && (
        <MinimalSection title="Achievements">
          <ul style={{ margin: "6px 0 0 16px", padding: 0, color: "#444" }} className="list-disc">
            {d.achievements.filter(ach => ach).map((ach, i) => <li key={i}>{ach}</li>)}
          </ul>
        </MinimalSection>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — Bold Executive (Strong typography, senior roles)
// ══════════════════════════════════════════════════════════════════════════════
export function BoldTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Arial Black', 'Arial', sans-serif", color: "#000", background: "#fff", maxWidth: 760, margin: "0 auto", fontSize: 13 }} className="text-left">
      {/* Header */}
      <div style={{ padding: "36px 44px 24px", borderBottom: "4px solid #000" }}>
        <div style={{ fontSize: 38, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, lineHeight: 1 }}>
          {d.personalInfo?.name || "Your Name"}
        </div>
        {d.personalInfo?.role && (
          <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 3, color: "#333", marginTop: 6, fontWeight: 900 }}>{d.personalInfo.role}</div>
        )}
        <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 11, color: "#555", flexWrap: "wrap" }}>
          {d.personalInfo?.email && <span>{d.personalInfo.email}</span>}
          {d.personalInfo?.phone && <span>{d.personalInfo.phone}</span>}
          {d.personalInfo?.location && <span>{d.personalInfo.location}</span>}
          {linksArr.map((link, idx) => (
            <span key={idx} className="select-all">{link.label.toUpperCase()}: {link.val}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 44px" }}>
        {/* Summary */}
        {d.summary && (
          <div style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.8, fontWeight: 300 }} className="whitespace-pre-wrap">{d.summary}</div>
        )}

        {/* Experience */}
        {d.experience && d.experience.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Experience</div>
            {d.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < d.experience.length - 1 ? "1px solid #eee" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 15 }}>{exp.role}</div>
                    <div style={{ fontWeight: 400, fontSize: 13, color: "#444" }}>{exp.company}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: "#000", textAlign: "right", whiteSpace: "nowrap" }}>{exp.duration}</div>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: "8px 0 0 16px", padding: 0 }} className="list-disc">
                    {exp.bullets.filter(b => b).map((b, j) => <li key={j} style={{ marginBottom: 3 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {d.projects && d.projects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Projects</div>
            {d.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{p.name}</strong>
                  {p.link && <span style={{ color: "#555", fontSize: 11, marginLeft: 8 }} className="select-all">{p.link}</span>}
                </div>
                <div style={{ color: "#444", marginTop: 2 }}>{p.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Skills row */}
        {d.skills && d.skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Core Skills</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {d.skills.map((s, i) => (
                <div key={i} style={{ borderLeft: "3px solid #000", paddingLeft: 8, fontSize: 12, fontWeight: 600 }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {d.education && d.education.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Education</div>
            {d.education.map((edu, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div><strong>{edu.degree}</strong> — {edu.institution}</div>
                <div style={{ color: "#555" }}>{edu.year}</div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {d.certifications && d.certifications.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Certifications</div>
            {d.certifications.map((cert, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div><strong>{cert.name}</strong> {cert.authority ? `— ${cert.authority}` : ''}</div>
                <div style={{ color: "#555" }}>{cert.year}</div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {d.languages && d.languages.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Languages</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {d.languages.map((l, i) => (
                <div key={i} style={{ borderLeft: "3px solid #000", paddingLeft: 8, fontSize: 12, fontWeight: 600 }}>
                  {l.name} <span style={{ fontWeight: 400, color: "#555", fontSize: 10 }}>({l.level})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {d.achievements && d.achievements.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Achievements</div>
            <ul style={{ margin: "8px 0 0 16px", padding: 0 }} className="list-disc">
              {d.achievements.filter(ach => ach).map((ach, i) => <li key={i} style={{ marginBottom: 3 }}>{ach}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5 — Sidebar Split (Two-column, creative/designer look)
// ══════════════════════════════════════════════════════════════════════════════
export function SidebarTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', sans-serif", color: "#000", background: "#fff", maxWidth: 760, margin: "0 auto", fontSize: 13, display: "flex", minHeight: 842 }} className="text-left">
      {/* Left sidebar */}
      <div style={{ width: 240, background: "#000", color: "#fff", padding: "36px 24px", flexShrink: 0 }} className="flex flex-col gap-6">
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{d.personalInfo?.name || "Your Name"}</div>
          {d.personalInfo?.role && (
            <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{d.personalInfo.role}</div>
          )}
          <div style={{ width: 32, height: 2, background: "#fff", margin: "12px 0" }} />
        </div>

        <SidebarSection title="Contact">
          <div style={{ fontSize: 11, lineHeight: 1.8, opacity: 0.85 }}>
            {d.personalInfo?.email && <div className="break-all">{d.personalInfo.email}</div>}
            {d.personalInfo?.phone && <div>{d.personalInfo.phone}</div>}
            {d.personalInfo?.location && <div>{d.personalInfo.location}</div>}
            {linksArr.map((link, idx) => (
              <div key={idx} className="truncate select-all"><strong style={{ textTransform: "uppercase", fontSize: 8 }}>{link.label}:</strong> {link.val}</div>
            ))}
          </div>
        </SidebarSection>

        {d.skills && d.skills.length > 0 && (
          <SidebarSection title="Skills">
            {d.skills.map((s, i) => (
              <div key={i} style={{ fontSize: 12, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </SidebarSection>
        )}

        {d.education && d.education.length > 0 && (
          <SidebarSection title="Education">
            {d.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 10, fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                <div style={{ opacity: 0.75 }}>{edu.institution}</div>
                <div style={{ opacity: 0.55, fontSize: 11 }}>{edu.year}</div>
              </div>
            ))}
          </SidebarSection>
        )}

        {d.languages && d.languages.length > 0 && (
          <SidebarSection title="Languages">
            {d.languages.map((l, i) => (
              <div key={i} style={{ marginBottom: 6, fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{l.name}</div>
                <div style={{ opacity: 0.75 }}>{l.level}</div>
              </div>
            ))}
          </SidebarSection>
        )}

        {d.certifications && d.certifications.length > 0 && (
          <SidebarSection title="Certifications">
            {d.certifications.map((cert, i) => (
              <div key={i} style={{ marginBottom: 10, fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{cert.name}</div>
                {cert.authority && <div style={{ opacity: 0.75 }}>{cert.authority}</div>}
                <div style={{ opacity: 0.55, fontSize: 11 }}>{cert.year}</div>
              </div>
            ))}
          </SidebarSection>
        )}
      </div>

      {/* Right main */}
      <div style={{ flex: 1, padding: "36px 32px" }}>
        {d.summary && (
          <div style={{ marginBottom: 24, padding: "14px 16px", background: "#f9f9f9", borderLeft: "3px solid #000" }}>
            <p style={{ margin: 0, lineHeight: 1.8 }} className="whitespace-pre-wrap">{d.summary}</p>
          </div>
        )}

        {d.experience && d.experience.length > 0 && (
          <RightSection title="Experience">
            {d.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{exp.role}</div>
                <div style={{ color: "#555", marginBottom: 4 }}>{exp.company} · {exp.duration}</div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
                    {exp.bullets.filter(b => b).map((b, j) => <li key={j} style={{ marginBottom: 3 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </RightSection>
        )}

        {d.projects && d.projects.length > 0 && (
          <RightSection title="Projects">
            {d.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  {p.link && <span style={{ fontSize: 11, color: "#666", marginLeft: 8 }} className="select-all">{p.link}</span>}
                </div>
                <div style={{ color: "#444", marginTop: 2 }}>{p.description}</div>
              </div>
            ))}
          </RightSection>
        )}

        {d.achievements && d.achievements.length > 0 && (
          <RightSection title="Achievements">
            <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
              {d.achievements.filter(ach => ach).map((ach, j) => <li key={j} style={{ marginBottom: 3 }}>{ach}</li>)}
            </ul>
          </RightSection>
        )}
      </div>
    </div>
  );
}

// ─── Small helper sub-components ────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ModernSection({ title, children, style }) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, paddingBottom: 4, borderBottom: "2px solid #000" }}>{title}</div>
      {children}
    </div>
  );
}

function MinimalSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#888", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function RightSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid #ddd" }}>{title}</div>
      {children}
    </div>
  );
}

export const TEMPLATE_COMPONENTS = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  bold: BoldTemplate,
  sidebar: SidebarTemplate,
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — ResumeTemplates Page
// Pass `resumeData` prop with real data from Firestore, or leave blank for demo
// ══════════════════════════════════════════════════════════════════════════════
export default function ResumeTemplates({ resumeData, onSelectTemplate }) {
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const data = resumeData || BLANK_RESUME;

  const handleSelect = (id) => {
    setSelected(id);
    if (onSelectTemplate) onSelectTemplate(id);
  };

  const ActiveTemplate = preview ? TEMPLATE_COMPONENTS[preview] : null;

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "40px 32px", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto 40px" }} className="text-left">
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Choose Your Template</h1>
        <p style={{ color: "#666", marginTop: 8, fontSize: 14 }}>All templates are ATS-friendly and recruiter-approved. Click to preview.</p>
      </div>

      {/* Template grid */}
      {!preview && (
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              onClick={() => setPreview(t.id)}
              style={{
                border: selected === t.id ? "2px solid #000" : "1px solid #e0e0e0",
                cursor: "pointer",
                transition: "all 0.15s",
                background: "#fff",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = selected === t.id ? "#000" : "#e0e0e0"; e.currentTarget.style.boxShadow = "none"; }}
              className="text-left"
            >
              {/* Mini preview thumbnail */}
              <TemplateThumbnail id={t.id} />
              {/* Card footer */}
              <div style={{ padding: "14px 16px", borderTop: "1px solid #eee" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{t.role}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(t.id); }}
                    style={{ flex: 1, padding: "7px 0", border: "1px solid #000", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >
                    Preview
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelect(t.id); }}
                    style={{ flex: 1, padding: "7px 0", border: "none", background: "#000", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >
                    {selected === t.id ? "✓ Selected" : "Use This"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full preview mode */}
      {preview && ActiveTemplate && (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button
              onClick={() => setPreview(null)}
              style={{ background: "#fff", border: "1px solid #000", padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              ← Back to Templates
            </button>
            <button
              onClick={() => { handleSelect(preview); setPreview(null); }}
              style={{ background: "#000", color: "#fff", border: "none", padding: "8px 24px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              {selected === preview ? "✓ Currently Selected" : "Use This Template"}
            </button>
          </div>
          {/* Live preview */}
          <div style={{ border: "1px solid #e0e0e0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <ActiveTemplate data={data} editable={false} onEdit={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Thumbnail previews (pure CSS, no images needed) ────────────────────────
function TemplateThumbnail({ id }) {
  const styles = {
    classic: { header: { background: "#fff", borderBottom: "2px solid #000", padding: "10px 14px" }, accent: "#000" },
    modern: { header: { background: "#000", padding: "10px 14px" }, accent: "#fff" },
    minimal: { header: { background: "#fff", padding: "10px 14px" }, accent: "#000" },
    bold: { header: { background: "#fff", borderBottom: "4px solid #000", padding: "10px 14px" }, accent: "#000" },
    sidebar: { header: null, accent: "#000" },
  };

  const s = styles[id];

  if (id === "sidebar") {
    return (
      <div style={{ height: 160, display: "flex", overflow: "hidden" }}>
        <div style={{ width: "32%", background: "#000", padding: 10 }}>
          <div style={{ height: 8, background: "#fff", borderRadius: 2, marginBottom: 6, width: "80%" }} />
          <div style={{ height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2, marginBottom: 4 }} />
          <div style={{ height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2, marginBottom: 4, width: "70%" }} />
          <div style={{ height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2, width: "60%" }} />
        </div>
        <div style={{ flex: 1, padding: 10 }}>
          <div style={{ height: 5, background: "#ddd", borderRadius: 2, marginBottom: 4 }} />
          <div style={{ height: 5, background: "#ddd", borderRadius: 2, marginBottom: 8, width: "80%" }} />
          <div style={{ height: 3, background: "#eee", borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, background: "#eee", borderRadius: 2, marginBottom: 3, width: "90%" }} />
          <div style={{ height: 3, background: "#eee", borderRadius: 2, width: "70%" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: 160, overflow: "hidden" }}>
      <div style={s.header}>
        <div style={{ height: 10, background: id === "modern" ? "#fff" : "#000", borderRadius: 2, width: "60%", marginBottom: 6 }} />
        <div style={{ display: "flex", gap: 6 }}>
          {[40, 50, 40].map((w, i) => (
            <div key={i} style={{ height: 4, background: id === "modern" ? "rgba(255,255,255,0.5)" : "#ccc", borderRadius: 2, width: w }} />
          ))}
        </div>
      </div>
      <div style={{ padding: 12 }}>
        {[90, 80, 95, 70, 85].map((w, i) => (
          <div key={i} style={{ height: 4, background: i % 3 === 0 ? "#aaa" : "#e8e8e8", borderRadius: 2, marginBottom: 5, width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
