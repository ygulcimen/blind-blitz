// components/BlindPhase/components/LoadingBlindPhase.tsx
import React from 'react';
import { LoadingSpinner } from '../../shared/LoadingSpinner';

export const LoadingBlindPhase: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <LoadingSpinner
        size="xl"
        text="Assigning Colors..."
        subtext="Preparing multiplayer battle"
      />
    </div>
  );
};
