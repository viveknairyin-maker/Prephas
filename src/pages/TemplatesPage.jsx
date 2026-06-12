import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, updateDoc, collection, query, where, orderBy, getDocs, addDoc } from '../utils/firebase';
import Navbar from '../components/Navbar';

const TEMPLATES = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    desc: 'Clean two-column technical layout optimized for developers.',
    pro: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKM3NH7JFkTtyv-tHXg9v1GI8pGdyBmNAhznSgF-HY9Es1ZgAReqSzbrp5bxOvu_frftGU67QCVUZ-vPBWzpMKRhvHoQ6viJv0FugsiIMnVQ34JemTefz34jtmEhQEvV8k5VHn3Bq4BzfPQg5uyBTp_U51-IZncnXNoJT4KTh042r6f8ZA1kk3zsqIySChg3-6ejBDo8YN59wTxc8ZvTguA590KSMDQJkA3a1qE1cHczZCt82jirwuidUdxFiB8_NfIEEL6IaoBdUr'
  },
  {
    id: 'fresher',
    name: 'Fresher / Student',
    desc: 'Academic-focused layout emphasizing education and projects.',
    pro: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMVZUlpklbPLxHbn0rhKM4Zwxo0POIxIOjtbG4Jq65EZwM2DNR3hNuDe-Js3IqpN4F8Ju0mzgxL62MwS32yUihZHTFqMhD17975sCVO2ZZuT_JGtf9tHwfRBCjbLJIAlDpo5PIPKb1xhteaBsG-wKFfI9p_83GNlfgPKLn7k_vmLm_cSIvMA96GNvHKUxwywMkUE25h0CM02h66Cddm7bg2RQnYWhZ_UeASbs2bST6zVVcbKoVh6dhmW9VxFFeLgzAY5_Rqca6PA3S'
  },
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    desc: 'Stylish layout with a dedicated info sidebar and modern sans-serif typography.',
    pro: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP4cosGpfuPAXC8Q7aX-LgS5CbmP1Dgk4H1hqaZn3Z4ddI5tnW_P6PWlfmg8ftly2S7EvFqJuMq4AULEQuCKxMCRfNMbXRTXZ5b1Kz9COsZI8m7MlrM97fFZoegHBn5WP50p3JTICtGWtr4P1r_YoTOBl14sDOEN9tSbMREQkpaYk4WabpTVMpo4Wx5e4NmFKK9gEmwU_L7PONj4XoA8yOaKBMFp3mcLTYQIuwQthZnvM-v5i8YGpvo47khj3oYIqwNSSLeJ1iLSOo'
  },
  {
    id: 'executive',
    name: 'Executive',
    desc: 'Elegant, classic serif layout designed for leadership and senior roles.',
    pro: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgw-ehf6R2pjUKMuBkCt0Z8nXbgEi2TuaKbRH8-BoW5TfIE95or8W7d6-JleH4XCXZnZXB1a03ZFErKcHpFpWKmcdnnLy1wr9G660nPxrG72wRYCKZqNi1OysVsg9hr1SkDbCObCIcuPwQgvVGOzx27-qxtIpCYaFpV5bgIT0G5PTSmYS1gIfnD_zRS5XfGgY0JJZo9BDI7bqlR1Wfd53Sw1BzjYoH14WHhxgSpfFyvLUAuFhqMdJbK26x583Etm-zeapjNcRWSpH8'
  },
  {
    id: 'creative',
    name: 'Creative',
    desc: 'Asymmetric layout with bold header styling for designers and makers.',
    pro: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYBH0GIfhYK-VS_42WYyujDScPfKWtMBuaXvgnQ6d6gNGL2l-zTkktUnBaPggxX4JAQfywRSr4y82c-V_wW8ktnftvliQe3JN2cwm0RQhDY2emTYZTfC_Tm8AC01WbnCAFuBZx6PX39h0KHVMBvCBAy-n5-GffinrPp4qo0iGG513f94qLFszTpxUmbXI1ZrIHg_OvMgTfEWiB82qx_qkS_68YQOimZanKFS3iiktYjVzk8jKpJ7eKb70aNqtJkqJRhNnKRWnJvTzE'
  }
];

function TemplatesPage() {
  const { user, profile } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
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
          title: `New Resume (${templateId.replace('-', ' ')})`,
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
      alert(`Something went wrong: ${error.message} (${error.code || 'unknown'})`);
    }
  };

  const filteredTemplates = TEMPLATES.filter(tpl => {
    // Basic search match
    const matchesSearch = tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tpl.desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter tags logic (just mock layout filters)
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Tech') return matchesSearch && ['software-engineer', 'modern-professional'].includes(tpl.id);
    if (activeFilter === 'Creative') return matchesSearch && tpl.id === 'creative';
    if (activeFilter === 'Executive') return matchesSearch && tpl.id === 'executive';
    if (activeFilter === 'Academic') return matchesSearch && tpl.id === 'fresher';
    return matchesSearch;
  });

  return (
    <div className="font-body-md text-body-md bg-background min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 min-h-screen">
        <header className="px-margin-desktop py-12 border-b border-primary">
          <h1 className="font-display text-display uppercase">Choose Your Template</h1>
          <p className="mt-4 font-body-lg text-body-lg text-secondary max-w-2xl">
            Select from our architecturally precise resume templates. Each design is optimized for both human legibility and machine readability (ATS).
          </p>
        </header>

        {/* Template Filter Bar */}
        <div className="px-margin-desktop py-6 border-b border-primary flex flex-wrap gap-8 items-center bg-surface sticky top-[64px] z-30">
          {['All', 'Tech', 'Creative', 'Executive', 'Academic'].map((filter) => (
            <button 
              key={filter} 
              onClick={() => setActiveFilter(filter)}
              className={`font-label-sm text-label-sm pb-1 ${
                activeFilter === filter ? 'border-b-2 border-primary text-primary' : 'text-secondary hover:text-primary transition-colors'
              }`}
            >
              {filter} Templates
            </button>
          ))}
          <div className="ml-auto flex items-center space-x-2 border-l border-primary pl-8">
            <span className="material-symbols-outlined text-xl" data-icon="search">search</span>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:ring-0 font-body-md text-body-md placeholder:text-secondary-fixed" 
              placeholder="Search templates..." 
              type="text"
            />
          </div>
        </div>

        {/* Editorial Gallery Grid */}
        <div className="p-margin-desktop grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {filteredTemplates.map((tpl) => (
            <div 
              key={tpl.id}
              className="template-card relative group border border-primary bg-white transition-all duration-300 hover:border-[3px] flex flex-col justify-between"
            >
              <div className="aspect-[3/4] overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500 bg-zinc-100 flex items-center justify-center">
                {tpl.image ? (
                  <img className="w-full h-full object-cover" src={tpl.image} alt={tpl.name} />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-secondary" data-icon="article">article</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <button 
                    onClick={() => handleUseTemplate(tpl.id)}
                    className="template-btn opacity-0 translate-y-4 transition-all duration-300 bg-primary text-on-primary px-8 py-3 font-label-sm text-label-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] uppercase tracking-widest"
                  >
                    Use Template
                  </button>
                </div>
                {tpl.pro && (
                  <div className="absolute top-4 right-4 bg-white border border-primary px-3 py-1 font-label-sm text-[10px] font-bold uppercase tracking-wider">
                    PRO
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-primary">
                <h3 className="font-headline-md text-headline-md uppercase">{tpl.name}</h3>
                <p className="text-secondary font-body-md text-body-md mt-1">{tpl.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="lg:pl-64 w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center border-t border-primary bg-surface mt-24">
        <div className="mb-8 md:mb-0">
          <div className="font-display text-headline-md text-primary">PREPHAS</div>
          <p className="text-secondary font-body-md text-body-md mt-2">© 2024 PREPHAS AI. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-8">
          <a className="text-secondary hover:text-primary transition-colors font-body-md text-body-md" href="#">Privacy Policy</a>
          <a className="text-secondary hover:text-primary transition-colors font-body-md text-body-md" href="#">Terms of Service</a>
          <a className="text-secondary hover:text-primary transition-colors font-body-md text-body-md" href="#">Contact</a>
          <a className="text-secondary hover:text-primary transition-colors font-body-md text-body-md" href="#">Twitter</a>
          <a className="text-secondary hover:text-primary transition-colors font-body-md text-body-md" href="#">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}

export default TemplatesPage;
