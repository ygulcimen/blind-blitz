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
    <div className="text-center mb-12 max-w-6xl mx-auto">
      <div className="relative inline-block">
        <h1 className="text-5xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
          ⚡ LIVE BATTLE ⚡
        </h1>
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-red-500/20 blur-xl rounded-full"></div>
      </div>

      <div className="bg-black/30 backdrop-blur-lg rounded-2xl px-8 py-6 border border-white/10 shadow-2xl inline-block">
        <p className="text-2xl lg:text-3xl text-white font-bold mb-2">
          🔥 3+2 BLITZ FORMAT 🔥
        </p>
        <p className="text-lg text-amber-300 font-semibold">
          Every millisecond counts in this epic showdown!
        </p>
      </div>

      <GameStatusBanner
        status={status}
        gameEnded={gameEnded}
        inCheck={inCheck}
      />
    </div>
  );
};

export default GameHeader;
