import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import { Helmet } from 'react-helmet-async';

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e0e0e0", marginBottom: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", textAlign: "left", padding: "20px 0",
          background: "none", border: "none", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 15, fontWeight: 600, color: "#000"
        }}
      >
        {question}
        <span style={{ fontSize: 20, fontWeight: 300, flexShrink: 0, marginLeft: 16 }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20, fontSize: 14, color: "#555", lineHeight: 1.8 }}>
          {answer}
        </div>
      )}
    </div>
  );
}

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  const handleCtaClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const faqs = [
    {
      q: "What is an ATS resume?",
      a: "ATS stands for Applicant Tracking System — software companies use to filter resumes before a human sees them. An ATS resume is formatted so it passes these filters. PREPHAS checks your resume against ATS criteria and scores it out of 100."
    },
    {
      q: "Is PREPHAS free to use?",
      a: "Yes. The free plan gives you 3 resume downloads, 2 templates, and a basic ATS score. The Premium plan at ₹99/month unlocks unlimited downloads, all 5 templates, AI improvements, and job description matching."
    },
    {
      q: "Can I upload my existing resume for ATS check?",
      a: "Yes. Go to the ATS Score page, upload any PDF resume, and PREPHAS will analyze it with AI and give you a detailed report with specific fixes."
    },
    {
      q: "How is PREPHAS different from other resume builders?",
      a: "Most resume builders just help you format a resume. PREPHAS goes further — it scores your resume against ATS systems, matches it to job descriptions, identifies missing keywords, and uses AI to improve every bullet point."
    },
    {
      q: "What resume templates are available?",
      a: "PREPHAS has 5 professional templates: Classic Pro for software engineers, Modern Edge for data analysts, Clean Minimal for freshers and graduates, Bold Executive for senior roles, and Sidebar Split for designers and creative professionals."
    },
  ];

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden min-h-screen">
      <Helmet>
        <title>PREPHAS — Free ATS Resume Builder | Get More Interviews</title>
        <meta name="description" content="Build an ATS-friendly resume that recruiters actually notice. Free AI-powered resume builder with ATS score, job matching, and PDF export." />
        <link rel="canonical" href="https://prephas.in/" />
      </Helmet>

      <Navbar />

      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[819px] flex flex-col justify-center items-center text-center px-margin-mobile md:px-margin-desktop py-24 overflow-hidden border-b border-primary">
          <div className="absolute inset-0 grid-bg pointer-events-none"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="font-display text-display md:text-[80px] leading-tight mb-8">
              Build a Resume Recruiters Actually Notice.
            </h1>
            <p className="font-body-lg text-secondary max-w-2xl mx-auto mb-12">
              ATS-optimized. AI-improved. Interview-ready. Stop sending resumes into a black hole. Let PREPHAS turn your experience into an unfair advantage.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <button onClick={handleCtaClick} className="w-full md:w-auto bg-primary text-on-primary px-10 py-5 font-label-sm uppercase tracking-widest hover:opacity-90 transition-all">
                Build My Resume
              </button>
              <button onClick={() => setShowDemo(true)} className="w-full md:w-auto bg-surface border border-primary text-primary px-10 py-5 font-label-sm text-center uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all">
                See How It Works
              </button>
            </div>
          </div>
          <div className="mt-24 w-full max-w-container-max-width border border-primary p-4 bg-white block-shadow">
            <div className="w-full h-auto grayscale border border-primary bg-zinc-100 flex items-center justify-center p-12">
              <div className="max-w-2xl text-center space-y-4">
                <span className="material-symbols-outlined text-[64px]" data-icon="description">description</span>
                <h3 className="font-headline-lg uppercase text-primary">PREPHAS AI BUILDER CANVAS</h3>
                <p className="text-secondary font-body-md">Architecturally precise black and white layouts. Single-plane depth, 1px rules, and robust typography built for immediate legibility.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="px-margin-mobile md:px-margin-desktop py-32 border-b border-primary">
          <div className="max-w-container-max-width mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <span className="font-label-sm text-primary uppercase tracking-widest block mb-4">Core Modules</span>
                <h2 className="font-display text-headline-lg md:text-[48px] leading-tight">Why PREPHAS Works</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              {/* Card 1: ATS Score */}
              <div className="md:col-span-8 border border-primary p-12 flex flex-col justify-between min-h-[400px] hover:bg-white transition-colors group">
                <div>
                  <span className="material-symbols-outlined text-[48px] mb-8" data-icon="analytics">analytics</span>
                  <h3 className="font-headline-lg mb-4">ATS Score Checker</h3>
                  <p className="font-body-lg text-secondary max-w-md">Our algorithm simulates top-tier Applicant Tracking Systems to ensure your resume passes the digital gatekeeper every single time.</p>
                </div>
                <div className="mt-12 flex items-center gap-4">
                  <div className="w-full h-[2px] bg-outline-variant relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary w-3/4"></div>
                  </div>
                  <span className="font-label-sm text-primary">94% MATCH</span>
                </div>
              </div>
              {/* Card 2: AI Improver */}
              <div className="md:col-span-4 border border-primary p-12 flex flex-col hover:bg-white transition-colors group">
                <span className="material-symbols-outlined text-[48px] mb-8" data-icon="auto_awesome">auto_awesome</span>
                <h3 className="font-headline-lg mb-4">AI Resume Improver</h3>
                <p className="font-body-md text-secondary">Instantly rewrite weak bullet points into high-impact, results-driven achievements using industry-specific LLMs.</p>
                <div className="mt-auto pt-12">
                  <button onClick={handleCtaClick} className="font-label-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                    Try AI Editor <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
              {/* Card 3: Job Matching */}
              <div className="md:col-span-4 border border-primary p-12 flex flex-col hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-[48px] mb-8" data-icon="person_search">person_search</span>
                <h3 className="font-headline-lg mb-4">Job Description Matching</h3>
                <p className="font-body-md text-secondary">Automatically find roles that match your skill set across 50+ major job boards with one click.</p>
              </div>
              {/* Card 4: Detailed Insight */}
              <div className="md:col-span-8 border border-primary p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center hover:bg-white transition-colors">
                <div className="flex-1 w-full">
                  <span className="material-symbols-outlined text-[48px] mb-8" data-icon="description">description</span>
                  <h3 className="font-headline-lg mb-4">Resume Templates</h3>
                  <p className="font-body-md text-secondary mb-6">Designed by hiring managers. Every pixel is placed with intent to guide the recruiter's eye to your most important qualifications.</p>
                  <button onClick={() => navigate('/templates')} className="font-label-sm uppercase tracking-widest border border-primary px-6 py-3 hover:bg-primary hover:text-on-primary transition-all">View Templates</button>
                </div>
                <div className="w-full md:flex-1 border border-primary grayscale opacity-80 overflow-hidden min-h-[180px] md:h-full flex items-center justify-center p-8 bg-zinc-50">
                  <div className="text-center font-display text-headline-md text-secondary uppercase tracking-widest">
                    5 PRESETS
                  </div>
                </div>
              </div>
              {/* Card 5: AI Bullet Generator */}
              <div className="md:col-span-6 border border-primary p-12 flex flex-col hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-[48px] mb-8" data-icon="edit_note">edit_note</span>
                <h3 className="font-headline-lg mb-4">AI Bullet Generator</h3>
                <p className="font-body-md text-secondary">Automatically generate professional, results-oriented experience bullets customized for your industry and role.</p>
              </div>
              {/* Card 6: Resume Strength Meter */}
              <div className="md:col-span-6 border border-primary p-12 flex flex-col hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-[48px] mb-8" data-icon="speed">speed</span>
                <h3 className="font-headline-lg mb-4">Resume Strength Meter</h3>
                <p className="font-body-md text-secondary">Get real-time visual feedback on your resume's overall completeness and structural quality as you edit.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-24 border-b border-primary bg-primary text-on-primary">
          <div className="max-w-container-max-width mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-center md:text-left">
              <h2 className="font-display text-display mb-4">12,400+</h2>
              <p className="font-label-sm uppercase tracking-widest opacity-70">Resumes Optimized This Month</p>
            </div>
            <div className="h-[1px] w-24 bg-on-primary md:h-24 md:w-[1px] opacity-30"></div>
            <div className="text-center md:text-left">
              <h2 className="font-display text-display mb-4">85%</h2>
              <p className="font-label-sm uppercase tracking-widest opacity-70">Interview Callback Rate Increase</p>
            </div>
            <div className="h-[1px] w-24 bg-on-primary md:h-24 md:w-[1px] opacity-30"></div>
            <div className="text-center md:text-left">
              <h2 className="font-display text-display mb-4">Top 10</h2>
              <p className="font-label-sm uppercase tracking-widest opacity-70">FAANG Placement Tool Ranking</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 40, textAlign: "center" }}>
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </section>

        {/* CTA Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-40 flex flex-col items-center text-center">
          <h2 className="font-display text-display md:text-[64px] mb-12 max-w-4xl">Ready to land your dream role?</h2>
          <p className="font-body-lg text-secondary mb-16 max-w-xl">Join thousands of professionals who have already unlocked their potential. No credit card required to start.</p>
          <div className="relative group">
            <div className="absolute inset-0 bg-primary block-shadow translate-x-2 translate-y-2 opacity-10 group-hover:opacity-100 transition-opacity"></div>
            <button onClick={handleCtaClick} className="relative bg-primary text-on-primary px-16 py-8 font-label-sm uppercase tracking-[0.2em] text-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300">
              Get Started Now
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: "#000", color: "#fff", padding: "48px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>PREPHAS</h2>
            <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.8, maxWidth: 280 }}>
              Build an ATS-friendly resume that recruiters actually notice. AI-powered. Interview-ready.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#888" }}>Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="/builder/new" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Resume Builder</a>
              <a href="/templates" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Templates</a>
              <a href="/pricing" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Pricing</a>
              <a href="/signup" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Sign Up Free</a>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#888" }}>Account</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="/login" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Login</a>
              <a href="/dashboard" style={{ color: "#ccc", fontSize: 13, textDecoration: "none" }}>Dashboard</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: "32px auto 0", borderTop: "1px solid #333", paddingTop: 24, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666" }}>
          <span>© 2026 PREPHAS. All rights reserved.</span>
          <span>Built for job seekers across India 🇮🇳</span>
        </div>
      </footer>

      {/* Modal */}
      {showDemo && (
        <div
          onClick={() => setShowDemo(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", padding: 32, maxWidth: 640, width: "90%",
              border: "1px solid #000", position: "relative"
            }}
          >
            <button
              onClick={() => setShowDemo(false)}
              style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer" }}
            >
              ×
            </button>
            <h2 style={{ marginBottom: 16, fontSize: 20, fontWeight: 700 }}>How PREPHAS Works</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { step: "1", title: "Create your resume", desc: "Fill in your details using our clean resume builder." },
                { step: "2", title: "Get your ATS score", desc: "AI checks your resume against recruiter ATS systems." },
                { step: "3", title: "Fix and improve", desc: "One-click AI improvements on every section." },
                { step: "4", title: "Match to jobs", desc: "Paste a job description and see your match percentage." },
                { step: "5", title: "Download and apply", desc: "Export a clean PDF and start applying." },
              ].map((item) => (
                <div key={item.step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, background: "#000", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, flexShrink: 0
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
