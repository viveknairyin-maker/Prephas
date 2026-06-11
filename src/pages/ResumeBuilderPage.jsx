import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, getDoc, updateDoc, collection, addDoc } from '../utils/firebase';
import { 
  improveBulletPoint, 
  generateSummary, 
  generateBulletPoints
} from '../utils/gemini';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function ResumeBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  // Resume State
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState('Saved ✓');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  // Form Collapse States
  const [collapsed, setCollapsed] = useState({
    personal: false,
    summary: false,
    experience: false,
    education: false,
    skills: false,
    projects: false
  });

  // AI Loading & Suggestion States
  const [aiLoading, setAiLoading] = useState({
    summary: false,
    bullets: {}, // company-role index map
    improver: {}, // bullet index map
    projects: {} // project index map
  });

  const [aiSuggestions, setAiSuggestions] = useState({
    bullets: {}, // index path -> suggestion string
    summary: null
  });

  const [skillInput, setSkillInput] = useState('');

  // Fetch Resume
  useEffect(() => {
    if (!user) return;

    if (id === 'new') {
      const initBlank = async () => {
        try {
          const docRef = await addDoc(collection(db, 'resumes'), {
            userId: user.uid,
            title: 'Untitled Resume',
            template: 'software-engineer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            personalInfo: { name: '', email: '', phone: '', linkedin: '', location: '' },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            projects: [],
            atsScore: 0,
            strengthScores: { experience: 0, projects: 0, skills: 0, education: 0 }
          });
          navigate(`/builder/${docRef.id}`, { replace: true });
        } catch (err) {
          console.error("Error creating blank resume:", err);
        }
      };
      initBlank();
      return;
    }

    const fetchResume = async () => {
      try {
        const docRef = doc(db, 'resumes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResume(docSnap.data());
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id, user, navigate]);

  // Local Strength calculation
  const calculateStrength = (res) => {
    const numExp = res.experience?.length || 0;
    const expScore = numExp >= 2 ? 100 : numExp * 50;

    const numProj = res.projects?.length || 0;
    const projScore = numProj >= 2 ? 100 : numProj * 50;

    const skillsScore = Math.min((res.skills?.length || 0) * 10, 100);

    const eduFilled = res.education?.some(edu => edu.institution && edu.institution.trim() !== '') ? 100 : 0;

    const overall = Math.round((expScore + projScore + skillsScore + eduFilled) / 4);

    return {
      experience: expScore,
      projects: projScore,
      skills: skillsScore,
      education: eduFilled,
      overall
    };
  };

  // Debounced auto-save (2 seconds delay)
  useEffect(() => {
    if (!id || id === 'new' || !resume) return;

    if (firstLoad) {
      setFirstLoad(false);
      return;
    }

    setSaveState('Saving...');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const strength = calculateStrength(resume);
        const updatedResume = {
          ...resume,
          strengthScores: strength,
          updatedAt: new Date().toISOString()
        };

        const docRef = doc(db, 'resumes', id);
        await updateDoc(docRef, updatedResume);
        setSaveState('Saved ✓');
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveState('Error saving');
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [resume, id]);

  const updatePersonalInfo = (field, val) => {
    setResume(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: val
      }
    }));
  };

  // repeatable Experience blocks
  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        { company: '', role: '', duration: '', bullets: [''] }
      ]
    }));
  };

  const updateExperience = (idx, field, val) => {
    setResume(prev => {
      const exp = [...(prev.experience || [])];
      exp[idx] = { ...exp[idx], [field]: val };
      return { ...prev, experience: exp };
    });
  };

  const addExpBullet = (expIdx) => {
    setResume(prev => {
      const exp = [...(prev.experience || [])];
      exp[expIdx].bullets = [...(exp[expIdx].bullets || []), ''];
      return { ...prev, experience: exp };
    });
  };

  const updateExpBullet = (expIdx, bIdx, val) => {
    setResume(prev => {
      const exp = [...(prev.experience || [])];
      const bullets = [...exp[expIdx].bullets];
      bullets[bIdx] = val;
      exp[expIdx].bullets = bullets;
      return { ...prev, experience: exp };
    });
  };

  const removeExpBullet = (expIdx, bIdx) => {
    setResume(prev => {
      const exp = [...(prev.experience || [])];
      const bullets = exp[expIdx].bullets.filter((_, i) => i !== bIdx);
      exp[expIdx].bullets = bullets;
      return { ...prev, experience: exp };
    });
  };

  const removeExperience = (idx) => {
    setResume(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== idx)
    }));
  };

  // Education repeatable
  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
        { institution: '', degree: '', year: '' }
      ]
    }));
  };

  const updateEducation = (idx, field, val) => {
    setResume(prev => {
      const edu = [...(prev.education || [])];
      edu[idx] = { ...edu[idx], [field]: val };
      return { ...prev, education: edu };
    });
  };

  const removeEducation = (idx) => {
    setResume(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== idx)
    }));
  };

  // Skills input
  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!resume.skills?.includes(skillInput.trim())) {
        setResume(prev => ({
          ...prev,
          skills: [...(prev.skills || []), skillInput.trim()]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setResume(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  // Projects repeatable
  const addProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { name: '', description: '', link: '' }
      ]
    }));
  };

  const updateProject = (idx, field, val) => {
    setResume(prev => {
      const projs = [...(prev.projects || [])];
      projs[idx] = { ...projs[idx], [field]: val };
      return { ...prev, projects: projs };
    });
  };

  const removeProject = (idx) => {
    setResume(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== idx)
    }));
  };

  // AI Feature 1: Improve Bullet Point Inline
  const handleImproveBullet = async (expIdx, bIdx, text) => {
    if (!text.trim()) return;
    const key = `${expIdx}-${bIdx}`;
    setAiLoading(prev => ({
      ...prev,
      improver: { ...prev.improver, [key]: true }
    }));
    try {
      const improved = await improveBulletPoint(text);
      setAiSuggestions(prev => ({
        ...prev,
        bullets: { ...prev.bullets, [key]: improved }
      }));
    } catch (err) {
      alert("Something went wrong. Try again.");
    } finally {
      setAiLoading(prev => ({
        ...prev,
        improver: { ...prev.improver, [key]: false }
      }));
    }
  };

  const acceptBulletSuggestion = (expIdx, bIdx) => {
    const key = `${expIdx}-${bIdx}`;
    const suggestion = aiSuggestions.bullets[key];
    if (suggestion) {
      updateExpBullet(expIdx, bIdx, suggestion);
      setAiSuggestions(prev => {
        const updated = { ...prev.bullets };
        delete updated[key];
        return { ...prev, bullets: updated };
      });
    }
  };

  const rejectBulletSuggestion = (expIdx, bIdx) => {
    const key = `${expIdx}-${bIdx}`;
    setAiSuggestions(prev => {
      const updated = { ...prev.bullets };
      delete updated[key];
      return { ...prev, bullets: updated };
    });
  };

  // AI Feature 2: Generate summary
  const handleGenerateSummary = async () => {
    setAiLoading(prev => ({ ...prev, summary: true }));
    try {
      const summaryText = await generateSummary({
        name: resume.personalInfo?.name,
        role: resume.personalInfo?.role,
        skills: resume.skills,
        experience: resume.experience
      });
      setResume(prev => ({ ...prev, summary: summaryText }));
    } catch (err) {
      alert("Something went wrong. Try again.");
    } finally {
      setAiLoading(prev => ({ ...prev, summary: false }));
    }
  };

  // AI Feature 3: Generate 3 bullets
  const handleGenerateBullets = async (expIdx, role, company) => {
    if (!role.trim() || !company.trim()) {
      alert("Please enter Company Name and Role first.");
      return;
    }
    const key = expIdx;
    setAiLoading(prev => ({
      ...prev,
      bullets: { ...prev.bullets, [key]: true }
    }));
    try {
      const bullets = await generateBulletPoints(role, company);
      setResume(prev => {
        const exp = [...(prev.experience || [])];
        exp[expIdx].bullets = bullets;
        return { ...prev, experience: exp };
      });
    } catch (err) {
      alert("Something went wrong. Try again.");
    } finally {
      setAiLoading(prev => ({
        ...prev,
        bullets: { ...prev.bullets, [key]: false }
      }));
    }
  };

  // PDF Export
  const handleDownload = async () => {
    if (!resume) return;

    if (profile?.plan === 'free') {
      const count = profile.downloadCount || 0;
      if (count >= 3) {
        setShowUpgradeModal(true);
        return;
      }
    }

    const previewDiv = document.getElementById('resume-preview-root');
    if (!previewDiv) return;

    try {
      const canvas = await html2canvas(previewDiv, { scale: 2 });
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
      console.error("PDF generation error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading || !resume) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-primary">
          <span>Loading Resume Builder...</span>
          <div className="h-2 w-2 bg-primary animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Calculate local strength
  const strength = calculateStrength(resume);

  return (
    <div className="bg-surface text-on-surface antialiased overflow-hidden min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 bg-surface border-b border-primary h-20">
        <div className="flex items-center gap-8">
          <Link className="font-display text-headline-md tracking-tighter text-primary" to="/dashboard">PREPHAS</Link>
          <div className="flex items-center gap-6">
            <span className="font-label-sm text-[10px] uppercase tracking-widest text-secondary flex items-center gap-2">
              Status: <span className="text-primary font-bold">{saveState}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 border border-primary bg-white block-shadow-sm">
            <span className="font-label-sm text-label-sm text-secondary">ATS SCORE</span>
            <span className="font-headline-md text-headline-md">{resume.atsScore || 0}<span className="text-secondary text-body-md">/100</span></span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          </div>
          <button 
            onClick={handleDownload}
            className="bg-primary text-on-primary px-8 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-opacity-90 active:translate-y-0.5"
          >
            DOWNLOAD PDF
          </button>
        </div>
      </header>

      <main className="flex h-screen pt-20">
        {/* Left Side Navigation */}
        <nav className="fixed left-0 top-20 h-[calc(100vh-80px)] w-20 flex flex-col items-center border-r border-primary bg-surface z-40 py-8 gap-10">
          <Link className="material-symbols-outlined text-secondary hover:text-primary transition-colors" data-icon="dashboard" to="/dashboard">dashboard</Link>
          <Link className="material-symbols-outlined text-secondary hover:text-primary transition-colors" data-icon="grid_view" to="/templates">grid_view</Link>
          <Link className="material-symbols-outlined text-secondary hover:text-primary transition-colors" data-icon="analytics" to={`/ats/${id}`}>analytics</Link>
          <Link className="material-symbols-outlined text-secondary hover:text-primary transition-colors" data-icon="work" to={`/match/${id}`}>work</Link>
          <div className="mt-auto flex flex-col gap-8 pb-4">
            <Link className="material-symbols-outlined text-secondary hover:text-primary transition-colors" data-icon="payments" to="/pricing">payments</Link>
          </div>
        </nav>

        {/* Form Editor Column */}
        <section className="ml-20 w-1/2 h-full overflow-y-auto px-12 py-12 bg-white pb-32">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-end border-b border-primary pb-4">
              <div>
                <input 
                  type="text" 
                  value={resume.title || ''}
                  onChange={(e) => setResume(prev => ({ ...prev, title: e.target.value }))}
                  className="font-headline-lg text-headline-lg uppercase tracking-tight bg-transparent border-none p-0 focus:ring-0 w-full"
                  placeholder="Untitled Resume"
                />
                <p className="font-body-md text-body-md text-secondary mt-1">Select layouts and options. Changes save automatically.</p>
              </div>
            </div>

            {/* Template Selector dropdown */}
            <div className="border border-primary p-6 space-y-4">
              <label className="block font-label-sm text-label-sm uppercase text-primary">Active Template Preset</label>
              <select 
                value={resume.template || 'software-engineer'}
                onChange={(e) => setResume(prev => ({ ...prev, template: e.target.value }))}
                className="w-full border border-primary p-3 bg-white focus:ring-0 focus:border-black font-body-md"
              >
                <option value="software-engineer">Software Engineer (Clean two-column)</option>
                <option value="data-analyst">Data Analyst (Single column, metric-focused)</option>
                <option value="fresher">Fresher (Simple, education-first)</option>
                <option value="designer">Designer (Asymmetric, bold name)</option>
                <option value="marketing">Marketing (Summary-first, classic)</option>
              </select>
            </div>

            {/* SECTION 1: Personal Info Card */}
            <div className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('personal')}>
                <span className="font-label-sm text-label-sm bg-primary text-on-primary px-3 py-1 uppercase">Section: Basic info</span>
                <span className="material-symbols-outlined text-xl">{collapsed.personal ? 'expand_more' : 'expand_less'}</span>
              </div>
              
              {!collapsed.personal && (
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-primary/10">
                  <div className="space-y-2 col-span-2">
                    <label className="font-label-sm text-label-sm uppercase">Full Name</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume.personalInfo?.name || ''}
                      onChange={(e) => updatePersonalInfo('name', e.target.value)}
                      placeholder="Alexander Vance"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm uppercase">Email Address</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="email" 
                      value={resume.personalInfo?.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="alex.vance@work.io"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm uppercase">Phone Number</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume.personalInfo?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 917 222 3443"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm uppercase">Location</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume.personalInfo?.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm uppercase">LinkedIn URL</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume.personalInfo?.linkedin || ''}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/alex"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Summary Card */}
            <div className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('summary')}>
                <h3 className="font-headline-md text-headline-md uppercase">Professional Summary</h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateSummary();
                    }}
                    disabled={aiLoading.summary}
                    className="bg-primary text-on-primary px-3 py-1 font-label-sm text-[10px] flex items-center gap-1 hover:opacity-85 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]" data-icon="bolt">bolt</span>
                    {aiLoading.summary ? 'Generating...' : '✦ Generate with AI'}
                  </button>
                  <span className="material-symbols-outlined text-xl">{collapsed.summary ? 'expand_more' : 'expand_less'}</span>
                </div>
              </div>

              {!collapsed.summary && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <textarea 
                    value={resume.summary || ''}
                    onChange={(e) => setResume(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full border border-primary p-3 focus:ring-0 focus:border-black font-body-md leading-relaxed"
                    rows="5"
                    placeholder="Describe your career highlights. Click AI Generate to write a 3-sentence summary based on your background."
                  />
                </div>
              )}
            </div>

            {/* SECTION 3: Experience Card */}
            <div className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('experience')}>
                <h3 className="font-headline-md text-headline-md uppercase">Experience</h3>
                <span className="material-symbols-outlined text-xl">{collapsed.experience ? 'expand_more' : 'expand_less'}</span>
              </div>

              {!collapsed.experience && (
                <div className="space-y-8 pt-4 border-t border-primary/10">
                  {(resume.experience || []).map((exp, expIdx) => (
                    <div key={expIdx} className="border border-primary p-6 space-y-6 bg-zinc-50 relative group">
                      <button 
                        onClick={() => removeExperience(expIdx)}
                        className="absolute top-4 right-4 text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                      </button>

                      <div className="flex justify-between items-center">
                        <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-secondary">Role #{expIdx + 1}</span>
                        <button
                          onClick={() => handleGenerateBullets(expIdx, exp.role, exp.company)}
                          disabled={aiLoading.bullets[expIdx]}
                          className="border border-primary bg-white text-primary px-3 py-1 font-label-sm text-[10px] flex items-center gap-1 hover:bg-black hover:text-white transition-all disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[14px]" data-icon="auto_awesome">auto_awesome</span>
                          {aiLoading.bullets[expIdx] ? 'Generating...' : '✦ Generate 3 Bullets'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Company Name</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. Stripe"
                            type="text"
                            value={exp.company || ''}
                            onChange={(e) => updateExperience(expIdx, 'company', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Date Range</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. 2019 — Present"
                            type="text"
                            value={exp.duration || ''}
                            onChange={(e) => updateExperience(expIdx, 'duration', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Job Title</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. Senior Software Architect"
                            type="text"
                            value={exp.role || ''}
                            onChange={(e) => updateExperience(expIdx, 'role', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block font-label-sm text-label-sm uppercase text-secondary">Bullet Achievements</label>
                        {(exp.bullets || []).map((bullet, bIdx) => {
                          const key = `${expIdx}-${bIdx}`;
                          const suggestion = aiSuggestions.bullets[key];

                          return (
                            <div key={bIdx} className="space-y-2">
                              <div className="flex gap-2 items-center">
                                <input 
                                  className="border border-primary p-3 flex-grow bg-white font-body-md"
                                  placeholder="Describe an achievement..."
                                  type="text"
                                  value={bullet}
                                  onChange={(e) => updateExpBullet(expIdx, bIdx, e.target.value)}
                                />
                                <button
                                  onClick={() => handleImproveBullet(expIdx, bIdx, bullet)}
                                  disabled={aiLoading.improver[key]}
                                  className="border border-primary bg-white text-primary px-3 py-3 font-label-sm text-label-sm flex items-center hover:bg-black hover:text-white transition-all disabled:opacity-50"
                                  title="Improve with AI"
                                >
                                  <span className="material-symbols-outlined text-[18px]" data-icon="auto_awesome">auto_awesome</span>
                                </button>
                                <button 
                                  onClick={() => removeExpBullet(expIdx, bIdx)}
                                  className="text-secondary hover:text-error px-2"
                                >
                                  <span className="material-symbols-outlined text-lg" data-icon="close">close</span>
                                </button>
                              </div>

                              {/* AI Suggestion Box */}
                              {aiLoading.improver[key] && (
                                <div className="border border-primary p-3 bg-white font-body-md text-secondary animate-pulse flex items-center gap-2">
                                  <span>Improving...</span>
                                  <div className="h-1.5 w-1.5 bg-primary animate-ping"></div>
                                </div>
                              )}
                              
                              {suggestion && (
                                <div className="border border-primary p-4 bg-white block-shadow-sm space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="font-label-sm text-[9px] uppercase tracking-wider text-primary">AI Suggestion</span>
                                    <span className="text-[10px] text-secondary italic">Result-oriented &amp; action-verb optimized</span>
                                  </div>
                                  <p className="font-body-md text-body-md italic text-primary">"{suggestion}"</p>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => acceptBulletSuggestion(expIdx, bIdx)}
                                      className="bg-primary text-on-primary px-3 py-1 font-label-sm text-[9px] uppercase font-bold"
                                    >
                                      Accept
                                    </button>
                                    <button 
                                      onClick={() => rejectBulletSuggestion(expIdx, bIdx)}
                                      className="border border-primary px-3 py-1 font-label-sm text-[9px] uppercase text-primary bg-white"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <button 
                          onClick={() => addExpBullet(expIdx)}
                          className="font-label-sm text-[10px] uppercase border border-primary border-dashed w-full py-2 hover:bg-white transition-colors"
                        >
                          + Add Bullet Point
                        </button>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addExperience}
                    className="w-full border-2 border-dashed border-primary py-6 font-label-sm text-label-sm uppercase hover:bg-surface transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined" data-icon="add">add</span>
                    Add Experience Entry
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 4: Education Card */}
            <div className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('education')}>
                <h3 className="font-headline-md text-headline-md uppercase">Education</h3>
                <span className="material-symbols-outlined text-xl">{collapsed.education ? 'expand_more' : 'expand_less'}</span>
              </div>

              {!collapsed.education && (
                <div className="space-y-6 pt-4 border-t border-primary/10">
                  {(resume.education || []).map((edu, idx) => (
                    <div key={idx} className="border border-primary p-6 space-y-4 bg-zinc-50 relative group">
                      <button 
                        onClick={() => removeEducation(idx)}
                        className="absolute top-4 right-4 text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Institution</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. Stanford University"
                            type="text"
                            value={edu.institution || ''}
                            onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Degree / Major</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. B.S. Computer Science"
                            type="text"
                            value={edu.degree || ''}
                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Graduation Year</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. 2022"
                            type="text"
                            value={edu.year || ''}
                            onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addEducation}
                    className="w-full border-2 border-dashed border-primary py-6 font-label-sm text-label-sm uppercase hover:bg-surface transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined" data-icon="add">add</span>
                    Add Education Entry
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 5: Skills Card */}
            <div className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('skills')}>
                <h3 className="font-headline-md text-headline-md uppercase">Skills</h3>
                <span className="material-symbols-outlined text-xl">{collapsed.skills ? 'expand_more' : 'expand_less'}</span>
              </div>

              {!collapsed.skills && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <p className="font-body-md text-secondary">Type a skill and press <strong className="text-primary">Enter</strong> to add a tag.</p>
                  
                  <input 
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="e.g. Figma"
                    className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                  />

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(resume.skills || []).map((skill, idx) => (
                      <span key={idx} className="flex items-center gap-2 px-3 py-1 border border-primary text-[10px] font-bold uppercase bg-white">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="text-secondary hover:text-primary">
                          <span className="material-symbols-outlined text-[12px]" data-icon="close">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 6: Projects Card */}
            <div className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('projects')}>
                <h3 className="font-headline-md text-headline-md uppercase">Projects</h3>
                <span className="material-symbols-outlined text-xl">{collapsed.projects ? 'expand_more' : 'expand_less'}</span>
              </div>

              {!collapsed.projects && (
                <div className="space-y-6 pt-4 border-t border-primary/10">
                  {(resume.projects || []).map((proj, idx) => (
                    <div key={idx} className="border border-primary p-6 space-y-4 bg-zinc-50 relative group">
                      <button 
                        onClick={() => removeProject(idx)}
                        className="absolute top-4 right-4 text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Project Name</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. PREPHAS Resume Builder"
                            type="text"
                            value={proj.name || ''}
                            onChange={(e) => updateProject(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Project Link (Optional)</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. github.com/user/prephas"
                            type="text"
                            value={proj.link || ''}
                            onChange={(e) => updateProject(idx, 'link', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Description</label>
                          <textarea 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="Describe what you built and the impact..."
                            rows="3"
                            value={proj.description || ''}
                            onChange={(e) => updateProject(idx, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addProject}
                    className="w-full border-2 border-dashed border-primary py-6 font-label-sm text-label-sm uppercase hover:bg-surface transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined" data-icon="add">add</span>
                    Add Project Entry
                  </button>
                </div>
              )}
            </div>

            <div className="h-32"></div>
          </div>
        </section>

        {/* Right Side Live Preview Panel */}
        <section className="w-1/2 h-full bg-surface-container-highest flex justify-center py-12 overflow-y-auto border-l border-primary">
          <div 
            id="resume-preview-root"
            className={`bg-white w-[595px] min-h-[842px] resume-shadow p-12 flex flex-col gap-8 transition-all duration-300 transform scale-95 origin-top template-${resume.template || 'software-engineer'}`}
          >
            {/* Header */}
            <header className="border-b-2 border-primary pb-6 preview-header">
              <h1 className="font-display text-display uppercase leading-tight tracking-tighter truncate">
                {resume.personalInfo?.name || 'Alexander Vance'}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                <span>{resume.personalInfo?.location || 'New York, NY'}</span>
                <span>•</span>
                <span>{resume.personalInfo?.email || 'alex.vance@work.io'}</span>
                <span>•</span>
                <span>{resume.personalInfo?.phone || '+1 917 222 3443'}</span>
                {resume.personalInfo?.linkedin && (
                  <>
                    <span>•</span>
                    <span className="truncate">{resume.personalInfo.linkedin}</span>
                  </>
                )}
              </div>
            </header>

            {/* Resume Content Blocks */}
            <div className="grid grid-cols-1 gap-10 preview-body">
              {resume.summary && (
                <section className="space-y-2">
                  <h4 className="font-label-sm text-label-sm uppercase font-bold border-b border-primary pb-1 w-fit pr-8">Summary</h4>
                  <p className="font-body-md text-body-md leading-relaxed whitespace-pre-wrap">{resume.summary}</p>
                </section>
              )}

              {resume.experience && resume.experience.length > 0 && (
                <section className="space-y-6">
                  <h4 className="font-label-sm text-label-sm uppercase font-bold border-b border-primary pb-1 w-fit pr-8">Experience</h4>
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h5 className="font-headline-md text-headline-md uppercase">{exp.company || 'Vanguard Dynamics'}</h5>
                        <span className="font-label-sm text-label-sm">{exp.duration || '2019 — Present'}</span>
                      </div>
                      <p className="font-label-sm text-label-sm italic">{exp.role || 'Principal Systems Architect'}</p>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc ml-4 font-body-md text-body-md space-y-1">
                          {exp.bullets.map((b, bIdx) => (
                            b ? <li key={bIdx}>{b}</li> : null
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {resume.education && resume.education.length > 0 && (
                <section className="space-y-4">
                  <h4 className="font-label-sm text-label-sm uppercase font-bold border-b border-primary pb-1 w-fit pr-8">Education</h4>
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-baseline">
                      <div>
                        <h5 className="font-headline-md text-headline-md uppercase">{edu.institution || 'Stanford University'}</h5>
                        <p className="font-body-md text-body-md text-secondary">{edu.degree || 'B.S. Computer Science'}</p>
                      </div>
                      <span className="font-label-sm text-label-sm">{edu.year || '2022'}</span>
                    </div>
                  ))}
                </section>
              )}

              {resume.skills && resume.skills.length > 0 && (
                <section className="space-y-4">
                  <h4 className="font-label-sm text-label-sm uppercase font-bold border-b border-primary pb-1 w-fit pr-8">Core Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 border border-primary text-[10px] font-bold uppercase">{skill}</span>
                    ))}
                  </div>
                </section>
              )}

              {resume.projects && resume.projects.length > 0 && (
                <section className="space-y-4">
                  <h4 className="font-label-sm text-label-sm uppercase font-bold border-b border-primary pb-1 w-fit pr-8">Projects</h4>
                  {resume.projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h5 className="font-headline-md text-headline-md uppercase">{proj.name || 'Project Name'}</h5>
                        {proj.link && <span className="font-label-sm text-[10px] text-secondary truncate max-w-[200px]">{proj.link}</span>}
                      </div>
                      <p className="font-body-md text-body-md text-secondary">{proj.description}</p>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary p-8 md:p-12 max-w-md w-full block-shadow relative">
            <h3 className="font-headline-lg uppercase text-primary mb-4">Upgrade to Premium</h3>
            <p className="font-body-lg text-secondary mb-8">
              You have reached your limit of 3 downloads on the Free Plan. Upgrade to Premium for unlimited resume downloads.
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

export default ResumeBuilderPage;
