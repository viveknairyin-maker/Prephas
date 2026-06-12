import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { signOut, auth, db } from '../utils/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { renderToStaticMarkup } from 'react-dom/server';
import { TEMPLATE_COMPONENTS } from '../components/ResumeTemplates';

function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const fetchResumes = async () => {
      try {
        const q = query(
          collection(db, 'resumes'), 
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Sort in-memory to prevent composite index requirements
        list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        setResumes(list);
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setLoadingResumes(false);
      }
    };

    fetchResumes();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Calculate overall strength scores average
  const calculateOverallStrength = (resume) => {
    if (!resume.strengthScores) return 0;
    const { experience = 0, projects = 0, skills = 0, education = 0 } = resume.strengthScores;
    return Math.round((experience + projects + skills + education) / 4);
  };

  // PDF Download trigger (checks free user limits)
  const handleDownloadPdf = async (resume, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (profile?.plan === 'free') {
      const count = profile.downloadCount || 0;
      if (count >= 3) {
        setShowUpgradeModal(true);
        return;
      }
    }

    const printEl = document.createElement('div');
    printEl.style.width = '595px';
    printEl.style.minHeight = '842px';
    printEl.style.position = 'fixed';
    printEl.style.left = '-9999px';
    printEl.style.top = '-9999px';
    printEl.className = 'bg-white p-0';

    const ActiveTemplate = TEMPLATE_COMPONENTS[resume.template || 'classic'] || TEMPLATE_COMPONENTS['classic'];
    printEl.innerHTML = renderToStaticMarkup(<ActiveTemplate data={resume} editable={false} onEdit={() => {}} />);

    document.body.appendChild(printEl);

    try {
      const canvas = await html2canvas(printEl, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const name = resume.personalInfo?.name || 'resume';
      pdf.save(`${name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`);

      if (profile?.plan === 'free') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          downloadCount: (profile.downloadCount || 0) + 1
        });
        refreshProfile();
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Something went wrong while exporting PDF. Try again.");
    } finally {
      document.body.removeChild(printEl);
    }
  };

  const deleteResume = async (resumeId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await deleteDoc(doc(db, 'resumes', resumeId));
        setResumes(resumes.filter(r => r.id !== resumeId));
      } catch (error) {
        console.error("Error deleting resume:", error);
      }
    }
  };

  // Get average strength across all resumes
  const getAverageStrength = () => {
    if (resumes.length === 0) return 0;
    const total = resumes.reduce((acc, res) => acc + calculateOverallStrength(res), 0);
    return Math.round(total / resumes.length);
  };

  // Get individual metric averages
  const getMetricAverage = (key) => {
    if (resumes.length === 0) return 0;
    const total = resumes.reduce((acc, res) => acc + (res.strengthScores?.[key] || 0), 0);
    return Math.round(total / resumes.length);
  };

  const latestResumeId = resumes[0]?.id;

  return (
    <div className="bg-background text-on-background min-h-screen">
      <Navbar />

      {/* Main Content Canvas */}
      <main className="pt-24 min-h-screen">
        <header className="pt-8 pb-12 px-margin-desktop">
          <h2 className="font-headline-lg text-headline-lg mb-2">Hello, {profile?.name || 'User'}.</h2>
          <p className="font-body-lg text-body-lg text-secondary">
            {resumes.length === 0 
              ? "You haven't created any resumes yet. Start one now!"
              : `Your average resume strength is ${getAverageStrength()}%. Keep refining to maximize callback rates.`}
          </p>
        </header>

        {/* Bento Grid Layout */}
        <div className="px-margin-desktop grid grid-cols-12 gap-gutter pb-20">
          {/* Left Column: Strength & Stats */}
          <div className="col-span-12 lg:col-span-7 space-y-12">
            {/* Resume Strength Section */}
            <section>
              <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-8">Overall Resume Strength</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-headline-md text-headline-md">Experience</span>
                    <span className="font-body-md text-body-md">{getMetricAverage('experience')}%</span>
                  </div>
                  <div className="w-full h-1 border border-primary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${getMetricAverage('experience')}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-headline-md text-headline-md">Projects</span>
                    <span className="font-body-md text-body-md">{getMetricAverage('projects')}%</span>
                  </div>
                  <div className="w-full h-1 border border-primary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${getMetricAverage('projects')}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-headline-md text-headline-md">Skills</span>
                    <span className="font-body-md text-body-md">{getMetricAverage('skills')}%</span>
                  </div>
                  <div className="w-full h-1 border border-primary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${getMetricAverage('skills')}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-headline-md text-headline-md">Education</span>
                    <span className="font-body-md text-body-md">{getMetricAverage('education')}%</span>
                  </div>
                  <div className="w-full h-1 border border-primary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${getMetricAverage('education')}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Resumes Grid */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Your Resumes</h3>
              </div>
              
              {loadingResumes ? (
                <div className="border border-primary p-12 text-center text-secondary font-body-lg">
                  Loading resumes...
                </div>
              ) : resumes.length === 0 ? (
                <div className="border-2 border-dashed border-primary p-16 text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-secondary" data-icon="description">description</span>
                  <p className="font-body-lg text-secondary">No resumes found. Create your first resume using our clean templates.</p>
                  <button onClick={() => navigate('/builder/new')} className="bg-primary text-on-primary px-8 py-3 font-label-sm uppercase tracking-widest hover:opacity-80">
                    Create Resume
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {resumes.map((resume) => (
                    <div 
                      key={resume.id} 
                      onClick={() => navigate(`/builder/${resume.id}`)}
                      className="border border-primary p-6 hover:bg-surface-container transition-colors group cursor-pointer relative"
                    >
                      <button 
                        onClick={(e) => deleteResume(resume.id, e)}
                        className="absolute top-4 right-4 text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete resume"
                      >
                        <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                      </button>
                      <div className="aspect-[3/4] bg-surface-container-highest border border-primary/10 mb-4 flex flex-col items-center justify-center p-6 text-center">
                        <span className="material-symbols-outlined text-[48px] text-secondary mb-2" data-icon="article">article</span>
                        <span className="font-label-sm text-[10px] text-secondary uppercase font-bold tracking-wider">{resume.template || 'software-engineer'}</span>
                      </div>
                      <h4 className="font-headline-md text-headline-md mb-1 truncate">{resume.title || 'Untitled Resume'}</h4>
                      <p className="font-body-md text-body-md text-secondary mb-4">
                        Edited {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <button 
                        onClick={(e) => handleDownloadPdf(resume, e)}
                        className="font-label-sm text-label-sm font-bold uppercase flex items-center gap-2 group-hover:gap-3 transition-all hover:underline"
                      >
                        Download PDF <span className="material-symbols-outlined text-[16px]" data-icon="download">download</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Quick Actions & Status */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Action Card: Builder */}
            <div className="bg-primary text-on-primary p-8 flex flex-col justify-between h-64">
              <div>
                <span className="material-symbols-outlined text-4xl mb-4" data-icon="auto_awesome">auto_awesome</span>
                <h3 className="font-headline-lg text-headline-lg leading-tight mb-2">Improve with AI</h3>
                <p className="font-body-md text-body-md opacity-70">Our LLM-powered engine can rewrite your bullet points for 2x more impact.</p>
              </div>
              <button 
                onClick={() => navigate(latestResumeId ? `/builder/${latestResumeId}` : '/builder/new')}
                className="w-fit px-8 py-3 bg-white text-black font-bold text-label-sm uppercase hover:bg-opacity-90 transition-all"
              >
                Launch AI Editor
              </button>
            </div>

            {/* Action Card: ATS Score */}
            <div className="border-2 border-primary bg-white p-8 flex flex-col justify-between h-64">
              <div>
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-4xl mb-4" data-icon="analytics">analytics</span>
                  <div className="text-right">
                    <span className="font-display text-headline-lg block">{resumes[0]?.atsScore || 0}</span>
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-tighter">Latest Score</span>
                  </div>
                </div>
                <h3 className="font-headline-lg text-headline-lg leading-tight mb-2">Check ATS Score</h3>
                <p className="font-body-md text-body-md text-secondary">See how your resume parses through major hiring systems like Workday and Greenhouse.</p>
              </div>
              <button 
                disabled={!latestResumeId}
                onClick={() => navigate(`/ats/${latestResumeId}`)}
                className="w-full px-8 py-3 bg-primary text-white font-bold text-label-sm uppercase hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Run Analysis
              </button>
            </div>

            {/* Job Match Feed */}
            <div className="border border-primary p-8">
              <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-6">Job Matching</h3>
              <p className="font-body-md text-body-md text-secondary mb-6">
                Paste your target job descriptions and evaluate keyword overlaps instantly. Appends missing skills automatically.
              </p>
              <button 
                disabled={!latestResumeId}
                onClick={() => navigate(`/match/${latestResumeId}`)}
                className="w-full text-center font-label-sm text-label-sm font-bold uppercase border border-primary py-4 hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go to Job Matcher
              </button>
            </div>
          </div>
        </div>

        {/* Footer Shell */}
        <footer className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center border-t border-primary mt-auto">
          <div className="flex items-center gap-8 mb-6 md:mb-0">
            <span className="font-display text-headline-md text-primary">PREPHAS</span>
            <p className="font-body-md text-body-md text-secondary">© 2024 PREPHAS AI. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Twitter</a>
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">LinkedIn</a>
          </div>
        </footer>
      </main>

      {/* Floating Action Button for "New Resume" */}
      <button 
        onClick={() => navigate('/builder/new')}
        className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-on-primary flex items-center justify-center group hover:scale-110 transition-transform duration-200 z-50"
      >
        <span className="material-symbols-outlined text-3xl" data-icon="add">add</span>
        <div className="absolute right-full mr-4 bg-primary text-on-primary px-4 py-2 font-label-sm text-label-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Create New Resume
        </div>
      </button>

      {/* Upgrade to Premium Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary p-8 md:p-12 max-w-md w-full block-shadow relative">
            <h3 className="font-headline-lg uppercase text-primary mb-4">Upgrade to Premium</h3>
            <p className="font-body-lg text-secondary mb-8">
              You have reached your limit of 3 downloads on the Free Plan. Upgrade to Premium for unlimited resume downloads and access to all premium templates.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/pricing');
                }} 
                className="flex-1 bg-primary text-on-primary py-4 font-label-sm uppercase tracking-widest hover:opacity-90"
              >
                View Plans
              </button>
              <button 
                onClick={() => setShowUpgradeModal(false)} 
                className="flex-1 border border-primary bg-white text-primary py-4 font-label-sm uppercase tracking-widest hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
