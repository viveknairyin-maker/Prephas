import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, getDoc, updateDoc } from '../utils/firebase';
import { calculateAtsScore } from '../utils/gemini';

function AtsScorePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // ATS Output States
  const [score, setScore] = useState(0);
  const [positives, setPositives] = useState([]);
  const [issues, setIssues] = useState([]);

  // Counter animation
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!user || !id) return;

    const fetchAndAnalyze = async () => {
      try {
        const docRef = doc(db, 'resumes', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          navigate('/dashboard');
          return;
        }

        const data = docSnap.data();
        setResume(data);
        setLoading(false);

        // Run analysis
        setAnalyzing(true);
        setError(null);
        
        // Remove nested strengthScores and id to keep JSON compact for AI
        const resumeCopy = { ...data };
        delete resumeCopy.strengthScores;
        delete resumeCopy.atsScore;
        
        const result = await calculateAtsScore(JSON.stringify(resumeCopy));
        
        if (result && typeof result.score === 'number') {
          setScore(result.score);
          setPositives(result.positives || []);
          setIssues(result.issues || []);
          
          // Save score back to Firestore
          await updateDoc(docRef, {
            atsScore: result.score
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("ATS calculation failed:", err);
        setError("Something went wrong. Try again.");
      } finally {
        setAnalyzing(false);
      }
    };

    fetchAndAnalyze();
  }, [id, user]);

  // Animated counter effect
  useEffect(() => {
    if (score > 0) {
      let current = 0;
      const step = Math.ceil(score / 30);
      const timer = setInterval(() => {
        current += step;
        if (current >= score) {
          current = score;
          clearInterval(timer);
        }
        setDisplayScore(current);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [score]);

  // SVG circular properties
  const radius = 45;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      {/* Side Navigation Shell */}
      <nav className="fixed left-0 top-0 h-full w-64 flex flex-col border-r border-primary z-40 bg-surface hidden md:flex">
        <div className="p-8">
          <Link className="font-display text-headline-md tracking-tighter text-primary" to="/dashboard">PREPHAS</Link>
          <p className="font-label-sm text-secondary mt-1 uppercase">Pro Account</p>
        </div>
        <div className="flex-grow px-4 space-y-2">
          <Link className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container transition-colors duration-150" to="/dashboard">
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="font-label-sm uppercase tracking-wider text-[10px]">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary font-bold transition-colors duration-150" to={`/ats/${id}`}>
            <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
            <span className="font-label-sm uppercase tracking-wider text-[10px]">ATS Analysis</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container transition-colors duration-150" to={`/builder/${id}`}>
            <span className="material-symbols-outlined" data-icon="description">description</span>
            <span className="font-label-sm uppercase tracking-wider text-[10px]">Editor</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container transition-colors duration-150" to="/templates">
            <span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
            <span className="font-label-sm uppercase tracking-wider text-[10px]">Templates</span>
          </Link>
        </div>
        <div className="p-4 mt-auto border-t border-primary">
          <Link className="w-full bg-primary text-on-primary py-4 block text-center font-label-sm hover:opacity-90 transition-opacity uppercase tracking-widest" to="/builder/new">
            Create New Resume
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-margin-desktop min-h-screen">
        <div className="max-w-container-max-width mx-auto">
          {/* Header Section */}
          <header className="mb-16">
            <div className="flex justify-between items-end border-b border-primary pb-8">
              <div>
                <h1 className="font-display text-display text-primary uppercase">ATS Analysis</h1>
                <p className="font-body-lg text-secondary mt-2">Resume: {resume?.title || 'Loading...'}</p>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-secondary uppercase tracking-widest">Last Scanned</p>
                <p className="font-body-md text-primary font-bold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </header>

          {/* Loading / Error States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex items-center gap-3 font-label-sm text-label-sm uppercase tracking-widest text-primary">
                <span>Loading Resume details...</span>
                <div className="h-2 w-2 bg-primary animate-pulse"></div>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="flex items-center gap-3 font-label-sm text-label-sm uppercase tracking-widest text-primary">
                <span>Analyzing resume formatting &amp; keywords</span>
                <div className="h-2 w-2 bg-primary animate-ping"></div>
              </div>
              <p className="text-secondary font-body-md text-center">PREPHAS AI is checking summary structure, skill density, and chronological compliance...</p>
            </div>
          )}

          {error && (
            <div className="border border-primary p-6 mb-16 max-w-lg mx-auto text-center bg-white space-y-4 block-shadow">
              <p className="font-headline-md text-error font-bold uppercase">Something went wrong. Try again.</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary text-on-primary px-8 py-3 font-label-sm uppercase tracking-widest"
              >
                Retry Scan
              </button>
            </div>
          )}

          {/* Results Visual Center */}
          {!analyzing && !error && resume && (
            <>
              <section className="flex flex-col items-center justify-center py-16 mb-16 border-b border-primary relative bg-white border border-primary p-12 block-shadow">
                <div className="relative flex items-center justify-center">
                  {/* Circular Progress Ring */}
                  <svg className="w-64 h-64" viewBox="0 0 100 100">
                    <circle className="text-surface-container-highest" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="2"></circle>
                    <circle 
                      className="progress-ring__circle text-primary" 
                      cx="50" 
                      cy="50" 
                      fill="transparent" 
                      r="45" 
                      stroke="currentColor" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset} 
                      strokeLinecap="butt" 
                      strokeWidth="2"
                    ></circle>
                  </svg>
                  {/* Score Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-[80px] leading-none text-primary">{displayScore}</span>
                    <span className="font-headline-md text-secondary border-t border-primary pt-2 mt-2 px-4 uppercase tracking-tighter">/ 100</span>
                  </div>
                </div>
                <div className="mt-12 text-center max-w-md">
                  <h2 className="font-headline-lg text-primary mb-4 uppercase">
                    {score >= 80 ? 'Strong Match Found' : score >= 60 ? 'Moderate Alignment' : 'Needs Optimization'}
                  </h2>
                  <p className="font-body-lg text-secondary">
                    {score >= 80 
                      ? 'Your resume performs better than 88% of applicants. Minimal adjustments needed to pass filters.' 
                      : 'We found structural opportunities to increase keyword matching. Review issues below to upgrade score.'}
                  </p>
                </div>
              </section>

              {/* Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {/* What's Working Column */}
                <div className="border border-primary p-8 bg-white block-shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-primary" data-icon="check_circle">check_circle</span>
                    <h3 className="font-headline-md text-primary uppercase">What's Working</h3>
                  </div>
                  <ul className="space-y-6">
                    {positives.length === 0 ? (
                      <li className="font-body-md text-secondary">No positive factors detected yet. Let's rebuild!</li>
                    ) : (
                      positives.map((pos, idx) => (
                        <li key={idx} className="flex items-start gap-4 pb-6 border-b border-secondary-fixed">
                          <span className="material-symbols-outlined text-primary mt-1" data-icon="check">check</span>
                          <div>
                            <p className="font-body-lg font-bold text-primary">{pos}</p>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Issues Found Column */}
                <div className="border border-primary p-8 bg-white block-shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-error" data-icon="error">error</span>
                    <h3 className="font-headline-md text-primary uppercase">Issues Found</h3>
                  </div>
                  <ul className="space-y-6">
                    {issues.length === 0 ? (
                      <li className="font-body-md text-secondary">Outstanding! No issues detected by parser.</li>
                    ) : (
                      issues.map((iss, idx) => (
                        <li key={idx} className="flex items-start gap-4 pb-6 border-b border-secondary-fixed group">
                          <span className="material-symbols-outlined text-error mt-1" data-icon="close">close</span>
                          <div className="flex-grow">
                            <p className="font-body-lg font-bold text-primary">{iss}</p>
                          </div>
                          <Link 
                            to={`/builder/${id}`}
                            className="font-label-sm text-primary underline uppercase transition-opacity opacity-0 group-hover:opacity-100 font-bold"
                          >
                            Fix
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* CTA Section */}
              <section className="mt-16 flex flex-col items-center">
                <div className="w-full max-w-2xl border-t border-primary pt-12 text-center">
                  <h4 className="font-headline-md text-primary mb-6">Ready to reach 100%?</h4>
                  <button 
                    onClick={() => navigate(`/builder/${id}`)}
                    className="bg-primary text-on-primary px-16 py-6 font-display text-headline-md uppercase hover:invert transition-all duration-300 flex items-center gap-4 mx-auto group border border-primary hover:bg-white hover:text-primary"
                  >
                    Fix with AI
                    <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform" data-icon="bolt" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  </button>
                  <p className="font-label-sm text-secondary mt-8 tracking-widest uppercase">PREPHAS AI will automatically rewrite and reformat these sections.</p>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Footer Shell */}
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

export default AtsScorePage;
