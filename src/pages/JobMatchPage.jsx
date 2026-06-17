import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, getDoc, updateDoc } from '../utils/firebase';
import { matchJobDescription } from '../utils/gemini';
import Navbar from '../components/Navbar';
import { trackEvent } from '../utils/analytics';

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

  const handleCopyMatchLink = () => {
    const text = `🎯 My resume matched ${matchPercent}% with this job description.\n\nCheck your match score for free on PREPHAS:\nhttps://www.prephas.online`;
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Share link copied to clipboard!");
        trackEvent('Share Link Copied', { source: 'job_match' });
      })
      .catch(err => {
        console.error("Failed to copy link:", err);
      });
  };

  const handleShareMatchResult = () => {
    const text = `🎯 My resume matched ${matchPercent}% with this job description. Check your match score for free on PREPHAS:`;
    if (navigator.share) {
      navigator.share({
        title: 'PREPHAS Job Match Score',
        text: text,
        url: 'https://www.prephas.online'
      })
      .then(() => trackEvent('Job Match Shared', { match_percent: matchPercent, method: 'native_share' }))
      .catch(err => console.log('Share failed:', err));
    } else {
      handleCopyMatchLink();
    }
  };

  const handleDownloadMatchCard = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 418;
      const ctx = canvas.getContext('2d');

      // Draw background (solid white)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border (solid 8px black)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 16;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Draw inner line (solid 2px black)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Draw PREPHAS logo (solid black square with white 'P', and bold 'PREPHAS' text)
      ctx.fillStyle = '#000000';
      ctx.fillRect(50, 50, 48, 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Inter", "Arial", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', 50 + 24, 50 + 24);

      ctx.fillStyle = '#000000';
      ctx.font = '900 24px "Inter", "Arial", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('PREPHAS', 110, 50 + 24);

      // Draw Score box (large rectangle on the right side)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      // Drop shadow for the score box
      ctx.fillStyle = '#000000';
      ctx.fillRect(510, 80, 240, 240); // Shadow offset
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(500, 70, 240, 240);
      ctx.strokeRect(500, 70, 240, 240);

      // Score label inside box
      ctx.fillStyle = '#555555';
      ctx.font = 'bold 12px "Inter", "Arial", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JOB DESCRIPTION MATCH', 500 + 120, 70 + 40);

      // Score value (e.g. 92%)
      ctx.fillStyle = '#000000';
      ctx.font = '900 80px "Inter", "Arial", sans-serif';
      ctx.fillText(`${matchPercent}%`, 500 + 120, 70 + 140);

      // Draw Title / Content on the left
      ctx.fillStyle = '#000000';
      ctx.font = '900 32px "Inter", "Arial", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('JOB MATCH OVERLAP', 50, 160);

      // Short tagline
      ctx.fillStyle = '#555555';
      ctx.font = '500 16px "Inter", "Arial", sans-serif';
      ctx.fillText('Compare your resume vocabulary with job postings.', 50, 210);

      ctx.fillStyle = '#777777';
      ctx.font = 'bold 12px "Inter", "Arial", sans-serif';
      ctx.fillText('Identify missing keywords and skills instantly.', 50, 240);

      // Website URL at the bottom left
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px "Inter", "Arial", sans-serif';
      ctx.fillText('www.prephas.online', 50, 350);

      // Convert to image download
      const link = document.createElement('a');
      link.download = `prephas-job-match-${matchPercent}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      trackEvent('Share Image Downloaded', { type: 'job_match', score: matchPercent });
    } catch (err) {
      console.error("Failed to generate match card:", err);
    }
  };

  const handleInviteFriends = () => {
    const text = "I'm using PREPHAS to build ATS-friendly resumes and check ATS scores. Try it here: https://www.prephas.online";
    if (navigator.share) {
      navigator.share({
        title: 'PREPHAS',
        text: text,
        url: 'https://www.prephas.online'
      })
      .then(() => trackEvent('Invite Friend Clicked', { source: 'job_match', method: 'native_share' }))
      .catch(err => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert("Invite message copied to clipboard!");
          trackEvent('Share Link Copied', { source: 'invite_friends_match' });
          trackEvent('Invite Friend Clicked', { source: 'job_match', method: 'copy_link' });
        })
        .catch(err => console.error("Clipboard copy failed:", err));
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
                  <>
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
                    {/* Share Your Match Score section */}
                    <div className="border-t border-primary/10 pt-6 space-y-4">
                      <h5 className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">Share Your Match Score</h5>
                      <p className="text-secondary text-xs leading-relaxed">
                        Challenge your friends to compare their resumes.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleCopyMatchLink}
                          className="bg-white text-primary border border-primary px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={handleShareMatchResult}
                          className="bg-primary text-on-primary border border-primary px-4 py-2 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                        >
                          Share Result
                        </button>
                        <button
                          onClick={handleDownloadMatchCard}
                          className="bg-white text-primary border border-primary px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
                        >
                          Download Card
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Invite Friends Block */}
                  <div className="border border-primary bg-white p-8 block-shadow-sm space-y-4 mt-6">
                    <h4 className="font-headline-md uppercase text-primary font-bold">Invite a Friend</h4>
                    <p className="font-body-md text-secondary leading-normal text-xs">
                      Know someone applying for internships or jobs? Help them improve their resume.
                    </p>
                    <button
                      onClick={handleInviteFriends}
                      className="bg-primary text-on-primary px-6 py-3 font-label-sm text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      Invite Friends
                    </button>
                  </div>
                </>
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
