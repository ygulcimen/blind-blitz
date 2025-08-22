// EPIC Victory Modal - Truly Impressive
import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  LogOut,
  Coins,
  Trophy,
  Crown,
  Zap,
  Star,
} from 'lucide-react';

interface GameResult {
  type: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'abort';
  winner: 'white' | 'black' | 'draw';
  reason: string;
}

interface EnhancedWarEndModalProps {
  isOpen: boolean;
  gameResult: GameResult | null;
  onRematch: () => void;
  onLeave: () => void;
}

export const EnhancedWarEndModal: React.FC<EnhancedWarEndModalProps> = ({
  isOpen,
  gameResult,
  onRematch,
  onLeave,
}) => {
  const [showGoldExplosion, setShowGoldExplosion] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowCelebration(true), 200);
      setTimeout(() => setShowGoldExplosion(true), 600);
    } else {
      setShowCelebration(false);
      setShowGoldExplosion(false);
    }
  }, [isOpen]);

  if (!isOpen || !gameResult) return null;

  // Mock gold calculations
  const goldReward = gameResult.winner === 'draw' ? 50 : 200;
  const totalPot = 400;

  const getVictoryData = () => {
    switch (gameResult.type) {
      case 'checkmate':
        return {
          title: 'TOTAL DOMINATION!',
          subtitle: `${gameResult.winner.toUpperCase()} EMPIRE CONQUERS ALL`,
          icon: '👑',
          celebration: ['🏆', '⚡', '💎', '👑', '🌟'],
          gradient: 'from-yellow-400 via-orange-500 to-red-600',
          glow: 'shadow-yellow-500/50',
          particles: 'from-yellow-500/30 via-orange-500/30 to-red-500/30',
          border: 'border-yellow-500/70',
        };
      case 'timeout':
        return {
          title: 'TIME DOMINATION!',
          subtitle: `${gameResult.winner.toUpperCase()} STRIKES WITH LIGHTNING SPEED`,
          icon: '⏰',
          celebration: ['⚡', '🔥', '⏰', '💥', '🌟'],
          gradient: 'from-red-500 via-pink-500 to-purple-600',
          glow: 'shadow-red-500/50',
          particles: 'from-red-500/30 via-pink-500/30 to-purple-500/30',
          border: 'border-red-500/70',
        };
      case 'resignation':
        return {
          title: 'ENEMY SURRENDERS!',
          subtitle: `${gameResult.winner.toUpperCase()} ACHIEVES PSYCHOLOGICAL VICTORY`,
          icon: '🏳️',
          celebration: ['🏆', '👑', '⚡', '🎯', '🌟'],
          gradient: 'from-purple-500 via-indigo-500 to-blue-600',
          glow: 'shadow-purple-500/50',
          particles: 'from-purple-500/30 via-indigo-500/30 to-blue-500/30',
          border: 'border-purple-500/70',
        };
      default: // draw
        return {
          title: 'LEGENDARY STALEMATE!',
          subtitle: 'BOTH EMPIRES PROVE THEIR MIGHT',
          icon: '⚖️',
          celebration: ['🤝', '⚖️', '🌟', '💎', '🏆'],
          gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
          glow: 'shadow-cyan-500/50',
          particles: 'from-cyan-500/30 via-blue-500/30 to-indigo-500/30',
          border: 'border-cyan-500/70',
        };
    }
  };

  const victory = getVictoryData();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Compact Celebration Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {showCelebration &&
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${0.8 + Math.random() * 0.5}rem`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
              }}
            >
              {victory.celebration[i % victory.celebration.length]}
            </div>
          ))}
      </div>

      <div className="relative w-80 max-w-sm">
        {/* MEGA Victory Aura */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${victory.particles} rounded-3xl blur-2xl animate-pulse opacity-80`}
        />

        {/* Spinning Victory Ring */}
        <div className="absolute inset-0 rounded-3xl">
          <div
            className="absolute inset-0 rounded-3xl border-4 border-transparent bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-spin opacity-60"
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* Main Modal */}
        <div
          className={`relative bg-gray-900/95 border-2 ${
            victory.border
          } rounded-3xl shadow-2xl backdrop-blur-lg overflow-hidden transform ${
            showCelebration ? 'scale-100' : 'scale-95'
          } transition-all duration-500`}
        >
          {/* Compact Epic Header */}
          <div className="relative p-5 text-center">
            {/* Crown for Winners */}
            {gameResult.winner !== 'draw' && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <Crown className="w-5 h-5 text-yellow-400 animate-bounce" />
              </div>
            )}

            {/* Victory Icon */}
            <div className="relative inline-block mb-4">
              <div className="text-5xl animate-bounce">{victory.icon}</div>
              <div className="absolute inset-0 text-5xl animate-ping opacity-30">
                {victory.icon}
              </div>

              {/* Victory Sparkles */}
              {showCelebration && (
                <>
                  <Star className="absolute -top-1 -left-1 w-3 h-3 text-yellow-400 animate-spin" />
                  <Star
                    className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-spin"
                    style={{ animationDirection: 'reverse' }}
                  />
                </>
              )}
            </div>

            {/* Compact Title */}
            <h1
              className={`text-xl font-black mb-2 bg-gradient-to-r ${victory.gradient} bg-clip-text text-transparent animate-pulse tracking-wider`}
            >
              {victory.title}
            </h1>

            <h2 className="text-sm font-bold text-white mb-3 tracking-wide">
              {victory.subtitle}
            </h2>
          </div>

          {/* Compact Gold Section */}
          <div className="relative px-5 pb-5">
            {/* Simple Gold Rain */}
            {showGoldExplosion && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-lg animate-bounce opacity-80"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${Math.random() * 60}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '1.5s',
                    }}
                  >
                    💰
                  </div>
                ))}
              </div>
            )}

            {/* Compact Gold Box */}
            <div className="relative bg-gradient-to-br from-yellow-900/60 via-orange-900/60 to-yellow-900/60 border-2 border-yellow-500/80 rounded-xl p-4 shadow-xl mb-4">
              <div className="relative">
                {/* Gold Header */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Coins
                    className="w-5 h-5 text-yellow-400 animate-spin"
                    style={{ animationDuration: '2s' }}
                  />
                  <span className="text-lg font-black text-yellow-300">
                    GOLD REWARD!
                  </span>
                </div>

                {gameResult.winner === 'draw' ? (
                  <div className="text-center">
                    <div className="text-3xl font-black text-yellow-200 mb-1 animate-pulse">
                      +{goldReward} EACH
                    </div>
                    <div className="text-xs text-yellow-300">
                      Honor rewards for both warriors
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl font-black text-yellow-200 mb-1 animate-bounce">
                      +{goldReward} GOLD
                    </div>
                    <div className="text-sm text-yellow-300 font-bold">
                      From {totalPot} gold pot
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compact Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800/80 rounded-lg p-2 border border-gray-600/50 text-center">
                <div className="text-lg mb-1">
                  {gameResult.type === 'checkmate'
                    ? '⚔️'
                    : gameResult.type === 'timeout'
                    ? '⏰'
                    : gameResult.type === 'resignation'
                    ? '🏳️'
                    : '🤝'}
                </div>
                <div className="text-xs text-gray-400 font-bold">METHOD</div>
                <div className="text-white font-bold text-xs uppercase">
                  {gameResult.type.replace('_', ' ')}
                </div>
              </div>

              <div className="bg-gray-800/80 rounded-lg p-2 border border-gray-600/50 text-center">
                <div className="text-lg mb-1">
                  {gameResult.winner === 'draw' ? '⚖️' : '👑'}
                </div>
                <div className="text-xs text-gray-400 font-bold">WINNER</div>
                <div
                  className={`font-bold text-xs uppercase bg-gradient-to-r ${victory.gradient} bg-clip-text text-transparent`}
                >
                  {gameResult.winner === 'draw' ? 'BOTH' : gameResult.winner}
                </div>
              </div>
            </div>

            {/* Compact Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onRematch}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">REMATCH</span>
              </button>

              <button
                onClick={onLeave}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">LEAVE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
