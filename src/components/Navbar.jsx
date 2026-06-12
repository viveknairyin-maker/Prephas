import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { signOut, auth } from '../utils/firebase';

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFeaturesClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 bg-surface border-b border-primary h-20">
      <div className="flex items-center gap-8">
        <Link className="font-display text-headline-md tracking-tighter text-primary" to="/">PREPHAS</Link>
        <nav className="hidden md:flex gap-6">
          <a 
            className="text-secondary hover:opacity-70 transition-opacity font-body-md text-body-md" 
            href="/#features"
            onClick={handleFeaturesClick}
          >
            Features
          </a>
          {user && (
            <>
              <Link 
                className={`font-body-md text-body-md transition-opacity hover:opacity-70 ${
                  location.pathname === '/templates' ? 'text-primary font-bold border-b-2 border-primary' : 'text-secondary'
                }`} 
                to="/templates"
              >
                Templates
              </Link>
              <Link 
                className={`font-body-md text-body-md transition-opacity hover:opacity-70 ${
                  location.pathname === '/dashboard' ? 'text-primary font-bold border-b-2 border-primary' : 'text-secondary'
                }`} 
                to="/dashboard"
              >
                Dashboard
              </Link>
            </>
          )}
          <Link 
            className={`font-body-md text-body-md transition-opacity hover:opacity-70 ${
              location.pathname === '/pricing' ? 'text-primary font-bold border-b-2 border-primary' : 'text-secondary'
            }`} 
            to="/pricing"
          >
            Pricing
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link 
              className="text-primary font-label-sm text-label-sm hover:opacity-70 transition-opacity uppercase tracking-widest hidden md:block" 
              to="/dashboard"
            >
              Dashboard
            </Link>
            <button 
              onClick={handleLogout} 
              className="text-secondary font-label-sm text-label-sm hover:opacity-70 transition-opacity uppercase tracking-widest border border-primary px-4 py-2 hover:bg-black hover:text-white transition-all duration-150"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-secondary font-label-sm text-label-sm hover:opacity-70 transition-opacity uppercase tracking-widest" to="/login">Login</Link>
            <Link className="bg-primary text-on-primary px-6 py-2.5 font-label-sm text-label-sm hover:opacity-90 transition-opacity uppercase tracking-widest" to="/signup">Get Started</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
