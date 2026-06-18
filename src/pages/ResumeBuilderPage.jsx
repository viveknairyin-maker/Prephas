import React, { useState, useEffect, useRef, useDeferredValue, useCallback } from 'react';
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
import { TEMPLATE_COMPONENTS, TEMPLATES, TemplateThumbnail } from '../components/ResumeTemplates';
import { Helmet } from 'react-helmet-async';
import { trackEvent } from '../utils/analytics';

function ResumeBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const builderOpenedTracked = useRef(false);

  // Resume State
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveState, setSaveState] = useState('Saved ✓');
  const [firstLoad, setFirstLoad] = useState(true);

  // Mobile UX State
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [previewScale, setPreviewScale] = useState(1);

  // Defer preview re-renders for better mobile typing performance
  // IMPORTANT: must be here at the top, never after a conditional return (Rules of Hooks)
  const deferredResume = useDeferredValue(resume);

  // Form Collapse States
  const [collapsed, setCollapsed] = useState({
    personal: false,
    experience: false,
    education: false,
    skills: false,
    projects: false,
    achifications: false, // Wait, achievements
    achievements: false,
    certifications: false,
    languages: false,
    links: false,
    summary: false
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
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  // Preview scale — recalculate on resize so preview fits mobile screen
  useEffect(() => {
    const calcScale = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        setPreviewScale(0.95);
        return;
      }
      const available = window.innerWidth - 32;
      setPreviewScale(Math.min(0.95, available / 595));
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  // Fetch Resume
  useEffect(() => {
    if (!user) return;

    const isNew = id === 'new' || !id || window.location.pathname.endsWith('/new');

    if (isNew) {
      const initBlank = async () => {
        try {
          setError(null);
          const newDoc = {
            userId: user.uid,
            title: 'Untitled Resume',
            template: 'software-engineer',
            source: 'blank',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            personalInfo: { name: '', email: '', phone: '', location: '', role: '' },
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
          const docRef = await addDoc(collection(db, 'resumes'), newDoc);
          trackEvent('Resume Created', {
            source: 'blank',
            template_name: 'software-engineer'
          });
          navigate(`/builder/${docRef.id}`, { replace: true });
        } catch (err) {
          console.error("Error creating blank resume:", err);
          trackEvent('Resume Creation Failed', {
            error_type: 'firestore_error',
            error_message: err.message || 'Failed to create blank resume'
          });
          setError("Failed to create a new resume. This is typically caused by locked Firestore Security Rules in your Firebase Project (insufficient permissions).");
          setLoading(false);
        }
      };
      initBlank();
      return;
    }

    const fetchResume = async () => {
      try {
        setError(null);
        const docRef = doc(db, 'resumes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setResume(data);
          if (!builderOpenedTracked.current) {
            trackEvent('Resume Builder Opened', {
              template_name: data.template || 'classic',
              source: data.source || 'blank'
            });
            builderOpenedTracked.current = true;
          }
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
        setError("Failed to load the resume. Please ensure your Firestore Security Rules allow read access.");
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
      if (!resume?.skills?.includes(skillInput.trim())) {
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

  // repeatable Achievements
  const addAchievement = () => {
    setResume(prev => ({
      ...prev,
      achievements: [
        ...(prev.achievements || []),
        ''
      ]
    }));
  };

  const updateAchievement = (idx, val) => {
    setResume(prev => {
      const ach = [...(prev.achievements || [])];
      ach[idx] = val;
      return { ...prev, achievements: ach };
    });
  };

  const removeAchievement = (idx) => {
    setResume(prev => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== idx)
    }));
  };

  // Certifications repeatable
  const addCertification = () => {
    setResume(prev => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { name: '', authority: '', year: '' }
      ]
    }));
  };

  const updateCertification = (idx, field, val) => {
    setResume(prev => {
      const certs = [...(prev.certifications || [])];
      certs[idx] = { ...certs[idx], [field]: val };
      return { ...prev, certifications: certs };
    });
  };

  const removeCertification = (idx) => {
    setResume(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== idx)
    }));
  };

  // Languages repeatable
  const addLanguage = () => {
    setResume(prev => ({
      ...prev,
      languages: [
        ...(prev.languages || []),
        { name: '', level: '' }
      ]
    }));
  };

  const updateLanguage = (idx, field, val) => {
    setResume(prev => {
      const langs = [...(prev.languages || [])];
      langs[idx] = { ...langs[idx], [field]: val };
      return { ...prev, languages: langs };
    });
  };

  const removeLanguage = (idx) => {
    setResume(prev => ({
      ...prev,
      languages: (prev.languages || []).filter((_, i) => i !== idx)
    }));
  };

  // Links update
  const updateLink = (field, val) => {
    setResume(prev => ({
      ...prev,
      links: {
        ...(prev.links || {}),
        [field]: val
      }
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
      console.error("AI Bullet Improver failed:", err);
      alert("AI Bullet Improver failed: " + err.message);
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
        experience: resume.experience,
        education: resume.education,
        projects: resume.projects,
        achievements: resume.achievements
      });
      setResume(prev => ({ ...prev, summary: summaryText }));
    } catch (err) {
      console.error("AI Summary Generation failed:", err);
      alert("AI Summary Generation failed: " + err.message);
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
      console.error("AI Bullet Generation failed:", err);
      alert("AI Bullet Generation failed: " + err.message);
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

    const elementId = 'resume-preview-root';
    const originalElement = document.getElementById(elementId);
    
    console.log("[PDF Export Diagnostic] Target element ID:", elementId);
    if (!originalElement) {
      console.error("[PDF Export Diagnostic] Validation failed: Export target NOT found!");
      alert("Error: Resume preview element not found.");
      return;
    }

    console.log("[PDF Export Diagnostic] Export target found.");

    // Log computed transform and other styles of original element and its ancestors
    let currentEl = originalElement;
    while (currentEl) {
      const s = window.getComputedStyle(currentEl);
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) {
        console.warn(`[PDF Export Diagnostic] Warning: Element or ancestor ${currentEl.tagName}${currentEl.id ? '#' + currentEl.id : ''} has hiding style: display=${s.display}, visibility=${s.visibility}, opacity=${s.opacity}`);
      }
      if (s.transform && s.transform !== 'none') {
        console.log(`[PDF Export Diagnostic] Element or ancestor ${currentEl.tagName}${currentEl.id ? '#' + currentEl.id : ''} has transform: ${s.transform}`);
      }
      currentEl = currentEl.parentElement;
    }

    const origRect = originalElement.getBoundingClientRect();
    const origWidth = originalElement.offsetWidth || origRect.width;
    const origHeight = originalElement.offsetHeight || origRect.height;
    const origTextLength = (originalElement.textContent || "").trim().length;
    const origHtmlLength = originalElement.innerHTML.length;

    console.log("[PDF Export Diagnostic] Original element details:", {
      width: origWidth,
      height: origHeight,
      innerHTML_length: origHtmlLength,
      textContent_length: origTextLength
    });

    // 1. Verify fonts are loaded
    console.log("[PDF Export Diagnostic] Waiting for document fonts to be ready...");
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      console.log("[PDF Export Diagnostic] Fonts are loaded and ready.");
    }

    // 2. Create temporary container to host a clean clone of the preview element
    const tempContainer = document.createElement('div');
    const tempElementId = 'temp-resume-print-root';
    tempContainer.id = tempElementId;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '0px';
    tempContainer.style.top = '0px';
    tempContainer.style.width = '595px'; 
    tempContainer.style.zIndex = '-9999';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.transform = 'none';
    tempContainer.style.opacity = '1';
    tempContainer.style.visibility = 'visible';
    tempContainer.style.display = 'block';

    const clonedElement = originalElement.cloneNode(true);
    clonedElement.style.transform = 'none';
    clonedElement.style.width = '595px';
    clonedElement.style.minHeight = '842px';
    clonedElement.style.margin = '0';
    clonedElement.style.padding = '0';
    clonedElement.style.boxShadow = 'none';
    clonedElement.style.display = 'block';
    clonedElement.style.visibility = 'visible';
    clonedElement.style.opacity = '1';

    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // 3. Wait for the next render cycle before capturing
    console.log("[PDF Export Diagnostic] Waiting for next render cycle...");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 4. Validate cloned target before capture
    const clonedRect = clonedElement.getBoundingClientRect();
    const clonedWidth = clonedElement.offsetWidth || clonedRect.width;
    const clonedHeight = clonedElement.offsetHeight || clonedRect.height;
    const clonedTextLength = (clonedElement.textContent || "").trim().length;
    const clonedHtmlLength = clonedElement.innerHTML.length;
    const computedStyle = window.getComputedStyle(clonedElement);
    const containerStyle = window.getComputedStyle(tempContainer);

    console.log("[PDF Export Diagnostic] Cloned element validation metrics:", {
      width: clonedWidth,
      height: clonedHeight,
      innerHTML_length: clonedHtmlLength,
      textContent_length: clonedTextLength,
      transform: computedStyle.transform,
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity
    });

    let validationFailed = false;
    let failureReason = "";

    if (clonedWidth <= 0) {
      validationFailed = true;
      failureReason = `Width is invalid: ${clonedWidth}px (must be > 0).`;
    } else if (clonedHeight <= 0) {
      validationFailed = true;
      failureReason = `Height is invalid: ${clonedHeight}px (must be > 0).`;
    } else if (clonedTextLength === 0) {
      validationFailed = true;
      failureReason = "Target does not contain any text nodes/content.";
    } else if (computedStyle.display === 'none' || containerStyle.display === 'none') {
      validationFailed = true;
      failureReason = "Target element or container has display: none.";
    } else if (computedStyle.visibility === 'hidden' || containerStyle.visibility === 'hidden') {
      validationFailed = true;
      failureReason = "Target element or container has visibility: hidden.";
    } else if (parseFloat(computedStyle.opacity) === 0 || parseFloat(containerStyle.opacity) === 0) {
      validationFailed = true;
      failureReason = "Target element or container has opacity: 0.";
    }

    if (validationFailed) {
      console.error("[PDF Export Diagnostic] Pre-capture validation failed! Aborting export. Reason:", failureReason);
      alert(`Export aborted: ${failureReason}`);
      document.body.removeChild(tempContainer);
      return;
    }

    // Add print-safe styles temporarily to the head for the temporary element
    const style = document.createElement("style");
    style.innerHTML = `
      #${tempElementId} * {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #${tempElementId} .resume-section {
        page-break-before: auto;
        break-before: auto;
      }
    `;
    document.head.appendChild(style);

    try {
      console.log("[PDF Export Diagnostic] Running html2canvas on cloned element...");
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 595,
      });

      console.log("[PDF Export Diagnostic] html2canvas complete. Canvas dimensions:", {
        width: canvas.width,
        height: canvas.height
      });

      // 5. Post-capture Validation: Detect if the canvas is entirely white
      let isBlank = true;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        // Sample a grid of pixels to check if they are all white
        const stepX = Math.max(1, Math.floor(imgWidth / 100));
        const stepY = Math.max(1, Math.floor(imgHeight / 100));
        
        outerLoop:
        for (let x = 0; x < imgWidth; x += stepX) {
          for (let y = 0; y < imgHeight; y += stepY) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const r = pixel[0];
            const g = pixel[1];
            const b = pixel[2];
            
            // If any pixel has non-white content, the canvas is not blank
            if (r !== 255 || g !== 255 || b !== 255) {
              isBlank = false;
              break outerLoop;
            }
          }
        }
      } else {
        console.warn("[PDF Export Diagnostic] Could not get 2D context from canvas. Skipping blank validation.");
        isBlank = false;
      }

      if (isBlank) {
        console.error("[PDF Export Diagnostic] Post-capture validation failed: The generated canvas is entirely white/blank!");
        alert("Export failed: Generated PDF is blank. Please verify the template content and try again.");
        return;
      }

      console.log("[PDF Export Diagnostic] Canvas blank check passed. Generating PDF...");

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

      // Compute page count
      const pageCount = imgHeight <= pageHeight ? 1 : Math.ceil(imgHeight / pageHeight);
      console.log("[PDF Export Diagnostic] Generated PDF page count:", pageCount);

      trackEvent('Resume Downloaded', {
        template_name: resume.template || 'classic',
        page_count: pageCount
      });

      if (profile?.plan === 'free') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          downloadCount: (profile.downloadCount || 0) + 1
        });
        refreshProfile();
      }

      setShowDownloadSuccess(true);
    } catch (err) {
      console.error("[PDF Export Diagnostic] PDF generation error:", err);
      trackEvent('Resume Download Failed', {
        error_type: 'pdf_generation_error',
        error_message: err.message || 'Unknown PDF generation error'
      });
      alert("Something went wrong while exporting PDF. Try again.");
    } finally {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      if (tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }
  };

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: false }));
    setTimeout(() => {
      const element = document.getElementById(`section-${section}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface p-6">
        <div className="border border-primary bg-white p-8 max-w-lg w-full block-shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-error">
            <span className="material-symbols-outlined text-3xl" data-icon="warning">warning</span>
            <h3 className="font-headline-md text-headline-md uppercase tracking-tight">Database Write Failed</h3>
          </div>
          <p className="font-body-md text-body-md text-secondary leading-relaxed">
            {error}
          </p>
          <div className="space-y-4 pt-4 border-t border-primary/10">
            <div className="text-[11px] font-mono text-left bg-zinc-50 p-4 border border-primary/20 overflow-x-auto text-secondary leading-normal">
              <strong className="text-primary">How to fix this in Firebase Console:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1 font-sans text-[12px]">
                <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-primary">Firebase Console</a>.</li>
                <li>Select your project (<strong className="font-mono">prephas</strong>).</li>
                <li>Click on <strong className="font-semibold">Firestore Database</strong> in the left sidebar.</li>
                <li>Go to the <strong className="font-semibold">Rules</strong> tab.</li>
                <li>Update your security rules to allow read and write access. For testing/development, you can use:
                  <pre className="mt-2 p-2 bg-zinc-800 text-zinc-100 font-mono text-[10px] overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                  </pre>
                </li>
                <li>Click <strong className="font-semibold">Publish</strong>.</li>
              </ol>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-primary text-on-primary py-3 font-label-sm uppercase tracking-widest hover:opacity-90 active:translate-y-0.5 text-label-sm text-center"
              >
                Dashboard
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 border border-primary bg-white text-primary py-3 font-label-sm uppercase tracking-widest hover:bg-zinc-50 active:translate-y-0.5 text-label-sm text-center"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const ActiveTemplate = resume 
    ? (TEMPLATE_COMPONENTS[resume.template || 'classic'] || TEMPLATE_COMPONENTS['classic']) 
    : TEMPLATE_COMPONENTS['classic'];
  const strength = resume ? calculateStrength(resume) : { experience: 0, projects: 0, skills: 0, education: 0, overall: 0 };

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
      <Helmet>
        <title>AI Resume Builder | PREPHAS</title>
        <meta name="description" content="Build ATS-friendly resumes with PREPHAS. Free AI resume builder, ATS score checker, job match analysis, resume templates, and instant PDF export." />
        <link rel="canonical" href="https://www.prephas.online/resume-builder" />
      </Helmet>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-3 md:px-6 lg:px-margin-desktop py-0 bg-surface border-b border-primary h-14 md:h-16 lg:h-20">
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <Link
            className="flex items-center flex-shrink-0"
            to="/"
          >
            <img src="/logo.png" alt="PREPHAS Logo" className="h-8 md:h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden xl:flex gap-6">
            <a className="text-secondary hover:opacity-70 transition-opacity font-body-md text-body-md" href="/#features">Features</a>
            <Link className="text-secondary hover:opacity-70 transition-opacity font-body-md text-body-md" to="/templates">Templates</Link>
            <Link className="text-secondary hover:opacity-70 transition-opacity font-body-md text-body-md" to="/dashboard">Dashboard</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Save status — desktop only */}
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-secondary hidden lg:flex items-center gap-2">
            Status: <span className="text-primary font-bold">{saveState}</span>
          </span>
          {/* ATS Score badge — hide on small phones */}
          <div className="hidden sm:flex items-center gap-2 px-2 md:px-4 py-1.5 md:py-2 border border-primary bg-white">
            <span className="font-label-sm text-[10px] uppercase tracking-widest text-secondary">ATS</span>
                        <span className="font-headline-md text-base md:text-headline-md">{resume?.atsScore || 0}<span className="text-secondary text-xs md:text-body-md">/100</span></span>
          </div>
          {/* Download — hidden on mobile (available in sticky bar) */}
          <button 
            onClick={handleDownload}
            className="hidden md:block bg-primary text-on-primary px-4 lg:px-8 py-2 lg:py-3 font-label-sm text-label-sm uppercase tracking-widest hover:opacity-90 active:translate-y-0.5"
          >
            <span className="hidden lg:inline">DOWNLOAD PDF</span>
            <span className="lg:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar — Edit / Preview switcher */}
      <div className="fixed top-14 md:top-16 lg:hidden left-0 right-0 z-40 flex border-b border-primary bg-surface">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-label-sm text-[11px] uppercase tracking-widest transition-all min-h-[44px] ${activeTab === 'edit' ? 'bg-primary text-on-primary' : 'text-secondary hover:bg-zinc-50'}`}
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Edit
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-label-sm text-[11px] uppercase tracking-widest transition-all min-h-[44px] ${activeTab === 'preview' ? 'bg-primary text-on-primary' : 'text-secondary hover:bg-zinc-50'}`}
        >
          <span className="material-symbols-outlined text-base">visibility</span>
          Preview
        </button>
      </div>

      <main className="flex min-h-screen pt-14 md:pt-16 lg:pt-20 builder-split" style={{ paddingBottom: '72px' }}>
        {/* Left Side Navigation (Resume Section Navigator) — desktop only */}
        <nav className="hidden lg:fixed lg:flex lg:left-0 lg:top-20 lg:h-[calc(100vh-80px)] lg:w-56 lg:flex-col border-r border-primary bg-surface z-40 py-6 overflow-y-auto custom-scrollbar sidebar">
          <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-secondary font-bold mb-2">
            Resume Sections
          </div>
          <div className="flex-grow space-y-1">
            {[
              { key: 'personal', label: 'Basic Info', icon: 'person' },
              { key: 'links', label: 'Links', icon: 'link' },
              { key: 'experience', label: 'Experience', icon: 'work' },
              { key: 'education', label: 'Education', icon: 'school' },
              { key: 'skills', label: 'Skills', icon: 'psychology' },
              { key: 'languages', label: 'Languages', icon: 'translate' },
              { key: 'projects', label: 'Projects', icon: 'folder_open' },
              { key: 'certifications', label: 'Certifications', icon: 'verified' },
              { key: 'achievements', label: 'Achievements', icon: 'emoji_events' },
              { key: 'summary', label: 'Summary', icon: 'description' }
            ].map(sec => (
              <button 
                key={sec.key}
                onClick={() => scrollToSection(sec.key)}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-secondary hover:bg-surface-container hover:text-primary transition-all duration-150 border-b border-primary/5 uppercase font-label-sm text-[11px] tracking-wider min-h-[44px]"
              >
                <span className="material-symbols-outlined text-lg">{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto border-t border-primary/10 pt-4 px-2 space-y-1">
            <div className="px-2 pb-1 text-[9px] uppercase tracking-widest text-secondary font-bold">
              Resume Tools
            </div>
            <Link 
              className="flex items-center gap-3 px-4 py-2.5 text-secondary hover:bg-surface-container hover:text-primary transition-all uppercase font-label-sm text-[11px] min-h-[44px]" 
              to={`/ats/${id}`}
            >
              <span className="material-symbols-outlined text-lg">analytics</span>
              <span>ATS Score</span>
            </Link>
            <Link 
              className="flex items-center gap-3 px-4 py-2.5 text-secondary hover:bg-surface-container hover:text-primary transition-all uppercase font-label-sm text-[11px] min-h-[44px]" 
              to={`/match/${id}`}
            >
              <span className="material-symbols-outlined text-lg">work</span>
              <span>Job Match</span>
            </Link>
            <Link 
              className="flex items-center gap-3 px-4 py-2.5 text-secondary hover:bg-surface-container hover:text-primary transition-all uppercase font-label-sm text-[11px] border-t border-primary/5 mt-2 pt-2 min-h-[44px]" 
              to="/dashboard"
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span>Dashboard</span>
            </Link>
          </div>
        </nav>

        {/* Form Editor Column — full-width on mobile, half-width on desktop */}
        <section className={`${activeTab === 'edit' ? 'block' : 'hidden'} lg:block w-full lg:ml-56 lg:w-1/2 h-full overflow-y-auto px-4 md:px-8 lg:px-12 py-6 lg:py-12 bg-white pb-32 mt-10 lg:mt-0 builder-form`}>
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-end border-b border-primary pb-4">
              <div>
                <input 
                  type="text" 
                  value={resume?.title || ''}
                  onChange={(e) => setResume(prev => ({ ...prev, title: e.target.value }))}
                  className="font-headline-lg text-headline-lg uppercase tracking-tight bg-transparent border-none p-0 focus:ring-0 w-full"
                  placeholder="Untitled Resume"
                />
                <p className="font-body-md text-body-md text-secondary mt-1">Select layouts and options. Changes save automatically.</p>
              </div>
            </div>

            {/* Visual Template Gallery */}
            <div className="border border-primary p-6 space-y-6">
              <div>
                <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-primary">Template Gallery</h3>
                <p className="font-body-md text-secondary mt-1">Select a layout preset. Switching templates preserves all entered data.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'classic',
                    name: 'Classic Pro',
                    desc: 'Traditional recruiter-trusted layout with centered serif typography.',
                    layout: 'serif-centered'
                  },
                  {
                    id: 'modern',
                    name: 'Modern Edge',
                    desc: 'Clean bold layout with a solid header bar and metrics focus.',
                    layout: 'modern'
                  },
                  {
                    id: 'minimal',
                    name: 'Clean Minimal',
                    desc: 'Academic, whitespace-heavy layout optimized for freshers.',
                    layout: 'single-edu-first'
                  },
                  {
                    id: 'bold',
                    name: 'Bold Executive',
                    desc: 'Strong sans-serif layouts for leadership and senior roles.',
                    layout: 'serif-centered'
                  },
                  {
                    id: 'sidebar',
                    name: 'Sidebar Split',
                    desc: 'Elegant asymmetric layout with a solid black left sidebar.',
                    layout: 'sidebar-left'
                  }
                ].map(tpl => {
                  const isActive = (resume?.template || 'classic') === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setResume(prev => ({ ...prev, template: tpl.id }));
                        trackEvent('Template Selected', { template_name: tpl.id });
                      }}
                      className={`text-left p-4 border transition-all flex flex-col justify-between h-40 group relative block-shadow-hover ${
                        isActive 
                          ? 'border-primary bg-zinc-50 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                          : 'border-primary bg-white hover:border-black'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`font-label-sm text-[11px] uppercase tracking-wider ${isActive ? 'font-bold text-primary' : 'text-secondary'}`}>
                            {tpl.name}
                          </span>
                          {isActive && (
                            <span className="material-symbols-outlined text-sm text-primary" data-icon="check_circle">check_circle</span>
                          )}
                        </div>
                        <p className="text-[10px] text-secondary font-body-md mt-2 leading-relaxed line-clamp-3">
                          {tpl.desc}
                        </p>
                      </div>

                      {/* Mini visual representation of layout */}
                      <div className="mt-3 w-full h-8 border border-primary/20 bg-white p-1 flex gap-1 overflow-hidden pointer-events-none">
                        {tpl.layout === 'modern' && (
                          <div className="w-full h-full border border-primary/10 flex flex-col gap-0.5">
                            <div className="w-full h-2 bg-primary"></div>
                            <div className="w-5/6 h-1 bg-secondary/10 m-0.5"></div>
                            <div className="w-4/5 h-1 bg-secondary/10 m-0.5"></div>
                          </div>
                        )}
                        {tpl.layout === 'single-edu-first' && (
                          <div className="w-full h-full border border-primary/10 flex flex-col gap-1 p-0.5">
                            <div className="w-full h-1 bg-primary/30"></div>
                            <div className="w-full h-1 bg-secondary/15"></div>
                            <div className="w-full h-1 bg-secondary/10"></div>
                            <div className="w-5/6 h-1 bg-secondary/10"></div>
                          </div>
                        )}
                        {tpl.layout === 'sidebar-left' && (
                          <>
                            <div className="w-1/3 h-full border border-primary/10 flex flex-col gap-1 p-0.5 bg-black">
                              <div className="w-full h-1.5 bg-white/40"></div>
                              <div className="w-full h-1 bg-white/20"></div>
                            </div>
                            <div className="w-2/3 h-full border border-primary/10 flex flex-col gap-1 p-0.5">
                              <div className="w-full h-1 bg-primary/20"></div>
                              <div className="w-full h-1 bg-secondary/10"></div>
                            </div>
                          </>
                        )}
                        {tpl.layout === 'serif-centered' && (
                          <div className="w-full h-full border border-primary/10 flex flex-col items-center gap-1 p-0.5">
                            <div className="w-1/2 h-1 bg-primary/40"></div>
                            <div className="w-full h-0.5 bg-primary/20"></div>
                            <div className="w-4/5 h-1 bg-secondary/10"></div>
                            <div className="w-4/5 h-1 bg-secondary/10"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 1: Personal Info Card */}
            <div id="section-personal" className="border border-primary p-6 space-y-6">
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
                      value={resume?.personalInfo?.name || ''}
                      onChange={(e) => updatePersonalInfo('name', e.target.value)}
                      placeholder="Alexander Vance"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="font-label-sm text-label-sm uppercase">Target Job Title / Professional Title</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume?.personalInfo?.role || ''}
                      onChange={(e) => updatePersonalInfo('role', e.target.value)}
                      placeholder="e.g. Senior Software Architect"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm uppercase">Email Address</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="email" 
                      value={resume?.personalInfo?.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="alex.vance@work.io"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm uppercase">Phone Number</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume?.personalInfo?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 917 222 3443"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm uppercase">Location</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume?.personalInfo?.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Links Card */}
            <div id="section-links" className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('links')}>
                <span className="font-label-sm text-label-sm bg-primary text-on-primary px-3 py-1 uppercase">Section: Professional Links</span>
                <span className="material-symbols-outlined text-xl">{collapsed.links ? 'expand_more' : 'expand_less'}</span>
              </div>
              
              {!collapsed.links && (
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-primary/10">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="font-label-sm text-label-sm uppercase text-secondary">LinkedIn URL</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume?.links?.linkedin || ''}
                      onChange={(e) => updateLink('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="font-label-sm text-label-sm uppercase text-secondary">GitHub URL</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume?.links?.github || ''}
                      onChange={(e) => updateLink('github', e.target.value)}
                      placeholder="github.com/username"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="font-label-sm text-label-sm uppercase text-secondary">Portfolio Website</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume?.links?.portfolio || ''}
                      onChange={(e) => updateLink('portfolio', e.target.value)}
                      placeholder="portfolio.dev"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="font-label-sm text-label-sm uppercase text-secondary">LeetCode Profile</label>
                    <input 
                      className="w-full border border-primary bg-transparent p-3 focus:ring-0 focus:border-black font-body-md"
                      type="text" 
                      value={resume?.links?.leetcode || ''}
                      onChange={(e) => updateLink('leetcode', e.target.value)}
                      placeholder="leetcode.com/username"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Experience Card */}
            <div id="section-experience" className="border border-primary p-6 space-y-6">
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
            <div id="section-education" className="border border-primary p-6 space-y-6">
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
            <div id="section-skills" className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('skills')}>
                <h3 className="font-headline-md text-headline-md uppercase">Skills</h3>
                <span className="material-symbols-outlined text-xl">{collapsed.skills ? 'expand_more' : 'expand_less'}</span>
              </div>

              {!collapsed.skills && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <p className="font-body-md text-secondary">Type a skill and press <strong className="text-primary">Enter</strong> to add a tag.</p>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {(resume.skills || []).map((skill, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          border: "1px solid #000",
                          padding: "4px 10px",
                          fontSize: 12,
                          background: "#fff",
                        }}
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 14,
                            color: "#888",
                            lineHeight: 1,
                            padding: "0 0 0 2px",
                          }}
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Type a skill and press Enter"
                    style={{
                      border: "1px solid #ccc",
                      padding: "8px 12px",
                      fontSize: 13,
                      width: "100%",
                      outline: "none",
                    }}
                  />
                </div>
              )}
            </div>

            {/* SECTION: Languages Card */}
            <div id="section-languages" className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('languages')}>
                <h3 className="font-headline-md text-headline-md uppercase">Languages</h3>
                <span className="material-symbols-outlined text-xl">{collapsed.languages ? 'expand_more' : 'expand_less'}</span>
              </div>

              {!collapsed.languages && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  {(resume.languages || []).map((lang, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-zinc-50 border border-primary p-4 relative group">
                      <button 
                        onClick={() => removeLanguage(idx)}
                        className="absolute top-4 right-4 text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Language"
                      >
                        <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                      </button>
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Language Name</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. English"
                            type="text"
                            value={lang.name || ''}
                            onChange={(e) => updateLanguage(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Proficiency Level</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. Native / Fluent / Conversational"
                            type="text"
                            value={lang.level || ''}
                            onChange={(e) => updateLanguage(idx, 'level', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addLanguage}
                    className="w-full border border-primary border-dashed py-3 font-label-sm text-[10px] uppercase hover:bg-surface transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                    Add Language
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 6: Projects Card */}
            <div id="section-projects" className="border border-primary p-6 space-y-6">
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

            {/* SECTION: Certifications Card */}
            <div id="section-certifications" className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('certifications')}>
                <h3 className="font-headline-md text-headline-md uppercase">Certifications</h3>
                <span className="material-symbols-outlined text-xl">{collapsed.certifications ? 'expand_more' : 'expand_less'}</span>
              </div>

              {!collapsed.certifications && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  {(resume.certifications || []).map((cert, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-zinc-50 border border-primary p-4 relative group">
                      <button 
                        onClick={() => removeCertification(idx)}
                        className="absolute top-4 right-4 text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Certification"
                      >
                        <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <div className="space-y-2 md:col-span-1">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Certification Name</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. AWS Cloud Practitioner"
                            type="text"
                            value={cert.name || ''}
                            onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Issuing Authority</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. Amazon Web Services"
                            type="text"
                            value={cert.authority || ''}
                            onChange={(e) => updateCertification(idx, 'authority', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <label className="font-label-sm text-label-sm uppercase text-secondary">Year / Date</label>
                          <input 
                            className="border border-primary p-3 w-full bg-white font-body-md"
                            placeholder="e.g. 2024"
                            type="text"
                            value={cert.year || ''}
                            onChange={(e) => updateCertification(idx, 'year', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addCertification}
                    className="w-full border border-primary border-dashed py-3 font-label-sm text-[10px] uppercase hover:bg-surface transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                    Add Certification
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 6: Achievements Card */}
            <div id="section-achievements" className="border border-primary p-6 space-y-6">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('achievements')}>
                <h3 className="font-headline-md text-headline-md uppercase">Achievements</h3>
                <span className="material-symbols-outlined text-xl">{collapsed.achievements ? 'expand_more' : 'expand_less'}</span>
              </div>

              {!collapsed.achievements && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  {(resume.achievements || []).map((ach, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        className="border border-primary p-3 flex-grow bg-white font-body-md"
                        placeholder="e.g. Won 1st place in Google Hackathon 2025"
                        type="text"
                        value={ach}
                        onChange={(e) => updateAchievement(idx, e.target.value)}
                      />
                      <button 
                        onClick={() => removeAchievement(idx)}
                        className="text-secondary hover:text-error px-2"
                      >
                        <span className="material-symbols-outlined text-lg" data-icon="close">close</span>
                      </button>
                    </div>
                  ))}

                  <button 
                    onClick={addAchievement}
                    className="w-full border border-primary border-dashed py-3 font-label-sm text-[10px] uppercase hover:bg-surface transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                    Add Achievement
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 7: Summary Card */}
            <div id="section-summary" className="border border-primary p-6 space-y-6">
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

            <div className="h-32"></div>
          </div>
        </section>

        {/* Right Side Live Preview Panel — full-width on mobile (when preview tab active), half-width on desktop */}
        <section className={`${activeTab === 'preview' ? 'block' : 'hidden'} lg:block w-full lg:w-1/2 bg-surface-container-highest flex flex-col items-center py-6 lg:py-12 overflow-y-auto border-l border-primary mt-10 lg:mt-0 builder-preview`} style={{ minHeight: 'calc(100vh - 56px)' }}>
          {/* Preview wrapper — scales down to fit viewport on mobile */}
          <div
            style={{
              width: '595px',
              transformOrigin: 'top center',
              transform: `scale(${previewScale})`,
              marginBottom: `${(842 * previewScale) - 842}px`,
            }}
          >
            <div
              id="resume-preview-root"
              className="bg-white w-[595px] min-h-[842px] resume-shadow transition-all duration-300 p-0"
            >
              <ActiveTemplate data={deferredResume || resume} editable={false} onEdit={() => {}} />
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Mobile Bottom Action Bar — lg:hidden */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex items-stretch border-t border-primary bg-surface">
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center px-3 py-2 text-secondary hover:text-primary hover:bg-zinc-50 transition-colors min-h-[56px] min-w-[56px]"
          title="Dashboard"
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="text-[9px] uppercase tracking-wide mt-0.5">Home</span>
        </Link>
        <Link
          to={`/ats/${id}`}
          className="flex flex-col items-center justify-center px-3 py-2 text-secondary hover:text-primary hover:bg-zinc-50 transition-colors min-h-[56px] min-w-[56px]"
          title="ATS Score"
        >
          <span className="material-symbols-outlined text-xl">analytics</span>
          <span className="text-[9px] uppercase tracking-wide mt-0.5">ATS</span>
        </Link>
        <div className="flex items-center justify-center px-3 py-2 text-secondary min-h-[56px] flex-1">
          <span className={`text-[10px] uppercase tracking-widest font-bold ${saveState === 'Saved ✓' ? 'text-green-700' : saveState === 'Saving...' ? 'text-secondary animate-pulse' : 'text-red-600'}`}>{saveState}</span>
        </div>
        <button
          onClick={() => setActiveTab(activeTab === 'preview' ? 'edit' : 'preview')}
          className="flex flex-col items-center justify-center px-3 py-2 text-secondary hover:text-primary hover:bg-zinc-50 transition-colors min-h-[56px] min-w-[56px]"
          title="Toggle Preview"
        >
          <span className="material-symbols-outlined text-xl">{activeTab === 'preview' ? 'edit' : 'visibility'}</span>
          <span className="text-[9px] uppercase tracking-wide mt-0.5">{activeTab === 'preview' ? 'Edit' : 'Preview'}</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex flex-col items-center justify-center px-3 py-2 bg-primary text-on-primary hover:opacity-90 transition-colors min-h-[56px] min-w-[64px]"
          title="Download PDF"
        >
          <span className="material-symbols-outlined text-xl">download</span>
          <span className="text-[9px] uppercase tracking-wide mt-0.5">PDF</span>
        </button>
      </div>

      {/* Download Success Modal */}
      {showDownloadSuccess && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: "#fff",
            border: "2px solid #000",
            boxShadow: "8px 8px 0px #000",
            padding: "36px",
            maxWidth: "500px",
            width: "100%",
            position: "relative",
            boxSizing: "border-box"
          }}>
            <button
              onClick={() => setShowDownloadSuccess(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 24,
                fontWeight: "bold",
                cursor: "pointer",
                color: "#000"
              }}
            >
              ×
            </button>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#000" }} data-icon="check_circle">
                check_circle
              </span>
              <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: -0.5, marginTop: 12, marginBottom: 8, color: "#000" }}>
                Resume Downloaded!
              </h2>
              <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Your ATS-optimized resume PDF has been saved successfully.
              </p>
            </div>

            <div style={{ borderTop: "2px solid #000", paddingTop: 20, textAlign: "center" }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 0, color: "#000" }}>
                Know someone looking for a job?
              </h3>
              <p style={{ color: "#666", fontSize: 13, lineHeight: 1.5, marginBottom: 20, marginTop: 0 }}>
                Share PREPHAS with them to help them build their resume and check their ATS score for free.
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => {
                    const text = `📄 I just built and downloaded a professional, recruiter-ready resume on PREPHAS for free!\nGet a clean chronological layout, test your ATS score, and match your CV to job listings: https://www.prephas.online`;
                    trackEvent('Share Link Copied', { source: 'download_success' });
                    if (navigator.share) {
                      navigator.share({
                        title: 'PREPHAS',
                        text: text,
                        url: 'https://www.prephas.online'
                      })
                      .then(() => trackEvent('Invite Friend Clicked', { method: 'native_share', source: 'download_success' }))
                      .catch((err) => console.log('Share failed:', err));
                    } else {
                      navigator.clipboard.writeText(text)
                      .then(() => alert("Share message copied to clipboard!"))
                      .catch((err) => console.error("Clipboard copy failed:", err));
                    }
                  }}
                  style={{
                    background: "#000",
                    color: "#fff",
                    border: "2px solid #000",
                    padding: "12px 28px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    boxShadow: "4px 4px 0 #000",
                    transition: "all 0.1s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
                >
                  Share PREPHAS
                </button>
                
                <button
                  onClick={() => setShowDownloadSuccess(false)}
                  style={{
                    background: "#fff",
                    color: "#000",
                    border: "2px solid #000",
                    padding: "12px 24px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    boxShadow: "4px 4px 0 #000",
                    transition: "all 0.1s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 #000"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 #000"; }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeBuilderPage;
