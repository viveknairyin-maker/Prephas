import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{ background: "#000", color: "#fff", padding: "48px 32px", width: "100%" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: "#fff" }}>PREPHAS</h2>
          <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.8, maxWidth: 280 }}>
            Build an ATS-friendly resume that recruiters actually notice. AI-powered. Interview-ready.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#888" }}>Product</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link to="/" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Home</Link>
            <Link to="/resume-builder" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Resume Builder</Link>
            <Link to="/ats-analyzer" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>ATS Analyzer</Link>
            <Link to="/templates" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Templates</Link>

          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#888" }}>Legal & Resources</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link to="/login" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Login</Link>
            <Link to="/signup" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Sign Up Free</Link>
            <Link to="/privacy-policy" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Privacy Policy</Link>
            <Link to="/terms-and-conditions" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Terms & Conditions</Link>
          </div>
        </div>
      </div>

      {/* External Authority Links Section */}
      <div style={{ maxWidth: 900, margin: "32px auto 0", borderTop: "1px solid #333", paddingTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          <a href="https://www.linkedin.com/help/linkedin/answer/a5059632" target="_blank" rel="noopener noreferrer" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>LinkedIn Career Resources</a>
          <a href="https://grow.google/certificates/" target="_blank" rel="noopener noreferrer" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>Google Career Certificates</a>
          <a href="https://www.indeed.com/career-advice/resumes-cover-letters/resume-writing-tips" target="_blank" rel="noopener noreferrer" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>Resume Writing Tips</a>
          <a href="https://www.livecareer.com/resources/resumes/how-to/write/ats-resume-guide" target="_blank" rel="noopener noreferrer" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>ATS Resume Guide</a>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "24px auto 0", borderTop: "1px solid #222", paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666" }}>
        <span>© 2026 PREPHAS. All rights reserved.</span>
        <span>Built for job seekers across India 🇮🇳</span>
      </div>
    </footer>
  );
}

export default Footer;
