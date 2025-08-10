// src/screens/LandingPage.tsx
import React from 'react';
import HeroSection from './landingPage/HeroSection';
import GameModes from './landingPage/GameModes';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white">
      <HeroSection />
      <GameModes />
    </div>
  );
};

export default LandingPage;
