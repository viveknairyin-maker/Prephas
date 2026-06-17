import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function HelpPage() {
  const [activeArticle, setActiveArticle] = useState('what-is-ats');

  const articles = [
    {
      id: 'what-is-ats',
      title: 'What is ATS?',
      content: (
        <div className="space-y-4">
          <p>
            An <strong>Applicant Tracking System (ATS)</strong> is a software application used by recruiters and employers to collect, scan, sort, and rank job applications. Today, over 98% of Fortune 500 companies and a growing majority of mid-sized organizations rely on ATS platforms to manage high volumes of job applications.
          </p>
          <p>
            When you submit your resume online, it rarely goes straight to a human reviewer. Instead, the ATS parses the document, extracting your contact details, work history, skills, and education, and saves it in a structured database. Recruiter searches then query this database using specific keywords from the job description. Resumes that cannot be parsed correctly due to complex layouts, or those lacking key terms, may be automatically filtered out.
          </p>
        </div>
      )
    },
    {
      id: 'how-scores-work',
      title: 'How ATS Scores Work',
      content: (
        <div className="space-y-4">
          <p>
            An <strong>ATS Score</strong> is a compatibility rating calculated by comparing your resume against the requirements of a target job description. The parser scans the text for specific hard skills, professional certifications, soft skills, and relevant job titles.
          </p>
          <p>
            The scoring algorithm evaluates two main pillars:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Keyword Matching:</strong> The frequency and context of terms matching the job posting.</li>
            <li><strong>Formatting Integrity:</strong> Checks for standard section headers, clean single-column layouts, recognizable fonts, and absence of tables, charts, or text boxes that disrupt text parsing.</li>
          </ul>
          <p>
            On PREPHAS, we analyze these elements dynamically, providing you with a score out of 100 alongside structured recommendations to fix compatibility issues.
          </p>
        </div>
      )
    },
    {
      id: 'improve-score',
      title: 'How to Improve ATS Score',
      content: (
        <div className="space-y-4">
          <p>
            Improving your compatibility score requires both formatting and content updates. Follow these core strategies to make your resume pass automated filters:
          </p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Tailor Your Keywords:</strong> Read the job description carefully and list key skills (e.g., JavaScript, Project Management, SEO) exactly as they are written in the posting.
            </li>
            <li>
              <strong>Use Standard Section Titles:</strong> Stick to standard section names like "Work Experience", "Education", and "Skills". Avoid creative section titles.
            </li>
            <li>
              <strong>Write Clean Bullet Points:</strong> Start your bullet points with strong action verbs and specify quantitative results (e.g., "Increased conversion by 15% through targeted layout optimization").
            </li>
            <li>
              <strong>Simplify Layouts:</strong> Remove complex charts, graphics, and sidebars. A simple top-to-bottom layout parses best.
            </li>
          </ol>
        </div>
      )
    },
    {
      id: 'formatting-guide',
      title: 'Resume Formatting Guide',
      content: (
        <div className="space-y-4">
          <p>
            Format issues are the leading cause of resume parsing failures. If the software cannot read the document, you will be filtered out regardless of your qualifications.
          </p>
          <p>
            Follow these rules for complete layout compatibility:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Layout:</strong> Use a clean, single-column design. Chronological order is highly preferred.</li>
            <li><strong>Fonts:</strong> Use standard fonts like Inter, Arial, Calibri, or Georgia. Keep body text between 10pt and 12pt.</li>
            <li><strong>Dividers:</strong> Use simple border rules rather than graphical shapes or line drawings.</li>
            <li><strong>No Graphical Elements:</strong> Avoid images, profile photos, graphs, icons, or progress bars representing skill levels.</li>
            <li><strong>File Format:</strong> Save and upload your document as a clean PDF or standard DOCX file. Avoid image formats like JPEG or PNG.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'keywords-guide',
      title: 'Resume Keywords Guide',
      content: (
        <div className="space-y-4">
          <p>
            Keyword optimization is not about keyword stuffing. Modern systems and recruiters easily detect lists of terms added in white text or grouped in a raw list without context.
          </p>
          <p>
            To integrate keywords naturally:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Hard Skills:</strong> List software packages, languages, and technical practices in a dedicated "Skills" section.</li>
            <li><strong>Contextual Integration:</strong> Weave technical skills directly into your work experience bullet points to show how you applied them (e.g., "Deployed cloud hosting using AWS to support 10k users").</li>
            <li><strong>Spell Out Terms:</strong> Use both abbreviations and spelled-out names (e.g., "Search Engine Optimization (SEO)").</li>
          </ul>
        </div>
      )
    },
    {
      id: 'job-match-explained',
      title: 'Job Match Analysis Explained',
      content: (
        <div className="space-y-4">
          <p>
            <strong>Job Match Analysis</strong> is a semantic comparison process. Our tool maps the context of your resume against the terms of a specific job posting.
          </p>
          <p>
            Unlike simple word count checkers, semantic comparison checks for relevance. For example, it checks if you have listed equivalent roles or missing certifications that are flagged as mandatory by the recruiter. By running a Job Match Analysis before applying, you receive a detailed gaps checklist highlighting missing terms. Adding these terms increases your chance of ranking at the top of candidate searches.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="font-body-md text-body-md bg-background min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>Help Center & Resume Guides | PREPHAS</title>
        <meta name="description" content="Access complete resume writing guides, ATS score checklists, resume formatting tips, and job match analysis help in the PREPHAS Help Center." />
        <link rel="canonical" href="https://www.prephas.online/help" />
        
        {/* Social Meta */}
        <meta property="og:title" content="Help Center & Resume Guides | PREPHAS" />
        <meta property="og:description" content="Learn how to optimize your resume templates, write ATS-friendly bullets, and analyze your score to land more interviews." />
        <meta property="og:image" content="https://www.prephas.online/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prephas.online/help" />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-24 md:pt-32 pb-24 px-4 md:px-margin-desktop max-w-5xl mx-auto w-full">
        {/* Header */}
        <section className="text-center mb-16 border-b border-primary pb-10">
          <span className="font-label-sm text-xs uppercase tracking-widest text-secondary block mb-3">Support & Education</span>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase text-primary tracking-tight leading-none mb-4">
            Help Center
          </h1>
          <p className="font-body-lg text-secondary max-w-2xl mx-auto text-base">
            Professional guides, formatting checklists, and technical explanations to help you navigate recruitment systems successfully.
          </p>
        </section>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <nav className="md:col-span-4 border border-primary bg-white p-4 space-y-1 block-shadow">
            <span className="text-[10px] uppercase tracking-[0.15em] text-secondary font-bold px-3 py-2 block border-b border-zinc-100 mb-2">
              Articles & Guides
            </span>
            {articles.map(article => (
              <button
                key={article.id}
                onClick={() => setActiveArticle(article.id)}
                className={`w-full text-left px-3 py-3 font-semibold text-sm transition-colors flex justify-between items-center ${
                  activeArticle === article.id
                    ? 'bg-black text-white'
                    : 'text-secondary hover:bg-zinc-50 hover:text-primary'
                }`}
              >
                {article.title}
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            ))}
          </nav>

          {/* Article Viewer */}
          <article className="md:col-span-8 border border-primary bg-white p-8 md:p-12 block-shadow min-h-[400px]">
            {articles.map(article => {
              if (article.id !== activeArticle) return null;
              return (
                <div key={article.id} className="animate-fadeIn">
                  <h2 className="font-display text-2xl md:text-3xl font-black uppercase text-primary mb-6 border-b border-primary pb-3">
                    {article.title}
                  </h2>
                  <div className="text-secondary leading-relaxed text-sm md:text-base space-y-6">
                    {article.content}
                  </div>
                </div>
              );
            })}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HelpPage;
