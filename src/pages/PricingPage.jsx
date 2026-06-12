import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db, doc, updateDoc } from '../utils/firebase';
import Navbar from '../components/Navbar';

function PricingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSelectFree = async () => {
    if (!user) {
      navigate('/signup');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: 'free'
      });
      await refreshProfile();
      setToast("Changed to Free Plan.");
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Error setting plan:", error);
    }
  };

  const handleSelectPremium = async () => {
    if (!user) {
      navigate('/signup');
      return;
    }
    
    setToast("Payment coming soon! Activating Premium plan for testing...");
    setTimeout(() => setToast(null), 4000);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: 'premium'
      });
      await refreshProfile();
    } catch (error) {
      console.error("Error upgrading plan:", error);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 font-body-md text-body-md border border-white block-shadow">
          {toast}
        </div>
      )}

      <main className="flex-grow pt-32 pb-24 px-margin-desktop max-w-container-max-width mx-auto w-full">
        {/* Header Section */}
        <section className="text-center mb-16">
          <h1 className="font-display text-display mb-4">Precision Pricing.</h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto">
            No complex tiers. No hidden fees. Just high-performance tools for professionals who demand excellence in their career journey.
          </p>
        </section>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Free Plan */}
          <div className="border border-primary bg-surface p-12 flex flex-col justify-between transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
            {profile?.plan === 'free' && (
              <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 font-label-sm text-[10px] uppercase">
                Active Plan
              </div>
            )}
            <div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-headline-lg text-headline-lg mb-1">Free Plan</h2>
                  <p className="font-label-sm text-label-sm text-secondary tracking-widest">ESSENTIALS</p>
                </div>
                <div className="text-right">
                  <span className="font-display text-display">₹0</span>
                  <p className="font-label-sm text-label-sm text-secondary">FOREVER</p>
                </div>
              </div>
              <div className="w-full h-px bg-primary mb-8"></div>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">1 Professional Resume Template</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">Basic ATS Analysis (3 scans/mo)</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">Export to PDF (Max 3 downloads)</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">Community Support</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={handleSelectFree}
              className="w-full py-4 border border-primary text-primary font-label-sm text-label-sm hover:bg-primary hover:text-on-primary transition-colors duration-200 uppercase"
            >
              Select Free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-primary text-on-primary p-12 flex flex-col justify-between relative transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(207,196,197,1)]">
            {profile?.plan === 'premium' ? (
              <div className="absolute top-4 right-4 bg-white text-primary px-3 py-1 font-label-sm text-[10px] uppercase border border-primary">
                Active Plan
              </div>
            ) : (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface text-primary border border-primary px-4 py-1 font-label-sm text-label-sm uppercase">
                MOST POPULAR
              </div>
            )}
            <div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-headline-lg text-headline-lg mb-1">Premium Plan</h2>
                  <p className="font-label-sm text-label-sm text-secondary-fixed tracking-widest">PROFESSIONAL</p>
                </div>
                <div className="text-right">
                  <span className="font-display text-display">₹99</span>
                  <p className="font-label-sm text-label-sm text-secondary-fixed">/ MONTH</p>
                </div>
              </div>
              <div className="w-full h-px bg-on-primary mb-8"></div>
              <ul className="space-y-4 mb-12">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">Unlimited Resume Templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">Unlimited Deep ATS Analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">AI-Powered Skill Gap Detection</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">Priority 24/7 Expert Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-primary" data-icon="check">check</span>
                  <span className="font-body-md text-body-md">Custom Branding &amp; Multi-format Export</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={handleSelectPremium}
              className="w-full py-4 bg-white text-primary font-label-sm text-label-sm hover:opacity-90 transition-opacity duration-200 uppercase font-bold"
            >
              Get Premium (₹99/mo)
            </button>
          </div>
        </div>

        {/* Comparative Summary / Trust Section */}
        <section className="mt-24 border-t border-primary pt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-headline-md text-headline-md mb-2 text-primary">Secure Payment</h3>
            <p className="font-body-md text-body-md text-secondary">All transactions are encrypted with 256-bit SSL protocol to ensure your financial safety.</p>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md mb-2 text-primary">Cancel Anytime</h3>
            <p className="font-body-md text-body-md text-secondary">No long-term contracts. Pause or cancel your subscription directly from your dashboard.</p>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md mb-2 text-primary">Enterprise Ready</h3>
            <p className="font-body-md text-body-md text-secondary">Need 10+ licenses? Contact our sales team for custom volume pricing and onboarding.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center border-t border-primary bg-surface">
        <div className="mb-8 md:mb-0">
          <span className="font-display text-headline-md text-primary">PREPHAS AI</span>
          <p className="font-body-md text-body-md text-secondary mt-2">© 2024 PREPHAS AI. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Contact</a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Twitter</a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}

export default PricingPage;
