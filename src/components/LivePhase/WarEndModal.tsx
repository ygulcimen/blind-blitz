// components/LivePhase/WarEndModal.tsx
import React from 'react';
import { RotateCcw, LogOut } from 'lucide-react';

interface GameResult {
  type: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'abort';
  winner: 'white' | 'black' | 'draw';
  reason: string;
}

interface WarEndModalProps {
  isOpen: boolean;
  gameResult: GameResult | null;
  onRematch: () => void;
  onLeave: () => void;
}

export const WarEndModal: React.FC<WarEndModalProps> = ({
  isOpen,
  gameResult,
  onRematch,
  onLeave,
}) => {
  if (!isOpen || !gameResult) return null;

  const getResultInfo = () => {
    switch (gameResult.type) {
      case 'checkmate':
        return {
          title: 'TOTAL DOMINATION!',
          message: `${gameResult.winner.toUpperCase()} achieves victory through superior warfare!`,
          icon: '👑',
          color: 'text-yellow-400',
          bgGradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
        };
      case 'timeout':
        return {
          title: 'TIME CONQUEST!',
          message: `${gameResult.winner.toUpperCase()} wins as time expires on the battlefield!`,
          icon: '⏰',
          color: 'text-red-400',
          bgGradient: 'from-red-500/20 via-orange-500/20 to-yellow-500/20',
        };
      case 'resignation':
        return {
          title: 'ENEMY SURRENDERS!',
          message: `${gameResult.winner.toUpperCase()} emerges victorious as the opponent flees!`,
          icon: '🏳️',
          color: 'text-gray-400',
          bgGradient: 'from-gray-500/20 via-slate-500/20 to-gray-500/20',
        };
      case 'draw':
        return {
          title: 'HONORABLE STALEMATE!',
          message: 'Both warriors fought valiantly to an epic draw!',
          icon: '⚖️',
          color: 'text-blue-400',
          bgGradient: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20',
        };
      default:
        return {
          title: 'WAR COMPLETE',
          message: 'The battlefield falls silent!',
          icon: '🏁',
          color: 'text-white',
          bgGradient: 'from-purple-500/20 via-blue-500/20 to-purple-500/20',
        };
    }
  };

  const resultInfo = getResultInfo();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* Epic victory glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${resultInfo.bgGradient} rounded-2xl blur-xl animate-pulse`}
        />

        <div className="relative bg-gray-900/90 border border-gray-700 rounded-2xl shadow-2xl backdrop-blur-sm p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            {/* Epic animated icon */}
            <div className="relative">
              <div className="text-8xl mb-4 animate-bounce">
                {resultInfo.icon}
              </div>
              {gameResult.type === 'checkmate' && (
                <div className="absolute inset-0 text-8xl animate-ping opacity-30">
                  {resultInfo.icon}
                </div>
              )}
            </div>

            <h2
              className={`text-3xl font-black mb-4 ${resultInfo.color} animate-pulse`}
            >
              {resultInfo.title}
            </h2>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              {resultInfo.message}
            </p>

            {/* Battle Summary */}
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wider">
                War Result
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className={`${resultInfo.color} font-black`}>
                  {gameResult.type.toUpperCase()}
                </span>
                {gameResult.winner !== 'draw' && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-white font-bold">
                      {gameResult.winner.toUpperCase()} VICTORIOUS
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onRematch}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
            >
              <RotateCcw className="w-5 h-5" />
              <span>New War</span>
            </button>
            <button
              onClick={onLeave}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Leave Battlefield</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
