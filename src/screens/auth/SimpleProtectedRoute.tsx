// src/screens/auth/SimpleProtectedRoute.tsx - Protected route for simple auth
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSimpleAuth } from '../../context/SimpleAuthContext';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { sessionData, guestPlayer, isAuthenticated, loading } = useSimpleAuth();
  const location = useLocation();

  // Debug logging
  console.log('🔒 SimpleProtectedRoute check:', {
    path: location.pathname,
    loading,
    hasSession: !!sessionData,
    hasGuest: !!guestPlayer,
    isAuthenticated,
  });

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="BlindBlitz"
            className="w-16 h-16 rounded-lg mb-4 mx-auto animate-pulse"
          />
          <div className="text-white text-xl font-bold mb-2">
            Checking Access...
          </div>
          <div className="text-gray-400">Please wait</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ Access denied, redirecting to', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User or guest is authenticated, show the protected content
  console.log('✅ Access granted');
  return <>{children}</>;
};
