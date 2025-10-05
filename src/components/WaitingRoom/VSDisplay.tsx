// components/WaitingRoom/VSDisplay.tsx
import React from 'react';

interface VSDisplayProps {
  prizePool: number;
  mode?: 'classic' | 'robochaos';
}

export const VSDisplay: React.FC<VSDisplayProps> = ({ prizePool, mode = 'classic' }) => {
  const getModeColors = (gameMode: 'classic' | 'robochaos') => {
    switch (gameMode) {
      case 'classic':
        return {
          vsGradient: 'from-blue-600 via-indigo-500 to-purple-600',
          prizeBoxGradient: 'from-blue-900/90 to-indigo-900/90',
          prizeBorder: 'border-blue-500/50',
        };
      case 'robochaos':
        return {
          vsGradient: 'from-red-600 via-orange-500 to-yellow-500',
          prizeBoxGradient: 'from-purple-900/90 to-red-900/90',
          prizeBorder: 'border-purple-500/50',
        };
      default:
        return {
          vsGradient: 'from-blue-600 via-indigo-500 to-purple-600',
          prizeBoxGradient: 'from-blue-900/90 to-indigo-900/90',
          prizeBorder: 'border-blue-500/50',
        };
    }
  };

  const colors = getModeColors(mode);

  return (
    <div className="flex flex-col items-center z-20">
      <div className="relative">
        <div className={`w-20 h-20 bg-gradient-to-br ${colors.vsGradient} rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform animate-pulse`}>
          <span className="text-white font-black text-2xl drop-shadow-lg">
            VS
          </span>
        </div>
      </div>

      <div className={`mt-5 bg-gradient-to-r ${colors.prizeBoxGradient} backdrop-blur-sm rounded-xl px-5 py-3 border-2 ${colors.prizeBorder} shadow-2xl`}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-base">💰</span>
            <span className="text-gray-200 text-xs uppercase tracking-wider font-bold">
              Prize Pool
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-400 font-black text-xl">
              {prizePool}
            </span>
            <span className="text-lg">🪙</span>
          </div>
        </div>
      </div>
    </div>
  );
};
