// components/BlindPhase/components/BlindPhaseHeader.tsx
import React from 'react';
import { EyeOff } from 'lucide-react';

interface BlindPhaseHeaderProps {
  timer: {
    whiteTime: number;
    blackTime: number;
    duration: number;
  };
}

export const BlindPhaseHeader: React.FC<BlindPhaseHeaderProps> = ({
  timer,
}) => {
  const timeLeftMs = timer.whiteTime; // Both players have same time in simultaneous mode
  const timeLeft = Math.ceil(timeLeftMs / 1000);
  const percentage = (timeLeftMs / timer.duration) * 100;
  const isCritical = timeLeft <= 10;
  const isWarning = timeLeft <= 30 && timeLeft > 10;

  return (
    <div className="relative">
      <div
        className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-300 ${
          isCritical
            ? 'bg-red-500/40 animate-pulse'
            : isWarning
            ? 'bg-yellow-500/30'
            : 'bg-blue-500/20'
        }`}
      />

      <div
        className={`relative px-3 py-2 sm:px-8 sm:py-6 rounded-lg sm:rounded-2xl border sm:border-2 backdrop-blur-xl transition-all duration-300 ${
          isCritical
            ? 'bg-red-900/30 border-red-400/50'
            : isWarning
            ? 'bg-yellow-900/30 border-yellow-400/50'
            : 'bg-blue-900/30 border-blue-400/50'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative hidden sm:block">
            <div className={`text-4xl ${isCritical ? 'animate-bounce' : ''}`}>
              ⏱️
            </div>
          </div>

          <div className="flex-1 text-center">
            <div className="text-[10px] sm:text-sm font-bold text-white/80 uppercase tracking-wider sm:tracking-widest mb-0.5 sm:mb-1">
              BLIND PHASE
            </div>
            <div className="text-lg sm:text-3xl font-black text-white leading-none mb-1 sm:mb-2">
              {timeLeft}s
            </div>

            <div className="relative w-full h-1.5 sm:h-2 bg-black/50 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear ${
                  isCritical
                    ? 'bg-gradient-to-r from-red-400 to-red-600'
                    : isWarning
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <EyeOff
            className={`w-4 h-4 sm:w-6 sm:h-6 text-white ${
              isCritical ? 'animate-pulse' : ''
            }`}
          />
        </div>

        {isCritical && (
          <div className="mt-1 sm:mt-3 text-center text-red-300 text-[10px] sm:text-sm font-bold uppercase tracking-wide sm:tracking-wider animate-pulse">
            ⚡ FINAL MOMENTS! ⚡
          </div>
        )}
      </div>
    </div>
  );
};
