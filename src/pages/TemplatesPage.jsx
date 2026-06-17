import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, updateDoc, collection, query, where, getDocs, addDoc } from '../utils/firebase';
import Navbar from '../components/Navbar';
import ResumeTemplates from '../components/ResumeTemplates';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import { trackEvent } from '../utils/analytics';

function TemplatesPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchResumes = async () => {
      try {
        const q = query(
          collection(db, 'resumes'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Sort in-memory to prevent composite index requirements
        list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        setResumes(list);
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };
    fetchResumes();
  }, [user]);

  const handleUseTemplate = async (templateId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (resumes.length > 0) {
        // Apply to the latest updated resume
        const latestResume = resumes[0];
        const docRef = doc(db, 'resumes', latestResume.id);
        await updateDoc(docRef, {
          template: templateId,
          updatedAt: new Date().toISOString()
        });
        trackEvent('Template Selected', { template_name: templateId });
        navigate(`/builder/${latestResume.id}`);
      } else {
        // Create a new resume
        const newResume = {
          userId: user.uid,
          title: `New Resume (${templateId})`,
          template: templateId,
          source: 'template_selection',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          personalInfo: { name: '', email: '', phone: '', linkedin: '', location: '', role: '' },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          projects: [],
          achievements: [],
          certifications: [],
          languages: [],
          links: { linkedin: '', github: '', portfolio: '', leetcode: '' },
          atsScore: 0,
          strengthScores: { experience: 0, projects: 0, skills: 0, education: 0 }
        };
        const docRef = await addDoc(collection(db, 'resumes'), newResume);
        trackEvent('Resume Created', {
          source: 'template_selection',
          template_name: templateId
        });
        navigate(`/builder/${docRef.id}`);
      }
    } catch (error) {
      console.error("Error applying template:", error);
      trackEvent('Resume Creation Failed', {
        error_type: 'template_apply_error',
        error_message: error.message || 'Failed to apply template'
      });
      alert(`Something went wrong: ${error.message}`);
    }
  };

  return (
    <div className="font-body-md text-body-md bg-background min-h-screen">
      <Helmet>
        <title>Resume Templates | Professional ATS-Friendly Resume Designs</title>
        <meta name="description" content="Choose from our library of recruiter-approved, ATS-friendly resume templates. Designed for software engineers, freshers, designers, and business professionals." />
        <link rel="canonical" href="https://www.prephas.online/templates" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Recruiter-Approved ATS Resume Templates | PREPHAS" />
        <meta property="og:description" content="Select from a curated collection of single-column, minimalist, and ATS-optimized resume templates designed to get past automated filters." />
        <meta property="og:image" content="https://www.prephas.online/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prephas.online/templates" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ATS-Friendly Resume Templates | PREPHAS" />
        <meta name="twitter:description" content="Choose from recruiter-approved, ATS-optimized resume templates to start building your professional CV today." />
        <meta name="twitter:image" content="https://www.prephas.online/og-image.png" />
      </Helmet>
      <Navbar />
      <main className="pt-20">
        <ResumeTemplates 
          resumeData={resumes[0] || null} 
          onSelectTemplate={handleUseTemplate} 
        />
        
        {/* Rich SEO Content Section (Fulfillment of Priority 5 and Word Count requirements) */}
        <section className="bg-white border-t border-primary py-16 px-4 md:px-margin-desktop w-full">
          <div className="max-w-[900px] mx-auto text-secondary">
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-8 border-b border-primary pb-3">
              Optimizing Your Resume Templates for the Applicant Tracking System (ATS)
            </h2>
            
            <div className="space-y-8 text-sm md:text-base leading-relaxed">
              <div>
                <h3 className="text-lg font-bold text-primary mb-3 uppercase tracking-wide">
                  The Power of a Structured Resume Builder
                </h3>
                <p className="mb-4">
                  When applying for modern jobs, your application faces a digital filter long before a human recruiter sees it. More than 98% of Fortune 500 firms use Applicant Tracking Systems (ATS) to manage their hiring pipelines. That is why choosing the right <strong>Resume Templates</strong> is the single most critical formatting choice you can make. 
                </p>
                <p>
                  Using a dedicated <strong>Resume Builder</strong> designed with compliance in mind ensures that your information—ranging from work achievements to education details—is correctly structured and parsed. Our <strong>AI Resume Builder</strong> is engineered to eliminate formatting bottlenecks, ensuring your content is clearly mapped into structured data columns.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-3 uppercase tracking-wide">
                  What makes a template ATS-friendly?
                </h3>
                <p className="mb-4">
                  Many candidates believe that an eye-catching, multi-column template with progress bars and complex graphic layouts is the best way to get noticed. However, standard ATS parsers read across the entire width of the page. This means multi-column layouts often cause text to be read out of chronological order, scrambling your job titles and dates.
                </p>
                <p className="mb-4">
                  To keep your document machine-readable, look for templates that utilize a clean, single-column design. Clear section headers like "Professional Experience" and "Education" are highly recommended over creative names, which can confuse the system's indexing models. Additionally, you should completely avoid using floating text boxes, graphics, icons, or custom fonts that standard system libraries do not support.
                </p>
                <p className="mb-4">
                  Our pre-optimized <strong>Resume Templates</strong> (such as Classic Pro, Modern Edge, and Clean Minimal) utilize these precise layout rules, leaving zero margin for parsing errors when your profile is indexed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-3 uppercase tracking-wide">
                  Leveraging our ATS Resume Checker & Score
                </h3>
                <p className="mb-4">
                  Once you select a template and input your professional details, how do you verify its compliance? That's where our integrated <strong>ATS Resume Checker</strong> comes in. Our tool runs a simulation on your draft, evaluating layout formatting, structural indicators, and critical keyword presence.
                </p>
                <p>
                  Your overall <strong>ATS Score</strong> provides an direct health report of your resume. A score above 80 indicates that your formatting is optimized and your keyword coverage matches industry benchmarks. If your score is lower, our builder provides clear, actionable guidelines on how to refine bullet points, restructure dates, and expand keyword alignments.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-3 uppercase tracking-wide">
                  Achieving Relevance with Job Match Analysis
                </h3>
                <p className="mb-4">
                  The final step in optimizing your job application is keyword alignment. Recruiters search their databases using specific search phrases matching the job posting. If your resume lacks these key phrases, it won't rank high in search results.
                </p>
                <p>
                  By performing a <strong>Job Match Analysis</strong>, you can paste the target job description directly into our tool. The AI evaluates the description and cross-checks it with your resume, identifying missing certifications, technical tools, and soft skills. Tailoring your resume to naturally include these missing elements maximizes your visibility and interview call-back rates.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default TemplatesPage;
