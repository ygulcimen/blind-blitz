// components/LivePhase/WarStatus.tsx
import React from 'react';
import { AlertTriangle, Flag, Swords } from 'lucide-react';

interface WarStatusProps {
  game: any;
  gameEnded: boolean;
}

export const WarStatus: React.FC<WarStatusProps> = ({ game, gameEnded }) => {
  return (
    <div
      className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 backdrop-blur-xl transition-all duration-300 ${
        game?.inCheck()
          ? 'bg-red-900/40 border-red-400/50 animate-pulse shadow-lg shadow-red-500/25'
          : gameEnded
          ? 'bg-green-900/40 border-green-500/50 shadow-lg shadow-green-500/25'
          : 'bg-gray-900/40 border-gray-600/50'
      }`}
    >
      {game?.inCheck() ? (
        <>
          <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
          <span className="text-red-400 font-black text-lg">UNDER SIEGE!</span>
          <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
        </>
      ) : gameEnded ? (
        <>
          <Flag className="w-6 h-6 text-green-400" />
          <span className="text-green-400 font-black text-lg">
            BATTLEFIELD SILENT
          </span>
          <Flag className="w-6 h-6 text-green-400" />
        </>
      ) : (
        <>
          <Swords className="w-6 h-6 text-red-400" />
          <span className="text-red-400 font-black text-lg">
            ⚡ LIVE WARFARE ⚡
          </span>
          <Swords className="w-6 h-6 text-red-400" />
        </>
      )}
    </div>
  );
};
