import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function AboutPage() {
  return (
    <div className="font-body-md text-body-md bg-background min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>About Us & Transparency | PREPHAS</title>
        <meta name="description" content="Read about PREPHAS's mission, resume checking algorithms, semantic matching models, and parsing limitations in our transparency statement." />
        <link rel="canonical" href="https://www.prephas.online/about" />
        
        {/* Social Meta */}
        <meta property="og:title" content="About Us & Transparency | PREPHAS" />
        <meta property="og:description" content="A clear, honest breakdown of how our resume analysis algorithms and tools work, who they are built for, and their limitations." />
        <meta property="og:image" content="https://www.prephas.online/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prephas.online/about" />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-24 md:pt-32 pb-24 px-4 md:px-margin-desktop max-w-3xl mx-auto w-full">
        <article className="border border-primary bg-white p-8 md:p-12 block-shadow">
          <header className="mb-10 border-b border-primary pb-6 text-center">
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary block mb-3">Transparency Statement</span>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-primary tracking-tight leading-none mb-4">
              About PREPHAS
            </h1>
            <p className="text-secondary text-sm">
              Last Updated: June 17, 2026
            </p>
          </header>

          <div className="space-y-10 text-secondary leading-relaxed text-sm md:text-base">
            <div>
              <h2 className="text-xl font-bold text-primary mb-3 uppercase tracking-wide border-b border-zinc-200 pb-2">
                1. What PREPHAS Does
              </h2>
              <p className="mb-4">
                PREPHAS is an independent utility platform designed to help candidates prepare their resumes for recruitment databases. Our services include a structural <strong>AI Resume Builder</strong>, a layout compliance checker, and a semantic keyword density matching system.
              </p>
              <p>
                The core engine translates standard text input into layouts formatted specifically to comply with parsing patterns used by enterprise tracking services. The output is delivered as a standard PDF document.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-primary mb-3 uppercase tracking-wide border-b border-zinc-200 pb-2">
                2. Who It Is Built For
              </h2>
              <p>
                Our tools are designed for students, freshers, and job seekers who are submitting applications online. It is intended to help individuals bypass initial layout parsing errors and ensure that their qualifications are indexed correctly inside employer databases. It is particularly useful for candidates in structured industries (such as engineering, finance, operations, and administration) where standard formatting takes precedence over visual decoration.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-primary mb-3 uppercase tracking-wide border-b border-zinc-200 pb-2">
                3. How ATS Analysis Works
              </h2>
              <p className="mb-4">
                When you run a check on PREPHAS, the analyzer reads the text data using structural scanners. It checks for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Section Identification:</strong> Matches headers like "Experience" or "Education" against recognized dictionary forms.</li>
                <li><strong>Typography Checks:</strong> Flags fonts, sizes, and colors that cause layout confusion.</li>
                <li><strong>Keyword Coverage:</strong> Measures technical terms and matches them against database expectations.</li>
              </ul>
              <p>
                The final score is a mathematical correlation calculated based on layout compliance and matching term counts.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-primary mb-3 uppercase tracking-wide border-b border-zinc-200 pb-2">
                4. What Job Match Analysis Means
              </h2>
              <p>
                Job Match Analysis checks for vocabulary alignment. It analyzes the specific job description text and computes keyword presence against your resume. It lists key terms that appear in the posting but are missing from your CV. This highlights potential content gaps that could prevent your application from matching keyword queries run by human recruiters.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-primary mb-3 uppercase tracking-wide border-b border-zinc-200 pb-2">
                5. Limitations of ATS Scoring
              </h2>
              <p className="mb-4">
                We believe in full transparency. Candidates must understand the limitations of simulations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>No Guarantee of Interviews:</strong> A high score (e.g. 90+) does not guarantee that you will be selected for interviews or secure employment. Recruiting systems are managed by human recruiters who evaluate content relevance, work history quality, and company fit.
                </li>
                <li>
                  <strong>System Variations:</strong> There is no single universal ATS. Different companies use different systems (Workday, Greenhouse, Taleo) with unique settings. A resume optimized on PREPHAS may rank differently depending on the configuration of each specific employer's software.
                </li>
                <li>
                  <strong>AI Scoring:</strong> Automated recommendations are based on parsed patterns. They should be reviewed and verified by the candidate before applying.
                </li>
              </ul>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default AboutPage;
