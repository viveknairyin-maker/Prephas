import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop py-6 bg-surface border-b border-primary">
        <div className="flex items-center gap-12">
          <Link className="font-display text-headline-md tracking-tighter text-primary" to="/">PREPHAS</Link>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-secondary font-body-md hover:opacity-70 transition-opacity" href="#features">Features</a>
            <Link className="text-secondary font-body-md hover:opacity-70 transition-opacity" to="/pricing">Pricing</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <Link className="text-primary font-label-sm hover:opacity-70 transition-opacity uppercase tracking-widest" to="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link className="hidden md:block text-primary font-label-sm hover:opacity-70 transition-opacity uppercase tracking-widest" to="/login">Login</Link>
              <button onClick={handleCtaClick} className="bg-primary text-on-primary px-6 py-3 font-label-sm uppercase tracking-widest hover:bg-opacity-90 transition-all duration-200">
                Get Started Free
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="pt-24">
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
              <a href="#features" className="w-full md:w-auto bg-surface border border-primary text-primary px-10 py-5 font-label-sm text-center uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all">
                See How It Works
              </a>
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
                <h2 className="font-display text-headline-lg md:text-[48px] leading-tight">Advanced tools for the high-performance candidate.</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              {/* Card 1: ATS Score */}
              <div className="md:col-span-8 border border-primary p-12 flex flex-col justify-between min-h-[400px] hover:bg-white transition-colors group">
                <div>
                  <span className="material-symbols-outlined text-[48px] mb-8" data-icon="analytics">analytics</span>
                  <h3 class="font-headline-lg mb-4">ATS Real-time Scoring</h3>
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
                <h3 className="font-headline-lg mb-4">AI Improver</h3>
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
                <h3 className="font-headline-lg mb-4">Job Matching</h3>
                <p className="font-body-md text-secondary">Automatically find roles that match your skill set across 50+ major job boards with one click.</p>
              </div>
              {/* Card 4: Detailed Insight */}
              <div className="md:col-span-8 border border-primary p-12 flex flex-col md:flex-row gap-12 items-center hover:bg-white transition-colors">
                <div className="flex-1">
                  <span className="material-symbols-outlined text-[48px] mb-8" data-icon="description">description</span>
                  <h3 className="font-headline-lg mb-4">Template Engineering</h3>
                  <p className="font-body-md text-secondary mb-6">Designed by hiring managers. Every pixel is placed with intent to guide the recruiter's eye to your most important qualifications.</p>
                  <button onClick={() => navigate('/pricing')} className="font-label-sm uppercase tracking-widest border border-primary px-6 py-3 hover:bg-primary hover:text-on-primary transition-all">View Templates</button>
                </div>
                <div className="flex-1 border border-primary grayscale opacity-80 overflow-hidden h-full min-h-[200px] flex items-center justify-center p-8 bg-zinc-50">
                  <div className="text-center font-display text-headline-md text-secondary uppercase tracking-widest">
                    5 PRESETS
                  </div>
                </div>
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
      <footer className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center border-t border-primary bg-surface">
        <div className="mb-8 md:mb-0">
          <span className="font-display text-headline-md text-primary tracking-tighter">PREPHAS</span>
          <p className="font-body-md text-secondary mt-2">© 2024 PREPHAS AI. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-10">
          <a className="text-secondary font-label-sm uppercase tracking-widest hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="text-secondary font-label-sm uppercase tracking-widest hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="text-secondary font-label-sm uppercase tracking-widest hover:text-primary transition-colors" href="#">Contact</a>
          <a className="text-secondary font-label-sm uppercase tracking-widest hover:text-primary transition-colors" href="#">Twitter</a>
          <a className="text-secondary font-label-sm uppercase tracking-widest hover:text-primary transition-colors" href="#">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
