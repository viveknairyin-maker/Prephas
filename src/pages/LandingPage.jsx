import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
  const [seoOpen, setSeoOpen] = useState(false);

  const handleCtaClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const faqs = [
    {
      q: "What is an ATS Resume?",
      a: "An ATS (Applicant Tracking System) resume is formatted to pass through automated recruiting software that companies use to filter job applications. PREPHAS helps you build resumes with the exact layout, structure, and keywords that ATS systems search for."
    },
    {
      q: "How does ATS Score work?",
      a: "PREPHAS analyzes your resume against key ATS parameters including contact formatting, section headers, keyword match, and experience bullet points. It gives you a score out of 100 with clear, actionable recommendations to improve."
    },
    {
      q: "Is PREPHAS free?",
      a: "Yes, PREPHAS offers a free tier that allows you to build your resume and run a basic ATS check. Our premium tier offers unlimited downloads, access to all templates, AI bullet generator, and deep job description matching."
    },
    {
      q: "Can I download resumes as PDF?",
      a: "Yes, all resumes created on PREPHAS can be downloaded instantly as print-ready, professional PDFs. The format is designed to be highly readable by both human recruiters and ATS software."
    },
    {
      q: "How does Job Match Analysis work?",
      a: "You can copy and paste any job description into PREPHAS. Our AI will analyze the posting, compare it with your resume, identify missing skills and keywords, and calculate a match score."
    }
  ];

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden min-h-screen">
      <Helmet>
        <title>PREPHAS | Free ATS Resume Builder & ATS Score Checker</title>
        <meta name="description" content="Build ATS-friendly resumes with PREPHAS. Free AI resume builder, ATS score checker, job match analysis, resume templates, and instant PDF export." />
        <link rel="canonical" href="https://www.prephas.online/" />
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
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

      {/* Modern Feature Showcase Section */}
      <section className="px-margin-mobile md:px-margin-desktop py-24 border-t border-b border-primary bg-zinc-50/30">
        <div className="max-w-container-max-width mx-auto">
          <div className="text-center mb-16">
            <span className="font-label-sm text-primary uppercase tracking-widest block mb-4">Core Platform Features</span>
            <h2 className="font-display text-headline-lg md:text-[48px] leading-tight">Built for modern job applications</h2>
          </div>
          
          {/* 3-column desktop, 2-column tablet, 1-column mobile grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="border border-primary bg-white p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 min-h-[200px]">
              <div>
                <span className="material-symbols-outlined text-[32px] text-primary mb-4" data-icon="analytics">analytics</span>
                <h3 className="font-headline-md text-headline-md mb-2 text-primary">ATS Score Checker</h3>
                <p className="font-body-md text-secondary text-sm leading-relaxed">Instant ATS analysis with actionable recommendations.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-primary bg-white p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 min-h-[200px]">
              <div>
                <span className="material-symbols-outlined text-[32px] text-primary mb-4" data-icon="person_search">person_search</span>
                <h3 className="font-headline-md text-headline-md mb-2 text-primary">Job Match Analysis</h3>
                <p className="font-body-md text-secondary text-sm leading-relaxed">Compare resumes against job descriptions and measure relevance.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-primary bg-white p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 min-h-[200px]">
              <div>
                <span className="material-symbols-outlined text-[32px] text-primary mb-4" data-icon="auto_awesome">auto_awesome</span>
                <h3 className="font-headline-md text-headline-md mb-2 text-primary">AI Resume Suggestions</h3>
                <p className="font-body-md text-secondary text-sm leading-relaxed">Improve wording, impact, and keyword optimization.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="border border-primary bg-white p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 min-h-[200px]">
              <div>
                <span className="material-symbols-outlined text-[32px] text-primary mb-4" data-icon="description">description</span>
                <h3 className="font-headline-md text-headline-md mb-2 text-primary">Professional Templates</h3>
                <p className="font-body-md text-secondary text-sm leading-relaxed">ATS-friendly resume templates for different careers.</p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="border border-primary bg-white p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 min-h-[200px]">
              <div>
                <span className="material-symbols-outlined text-[32px] text-primary mb-4" data-icon="download">download</span>
                <h3 className="font-headline-md text-headline-md mb-2 text-primary">One-Click PDF Export</h3>
                <p className="font-body-md text-secondary text-sm leading-relaxed">Download clean recruiter-ready resumes instantly.</p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="border border-primary bg-white p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 min-h-[200px]">
              <div>
                <span className="material-symbols-outlined text-[32px] text-primary mb-4" data-icon="speed">speed</span>
                <h3 className="font-headline-md text-headline-md mb-2 text-primary">Resume Strength Meter</h3>
                <p className="font-body-md text-secondary text-sm leading-relaxed">Real-time feedback while building your resume.</p>
              </div>
            </div>
          </div>

          {/* CTA below cards */}
          <div className="mt-20 border border-primary p-12 bg-white block-shadow text-center max-w-3xl mx-auto">
            <h3 className="font-display text-headline-lg mb-6 text-primary">Ready to Build a Resume Recruiters Notice?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleCtaClick} 
                className="w-full sm:w-auto bg-primary text-on-primary px-8 py-4 font-label-sm uppercase tracking-widest hover:opacity-90 transition-all text-sm"
              >
                Build My Resume
              </button>
              <button 
                onClick={() => {
                  if (user) navigate('/ats-analyzer');
                  else navigate('/signup');
                }} 
                className="w-full sm:w-auto bg-surface border border-primary text-primary px-8 py-4 font-label-sm uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all text-sm"
              >
                Check ATS Score
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section (Preserved inside an expandable accordion) */}
      <section className="px-margin-mobile md:px-margin-desktop py-12 bg-zinc-50/30">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSeoOpen(!seoOpen)}
            className="w-full flex justify-between items-center py-6 px-8 border border-primary bg-white hover:bg-zinc-50 transition-colors cursor-pointer select-none text-left"
            aria-expanded={seoOpen}
          >
            <span className="font-headline-md text-headline-md text-primary font-bold">
              Learn More About ATS-Friendly Resumes
            </span>
            <span className="material-symbols-outlined text-2xl text-primary transition-transform duration-200" style={{ transform: seoOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              expand_more
            </span>
          </button>
          
          {seoOpen && (
            <div className="border-x border-b border-primary p-8 bg-white font-body-md text-secondary space-y-6 leading-relaxed transition-all duration-300">
              <p>
                In today's highly competitive job market, submitting a standard resume is no longer enough. The vast majority of medium and large-sized companies, both in India and globally, utilize an Applicant Tracking System (ATS) to scan, filter, and rank applications before they are ever read by human recruiters. In fact, research indicates that up to 75% of resumes are filtered out automatically before reaching a hiring manager. This digital gatekeeping makes ATS optimization an essential part of the modern job application process. PREPHAS is built specifically to address this challenge, offering an end-to-end suite of tools designed to maximize your visibility and help you secure more callbacks.
              </p>
              <p>
                At the heart of the PREPHAS platform is our advanced ATS Score Checker. By uploading your resume, our system analyzes its structural integrity, formatting choices, and content depth. It checks for common issues that cause software parsing errors, such as tables, text boxes, non-standard fonts, or complex layouts. The score checker then generates a detailed, actionable report with a rating from 0 to 100. This immediate feedback highlights exactly what is working and what needs correction, giving you a clear roadmap to optimize your document for digital crawlers.
              </p>
              <p>
                Beyond structure, the actual vocabulary used in your resume plays a vital role. Recruiters program ATS systems with specific search queries consisting of skills, tools, and methodologies required for the role. If your resume lacks these critical terms, it will rank poorly. PREPHAS solves this through our deep Job Description Matching tool. By pasting a target job description, our AI compares it against your experience, highlighting missing keywords and recommending precise edits. This ensures your resume speaks the exact language of the recruiter, significantly boosting your placement on the candidate leaderboard.
              </p>
              <p>
                Writing impactful experience bullet points is another hurdle for many job seekers. PREPHAS features a built-in AI Bullet Generator that transforms weak, task-oriented descriptions into high-impact, results-driven achievements. By focusing on action verbs and quantifiable metrics, the AI helps you construct compelling professional stories. To complement this, our real-time Resume Strength Meter provides immediate visual feedback as you make updates, ensuring your document maintains the highest standard of quality.
              </p>
              <p>
                Finally, layout and styling can determine whether a recruiter spends more than the average six seconds reviewing your profile. PREPHAS provides professionally designed, recruiter-approved resume templates. These presets are intentionally structured to guide the human eye to your most impressive qualifications while remaining fully parsable by applicant tracking systems. Whether you are a software engineer, creative designer, senior executive, or a recent graduate looking for entry-level roles, PREPHAS ensures your presentation is polished, professional, and ready to stand out. By using our free professional resume builder, you bridge the gap between human intuition and machine intelligence, preparing a document that impresses both bots and hiring managers. Stop sending your resume into a black hole—use PREPHAS to build an optimized, interview-winning document today.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />

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
