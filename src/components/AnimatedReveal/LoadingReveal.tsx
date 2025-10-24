// components/AnimatedReveal/components/LoadingReveal.tsx
import React from 'react';

interface ModeInfo {
  name: string;
  icon: string;
  gradient: string;
  description: string;
}

interface LoadingRevealProps {
  modeInfo: ModeInfo;
  gameMode: 'classic' | 'robot_chaos';
}

export const LoadingReveal: React.FC<LoadingRevealProps> = ({
  modeInfo,
  gameMode,
}) => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/[0.07] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/[0.05] rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 text-center">
        {/* Branded Logo with Glow */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 blur-xl animate-pulse" />
          <img
            src="/logo.png"
            alt="BlindBlitz"
            className="relative w-24 h-24 mx-auto rounded-lg animate-pulse drop-shadow-2xl"
          />
        </div>

        {/* Mode Icon */}
        <div className="text-4xl mb-4">{modeInfo.icon}</div>

        {/* Loading Title */}
        <h1
          className={`text-3xl font-black mb-3 bg-gradient-to-r ${modeInfo.gradient} bg-clip-text text-transparent animate-pulse`}
        >
          {modeInfo.name}
        </h1>

        {/* Loading Message */}
        <div className="text-lg text-gray-300 mb-6 font-medium">
          {gameMode === 'classic'
            ? 'Preparing to reveal your strategic brilliance...'
            : 'Chaos AI calculating maximum carnage...'}
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-0"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-400"></div>
        </div>

        {/* Status Text */}
        <div className="text-sm text-gray-500 font-medium">
          Analyzing blind moves and calculating battle outcomes...
        </div>
      </div>
    </div>
  );
};
