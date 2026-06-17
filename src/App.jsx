import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { initGA, trackPageView } from './utils/analytics';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import AtsScorePage from './pages/AtsScorePage';
import JobMatchPage from './pages/JobMatchPage';
import TemplatesPage from './pages/TemplatesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import HelpPage from './pages/HelpPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Component to handle automatic page tracking on route changes
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Resume Builder Routes */}
          <Route path="/resume-builder" element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/resume-builder/:id" element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/builder/new" element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/builder/:id" element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          } />
          
          {/* ATS Analyzer Routes */}
          <Route path="/ats-analyzer" element={<AtsScorePage />} />
          <Route path="/ats-analyzer/:id" element={
            <ProtectedRoute>
              <AtsScorePage />
            </ProtectedRoute>
          } />
          <Route path="/ats" element={<AtsScorePage />} />
          <Route path="/ats/:id" element={
            <ProtectedRoute>
              <AtsScorePage />
            </ProtectedRoute>
          } />
          
          <Route path="/match/:id" element={
            <ProtectedRoute>
              <JobMatchPage />
            </ProtectedRoute>
          } />
          
          <Route path="/templates" element={<TemplatesPage />} />
          

          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Blog Routes */}
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
