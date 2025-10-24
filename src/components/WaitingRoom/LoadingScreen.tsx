// components/WaitingRoom/LoadingScreen.tsx
import React from 'react';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center">
      <LoadingSpinner
        size="xl"
        text="Loading Battle Arena..."
        subtext="Preparing for combat"
      />
    </div>
  );
};
