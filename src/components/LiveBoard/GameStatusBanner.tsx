// components/LiveBoard/GameStatusBanner.tsx - Compact version
import React from 'react';

interface GameStatusBannerProps {
  status: string;
  gameEnded: boolean;
  inCheck: boolean;
}

const GameStatusBanner: React.FC<GameStatusBannerProps> = ({
  status,
  gameEnded,
  inCheck,
}) => {
  const getStatusIcon = () => {
    if (gameEnded) return '🏁';
    if (inCheck) return '⚠️';
    return '⚔️';
  };

  const getStatusStyles = () => {
    if (gameEnded) {
      return 'from-red-500/20 to-orange-500/20 border-red-500/30';
    }
    if (inCheck) {
      return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    }
    return 'from-blue-500/20 to-purple-500/20 border-blue-500/30';
  };

  return (
    <div
      className={`bg-gradient-to-r ${getStatusStyles()} backdrop-blur-sm rounded-lg px-4 py-2 border shadow-lg inline-block`}
    >
      <p className="text-sm sm:text-base font-bold text-white flex items-center justify-center gap-2">
        {getStatusIcon()}
        {status}
        {!gameEnded && <span className="animate-pulse">|</span>}
      </p>
    </div>
  );
};

export default GameStatusBanner;
