import React from 'react';
import { useAuth } from '../context/AuthContext';
import HeroSection from './landingPage/HeroSection';
import GameModes from './landingPage/GameModes';

const LandingPage: React.FC = () => {
  const { loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-black font-black text-2xl">BC</span>
          </div>
          <div className="text-white text-xl font-bold">Loading...</div>
        </div>
      </div>
    );
  }

  // Show landing page to everyone (authenticated or not)
  return (
    <div className="bg-black-900 text-white">
      <HeroSection />
      <GameModes />
    </div>
  );
};

export default LandingPage;
