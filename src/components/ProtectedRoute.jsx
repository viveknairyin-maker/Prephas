import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-primary">
          <span>Verifying Session...</span>
          <div className="h-2 w-2 bg-primary animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
