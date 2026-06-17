import { useState, useRef } from "react";
import { db, doc, updateDoc, collection, addDoc } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { parseResumeFromText } from "../utils/gemini";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { trackEvent } from "../utils/analytics";

// Configure local worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ─── Gemini call ─────────────────────────────────────────────────────────────
async function analyzeWithGemini(resumeText) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

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

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── PDF text extractor using pdfjs-dist ────────────────────────────────────
async function extractTextFromPDF(file) {
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

// ─── Job Match analysis ───────────────────────────────────────────────────────
async function analyzeJobMatch(resumeText, jobDescription) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) throw new Error("Gemini API key is not configured.");
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `\
You are an expert ATS (Applicant Tracking System) and job match analyst. Compare the provided resume text with the job description. Return ONLY a valid JSON object (no markdown, no code fences) with the following structure:\
{\
  "matchScore": <number 0-100>,\
  "summary": "<2-3 sentence overall match verdict and compatibility explanation>",\
  "strengths": ["<string>", "<string>", "<string>"],\
  "issues": [{"severity": "high|medium|low", "issue": "<string>", "fix": "<string>"}],\
  "recommendedSkillsToLearn": [{"skill": "<skill name>", "reason": "<why the candidate should learn/prepare for this skill for the target role>"}],\
  "missingKeywords": ["<keyword>"]\
}\
\
Resume Text:\
"""${resumeText}"""\
\
Job Description:\
"""${jobDescription}"""`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
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
    <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <svg width={140} height={140} viewBox="0 0 140 140" style={{ display: "block" }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="#f0f0f0" strokeWidth={10} />
        <circle
          cx={70} cy={70} r={r} fill="none"
          stroke="#000" strokeWidth={10}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: "#000", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: "#888", marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>out of 100</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, score, status }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
        <span style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 }}>{label}</span>
        <span style={{ color: STATUS_COLOR[status], fontWeight: 900, fontSize: 11 }}>
          {STATUS_ICON[status]} {score}%
        </span>
      </div>
      <div style={{ height: 12, background: "#f0f0f0", border: "2px solid #000", borderRadius: 0, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: score >= 70 ? "#000" : score >= 40 ? "#888" : "#ddd",
            transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
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
  
  // New state for Job Description Match
  const [jobDesc, setJobDesc] = useState("");
  const [jobResult, setJobResult] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState("");
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Analyze uploaded PDF ──────────────────────────────────────────────────
  const analyzeFile = async (f) => {
    if (!f) return;
    setFile(f);
    setMode("loading");
    setLoadingMsg("Reading your resume...");
    trackEvent('ATS Analysis Started');

    try {
      const text = await extractTextFromPDF(f);
      if (!text || text.length < 100) throw new Error("Could not extract text. Please ensure the PDF is not scanned/image-based.");
      setRawText(text);
      setLoadingMsg("Analysing with AI...");
      const analysis = await analyzeWithGemini(text);
      setResult(analysis);
      setMode("result");
      trackEvent('ATS Analysis Completed', {
        ats_score: analysis?.score || 0
      });
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setMode("error");
      trackEvent('ATS Analysis Failed', {
        error_type: 'ats_analysis_error',
        error_message: err.message || 'Unknown analysis error'
      });
    }
  };

  // ── Handle Job Match ──────────────────────────────────────────────────────
  const handleJobMatch = async () => {
    if (!jobDesc) return;
    setJobLoading(true);
    setJobError("");
    trackEvent('Job Match Analysis Started');
    try {
      const data = await analyzeJobMatch(rawText, jobDesc);
      setJobResult(data);
      trackEvent('Job Match Analysis Completed', {
        match_score: data?.matchScore || 0
      });
    } catch (err) {
      setJobError("Analysis failed. Try again.");
      trackEvent('Job Match Analysis Failed', {
        error_type: 'job_match_error',
        error_message: err.message || 'Unknown job match error'
      });
    } finally {
      setJobLoading(false);
    }
  };

  // ── Convert uploaded PDF to builder resume document ──────────────────────
  const handleFixInBuilder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // If they analyzed their builder resume directly without uploading any PDF
    if (!file) {
      if (existingResumeData?.id) {
        navigate(`/builder/${existingResumeData.id}`);
      } else {
        navigate(`/dashboard`);
      }
      return;
    }

    // If they uploaded a PDF, we must parse and import it!
    if (!rawText) return;

    setMode("loading");
    setLoadingMsg("Extracting resume fields into builder schema...");

    try {
      const parsedData = await parseResumeFromText(rawText);
      
      const resumeData = {
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
        updatedAt: new Date().toISOString()
      };

      if (existingResumeData?.id) {
        // Update existing resume document in Firestore
        const docRef = doc(db, 'resumes', existingResumeData.id);
        await updateDoc(docRef, resumeData);
        navigate(`/builder/${existingResumeData.id}`);
      } else {
        // Create new resume document in Firestore
        const newResume = {
          userId: user.uid,
          title: `Imported (${file.name.replace(/\.pdf$/i, '')})`,
          template: "classic",
          source: "ats_import",
          createdAt: new Date().toISOString(),
          strengthScores: { experience: 0, projects: 0, skills: 0, education: 0 },
          ...resumeData
        };
        const docRef = await addDoc(collection(db, 'resumes'), newResume);
        trackEvent('Resume Created', {
          source: 'ats_import',
          template_name: 'classic'
        });
        navigate(`/builder/${docRef.id}`);
      }
    } catch (err) {
      console.error("Failed to parse and import resume:", err);
      trackEvent('Resume Creation Failed', {
        error_type: 'ats_import_error',
        error_message: err.message || 'Failed to import resume'
      });
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

  const compileResumeToText = (data) => {
    if (!data) return "";
    let text = "";
    if (data.personalInfo) {
      const { name, role, email, phone, location, linkedin } = data.personalInfo;
      if (name) text += `${name}\n`;
      if (role) text += `${role}\n`;
      if (email || phone || location || linkedin) {
        text += `${[email, phone, location, linkedin].filter(Boolean).join(" | ")}\n`;
      }
      text += "\n";
    }
    if (data.summary) {
      text += `PROFESSIONAL SUMMARY\n${data.summary}\n\n`;
    }
    if (data.experience && data.experience.length > 0) {
      text += `WORK EXPERIENCE\n`;
      data.experience.forEach(exp => {
        text += `${exp.position || ""} at ${exp.company || ""} (${exp.duration || ""})\n${exp.description || ""}\n\n`;
      });
    }
    if (data.projects && data.projects.length > 0) {
      text += `PROJECTS\n`;
      data.projects.forEach(proj => {
        text += `${proj.name || ""} - ${proj.role || ""}\n${proj.description || ""}\n\n`;
      });
    }
    if (data.education && data.education.length > 0) {
      text += `EDUCATION\n`;
      data.education.forEach(edu => {
        text += `${edu.degree || ""} - ${edu.institution || ""} (${edu.duration || ""})\n\n`;
      });
    }
    if (data.skills && data.skills.length > 0) {
      text += `SKILLS\n${data.skills.join(", ")}\n\n`;
    }
    if (data.certifications && data.certifications.length > 0) {
      text += `CERTIFICATIONS\n`;
      data.certifications.forEach(cert => {
        text += `${cert.name || ""} by ${cert.authority || ""} (${cert.year || ""})\n`;
      });
      text += "\n";
    }
    if (data.languages && data.languages.length > 0) {
      text += `LANGUAGES\n`;
      data.languages.forEach(lang => {
        text += `${lang.name || ""} (${lang.level || ""})\n`;
      });
      text += "\n";
    }
    return text;
  };

  // ── Analyze existing builder resume ──────────────────────────────────────────────
  const analyzeBuilderResume = async () => {
    if (!existingResumeData) return;
    setMode('loading');
    setLoadingMsg('Analyzing your builder resume with AI...');
    trackEvent('ATS Analysis Started');
    try {
      const text = compileResumeToText(existingResumeData);
      if (!text || text.trim().length < 50) {
        throw new Error("Your resume is empty. Please fill in your details in the builder before running the ATS analysis.");
      }

      const analysis = await analyzeWithGemini(text);
      setResult(analysis);
      setMode('result');

      // Update Firestore document with new ATS score
      try {
        const docRef = doc(db, 'resumes', existingResumeData.id);
        await updateDoc(docRef, {
          atsScore: analysis.score || 0,
          updatedAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.error("Failed to update ATS score in Firestore:", dbErr);
      }

      trackEvent('ATS Analysis Completed', {
        ats_score: analysis?.score || 0
      });
    } catch (err) {
      console.error("Failed to analyze builder resume:", err);
      setErrorMsg(err.message || 'Failed to analyze builder resume.');
      setMode('error');
      trackEvent('ATS Analysis Failed', {
        error_type: 'ats_analysis_error',
        error_message: err.message || 'Failed to analyze builder resume'
      });
    }
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 20, maxWidth: 640, margin: "0 auto" }}>
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
        <HowAtsWorks />
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
        <HowAtsWorks />
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

    const score = result.score || 0;

    const handleCopyScoreLink = () => {
      const text = `🚀 I scored ${score}/100 on PREPHAS ATS Analyzer.\n\nCheck your ATS score and improve your resume for free:\nhttps://www.prephas.online`;
      navigator.clipboard.writeText(text)
        .then(() => {
          alert("Share link copied to clipboard!");
          trackEvent('Share Link Copied', { source: 'ats_score' });
        })
        .catch(err => {
          console.error("Failed to copy link:", err);
        });
    };

    const handleShareScoreResult = () => {
      const text = `🚀 I scored ${score}/100 on PREPHAS ATS Analyzer. Check your ATS score and improve your resume for free:`;
      if (navigator.share) {
        navigator.share({
          title: 'PREPHAS ATS Score',
          text: text,
          url: 'https://www.prephas.online'
        })
        .then(() => trackEvent('ATS Score Shared', { score, method: 'native_share' }))
        .catch(err => console.log('Share failed:', err));
      } else {
        handleCopyScoreLink();
      }
    };

    const handleDownloadScoreCard = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 418;
        const ctx = canvas.getContext('2d');

        // Draw background (solid white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw border (solid 8px black)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 16;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Draw inner line (solid 2px black)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Draw PREPHAS logo (solid black square with white 'P', and bold 'PREPHAS' text)
        ctx.fillStyle = '#000000';
        ctx.fillRect(50, 50, 48, 48);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px "Inter", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', 50 + 24, 50 + 24);

        ctx.fillStyle = '#000000';
        ctx.font = '900 24px "Inter", "Arial", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('PREPHAS', 110, 50 + 24);

        // Draw Score box (large rectangle on the right side)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        // Drop shadow for the score box
        ctx.fillStyle = '#000000';
        ctx.fillRect(510, 80, 240, 240); // Shadow offset
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(500, 70, 240, 240);
        ctx.strokeRect(500, 70, 240, 240);

        // Score label inside box
        ctx.fillStyle = '#555555';
        ctx.font = 'bold 12px "Inter", "Arial", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ATS COMPATIBILITY SCORE', 500 + 120, 70 + 40);

        // Score value (e.g. 87)
        ctx.fillStyle = '#000000';
        ctx.font = '900 80px "Inter", "Arial", sans-serif';
        ctx.fillText(score.toString(), 500 + 120, 70 + 130);

        // Total score (e.g. /100)
        ctx.fillStyle = '#555555';
        ctx.font = 'bold 20px "Inter", "Arial", sans-serif';
        ctx.fillText('/100', 500 + 120, 70 + 190);

        // Draw Title / Content on the left
        ctx.fillStyle = '#000000';
        ctx.font = '900 32px "Inter", "Arial", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('RESUME PERFORMANCE', 50, 160);

        // Short tagline
        ctx.fillStyle = '#555555';
        ctx.font = '500 16px "Inter", "Arial", sans-serif';
        ctx.fillText('Pass applicant tracking systems and get more interviews.', 50, 210);

        ctx.fillStyle = '#777777';
        ctx.font = 'bold 12px "Inter", "Arial", sans-serif';
        ctx.fillText('Check your ATS compatibility score for free.', 50, 240);

        // Website URL at the bottom left
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px "Inter", "Arial", sans-serif';
        ctx.fillText('www.prephas.online', 50, 350);

        // Convert to image download
        const link = document.createElement('a');
        link.download = `prephas-ats-score-${score}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        trackEvent('Share Image Downloaded', { type: 'ats_score', score });
      } catch (err) {
        console.error("Failed to generate score card:", err);
      }
    };

    const handleInviteFriends = () => {
      const text = "I'm using PREPHAS to build ATS-friendly resumes and check ATS scores. Try it here: https://www.prephas.online";
      if (navigator.share) {
        navigator.share({
          title: 'PREPHAS',
          text: text,
          url: 'https://www.prephas.online'
        })
        .then(() => trackEvent('Invite Friend Clicked', { source: 'ats_score', method: 'native_share' }))
        .catch(err => console.log('Share failed:', err));
      } else {
        navigator.clipboard.writeText(text)
          .then(() => {
            alert("Invite message copied to clipboard!");
            trackEvent('Share Link Copied', { source: 'invite_friends_ats' });
            trackEvent('Invite Friend Clicked', { source: 'ats_score', method: 'copy_link' });
          })
          .catch(err => console.error("Clipboard copy failed:", err));
      }
    };

    return (
      <Page>
        {/* Top: Score + grade */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyCenter: "center", marginBottom: 48, textAlign: "center" }}>
          <ScoreRing score={result.score} />
          <div style={{ marginTop: 24 }}>
            <span style={{
              fontSize: 14, fontWeight: 900, padding: "6px 20px",
              background: result.score >= 70 ? "#000" : result.score >= 50 ? "#555" : "#c00",
              color: "#fff", letterSpacing: 2,
              textTransform: "uppercase",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000"
            }}>
              Grade {result.grade}
            </span>
          </div>
          <p style={{ color: "#333", marginTop: 20, fontSize: 16, maxWidth: 600, margin: "20px auto 0", fontWeight: 500, lineHeight: 1.6 }}>{result.summary}</p>
        </div>

        {/* Share Your Score block */}
        <div style={{
          border: "2px solid #000",
          boxShadow: "4px 4px 0px #000",
          padding: "24px",
          background: "#fff",
          maxWidth: 600,
          width: "100%",
          margin: "0 auto 48px auto",
          boxSizing: "border-box",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 0 }}>
            Share Your Score
          </h3>
          <p style={{ color: "#555", fontSize: 13, margin: "0 0 16px 0", lineHeight: 1.5 }}>
            Help your friends improve their resumes too.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <button
              onClick={handleCopyScoreLink}
              style={{
                background: "#fff",
                color: "#000",
                border: "2px solid #000",
                padding: "10px 20px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
                boxShadow: "3px 3px 0 #000",
                transition: "all 0.1s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-1px, -1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0 #000"; }}
            >
              Copy Link
            </button>
            
            <button
              onClick={handleShareScoreResult}
              style={{
                background: "#000",
                color: "#fff",
                border: "2px solid #000",
                padding: "10px 20px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
                boxShadow: "3px 3px 0 #000",
                transition: "all 0.1s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-1px, -1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0 #000"; }}
            >
              Share Result
            </button>

            <button
              onClick={handleDownloadScoreCard}
              style={{
                background: "#fff",
                color: "#000",
                border: "2px solid #000",
                padding: "10px 20px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 1,
                boxShadow: "3px 3px 0 #000",
                transition: "all 0.1s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-1px, -1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0 #000"; }}
            >
              Download Card
            </button>
          </div>
        </div>

        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 24, marginTop: 40 }}>
          {/* Section breakdown */}
          <Card title="Section Breakdown">
            {Object.entries(result.sections).map(([key, val]) => (
              <ProgressBar key={key} label={sectionLabels[key] || key} score={val.score} status={val.status} />
            ))}
          </Card>

          {/* Issues */}
          <Card title="Issues to Fix">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {result.issues.map((issue, i) => (
                <div key={i} style={{ padding: "16px", border: "2px solid #000", background: "#fbfbfb", boxShadow: "4px 4px 0 #000" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 900, padding: "2px 8px",
                      background: SEVERITY_COLOR[issue.severity],
                      color: "#fff", flexShrink: 0, border: "1px solid #000",
                      textTransform: "uppercase", letterSpacing: 0.5
                    }}>
                      {issue.severity}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#000" }}>{issue.issue}</div>
                      <div style={{ color: "#444", fontSize: 13, marginTop: 6, fontWeight: 500 }}>{issue.fix}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Strengths */}
          <Card title="What's Working ✓">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.strengths.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", border: "2px solid #000", background: "#f5fdf7" }}>
                  <span style={{ color: "#1a7a3c", fontWeight: 900, fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{s}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Keywords */}
          <Card title="Keyword Analysis">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#000", marginBottom: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>Keywords Found</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.topKeywordsFound.map((k, i) => (
                  <span key={i} style={{ background: "#f0f0f0", border: "2px solid #000", padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{k}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#000", marginBottom: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>Keywords Missing</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.missingKeywords.map((k, i) => (
                  <span key={i} style={{ background: "#fff", border: "2px solid #c00", color: "#c00", padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{k}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* Job Description Match Score */}
          <Card title="Job Description Match Score">
            {jobResult ? (
              <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Compatibility Banner */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", borderBottom: "2px solid #000", paddingBottom: 16 }}>
                  <div style={{
                    background: jobResult.matchScore >= 70 ? "#e6f4ea" : jobResult.matchScore >= 45 ? "#fef7e0" : "#fce8e6",
                    border: "2px solid #000",
                    padding: "10px 20px",
                    fontWeight: 900,
                    fontSize: 22,
                    boxShadow: "3px 3px 0 #000",
                    color: "#000"
                  }}>
                    {jobResult.matchScore}% Match
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase", color: "#000" }}>
                      {jobResult.matchScore >= 70 ? "High Compatibility" : jobResult.matchScore >= 45 ? "Moderate Alignment" : "Low Overlap"}
                    </div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>Target Role compatibility review</div>
                  </div>
                </div>

                {/* Match Summary */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 6 }}>Summary Analysis</div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, fontWeight: 500, color: "#111" }}>{jobResult.summary}</p>
                </div>

                {/* Strengths */}
                {jobResult.strengths && jobResult.strengths.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>Matching Strengths</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {jobResult.strengths.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", border: "1px solid #e0e0e0", background: "#f9f9f9" }}>
                          <span style={{ color: "#1a7a3c", fontWeight: 900, fontSize: 14, lineHeight: 1 }}>✓</span>
                          <span style={{ fontSize: 13, color: "#333", lineHeight: 1.3 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills to Learn (New Feature!) */}
                {jobResult.recommendedSkillsToLearn && jobResult.recommendedSkillsToLearn.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>Recommended Skills to Learn</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {jobResult.recommendedSkillsToLearn.map((item, i) => (
                        <div key={i} style={{ padding: "12px", border: "2px solid #000", background: "#fff", boxShadow: "3px 3px 0 #000" }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{
                              background: "#000",
                              color: "#fff",
                              fontSize: 9,
                              fontWeight: 800,
                              padding: "2px 6px",
                              textTransform: "uppercase",
                              letterSpacing: 0.5
                            }}>
                              {item.skill}
                            </span>
                            <span style={{ fontSize: 10, color: "#666", fontWeight: 600 }}>Suggested preparation</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#444", marginTop: 6, lineHeight: 1.4, fontWeight: 500 }}>
                            {item.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gaps / Issues */}
                {jobResult.issues && jobResult.issues.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>Issues & Gaps to Address</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {jobResult.issues.map((issue, i) => (
                        <div key={i} style={{ padding: "10px 12px", border: "1px solid #e0e0e0", background: "#fffdfd", borderLeft: `3px solid ${SEVERITY_COLOR[issue.severity] || "#ccc"}` }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{
                              fontSize: 8,
                              fontWeight: 900,
                              padding: "1px 5px",
                              background: SEVERITY_COLOR[issue.severity],
                              color: "#fff",
                              textTransform: "uppercase"
                            }}>
                              {issue.severity} priority
                            </span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#000", marginTop: 4 }}>{issue.issue}</div>
                          <div style={{ color: "#555", fontSize: 12, marginTop: 2, fontWeight: 500 }}>{issue.fix}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reset button */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: 14, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => {
                      setJobResult(null);
                      setJobDesc("");
                    }}
                    style={{
                      background: "#fff",
                      color: "#000",
                      border: "2px solid #000",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      boxShadow: "2px 2px 0 #000",
                      transition: "transform 0.1s, box-shadow 0.1s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-1px, -1px)"; e.currentTarget.style.boxShadow = "3px 3px 0 #000"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "2px 2px 0 #000"; }}
                  >
                    Clear & Try Another Job
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the job description you are applying for..."
                  style={{ width: "100%", height: 120, padding: 8, border: "2px solid #000", marginBottom: 12, fontFamily: "inherit" }}
                />
                <button
                  onClick={handleJobMatch}
                  disabled={jobLoading}
                  style={{ background: "#000", color: "#fff", border: "2px solid #000", padding: "8px 16px", cursor: "pointer", fontWeight: 800, textTransform: "uppercase" }}
                >
                  {jobLoading ? "Analyzing..." : "Analyze Match"}
                </button>
                {jobError && <div style={{ color: "#c00", marginTop: 8 }}>{jobError}</div>}
              </div>
            )}
          </Card>
        </div>
        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48, display: "flex", gap: 16, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <button 
            onClick={handleFixInBuilder} 
            style={{ 
              background: "#000", 
              color: "#fff", 
              border: "2px solid #000", 
              padding: "14px 32px", 
              cursor: "pointer", 
              fontSize: 14, 
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
              boxShadow: "4px 4px 0 #000",
              transition: "transform 0.1s, box-shadow 0.1s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
          >
            {existingResumeData?.id ? "Fix this resume in Builder" : "Import & Fix in Builder ✦"}
          </button>
          <button 
            onClick={reset} 
            style={{ 
              background: "#fff", 
              color: "#000", 
              border: "2px solid #000", 
              padding: "14px 32px", 
              cursor: "pointer", 
              fontSize: 14, 
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
              boxShadow: "4px 4px 0 #000",
              transition: "transform 0.1s, box-shadow 0.1s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
          >
            Check Another Resume
          </button>
          {file && (
            <div style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>
              Analysed: <strong>{file.name}</strong>
            </div>
          )}
        </div>

        {/* Invite Friends Block */}
        <div style={{
          border: "2px solid #000",
          boxShadow: "6px 6px 0px #000",
          padding: "32px 28px",
          background: "#fff",
          marginTop: 48,
          boxSizing: "border-box",
          maxWidth: 600,
          margin: "48px auto 0 auto",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 0 }}>
            Invite a Friend
          </h3>
          <p style={{ color: "#555", fontSize: 14, margin: "0 0 20px 0", lineHeight: 1.6 }}>
            Know someone applying for internships or jobs? Help them improve their resume.
          </p>
          <button
            onClick={handleInviteFriends}
            style={{
              background: "#000",
              color: "#fff",
              border: "2px solid #000",
              padding: "12px 24px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: 1,
              boxShadow: "4px 4px 0 #000",
              transition: "all 0.1s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
          >
            Invite Friends
          </button>
        </div>

        <HowAtsWorks />
      </Page>
    );
  }

  return null;
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

function Page({ children }) {
  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh", padding: "32px 16px", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: "uppercase", letterSpacing: -0.5, margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ color: "#555", fontSize: 16, marginTop: 12, fontWeight: 500 }}>{subtitle}</p>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ border: "2px solid #000", boxShadow: "6px 6px 0px #000", padding: "32px 28px", background: "#fff", height: "100%", boxSizing: "border-box" }}>
      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #000" }}>
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
      style={{ border: "2px solid #000", boxShadow: "6px 6px 0px #000", padding: "48px 32px", textAlign: "center", cursor: "pointer", transition: "all 0.15s", background: "#fff", height: "100%", boxSizing: "border-box" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "10px 10px 0 #000"; e.currentTarget.style.transform = "translate(-4px, -4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "6px 6px 0 #000"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ fontSize: 44, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
      <div style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "inline-block" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ats-spinner { width: 48px; height: 48px; border: 4px solid #eee; border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
      `}</style>
      <div className="ats-spinner" />
    </div>
  );
}

function HowAtsWorks() {
  return (
    <div style={{ marginTop: 64, borderTop: "2px solid #000", paddingTop: 48 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase", letterSpacing: -0.5, marginBottom: 24, textAlign: "center" }}>
          How ATS Scoring Works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
          <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0px #000", padding: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, borderBottom: "1px solid #000", paddingBottom: 8 }}>
              What is an ATS?
            </h3>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              An Applicant Tracking System (ATS) is a software application used by employers to automate the intake, organization, and screening of job applications. Instead of reading every resume, recruiters search a database of parsed candidate profiles.
            </p>
          </div>

          <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0px #000", padding: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, borderBottom: "1px solid #000", paddingBottom: 8 }}>
              How Resumes are Scanned & Parsed
            </h3>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              When you upload a resume, the parser scans the text content, separating it into data fields such as Work Experience, Education, and Skills. Complicated layout elements like text boxes, graphics, and multiple columns can disrupt this parsing, resulting in corrupted profiles or missing details.
            </p>
          </div>

          <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0px #000", padding: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, borderBottom: "1px solid #000", paddingBottom: 8 }}>
              What Affects ATS Scores?
            </h3>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              ATS scores evaluate keyword alignment, formatting compliance, and structured readability. Having correct contact details, standardized headers (e.g. &quot;Work Experience&quot; instead of &quot;Where I've Been&quot;), and chronological layouts increases parsing success.
            </p>
          </div>

          <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0px #000", padding: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, borderBottom: "1px solid #000", paddingBottom: 8 }}>
              Why Keyword Matching Matters
            </h3>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Recruiters search the candidate database using specific keywords (e.g. hard skills, certifications, tools). Resumes that naturally incorporate these precise phrases from the job description are ranked higher, ensuring they are seen by human recruiters first.
            </p>
          </div>

          <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "4px 4px 0px #000", padding: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, borderBottom: "1px solid #000", paddingBottom: 8 }}>
              How PREPHAS Calculates Compatibility
            </h3>
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Our analyzer uses algorithms to simulate recruiter parsers. We scan your resume layout for compatibility errors, identify recognized headers, and compare your keyword density against standard industry profiles or user-provided job descriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
