// components/WaitingRoom/LoadingScreen.tsx
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">⚔️</div>
        <div className="text-2xl font-bold mb-2">Loading Battle Arena...</div>
        <div className="text-gray-400">Preparing for combat</div>
      </div>
    </div>
  );
};
