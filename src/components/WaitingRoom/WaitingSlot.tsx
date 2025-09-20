// components/WaitingRoom/WaitingSlot.tsx
import React from 'react';

export const WaitingSlot: React.FC = () => {
  return (
    <div className="relative group">
      <div className="relative bg-gradient-to-br from-slate-800/30 to-slate-900/50 backdrop-blur-sm border-2 border-dashed border-slate-600/50 rounded-2xl p-6 w-64 transition-all duration-300 shadow-xl">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-slate-400 text-2xl">👤</span>
            </div>
          </div>
          <h3 className="text-lg font-black mb-2 tracking-wide text-slate-400">
            Waiting for opponent...
          </h3>
          <div className="text-slate-500 text-sm">Share room to invite</div>
        </div>
      </div>
    </div>
  );
};
