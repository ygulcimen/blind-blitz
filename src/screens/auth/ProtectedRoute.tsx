import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { user, guestPlayer, isGuest, loading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('🔒 ProtectedRoute check:', {
    path: location.pathname,
    loading,
    hasUser: !!user,
    hasGuest: !!guestPlayer,
    isGuest,
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

  // Allow access if user is authenticated OR is a guest
  const hasAccess = user !== null || guestPlayer !== null;

  // Redirect to login if not authenticated and not a guest
  if (!hasAccess) {
    console.log('❌ Access denied, redirecting to', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User or guest is authenticated, show the protected content
  console.log('✅ Access granted');
  return <>{children}</>;
};
