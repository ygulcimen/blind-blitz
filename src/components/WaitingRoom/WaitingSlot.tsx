// components/WaitingRoom/WaitingSlot.tsx
import React from 'react';

export const WaitingSlot: React.FC = () => {
  return (
    <div className="relative group">
      <div className="relative bg-gradient-to-br from-slate-800/30 to-slate-900/50 backdrop-blur-sm border-2 border-dashed border-slate-600/50 rounded-2xl p-3 sm:p-5 md:p-6 w-full max-w-[240px] sm:w-60 md:w-72 transition-all duration-300 shadow-xl">
        <div className="text-center mb-3 sm:mb-5">
          <div className="relative inline-block mb-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-slate-700/50 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-slate-400 text-lg sm:text-2xl md:text-3xl">👤</span>
            </div>
          </div>
          <h3 className="text-sm sm:text-lg md:text-xl font-black mb-1 sm:mb-2 tracking-wide text-slate-400">
            Waiting for opponent...
          </h3>
          <div className="text-slate-500 text-xs sm:text-sm">Share room to invite</div>
        </div>
      </div>
    </div>
  );
};
