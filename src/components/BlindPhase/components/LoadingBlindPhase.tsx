// components/BlindPhase/components/LoadingBlindPhase.tsx
import React from 'react';

export const LoadingBlindPhase: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">⚔️</div>
        <div className="text-2xl font-bold mb-2 text-white">
          Assigning Colors...
        </div>
        <div className="text-gray-400">Preparing multiplayer battle</div>
      </div>
    </div>
  );
};
