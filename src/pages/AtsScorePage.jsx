import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, getDoc } from '../utils/firebase';
import Navbar from '../components/Navbar';
import ATSScore from '../components/ATSScore';

function AtsScorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

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
  }, [id, user]);

  if (loading) {
    return (
      <div className="bg-surface text-on-surface font-body-md min-h-screen">
        <Navbar />
        <main className="pt-24 flex items-center justify-center min-h-[50vh]">
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
      <Navbar />
      <main className="pt-20">
        <ATSScore existingResumeData={resume} />
      </main>
    </div>
  );
}

export default AtsScorePage;
