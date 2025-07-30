// components/GameEndModal.tsx
import { useState, useEffect } from 'react';

export interface GameResult {
  type: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'abort';
  winner?: 'white' | 'black' | 'draw';
  reason: string;
}

export interface BlindMoveStats {
  totalBlindMoves: number;
  whiteBlindMoves: number;
  blackBlindMoves: number;
}

interface GameEndModalProps {
  result: GameResult;
  blindMoveStats: BlindMoveStats;
  liveMoves: number;
  isVisible: boolean;
  onRematch: () => void;
  onLeaveTable: () => void;
}

const GameEndModal = ({
  result,
  blindMoveStats,
  liveMoves,
  isVisible,
  onRematch,
  onLeaveTable,
}: GameEndModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    'entering' | 'showing' | 'exiting'
  >('entering');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('entering');
      const timer1 = setTimeout(() => setAnimationPhase('showing'), 100);
      const timer2 = setTimeout(() => setShowConfetti(true), 500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setShowConfetti(false);
      setAnimationPhase('entering');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getResultConfig = () => {
    switch (result.type) {
      case 'checkmate':
        return {
          icon: '👑',
          title:
            result.winner === 'white' ? 'WHITE CONQUERS!' : 'BLACK DOMINATES!',
          subtitle: 'CHECKMATE VICTORY!',
          bgGradient: 'from-yellow-600 via-orange-500 to-red-600',
          textColor: 'text-yellow-100',
          accentColor: 'border-yellow-400',
          celebration: '🎆 LEGENDARY FINISH! 🎆',
        };

      case 'resignation':
        return {
          icon: '🏳️',
          title: result.winner === 'white' ? 'WHITE WINS!' : 'BLACK WINS!',
          subtitle: 'Victory by Resignation',
          bgGradient: 'from-blue-600 via-purple-500 to-pink-600',
          textColor: 'text-blue-100',
          accentColor: 'border-blue-400',
          celebration: '🎊 HONORABLE VICTORY! 🎊',
        };

      case 'timeout':
        return {
          icon: '⏰',
          title: result.winner === 'white' ? 'WHITE WINS!' : 'BLACK WINS!',
          subtitle: 'Victory on Time',
          bgGradient: 'from-red-600 via-orange-500 to-yellow-600',
          textColor: 'text-red-100',
          accentColor: 'border-red-400',
          celebration: '⚡ TIME PRESSURE VICTORY! ⚡',
        };

      case 'draw':
        return {
          icon: '🤝',
          title: 'EPIC DRAW!',
          subtitle: 'Honorable Battle',
          bgGradient: 'from-gray-600 via-slate-500 to-gray-600',
          textColor: 'text-gray-100',
          accentColor: 'border-gray-400',
          celebration: '⚔️ WARRIORS HONOR! ⚔️',
        };

      case 'abort':
        return {
          icon: '❌',
          title: 'GAME ABORTED',
          subtitle: 'Battle Cancelled',
          bgGradient: 'from-gray-600 via-red-500 to-gray-600',
          textColor: 'text-gray-100',
          accentColor: 'border-gray-400',
          celebration: '🚫 BATTLE CANCELLED! 🚫',
        };

      default:
        return {
          icon: '🎮',
          title: 'GAME OVER',
          subtitle: 'Battle Concluded',
          bgGradient: 'from-gray-600 via-slate-500 to-gray-600',
          textColor: 'text-gray-100',
          accentColor: 'border-gray-400',
          celebration: '🎯 BATTLE COMPLETE! 🎯',
        };
    }
  };

  const config = getResultConfig();

  const getEpicQuote = () => {
    switch (result.type) {
      case 'checkmate':
        return '"In the chaos of blind chess, legends are born"';
      case 'draw':
        return '"Two masters, perfectly matched in blind warfare"';
      case 'resignation':
        return '"Sometimes retreat is the path to wisdom"';
      case 'timeout':
        return '"Time conquers all, even the greatest strategies"';
      case 'abort':
        return '"Every battle teaches us something valuable"';
      default:
        return '"The art of war is in the mind, not the board"';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Animated Background Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          animationPhase === 'entering' ? 'bg-black/0' : 'bg-black/80'
        }`}
        onClick={onLeaveTable} // Click outside to leave
      />

      {/* Confetti Effect */}
      {showConfetti && result.type !== 'abort' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '🎊', '⭐', '💫', '✨'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Main Modal */}
      <div
        className={`relative bg-gradient-to-br ${
          config.bgGradient
        } rounded-2xl shadow-2xl border-4 ${
          config.accentColor
        } max-w-lg w-full transform transition-all duration-700 ${
          animationPhase === 'entering'
            ? 'scale-0 rotate-180 opacity-0'
            : 'scale-100 rotate-0 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking modal
      >
        {/* Glow Effect */}
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${config.bgGradient} rounded-2xl blur opacity-30 animate-pulse`}
        ></div>

        <div className="relative p-8 text-center">
          {/* Main Icon */}
          <div className="text-8xl mb-4 animate-bounce">{config.icon}</div>

          {/* Celebration Text */}
          <div
            className={`text-sm font-bold ${config.textColor} mb-2 animate-pulse`}
          >
            {config.celebration}
          </div>

          {/* Main Title */}
          <h1
            className={`text-4xl lg:text-5xl font-black ${config.textColor} mb-2 drop-shadow-lg`}
          >
            {config.title}
          </h1>

          {/* Subtitle */}
          <h2
            className={`text-xl lg:text-2xl font-bold ${config.textColor} opacity-90 mb-6`}
          >
            {config.subtitle}
          </h2>

          {/* Game Stats */}
          <div className="bg-black/20 backdrop-blur rounded-xl p-4 mb-6 border border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {blindMoveStats.totalBlindMoves}
                </div>
                <div className={`text-sm ${config.textColor} opacity-80`}>
                  Blind Moves
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {liveMoves}
                </div>
                <div className={`text-sm ${config.textColor} opacity-80`}>
                  Live Moves
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {blindMoveStats.totalBlindMoves + liveMoves}
                </div>
                <div className={`text-sm ${config.textColor} opacity-80`}>
                  Total Moves
                </div>
              </div>
            </div>

            {/* Blind Phase Breakdown */}
            {blindMoveStats.totalBlindMoves > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚪</span>
                    <span className={`${config.textColor} opacity-80`}>
                      {blindMoveStats.whiteBlindMoves} blind
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚫</span>
                    <span className={`${config.textColor} opacity-80`}>
                      {blindMoveStats.blackBlindMoves} blind
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRematch}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-green-400"
            >
              🔄 REMATCH
            </button>

            <button
              onClick={onLeaveTable}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-gray-500"
            >
              🚪 LEAVE TABLE
            </button>
          </div>

          {/* Epic Quote */}
          <div className={`mt-6 text-sm ${config.textColor} opacity-70 italic`}>
            {getEpicQuote()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
