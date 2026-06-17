import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, getDoc } from '../utils/firebase';
import Navbar from '../components/Navbar';
import ATSScore from '../components/ATSScore';
import { Helmet } from 'react-helmet-async';

function AtsScorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      if (id) {
        navigate('/login');
      } else {
        setLoading(false);
      }
      return;
    }

    if (!id) {
      setLoading(false);
      return;
    }

    const fetchResume = async () => {
      try {
        const docRef = doc(db, 'resumes', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          navigate('/dashboard');
          return;
        }

        setResume({ id: docSnap.id, ...docSnap.data() });
      } catch (error) {
        console.error("Error fetching resume:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="bg-surface text-on-surface font-body-md min-h-screen">
        <Navbar />
        <main className="pt-20 md:pt-24 flex items-center justify-center min-h-[50vh]">
          <div className="flex items-center gap-3 font-label-sm text-label-sm uppercase tracking-widest text-primary">
            <span>Loading Resume...</span>
            <div className="h-2 w-2 bg-primary animate-pulse"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <Helmet>
        <title>ATS Resume Checker | Analyze Resume ATS Score</title>
        <meta name="description" content="Analyze your resume with our free AI ATS Resume Checker. Get an instant ATS score out of 100, identify skill gaps, and match your CV to target jobs." />
        <link rel="canonical" href="https://www.prephas.online/ats-analyzer" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="AI ATS Resume Checker & Score Analyzer | PREPHAS" />
        <meta property="og:description" content="Find layout issues, scan keyword coverage, and test your resume against recruiter screening models using our free ATS analyzer." />
        <meta property="og:image" content="https://www.prephas.online/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prephas.online/ats-analyzer" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free AI ATS Resume Checker | PREPHAS" />
        <meta name="twitter:description" content="Upload your CV and run a comprehensive ATS score audit. Check keyword matches and fix layouts instantly." />
        <meta name="twitter:image" content="https://www.prephas.online/og-image.png" />
      </Helmet>
      <Navbar />
      <main className="pt-16 md:pt-20">
        <ATSScore existingResumeData={resume} />
      </main>
    </div>
  );
}

export default AtsScorePage;
