import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, getDoc, updateDoc } from '../utils/firebase';
import { matchJobDescription } from '../utils/gemini';
import Navbar from '../components/Navbar';

function JobMatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Gemini Output States
  const [matchPercent, setMatchPercent] = useState(null);
  const [presentKeywords, setPresentKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [addingKeywords, setAddingKeywords] = useState(false);
  const [keywordsAdded, setKeywordsAdded] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

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
        console.error("Error loading resume:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id, user]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a job description first.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setMatchPercent(null);
    setKeywordsAdded(false);

    try {
      const resumeCopy = { ...resume };
      delete resumeCopy.strengthScores;
      delete resumeCopy.atsScore;

      const result = await matchJobDescription(JSON.stringify(resumeCopy), jobDescription);
      
      if (result && typeof result.matchPercent === 'number') {
        setMatchPercent(result.matchPercent);
        setPresentKeywords(result.presentKeywords || []);
        setMissingKeywords(result.missingKeywords || []);
      } else {
        throw new Error("Invalid response schema from matcher");
      }
    } catch (err) {
      console.error("Error matching job description:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const addKeywordsToResume = async () => {
    if (!id || !missingKeywords?.length) return;
    setAddingKeywords(true);
    try {
      const resumeRef = doc(db, "resumes", id);
      const resumeSnap = await getDoc(resumeRef);
      const currentSkills = resumeSnap.data()?.skills || [];

      // Merge without duplicates
      const merged = [...new Set([...currentSkills, ...missingKeywords])];

      await updateDoc(resumeRef, { skills: merged });
      setKeywordsAdded(true);
    } catch (err) {
      console.error("Failed to add keywords:", err);
    } finally {
      setAddingKeywords(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <Navbar />

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 font-body-md text-body-md border border-white block-shadow">
          {toast}
        </div>
      )}

      {/* Main Content */}
      <main className="pt-24 p-margin-desktop min-h-screen">
        <div className="max-w-container-max-width mx-auto">
          {/* Header */}
          <header className="mb-12 border-b border-primary pb-8">
            <h1 className="font-display text-display text-primary uppercase">Job Match Analyzer</h1>
            <p className="font-body-lg text-secondary mt-2">Compare: {resume?.title || 'Loading...'}</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20 font-label-sm text-secondary uppercase tracking-widest">
              <span>Loading Resume Details...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              {/* Input Form Column */}
              <div className="lg:col-span-6 border border-primary p-8 bg-white block-shadow-sm space-y-6">
                <h3 className="font-headline-md text-primary uppercase">Paste Target Job Description</h3>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full border border-primary p-4 focus:ring-0 focus:border-black font-body-md leading-relaxed"
                  rows="12"
                  placeholder="Paste the raw job posting text here (e.g. Roles, requirements, responsibilities)..."
                />

                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-primary text-on-primary py-4 font-label-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 active:translate-y-0.5"
                >
                  <span className="material-symbols-outlined" data-icon="manage_search">manage_search</span>
                  {analyzing ? 'Analyzing Overlap...' : 'Analyze Match'}
                </button>

                {analyzing && (
                  <div className="text-center py-4 text-secondary font-body-md flex items-center justify-center gap-2">
                    <span>Gemini AI is parsing and mapping qualifications...</span>
                    <div className="h-1.5 w-1.5 bg-primary animate-ping"></div>
                  </div>
                )}

                {error && (
                  <div className="border border-error p-4 bg-error-container text-on-error-container font-body-md">
                    {error}
                  </div>
                )}
              </div>

              {/* Match Feedback Results Column */}
              <div className="lg:col-span-6 space-y-8">
                {matchPercent !== null ? (
                  <div className="border border-primary bg-white p-8 block-shadow-sm space-y-8">
                    {/* Score circle */}
                    <div className="flex items-center gap-8">
                      <div className="w-32 h-32 border border-primary flex flex-col items-center justify-center bg-zinc-50 block-shadow-sm">
                        <span className="font-display text-4xl font-bold">{matchPercent}%</span>
                        <span className="font-label-sm text-[9px] text-secondary uppercase tracking-wider mt-1">Match Rate</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-headline-md uppercase text-primary">
                          {matchPercent >= 80 ? 'Highly Compatible' : matchPercent >= 60 ? 'Strong Alignment' : 'Low Overlap'}
                        </h4>
                        <p className="font-body-md text-secondary leading-normal">
                          {matchPercent >= 80 
                            ? 'Excellent coverage of target requirements. Ready to submit!' 
                            : 'Consider adding some missing keywords below to pass automatic filters.'}
                        </p>
                      </div>
                    </div>

                    {/* Keywords Present */}
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <h5 className="font-label-sm text-label-sm uppercase tracking-widest text-primary">Keywords Found in Resume</h5>
                      <div className="flex flex-wrap gap-2">
                        {presentKeywords.length === 0 ? (
                          <span className="text-secondary font-body-md italic">No match key-phrases identified.</span>
                        ) : (
                          presentKeywords.map((kw, idx) => (
                            <span key={idx} className="px-3 py-1 border border-primary/20 text-[10px] uppercase font-semibold text-secondary bg-zinc-50">
                              {kw}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Keywords Missing */}
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <h5 className="font-label-sm text-label-sm uppercase tracking-widest text-error">Missing Target Keywords</h5>
                      <div className="flex flex-wrap gap-2">
                        {missingKeywords.length === 0 ? (
                          <span className="text-primary font-body-md font-bold">Awesome! All target keywords are covered.</span>
                        ) : (
                          missingKeywords.map((kw, idx) => (
                            <span key={idx} className="px-3 py-1 border border-primary text-[10px] uppercase font-bold text-primary bg-white">
                              {kw}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add Missing Keywords CTA */}
                    {missingKeywords.length > 0 && (
                      <button
                        onClick={addKeywordsToResume}
                        disabled={addingKeywords || keywordsAdded}
                        style={{
                          background: keywordsAdded ? "#fff" : "#000",
                          color: keywordsAdded ? "#000" : "#fff",
                          border: "1px solid #000",
                          padding: "10px 22px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: keywordsAdded ? "default" : "pointer",
                          width: "100%",
                          marginTop: 16
                        }}
                      >
                        {keywordsAdded
                          ? "✓ Keywords Added to Resume"
                          : addingKeywords
                          ? "Adding..."
                          : "Add Missing Keywords to Resume"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-primary p-12 text-center text-secondary bg-white block-shadow-sm flex flex-col items-center justify-center h-80 space-y-4">
                    <span className="material-symbols-outlined text-4xl text-secondary" data-icon="work">work</span>
                    <p className="font-body-lg">Paste a job posting on the left and run analysis to evaluate alignment, present skills, and keywords.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="md:ml-64 w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center border-t border-primary bg-surface mt-24">
        <div className="mb-8 md:mb-0">
          <span className="font-display text-headline-md text-primary">PREPHAS</span>
          <p className="font-body-md text-secondary mt-2">© 2024 PREPHAS AI. All rights reserved.</p>
        </div>
        <div className="flex gap-8">
          <a className="font-label-sm text-secondary hover:text-primary transition-colors uppercase" href="#">Privacy Policy</a>
          <a className="font-label-sm text-secondary hover:text-primary transition-colors uppercase" href="#">Terms of Service</a>
          <a className="font-label-sm text-secondary hover:text-primary transition-colors uppercase" href="#">LinkedIn</a>
          <a className="font-label-sm text-secondary hover:text-primary transition-colors uppercase" href="#">Twitter</a>
        </div>
      </footer>
    </div>
  );
}

export default JobMatchPage;
