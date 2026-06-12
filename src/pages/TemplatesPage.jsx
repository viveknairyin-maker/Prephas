import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, updateDoc, collection, query, where, getDocs, addDoc } from '../utils/firebase';
import Navbar from '../components/Navbar';
import ResumeTemplates from '../components/ResumeTemplates';

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
        navigate(`/builder/${latestResume.id}`);
      } else {
        // Create a new resume
        const newResume = {
          userId: user.uid,
          title: `New Resume (${templateId})`,
          template: templateId,
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
        navigate(`/builder/${docRef.id}`);
      }
    } catch (error) {
      console.error("Error applying template:", error);
      alert(`Something went wrong: ${error.message}`);
    }
  };

  return (
    <div className="font-body-md text-body-md bg-background min-h-screen">
      <Navbar />
      <main className="pt-20">
        <ResumeTemplates 
          resumeData={resumes[0] || null} 
          onSelectTemplate={handleUseTemplate} 
        />
      </main>
    </div>
  );
}

export default TemplatesPage;
