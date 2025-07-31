// components/LiveBoard/GameHeader.tsx - Responsive & Compact
import React from 'react';
import GameStatusBanner from './GameStatusBanner';

interface GameHeaderProps {
  status: string;
  gameEnded: boolean;
  inCheck: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  status,
  gameEnded,
  inCheck,
}) => {
  return (
    <div className="text-center mb-4 lg:mb-6 max-w-4xl mx-auto">
      {/* Much smaller, more balanced header */}
      <div className="relative inline-block mb-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          ⚡ LIVE BATTLE ⚡
        </h1>
      </div>

      {/* Compact format info */}
      <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10 shadow-lg inline-block mb-3">
        <p className="text-sm sm:text-base lg:text-lg text-white font-bold">
          🔥 3+2 BLITZ 🔥
        </p>
      </div>

      {/* Compact status banner */}
      <GameStatusBanner
        status={status}
        gameEnded={gameEnded}
        inCheck={inCheck}
      />
    </div>
  );
};

export default GameHeader;
