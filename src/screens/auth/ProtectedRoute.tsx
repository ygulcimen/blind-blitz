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
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-black font-black text-2xl">BB</span>
          </div>
          <div className="text-white text-xl font-bold mb-2">
            Checking Access...
          </div>
          <div className="text-gray-400">Please wait</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated, but remember where they wanted to go
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};
