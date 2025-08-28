import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Redirects authenticated users away from auth pages
export const AuthRedirect: React.FC<AuthRedirectProps> = ({
  children,
  redirectTo = '/games',
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, redirect them away from login/signup pages
  if (user) {
    // Check if they were trying to go somewhere specific before login
    const from = (location.state as any)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // User not authenticated, show auth pages
  return <>{children}</>;
};
