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
          <Route path="/ats-analyzer" element={
            <ProtectedRoute>
              <AtsScorePage />
            </ProtectedRoute>
          } />
          <Route path="/ats-analyzer/:id" element={
            <ProtectedRoute>
              <AtsScorePage />
            </ProtectedRoute>
          } />
          <Route path="/ats" element={
            <ProtectedRoute>
              <AtsScorePage />
            </ProtectedRoute>
          } />
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
          
          <Route path="/templates" element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          } />
          

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
