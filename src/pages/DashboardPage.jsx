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

  // State per card
  const [menuOpen, setMenuOpen] = useState(null); // holds resumeId of open menu
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleDelete = async (resumeId) => {
    const confirmed = window.confirm("Delete this resume? This cannot be undone.");
    if (!confirmed) return;
    await deleteDoc(doc(db, "resumes", resumeId));
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    setMenuOpen(null);
  };

  const handleRename = async (resumeId) => {
    if (!renameValue.trim()) return;
    await updateDoc(doc(db, "resumes", resumeId), { title: renameValue.trim() });
    setResumes((prev) =>
      prev.map((r) => r.id === resumeId ? { ...r, title: renameValue.trim() } : r)
    );
    setRenamingId(null);
    setMenuOpen(null);
  };

  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

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

    console.log("[PDF Export Diagnostic - Dashboard] Starting PDF download for resume:", resume.id);

    // 1. Verify fonts are loaded
    console.log("[PDF Export Diagnostic - Dashboard] Waiting for document fonts to be ready...");
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      console.log("[PDF Export Diagnostic - Dashboard] Fonts are loaded and ready.");
    }

    const printEl = document.createElement('div');
    const elementId = 'print-resume-element';
    printEl.id = elementId;
    printEl.style.position = 'absolute';
    printEl.style.left = '0px';
    printEl.style.top = '0px';
    printEl.style.width = '595px';
    printEl.style.minHeight = '842px';
    printEl.style.zIndex = '-9999';
    printEl.style.background = '#ffffff';
    printEl.style.transform = 'none';
    printEl.style.opacity = '1';
    printEl.style.visibility = 'visible';
    printEl.style.display = 'block';
    printEl.className = 'bg-white p-0';

    const ActiveTemplate = TEMPLATE_COMPONENTS[resume.template || 'classic'] || TEMPLATE_COMPONENTS['classic'];
    printEl.innerHTML = renderToStaticMarkup(<ActiveTemplate data={resume} editable={false} onEdit={() => {}} />);

    document.body.appendChild(printEl);

    // 2. Wait for next render cycle
    console.log("[PDF Export Diagnostic - Dashboard] Waiting for next render cycle...");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 3. Pre-capture validations on printEl
    const rect = printEl.getBoundingClientRect();
    const width = printEl.offsetWidth || rect.width;
    const height = printEl.offsetHeight || rect.height;
    const textContentLength = (printEl.textContent || "").trim().length;
    const innerHtmlLength = printEl.innerHTML.length;

    const style = window.getComputedStyle(printEl);

    console.log("[PDF Export Diagnostic - Dashboard] Print element validation metrics:", {
      width,
      height,
      innerHTML_length: innerHtmlLength,
      textContent_length: textContentLength,
      transform: style.transform,
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity
    });

    let validationFailed = false;
    let failureReason = "";

    if (width <= 0) {
      validationFailed = true;
      failureReason = `Print element width is invalid: ${width}px.`;
    } else if (height <= 0) {
      validationFailed = true;
      failureReason = `Print element height is invalid: ${height}px.`;
    } else if (textContentLength === 0) {
      validationFailed = true;
      failureReason = "Print element does not contain any text content.";
    } else if (style.display === 'none') {
      validationFailed = true;
      failureReason = "Print element has display: none.";
    } else if (style.visibility === 'hidden') {
      validationFailed = true;
      failureReason = "Print element has visibility: hidden.";
    } else if (parseFloat(style.opacity) === 0) {
      validationFailed = true;
      failureReason = "Print element has opacity: 0.";
    }

    if (validationFailed) {
      console.error("[PDF Export Diagnostic - Dashboard] Pre-capture validation failed! Aborting export. Reason:", failureReason);
      alert(`Export aborted: ${failureReason}`);
      document.body.removeChild(printEl);
      return;
    }

    // Add print-safe styles temporarily
    const printStyle = document.createElement("style");
    printStyle.innerHTML = `
      #${elementId} * {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #${elementId} .resume-section {
        page-break-before: auto;
        break-before: auto;
      }
    `;
    document.head.appendChild(printStyle);

    try {
      console.log("[PDF Export Diagnostic - Dashboard] Running html2canvas...");
      const canvas = await html2canvas(printEl, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 595,
      });

      console.log("[PDF Export Diagnostic - Dashboard] html2canvas complete. Canvas dimensions:", {
        width: canvas.width,
        height: canvas.height
      });

      // 4. Post-capture Validation: Detect if the canvas is entirely white
      let isBlank = true;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const stepX = Math.max(1, Math.floor(imgWidth / 100));
        const stepY = Math.max(1, Math.floor(imgHeight / 100));
        
        outerLoop:
        for (let x = 0; x < imgWidth; x += stepX) {
          for (let y = 0; y < imgHeight; y += stepY) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];
            
            if (r !== 255 || g !== 255 || b !== 255) {
              isBlank = false;
              break outerLoop;
            }
          }
        }
      } else {
        console.warn("[PDF Export Diagnostic - Dashboard] Could not get 2D context from canvas. Skipping blank validation.");
        isBlank = false;
      }

      if (isBlank) {
        console.error("[PDF Export Diagnostic - Dashboard] Post-capture validation failed: The generated canvas is entirely white/blank!");
        alert("Export failed: Generated PDF is blank. Please try again.");
        return;
      }

      console.log("[PDF Export Diagnostic - Dashboard] Canvas blank check passed. Generating PDF...");

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If resume is taller than one page, split across pages
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let pageNum = 0;

        while (remainingHeight > 0) {
          if (pageNum > 0) pdf.addPage();

          pdf.addImage(
            imgData,
            "PNG",
            0,
            -pageNum * pageHeight,
            imgWidth,
            imgHeight
          );

          remainingHeight -= pageHeight;
          pageNum++;
        }
      }

      const name = resume.personalInfo?.name || 'resume';
      pdf.save(`${name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`);

      const pageCount = imgHeight <= pageHeight ? 1 : Math.ceil(imgHeight / pageHeight);
      console.log("[PDF Export Diagnostic - Dashboard] Generated PDF page count:", pageCount);

      if (profile?.plan === 'free') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          downloadCount: (profile.downloadCount || 0) + 1
        });
        refreshProfile();
      }
    } catch (err) {
      console.error("[PDF Export Diagnostic - Dashboard] Error in PDF generation:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      if (printStyle.parentNode) {
        printStyle.parentNode.removeChild(printStyle);
      }
      if (printEl.parentNode) {
        printEl.parentNode.removeChild(printEl);
      }
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
      <main className="pt-20 md:pt-24 min-h-screen">
        <header className="pt-6 md:pt-8 pb-8 md:pb-12 px-4 md:px-margin-desktop">
          <h2 className="font-headline-lg text-headline-lg mb-2">Hello, {profile?.name || 'User'}.</h2>
          <p className="font-body-lg text-body-lg text-secondary">
            {resumes.length === 0 
              ? "You haven't created any resumes yet. Start one now!"
              : `Your average resume strength is ${getAverageStrength()}%. Keep refining to maximize callback rates.`}
          </p>
        </header>

        {/* Bento Grid Layout */}
        <div className="px-4 md:px-margin-desktop grid grid-cols-12 gap-4 md:gap-gutter pb-20">
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
                <div style={{
                  textAlign: "center",
                  padding: "80px 32px",
                  border: "1px dashed #ccc",
                  maxWidth: 480,
                  margin: "40px auto"
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                    No resumes yet
                  </div>
                  <div style={{ color: "#666", fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
                    You haven't created any resumes yet. Build your first one — it only takes a few minutes.
                  </div>
                  <button
                    onClick={() => navigate("/builder/new")}
                    style={{
                      background: "#000",
                      color: "#fff",
                      border: "none",
                      padding: "12px 28px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Create My First Resume →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter dashboard-grid">
                  {resumes.map((resume) => (
                    <div 
                      key={resume.id} 
                      onClick={() => navigate(`/builder/${resume.id}`)}
                      className="border border-primary p-6 hover:bg-surface-container transition-colors group cursor-pointer relative"
                    >
                      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 30 }} onClick={(e) => e.stopPropagation()}>
                        {/* ⋯ trigger */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === resume.id ? null : resume.id); }}
                          style={{
                            background: "none", border: "1px solid #e0e0e0",
                            width: 28, height: 28, cursor: "pointer",
                            fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                        >
                          ⋯
                        </button>

                        {/* Dropdown */}
                        {menuOpen === resume.id && (
                          <div style={{
                            position: "absolute", top: 32, right: 0, zIndex: 100,
                            background: "#fff", border: "1px solid #000",
                            minWidth: 140, boxShadow: "4px 4px 0 #000"
                          }}>
                            <button
                              onClick={() => { setRenamingId(resume.id); setRenameValue(resume.title || ""); setMenuOpen(null); }}
                              style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left", background: "none", border: "none", fontSize: 13, cursor: "pointer", borderBottom: "1px solid #eee" }}
                            >
                              ✏ Rename
                            </button>
                            <button
                              onClick={() => handleDelete(resume.id)}
                              style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left", background: "none", border: "none", fontSize: 13, cursor: "pointer", color: "#c00" }}
                            >
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="aspect-[3/4] bg-surface-container-highest border border-primary/10 mb-4 flex flex-col items-center justify-center p-6 text-center">
                        <span className="material-symbols-outlined text-[48px] text-secondary mb-2" data-icon="article">article</span>
                        <span className="font-label-sm text-[10px] text-secondary uppercase font-bold tracking-wider">{resume.template || 'software-engineer'}</span>
                      </div>
                      
                      {renamingId === resume.id ? (
                        <div style={{ marginTop: 8, display: "flex", gap: 8, marginBottom: 12 }} onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename(resume.id)}
                            style={{ flex: 1, border: "1px solid #000", padding: "6px 10px", fontSize: 13, outline: "none" }}
                          />
                          <button onClick={() => handleRename(resume.id)} style={{ background: "#000", color: "#fff", border: "none", padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>Save</button>
                          <button onClick={() => setRenamingId(null)} style={{ background: "#fff", border: "1px solid #ccc", padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                        </div>
                      ) : (
                        <h4 className="font-headline-md text-headline-md mb-1 truncate">{resume.title || 'Untitled Resume'}</h4>
                      )}

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
        <footer className="w-full py-8 md:py-12 px-4 md:px-margin-desktop flex flex-col md:flex-row justify-between items-center border-t border-primary mt-auto gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-8">
            <span className="font-display text-headline-md text-primary">PREPHAS</span>
            <p className="font-body-md text-body-md text-secondary">© 2024 PREPHAS AI. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
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
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-primary text-on-primary flex items-center justify-center group hover:scale-110 transition-transform duration-200 z-50 min-w-[44px] min-h-[44px]"
      >
        <span className="material-symbols-outlined text-2xl md:text-3xl" data-icon="add">add</span>
        <div className="absolute right-full mr-4 bg-primary text-on-primary px-4 py-2 font-label-sm text-label-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden md:block">
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
