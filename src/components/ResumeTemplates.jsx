import { useState, useEffect } from "react";

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
  { id: "software-engineer", label: "Software Engineer", role: "Technical & Grid Layout" },
  { id: "fresher", label: "Fresher / Student", role: "Academic & Simple" },
  { id: "modern-professional", label: "Modern Professional", role: "Asymmetric Tinted Sidebar" },
  { id: "executive", label: "Executive", role: "Centered & Elegant Serif" },
  { id: "creative", label: "Creative", role: "Bold Design & Custom Typography" },
];

// Helper styles for sections
function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 8, color: "#000" }}>
      {children}
    </div>
  );
}

function RightSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #ddd", color: "#000" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SidebarSection({ title, children, dark = false }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: dark ? "rgba(255,255,255,0.6)" : "#666", marginBottom: 8, fontWeight: "bold" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 — Software Engineer (Two-column technical grid layout)
// ══════════════════════════════════════════════════════════════════════════════
export function SoftwareEngineerTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#000", background: "#fff", padding: "40px", maxWidth: 760, margin: "0 auto", fontSize: 13, lineHeight: 1.5, display: "flex", gap: 32 }} className="text-left">
      {/* Left (Main) Column */}
      <div style={{ flex: 1.6 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: "bold", textTransform: "uppercase", letterSpacing: -0.5, color: "#000" }}>
            {d.personalInfo?.name || "Your Name"}
          </div>
          {d.personalInfo?.role && (
            <div style={{ fontSize: 13, fontWeight: "600", color: "#333", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {d.personalInfo.role}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#666", marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {d.personalInfo?.location && <span>📍 {d.personalInfo.location}</span>}
            {d.personalInfo?.phone && <span>📞 {d.personalInfo.phone}</span>}
            {d.personalInfo?.email && <span>✉ {d.personalInfo.email}</span>}
          </div>
        </div>

        {d.summary && (
          <div style={{ marginBottom: 20 }}>
            <SectionTitle>Professional Summary</SectionTitle>
            <p style={{ margin: 0, lineHeight: 1.6 }} className="whitespace-pre-wrap">{d.summary}</p>
          </div>
        )}

        {d.experience && d.experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionTitle>Experience</SectionTitle>
            {d.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>{exp.role}</span>
                  <span style={{ fontWeight: 500, color: "#555" }}>{exp.duration}</span>
                </div>
                <div style={{ fontStyle: "italic", color: "#444", marginBottom: 4 }}>{exp.company}</div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
                    {exp.bullets.filter(b => b).map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {d.projects && d.projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionTitle>Projects</SectionTitle>
            {d.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>{p.name}</span>
                  {p.link && <span style={{ fontWeight: 400, fontSize: 11, color: "#555" }} className="select-all">{p.link}</span>}
                </div>
                <div style={{ color: "#444", marginTop: 2 }}>{p.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right (Sidebar) Column */}
      <div style={{ flex: 1, borderLeft: "1px solid #eee", paddingLeft: 24 }}>
        {linksArr.length > 0 && (
          <RightSection title="Links">
            {linksArr.map((link, idx) => (
              <div key={idx} style={{ marginBottom: 6, fontSize: 12 }} className="select-all">
                <strong>{link.label}:</strong> <span style={{ color: "#333" }}>{link.val}</span>
              </div>
            ))}
          </RightSection>
        )}

        {d.skills && d.skills.length > 0 && (
          <RightSection title="Skills">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {d.skills.map((s, i) => (
                <span key={i} style={{ border: "1px solid #000", padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </RightSection>
        )}

        {d.certifications && d.certifications.length > 0 && (
          <RightSection title="Certifications">
            {d.certifications.map((cert, i) => (
              <div key={i} style={{ marginBottom: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{cert.name}</div>
                <div style={{ color: "#555", fontSize: 11 }}>{cert.authority} ({cert.year})</div>
              </div>
            ))}
          </RightSection>
        )}

        {d.education && d.education.length > 0 && (
          <RightSection title="Education">
            {d.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 10, fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                <div style={{ color: "#555" }}>{edu.institution}</div>
                <div style={{ color: "#777", fontSize: 11 }}>{edu.year}</div>
              </div>
            ))}
          </RightSection>
        )}

        {d.languages && d.languages.length > 0 && (
          <RightSection title="Languages">
            {d.languages.map((l, i) => (
              <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                <strong>{l.name}</strong> <span style={{ color: "#666", fontSize: 11 }}>({l.level})</span>
              </div>
            ))}
          </RightSection>
        )}

        {d.achievements && d.achievements.length > 0 && (
          <RightSection title="Achievements">
            <ul style={{ margin: "4px 0 0 14px", padding: 0 }} className="list-disc">
              {d.achievements.filter(ach => ach).map((ach, i) => <li key={i} style={{ marginBottom: 2, fontSize: 12 }}>{ach}</li>)}
            </ul>
          </RightSection>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — Fresher / Student (Education-first single-column layout)
// ══════════════════════════════════════════════════════════════════════════════
export function FresherTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#111", background: "#fff", padding: "40px 48px", maxWidth: 760, margin: "0 auto", fontSize: 13, lineHeight: 1.6 }} className="text-left">
      {/* Header */}
      <div style={{ borderBottom: "2px solid #000", paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 30, fontWeight: 800 }}>{d.personalInfo?.name || "Your Name"}</div>
        {d.personalInfo?.role && (
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#666", marginTop: 2 }}>{d.personalInfo.role}</div>
        )}
        <div style={{ fontSize: 12, marginTop: 8, display: "flex", gap: 15, flexWrap: "wrap", color: "#555" }}>
          {d.personalInfo?.email && <span>✉ {d.personalInfo.email}</span>}
          {d.personalInfo?.phone && <span>📞 {d.personalInfo.phone}</span>}
          {d.personalInfo?.location && <span>📍 {d.personalInfo.location}</span>}
        </div>
      </div>

      {d.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Objective / Summary</SectionTitle>
          <p style={{ margin: 0 }} className="whitespace-pre-wrap">{d.summary}</p>
        </div>
      )}

      {/* Education (First for Freshers!) */}
      {d.education && d.education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Education</SectionTitle>
          {d.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span><strong>{edu.degree}</strong> — {edu.institution}</span>
              <span style={{ color: "#555" }}>{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {d.projects && d.projects.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Projects</SectionTitle>
          {d.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong>{p.name}</strong>
                {p.link && <span style={{ color: "#555", fontSize: 11, marginLeft: 8 }} className="select-all">{p.link}</span>}
              </div>
              <div style={{ color: "#444", marginTop: 2 }}>{p.description}</div>
            </div>
          ))}
        </div>
      )}

      {d.skills && d.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Skills</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {d.skills.map((s, i) => (
              <span key={i} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "3px 10px", fontSize: 12, borderRadius: 4 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {d.certifications && d.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Certifications</SectionTitle>
          {d.certifications.map((cert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span><strong>{cert.name}</strong> {cert.authority ? `— ${cert.authority}` : ''}</span>
              <span style={{ color: "#555" }}>{cert.year}</span>
            </div>
          ))}
        </div>
      )}

      {d.experience && d.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Experience</SectionTitle>
          {d.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                <span>{exp.role}</span>
                <span style={{ fontWeight: 500, color: "#555" }}>{exp.duration}</span>
              </div>
              <div style={{ fontStyle: "italic", color: "#444", marginBottom: 4 }}>{exp.company}</div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
                  {exp.bullets.filter(b => b).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {d.languages && d.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Languages</SectionTitle>
          <p style={{ margin: 0 }}>
            {d.languages.map(l => `${l.name} (${l.level})`).join(" · ")}
          </p>
        </div>
      )}

      {d.achievements && d.achievements.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Achievements</SectionTitle>
          <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
            {d.achievements.filter(ach => ach).map((ach, i) => <li key={i}>{ach}</li>)}
          </ul>
        </div>
      )}

      {linksArr.length > 0 && (
        <div>
          <SectionTitle>Links / Profiles</SectionTitle>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
            {linksArr.map((link, idx) => (
              <span key={idx} className="select-all">
                <strong>{link.label}:</strong> {link.val}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 — Modern Professional (Tinted left sidebar layout)
// ══════════════════════════════════════════════════════════════════════════════
export function ModernProfessionalTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#000", background: "#fff", maxWidth: 760, margin: "0 auto", fontSize: 13, display: "flex", minHeight: 842 }} className="text-left">
      {/* Sidebar (Left Column, tinted) */}
      <div style={{ width: 240, background: "#f4f4f5", padding: "36px 24px", flexShrink: 0, borderRight: "1px solid #e4e4e7" }} className="flex flex-col gap-6">
        {linksArr.length > 0 && (
          <SidebarSection title="Links">
            <div style={{ fontSize: 11, lineHeight: 1.8 }}>
              {linksArr.map((link, idx) => (
                <div key={idx} className="truncate select-all">
                  <strong>{link.label}:</strong> {link.val}
                </div>
              ))}
            </div>
          </SidebarSection>
        )}

        {d.skills && d.skills.length > 0 && (
          <SidebarSection title="Skills">
            {d.skills.map((s, i) => (
              <div key={i} style={{ fontSize: 12, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, background: "#000", borderRadius: "50%", flexShrink: 0 }} />
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
                <div style={{ color: "#555" }}>{edu.institution}</div>
                <div style={{ color: "#777", fontSize: 11 }}>{edu.year}</div>
              </div>
            ))}
          </SidebarSection>
        )}

        {d.languages && d.languages.length > 0 && (
          <SidebarSection title="Languages">
            {d.languages.map((l, i) => (
              <div key={i} style={{ marginBottom: 6, fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{l.name}</div>
                <div style={{ color: "#555" }}>{l.level}</div>
              </div>
            ))}
          </SidebarSection>
        )}

        {d.certifications && d.certifications.length > 0 && (
          <SidebarSection title="Certifications">
            {d.certifications.map((cert, i) => (
              <div key={i} style={{ marginBottom: 10, fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{cert.name}</div>
                <div style={{ color: "#555" }}>{cert.authority}</div>
                <div style={{ color: "#777", fontSize: 11 }}>{cert.year}</div>
              </div>
            ))}
          </SidebarSection>
        )}
      </div>

      {/* Main (Right Column) */}
      <div style={{ flex: 1, padding: "36px 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24, borderBottom: "2px solid #000", paddingBottom: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase" }}>{d.personalInfo?.name || "Your Name"}</div>
          {d.personalInfo?.role && (
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#666", marginTop: 2 }}>{d.personalInfo.role}</div>
          )}
          <div style={{ fontSize: 11, color: "#666", marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {d.personalInfo?.email && <span>{d.personalInfo.email}</span>}
            {d.personalInfo?.phone && <span>{d.personalInfo.phone}</span>}
            {d.personalInfo?.location && <span>{d.personalInfo.location}</span>}
          </div>
        </div>

        {d.summary && (
          <div style={{ marginBottom: 24 }}>
            <RightSection title="Summary">
              <p style={{ margin: 0, lineHeight: 1.7 }} className="whitespace-pre-wrap">{d.summary}</p>
            </RightSection>
          </div>
        )}

        {d.experience && d.experience.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <RightSection title="Experience">
              {d.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
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
            </RightSection>
          </div>
        )}

        {d.projects && d.projects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <RightSection title="Projects">
              {d.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>
                    {p.name} {p.link && <span style={{ fontSize: 10, fontWeight: 400, color: "#555" }} className="select-all">— {p.link}</span>}
                  </div>
                  <div style={{ color: "#444", marginTop: 2 }}>{p.description}</div>
                </div>
              ))}
            </RightSection>
          </div>
        )}

        {d.achievements && d.achievements.length > 0 && (
          <div>
            <RightSection title="Achievements">
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
                {d.achievements.filter(ach => ach).map((ach, i) => <li key={i} style={{ marginBottom: 2 }}>{ach}</li>)}
              </ul>
            </RightSection>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — Executive (Centered serif layout)
// ══════════════════════════════════════════════════════════════════════════════
export function ExecutiveTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Lora', 'Georgia', serif", color: "#000", background: "#fff", padding: "40px 48px", maxWidth: 760, margin: "0 auto", fontSize: 13, lineHeight: 1.6 }} className="text-left">
      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "4px double #000", paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: "bold", letterSpacing: 2, textTransform: "uppercase" }}>
          {d.personalInfo?.name || "Your Name"}
        </div>
        {d.personalInfo?.role && (
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#444", marginTop: 4, fontWeight: "bold" }}>
            {d.personalInfo.role}
          </div>
        )}
        <div style={{ fontSize: 12, marginTop: 8, color: "#333", display: "flex", justifyContent: "center", gap: 15, flexWrap: "wrap" }}>
          {d.personalInfo?.email && <span>{d.personalInfo.email}</span>}
          {d.personalInfo?.phone && (
            <>
              <span>•</span>
              <span>{d.personalInfo.phone}</span>
            </>
          )}
          {d.personalInfo?.location && (
            <>
              <span>•</span>
              <span>{d.personalInfo.location}</span>
            </>
          )}
          {linksArr.map((link, idx) => (
            <span key={idx} style={{ display: "inline-flex", gap: 15 }}>
              <span>•</span>
              <span className="select-all"><strong>{link.label}:</strong> {link.val}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {d.summary && (
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Professional Summary</SectionTitle>
          <p style={{ margin: 0 }} className="whitespace-pre-wrap">{d.summary}</p>
        </div>
      )}

      {/* Experience */}
      {d.experience && d.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
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
        <div style={{ marginBottom: 20 }}>
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
        <div style={{ marginBottom: 20 }}>
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
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Skills</SectionTitle>
          <p style={{ margin: 0 }}>{d.skills.join(" • ")}</p>
        </div>
      )}

      {/* Certifications */}
      {d.certifications && d.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
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
        <div style={{ marginBottom: 20 }}>
          <SectionTitle>Languages</SectionTitle>
          <p style={{ margin: 0 }}>
            {d.languages.map(l => `${l.name} (${l.level})`).join(" • ")}
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
// TEMPLATE 5 — Creative (Asymmetric modern layout)
// ══════════════════════════════════════════════════════════════════════════════
export function CreativeTemplate({ data }) {
  const d = data;
  const linksArr = getLinksArray(d.links);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: "#111", background: "#fff", padding: "40px", maxWidth: 760, margin: "0 auto", fontSize: 13, lineHeight: 1.6 }} className="text-left">
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1, color: "#000", lineHeight: 1.1 }}>
            {d.personalInfo?.name || "Your Name"}
          </div>
          {d.personalInfo?.role && (
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#666", marginTop: 6, fontWeight: 700 }}>
              {d.personalInfo.role}
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#555", textAlign: "right", minWidth: 200 }}>
          {d.personalInfo?.email && <div>✉ {d.personalInfo.email}</div>}
          {d.personalInfo?.phone && <div>📞 {d.personalInfo.phone}</div>}
          {d.personalInfo?.location && <div>📍 {d.personalInfo.location}</div>}
          {linksArr.map((link, idx) => (
            <div key={idx} className="select-all"><strong>{link.label}:</strong> {link.val}</div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32 }}>
        {/* Column 1 */}
        <div>
          {d.summary && (
            <div style={{ marginBottom: 24, borderLeft: "3px solid #000", paddingLeft: 16 }}>
              <p style={{ margin: 0, fontStyle: "italic", fontSize: 14 }} className="whitespace-pre-wrap">{d.summary}</p>
            </div>
          )}

          {d.experience && d.experience.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle>Experience</SectionTitle>
              {d.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 16, position: "relative", paddingLeft: 12, borderLeft: "1px solid #ddd" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                    <span>{exp.role}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#666" }}>{exp.duration}</span>
                  </div>
                  <div style={{ color: "#555", fontWeight: 500, fontSize: 12, marginBottom: 4 }}>{exp.company}</div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }} className="list-disc">
                      {exp.bullets.filter(b => b).map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {d.projects && d.projects.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle>Projects</SectionTitle>
              {d.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: "1px solid #ddd" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>{p.name}</span>
                    {p.link && <span style={{ fontSize: 11, color: "#666" }} className="select-all">{p.link}</span>}
                  </div>
                  <div style={{ color: "#555", marginTop: 2 }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2 */}
        <div>
          {d.skills && d.skills.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle>Skills</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {d.skills.map((s, i) => (
                  <span key={i} style={{ background: "#000", color: "#fff", padding: "3px 8px", fontSize: 11, fontWeight: "bold" }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {d.education && d.education.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle>Education</SectionTitle>
              {d.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                  <div style={{ color: "#555", fontSize: 12 }}>{edu.institution}</div>
                  <div style={{ color: "#777", fontSize: 11 }}>{edu.year}</div>
                </div>
              ))}
            </div>
          )}

          {d.certifications && d.certifications.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle>Certifications</SectionTitle>
              {d.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{cert.name}</div>
                  <div style={{ color: "#555", fontSize: 11 }}>{cert.authority} ({cert.year})</div>
                </div>
              ))}
            </div>
          )}

          {d.languages && d.languages.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle>Languages</SectionTitle>
              {d.languages.map((l, i) => (
                <div key={i} style={{ marginBottom: 4, fontSize: 12, color: '#333' }}>{typeof l === 'string' ? l : `${l.language || ''} — ${l.proficiency || ''}`}</div>
              ))}
            </div>
          )}

          {d.achievements && d.achievements.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionTitle>Achievements</SectionTitle>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }} className="list-disc">
                {d.achievements.filter(ach => ach).map((ach, i) => <li key={i} style={{ marginBottom: 2 }}>{ach}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export const TEMPLATE_COMPONENTS = {
  // New IDs
  "software-engineer": SoftwareEngineerTemplate,
  "fresher": FresherTemplate,
  "modern-professional": ModernProfessionalTemplate,
  "executive": ExecutiveTemplate,
  "creative": CreativeTemplate,

  // Fallbacks for compatibility
  classic: ExecutiveTemplate,
  modern: ModernProfessionalTemplate,
  minimal: FresherTemplate,
  bold: SoftwareEngineerTemplate,
  sidebar: CreativeTemplate,
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — ResumeTemplates Page
// Pass `resumeData` prop with real data from Firestore, or leave blank for demo
// ══════════════════════════════════════════════════════════════════════════════
export default function ResumeTemplates({ resumeData, onSelectTemplate }) {
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const data = resumeData || BLANK_RESUME;

  // Compute scale for mobile preview
  const updateScale = () => {
    const available = Math.min(window.innerWidth - 32, 860);
    setPreviewScale(Math.min(1, available / 595));
  };

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleSelect = (id) => {
    setSelected(id);
    if (onSelectTemplate) onSelectTemplate(id);
  };

  const ActiveTemplate = preview ? TEMPLATE_COMPONENTS[preview] : null;

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "24px 16px", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto 28px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Choose Your Template</h1>
        <p style={{ color: "#666", marginTop: 8, fontSize: 14 }}>All templates are ATS-friendly and recruiter-approved. Scroll down to browse all options.</p>
      </div>

      {/* Template grid — responsive vertical grid for both mobile and desktop */}
      {!preview && (
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              onClick={() => setPreview(t.id)}
              style={{
                border: selected === t.id ? "2px solid #000" : "1px solid #e0e0e0",
                cursor: "pointer",
                transition: "all 0.15s",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#000";
                e.currentTarget.style.boxShadow = "4px 4px 0 #000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = selected === t.id ? "#000" : "#e0e0e0";
                e.currentTarget.style.boxShadow = selected === t.id ? "4px 4px 0 #000" : "none";
              }}
            >
              <TemplateThumbnail id={t.id} />
              <div style={{ padding: "14px 16px", borderTop: "1px solid #eee", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                  <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{t.role}</div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(t.id);
                    }}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      border: "1px solid #000",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      minHeight: 36,
                    }}
                  >
                    Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(t.id);
                    }}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      border: "none",
                      background: "#000",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      minHeight: 36,
                    }}
                  >
                    {selected === t.id ? "✓ Selected" : "Use This"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full preview mode — scales to fit any screen */}
      {preview && ActiveTemplate && (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => setPreview(null)}
              style={{ background: "#fff", border: "1px solid #000", padding: "10px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, minHeight: 44 }}
            >
              ← Back
            </button>
            <button
              onClick={() => { handleSelect(preview); setPreview(null); }}
              style={{ background: "#000", color: "#fff", border: "none", padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: 600, minHeight: 44 }}
            >
              {selected === preview ? "✓ Currently Selected" : "Use This Template"}
            </button>
          </div>
          {/* Scaled live preview */}
          <div style={{ width: "100%", overflowX: "hidden", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 595,
                transformOrigin: "top center",
                transform: `scale(${previewScale})`,
                marginBottom: `${(842 * previewScale) - 842}px`,
                border: "1px solid #e0e0e0",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
              }}
            >
              <ActiveTemplate data={data} editable={false} onEdit={() => {}} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Thumbnail previews (pure CSS, no images needed) ────────────────────────
export function TemplateThumbnail({ id }) {
  const styles = {
    executive: { header: { background: "#fff", borderBottom: "2px solid #000", padding: "10px 14px" }, accent: "#000" },
    "modern-professional": { header: { background: "#000", padding: "10px 14px" }, accent: "#fff" },
    fresher: { header: { background: "#fff", padding: "10px 14px" }, accent: "#000" },
    "software-engineer": { header: { background: "#fff", borderBottom: "4px solid #000", padding: "10px 14px" }, accent: "#000" },
    creative: { header: null, accent: "#000" },
    
    // Compatibility Fallbacks
    classic: { header: { background: "#fff", borderBottom: "2px solid #000", padding: "10px 14px" }, accent: "#000" },
    modern: { header: { background: "#000", padding: "10px 14px" }, accent: "#fff" },
    minimal: { header: { background: "#fff", padding: "10px 14px" }, accent: "#000" },
    bold: { header: { background: "#fff", borderBottom: "4px solid #000", padding: "10px 14px" }, accent: "#000" },
    sidebar: { header: null, accent: "#000" },
  };

  const s = styles[id] || styles.executive;

  if (id === "creative" || id === "sidebar") {
    return (
      <div style={{ height: 160, display: "flex", overflow: "hidden", border: "1px solid #eee", background: "#fff" }}>
        <div style={{ width: "32%", background: "#000", padding: 10 }}>
          <div style={{ height: 8, background: "#fff", borderRadius: 2, marginBottom: 6, width: "80%" }} />
          <div style={{ height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2, marginBottom: 4 }} />
          <div style={{ height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2, marginBottom: 4, width: "70%" }} />
          <div style={{ height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2, width: "60%" }} />
        </div>
        <div style={{ flex: 1, padding: 10, background: "#fff" }}>
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
    <div style={{ height: 160, overflow: "hidden", border: "1px solid #eee", background: "#fff" }}>
      <div style={s.header}>
        <div style={{ height: 10, background: id === "modern-professional" || id === "modern" ? "#fff" : "#000", borderRadius: 2, width: "60%", marginBottom: 6 }} />
        <div style={{ display: "flex", gap: 6 }}>
          {[40, 50, 40].map((w, i) => (
            <div key={i} style={{ height: 4, background: id === "modern-professional" || id === "modern" ? "rgba(255,255,255,0.5)" : "#ccc", borderRadius: 2, width: w }} />
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

