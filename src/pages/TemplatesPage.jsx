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
    if (!user) return;

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
        <meta name="description" content="Build ATS-friendly resumes with PREPHAS. Free AI resume builder, ATS score checker, job match analysis, resume templates, and instant PDF export." />
        <link rel="canonical" href="https://www.prephas.online/templates" />
      </Helmet>
      <Navbar />
      <main className="pt-20">
        <ResumeTemplates 
          resumeData={resumes[0] || null} 
          onSelectTemplate={handleUseTemplate} 
        />
      </main>
      <Footer />
    </div>
  );
}

export default TemplatesPage;
