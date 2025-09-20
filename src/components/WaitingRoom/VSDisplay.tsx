// components/WaitingRoom/VSDisplay.tsx
import React from 'react';

interface VSDisplayProps {
  prizePool: number;
}

export const VSDisplay: React.FC<VSDisplayProps> = ({ prizePool }) => {
  return (
    <div className="flex flex-col items-center z-20">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform animate-pulse">
          <span className="text-white font-black text-2xl drop-shadow-lg">
            VS
          </span>
        </div>
      </div>

      <div className="mt-5 bg-gradient-to-r from-yellow-900/90 to-amber-900/90 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-yellow-600/50 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-yellow-400 text-base">💰</span>
            <span className="text-yellow-200 text-xs uppercase tracking-wider font-bold">
              Prize Pool
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-400 font-black text-xl">
              {prizePool}
            </span>
            <span className="text-yellow-400 text-lg">🪙</span>
          </div>
        </div>
      </div>
    </div>
  );
};
