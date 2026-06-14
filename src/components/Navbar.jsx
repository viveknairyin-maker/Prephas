import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { signOut, auth } from '../utils/firebase';

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleFeaturesClick = (e) => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-margin-desktop py-0 bg-surface border-b border-primary h-16 md:h-20 navbar">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            className="flex items-center flex-shrink-0"
            to="/"
            onClick={closeMenu}
          >
            <img src="/logo.png" alt="PREPHAS Logo" className="h-8 md:h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Nav — hidden on mobile */}
          <nav className="hidden md:flex gap-6">
            <a
              className="text-secondary hover:opacity-70 transition-opacity font-body-md text-body-md"
              href="/"
              onClick={handleFeaturesClick}
            >
              Home
            </a>
            {user && (
              <>
                <Link
                  className={`font-body-md text-body-md transition-opacity hover:opacity-70 ${
                    location.pathname === '/templates'
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-secondary'
                  }`}
                  to="/templates"
                >
                  Templates
                </Link>
                <Link
                  className={`font-body-md text-body-md transition-opacity hover:opacity-70 ${
                    location.pathname.startsWith('/ats')
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-secondary'
                  }`}
                  to="/ats"
                >
                  ATS Analyser
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                className="text-primary font-label-sm text-label-sm hover:opacity-70 transition-opacity uppercase tracking-widest"
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
              <Link
                className="text-secondary font-label-sm text-label-sm hover:opacity-70 transition-opacity uppercase tracking-widest"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="bg-primary text-on-primary px-6 py-2.5 font-label-sm text-label-sm hover:opacity-90 transition-opacity uppercase tracking-widest"
                to="/signup"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Hamburger button */}
        <button
          className="md:hidden relative flex flex-col justify-center items-center w-11 h-11 gap-[5px] focus:outline-none flex-shrink-0"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-[2px] bg-primary rounded-sm transition-all duration-300 origin-center ${
              menuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-primary rounded-sm transition-all duration-300 ${
              menuOpen ? 'opacity-0 scale-x-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-primary rounded-sm transition-all duration-300 origin-center ${
              menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Slide-Out Drawer */}
      <div
        className={`fixed top-16 right-0 z-50 w-72 max-w-[85vw] h-[calc(100dvh-64px)] bg-surface border-l border-primary flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out md:hidden`}
        style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(100%)' }}
        aria-hidden={!menuOpen}
      >
        {/* Drawer Nav Links */}
        <nav className="flex flex-col py-4">
          <div className="px-6 py-3 border-b border-primary/10 mb-1">
            <span className="text-[10px] uppercase tracking-[0.15em] text-secondary font-bold">
              Navigation
            </span>
          </div>

          <a
            className="flex items-center gap-3 px-6 py-4 text-secondary hover:bg-zinc-50 hover:text-primary transition-colors font-body-md border-b border-primary/5 min-h-[52px]"
            href="/"
            onClick={handleFeaturesClick}
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">home</span>
            Home
          </a>

          {user && (
            <>
              <Link
                className={`flex items-center gap-3 px-6 py-4 hover:bg-zinc-50 transition-colors font-body-md border-b border-primary/5 min-h-[52px] ${
                  location.pathname === '/templates'
                    ? 'text-primary font-semibold bg-zinc-50'
                    : 'text-secondary'
                }`}
                to="/templates"
                onClick={closeMenu}
              >
                <span className="material-symbols-outlined text-xl flex-shrink-0">description</span>
                Templates
              </Link>

              <Link
                className={`flex items-center gap-3 px-6 py-4 hover:bg-zinc-50 transition-colors font-body-md border-b border-primary/5 min-h-[52px] ${
                  location.pathname.startsWith('/ats')
                    ? 'text-primary font-semibold bg-zinc-50'
                    : 'text-secondary'
                }`}
                to="/ats"
                onClick={closeMenu}
              >
                <span className="material-symbols-outlined text-xl flex-shrink-0">analytics</span>
                ATS Analyser
              </Link>

              <Link
                className={`flex items-center gap-3 px-6 py-4 hover:bg-zinc-50 transition-colors font-body-md border-b border-primary/5 min-h-[52px] ${
                  location.pathname.startsWith('/builder')
                    ? 'text-primary font-semibold bg-zinc-50'
                    : 'text-secondary'
                }`}
                to="/builder/new"
                onClick={closeMenu}
              >
                <span className="material-symbols-outlined text-xl flex-shrink-0">edit_document</span>
                Build My Resume
              </Link>

              <Link
                className={`flex items-center gap-3 px-6 py-4 hover:bg-zinc-50 transition-colors font-body-md border-b border-primary/5 min-h-[52px] ${
                  location.pathname === '/dashboard'
                    ? 'text-primary font-semibold bg-zinc-50'
                    : 'text-secondary'
                }`}
                to="/dashboard"
                onClick={closeMenu}
              >
                <span className="material-symbols-outlined text-xl flex-shrink-0">dashboard</span>
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Drawer Auth Actions */}
        <div className="mt-auto px-6 py-6 border-t border-primary/10 space-y-3">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full border border-primary py-3.5 font-label-sm text-label-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all text-secondary min-h-[48px]"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                className="flex items-center justify-center w-full border border-primary py-3.5 font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:bg-zinc-50 transition-all min-h-[48px]"
                to="/login"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                className="flex items-center justify-center w-full bg-primary text-on-primary py-3.5 font-label-sm text-label-sm uppercase tracking-widest hover:opacity-90 transition-all min-h-[48px]"
                to="/signup"
                onClick={closeMenu}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
