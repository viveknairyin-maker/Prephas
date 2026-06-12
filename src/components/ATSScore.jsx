import { useState, useRef } from "react";
import { db, doc, updateDoc, collection, addDoc } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { parseResumeFromText } from "../utils/gemini";

// ─── Gemini call ─────────────────────────────────────────────────────────────
async function analyzeWithGemini(resumeText) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const prompt = `
You are an expert ATS (Applicant Tracking System) analyst and resume coach.

Analyze the following resume text carefully and return ONLY a valid JSON object — no markdown, no explanation, no code fences, just raw JSON.

The JSON must follow this exact structure:
{
  "score": <number 0-100>,
  "grade": "<A / B / C / D>",
  "summary": "<one sentence overall verdict>",
  "sections": {
    "contactInfo": { "score": <0-100>, "status": "<good|warning|missing>" },
    "summary": { "score": <0-100>, "status": "<good|warning|missing>" },
    "experience": { "score": <0-100>, "status": "<good|warning|missing>" },
    "skills": { "score": <0-100>, "status": "<good|warning|missing>" },
    "education": { "score": <0-100>, "status": "<good|warning|missing>" },
    "formatting": { "score": <0-100>, "status": "<good|warning|missing>" }
  },
  "strengths": ["<string>", "<string>", "<string>"],
  "issues": [
    { "severity": "high", "issue": "<string>", "fix": "<string>" },
    { "severity": "medium", "issue": "<string>", "fix": "<string>" }
  ],
  "missingKeywords": ["<string>"],
  "topKeywordsFound": ["<string>"]
}

Resume text to analyze:
"""
${resumeText}
"""
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
      }),
    }
  );

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── PDF text extractor using pdfjs-dist ────────────────────────────────────
async function extractTextFromPDF(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SEVERITY_COLOR = { high: "#c00", medium: "#b86000", low: "#666" };
const STATUS_COLOR = { good: "#1a7a3c", warning: "#b86000", missing: "#c00" };
const STATUS_ICON = { good: "✓", warning: "⚠", missing: "✗" };

function ScoreRing({ score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <svg width={130} height={130} viewBox="0 0 130 130">
      <circle cx={65} cy={65} r={r} fill="none" stroke="#eee" strokeWidth={10} />
      <circle
        cx={65} cy={65} r={r} fill="none"
        stroke="#000" strokeWidth={10}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x={65} y={60} textAnchor="middle" fontSize={28} fontWeight={900} fill="#000">{score}</text>
      <text x={65} y={78} textAnchor="middle" fontSize={11} fill="#888">out of 100</text>
    </svg>
  );
}

function ProgressBar({ label, score, status }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: STATUS_COLOR[status], fontWeight: 700 }}>
          {STATUS_ICON[status]} {score}%
        </span>
      </div>
      <div style={{ height: 6, background: "#f0f0f0", borderRadius: 0 }}>
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: score >= 70 ? "#000" : score >= 40 ? "#888" : "#ddd",
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ATSScore({ existingResumeData }) {
  const [mode, setMode] = useState(existingResumeData ? "choose" : "upload"); // choose | upload | builder | loading | result | error
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [rawText, setRawText] = useState("");
  const fileInputRef = useRef();
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Analyze uploaded PDF ──────────────────────────────────────────────────
  const analyzeFile = async (f) => {
    if (!f) return;
    setFile(f);
    setMode("loading");
    setLoadingMsg("Reading your resume...");

    try {
      const text = await extractTextFromPDF(f);
      if (!text || text.length < 100) throw new Error("Could not extract text. Please ensure the PDF is not scanned/image-based.");
      setRawText(text);
      setLoadingMsg("Analysing with AI...");
      const analysis = await analyzeWithGemini(text);
      setResult(analysis);
      setMode("result");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setMode("error");
    }
  };

  // ── Analyze from builder data ─────────────────────────────────────────────
  const analyzeBuilderResume = async () => {
    if (!existingResumeData) return;
    setMode("loading");
    setLoadingMsg("Reading your resume...");

    try {
      // Remove nested metadata fields to make JSON clean
      const resumeCopy = { ...existingResumeData };
      delete resumeCopy.strengthScores;
      delete resumeCopy.atsScore;

      const text = JSON.stringify(resumeCopy, null, 2);
      setRawText(text);
      setLoadingMsg("Analysing with AI...");
      const analysis = await analyzeWithGemini(text);

      // Save score back to Firestore if we have a resume ID
      if (existingResumeData?.id) {
        try {
          const docRef = doc(db, 'resumes', existingResumeData.id);
          await updateDoc(docRef, {
            atsScore: analysis.score,
            updatedAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error("Failed to update Firestore ATS score:", dbErr);
        }
      }

      setResult(analysis);
      setMode("result");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setMode("error");
    }
  };

  // ── Convert uploaded PDF to builder resume document ──────────────────────
  const handleFixInBuilder = async () => {
    if (!user) return;

    if (existingResumeData?.id) {
      navigate(`/builder/${existingResumeData.id}`);
      return;
    }

    if (!rawText) return;

    setMode("loading");
    setLoadingMsg("Extracting resume fields into builder schema...");

    try {
      const parsedData = await parseResumeFromText(rawText);
      
      const newResume = {
        userId: user.uid,
        title: file ? `Imported (${file.name.replace(/\.pdf$/i, '')})` : "Imported Resume",
        template: "classic",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personalInfo: parsedData.personalInfo || { name: '', email: '', phone: '', linkedin: '', location: '', role: '' },
        summary: parsedData.summary || '',
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        skills: parsedData.skills || [],
        projects: parsedData.projects || [],
        achievements: parsedData.achievements || [],
        certifications: parsedData.certifications || [],
        languages: parsedData.languages || [],
        links: parsedData.links || { linkedin: '', github: '', portfolio: '', leetcode: '' },
        atsScore: result?.score || 0,
        strengthScores: { experience: 0, projects: 0, skills: 0, education: 0 }
      };

      const docRef = await addDoc(collection(db, 'resumes'), newResume);
      navigate(`/builder/${docRef.id}`);
    } catch (err) {
      console.error("Failed to parse and import resume:", err);
      setErrorMsg(err.message || "Failed to convert resume. You can manually copy details into the builder.");
      setMode("error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") analyzeFile(f);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) analyzeFile(f);
  };

  const reset = () => {
    setMode("choose");
    setFile(null);
    setResult(null);
    setErrorMsg("");
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN: CHOOSE MODE
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "choose") {
    return (
      <Page>
        <Header title="ATS Score Checker" subtitle="Find out how well your resume performs with Applicant Tracking Systems." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 640, margin: "0 auto" }}>
          {/* Upload card */}
          <ChoiceCard
            icon="⬆"
            title="Upload Your Resume"
            desc="Upload an existing PDF resume and get an instant ATS analysis."
            onClick={() => setMode("upload")}
          />

          {/* Builder card */}
          {existingResumeData && (
            <ChoiceCard
              icon="✦"
              title="Analyse My Resume"
              desc="Use the resume you've been building in PREPHAS."
              onClick={analyzeBuilderResume}
            />
          )}
        </div>
      </Page>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN: UPLOAD
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "upload") {
    return (
      <Page>
        <Header title="Upload Your Resume" subtitle="We accept PDF files only. Your file is never stored." />

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{
            maxWidth: 480,
            margin: "0 auto",
            border: dragOver ? "2px solid #000" : "2px dashed #ccc",
            padding: "56px 32px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "#f9f9f9" : "#fff",
            transition: "all 0.15s",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Drop your PDF here</div>
          <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>or click to browse your files</div>
          <button
            style={{ background: "#000", color: "#fff", border: "none", padding: "10px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
          >
            Choose PDF File
          </button>
          <div style={{ marginTop: 16, fontSize: 11, color: "#bbb" }}>Supported: PDF only · Max 10MB</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
            ← Back
          </button>
        </div>
      </Page>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN: LOADING
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "loading") {
    return (
      <Page>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Spinner />
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 24 }}>{loadingMsg}</div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 8 }}>This usually takes 5–10 seconds.</div>
        </div>
      </Page>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN: ERROR
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "error") {
    return (
      <Page>
        <div style={{ textAlign: "center", padding: "60px 0", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Analysis Failed</div>
          <div style={{ color: "#666", fontSize: 14, marginBottom: 24, border: "1px solid #e0e0e0", padding: "12px 16px" }}>{errorMsg}</div>
          <button onClick={reset} style={{ background: "#000", color: "#fff", border: "none", padding: "10px 28px", cursor: "pointer", fontWeight: 600 }}>
            Try Again
          </button>
        </div>
      </Page>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN: RESULT
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "result" && result) {
    const sectionLabels = {
      contactInfo: "Contact Info",
      summary: "Summary",
      experience: "Experience",
      skills: "Skills",
      education: "Education",
      formatting: "Formatting",
    };

    return (
      <Page>
        {/* Top: Score + grade */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <ScoreRing score={result.score} />
          <div style={{ marginTop: 12 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, padding: "4px 16px",
              background: result.score >= 70 ? "#000" : result.score >= 50 ? "#555" : "#c00",
              color: "#fff", letterSpacing: 1,
            }}>
              Grade {result.grade}
            </span>
          </div>
          <p style={{ color: "#555", marginTop: 12, fontSize: 14, maxWidth: 480, margin: "12px auto 0" }}>{result.summary}</p>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Section breakdown */}
          <Card title="Section Breakdown">
            {Object.entries(result.sections).map(([key, val]) => (
              <ProgressBar key={key} label={sectionLabels[key] || key} score={val.score} status={val.status} />
            ))}
          </Card>

          {/* Issues */}
          <div>
            <Card title="Issues to Fix">
              {result.issues.map((issue, i) => (
                <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < result.issues.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px",
                      background: SEVERITY_COLOR[issue.severity],
                      color: "#fff", flexShrink: 0, marginTop: 2,
                    }}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{issue.issue}</div>
                      <div style={{ color: "#555", fontSize: 12, marginTop: 3 }}>→ {issue.fix}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Strengths */}
          <Card title="What's Working ✓">
            {result.strengths.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#1a7a3c", fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13 }}>{s}</span>
              </div>
            ))}
          </Card>

          {/* Keywords */}
          <Card title="Keyword Analysis">
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 8, letterSpacing: 1 }}>FOUND</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.topKeywordsFound.map((k, i) => (
                  <span key={i} style={{ background: "#f0f0f0", border: "1px solid #ddd", padding: "3px 10px", fontSize: 11 }}>{k}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 8, letterSpacing: 1 }}>MISSING</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.missingKeywords.map((k, i) => (
                  <span key={i} style={{ background: "#fff", border: "1px solid #c00", color: "#c00", padding: "3px 10px", fontSize: 11 }}>{k}</span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 36, display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
          <button 
            onClick={handleFixInBuilder} 
            style={{ background: "#000", color: "#fff", border: "none", padding: "10px 28px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            {existingResumeData?.id ? "Fix this resume in Builder" : "Import & Fix in Builder ✦"}
          </button>
          <button onClick={reset} style={{ background: "#fff", border: "1px solid #000", padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Check Another Resume
          </button>
          {file && (
            <div style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center" }}>
              Analysed: {file.name}
            </div>
          )}
        </div>
      </Page>
    );
  }

  return null;
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

function Page({ children }) {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
      {children}
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 36 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ color: "#666", fontSize: 14, marginTop: 8 }}>{subtitle}</p>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ border: "1px solid #e8e8e8", padding: "20px 22px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #f0f0f0" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ChoiceCard({ icon, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ border: "1px solid #e0e0e0", padding: "32px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid #000"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
      onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid #e0e0e0"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</div>
      <div style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "inline-block" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ats-spinner { width: 40px; height: 40px; border: 3px solid #eee; border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
      `}</style>
      <div className="ats-spinner" />
    </div>
  );
}
