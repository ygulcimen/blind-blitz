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
    <div className="mt-8">
      <div
        className={`bg-gradient-to-r ${getStatusStyles()} backdrop-blur-lg rounded-2xl px-8 py-4 border shadow-2xl inline-block`}
      >
        <p className="text-xl lg:text-2xl font-bold text-white flex items-center justify-center gap-3">
          {getStatusIcon()}
          {status}
          {!gameEnded && <span className="animate-pulse">|</span>}
        </p>
      </div>
    </div>
  );
};

export default GameStatusBanner;
