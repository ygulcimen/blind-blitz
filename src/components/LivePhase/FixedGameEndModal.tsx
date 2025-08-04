// components/LivePhase/FixedGameEndModal.tsx
import React from 'react';

interface GameResult {
  type: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'abort';
  winner: 'white' | 'black' | 'draw';
  reason: string;
}

interface FixedGameEndModalProps {
  result: GameResult;
  onRematch: () => void;
  onLeaveTable: () => void;
  gameHistory: any;
  isVisible: boolean;
}

const FixedGameEndModal: React.FC<FixedGameEndModalProps> = ({
  result,
  onRematch,
  onLeaveTable,
  gameHistory,
  isVisible,
}) => {
  if (!isVisible) return null;

  // ─────────────────────────────────────────────────────────────
  // 🎨 RESULT STYLING
  // ─────────────────────────────────────────────────────────────

  const getResultInfo = () => {
    switch (result.type) {
      case 'checkmate':
        return {
          icon: '👑',
          title: 'CHECKMATE!',
          subtitle: `${
            result.winner === 'white' ? 'White' : 'Black'
          } wins by checkmate`,
          bgGradient: 'from-yellow-600/20 via-orange-600/20 to-red-600/20',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-300',
        };
      case 'timeout':
        return {
          icon: '⏰',
          title: 'TIME OUT!',
          subtitle: `${
            result.winner === 'white' ? 'White' : 'Black'
          } wins on time`,
          bgGradient: 'from-red-600/20 via-orange-600/20 to-yellow-600/20',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-300',
        };
      case 'resignation':
        return {
          icon: '🏳️',
          title: 'RESIGNATION',
          subtitle: `${
            result.winner === 'white' ? 'White' : 'Black'
          } wins by resignation`,
          bgGradient: 'from-blue-600/20 via-purple-600/20 to-pink-600/20',
          borderColor: 'border-blue-500/50',
          textColor: 'text-blue-300',
        };
      case 'draw':
        return {
          icon: '🤝',
          title: 'DRAW',
          subtitle:
            result.reason === 'agreement'
              ? 'Draw by agreement'
              : 'Draw by stalemate',
          bgGradient: 'from-gray-600/20 via-slate-600/20 to-zinc-600/20',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-300',
        };
      default:
        return {
          icon: '⏹️',
          title: 'GAME ABORTED',
          subtitle: 'Game was aborted',
          bgGradient: 'from-gray-600/20 via-slate-600/20 to-zinc-600/20',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-300',
        };
    }
  };

  const resultInfo = getResultInfo();

  // ─────────────────────────────────────────────────────────────
  // 📊 GAME STATISTICS
  // ─────────────────────────────────────────────────────────────

  const getGameStats = () => {
    const { blindPhaseData, livePhaseData } = gameHistory;

    const blindStats = {
      totalBlind: blindPhaseData.revealLog.length,
      validBlind: blindPhaseData.revealLog.filter((m: any) => !m.isInvalid)
        .length,
      whiteBlind: blindPhaseData.p1BlindMoves.length,
      blackBlind: blindPhaseData.p2BlindMoves.length,
    };

    const liveStats = {
      totalLive: livePhaseData.moves.length,
      whiteLive: Math.ceil(livePhaseData.moves.length / 2),
      blackLive: Math.floor(livePhaseData.moves.length / 2),
    };

    return { blindStats, liveStats };
  };

  const { blindStats, liveStats } = getGameStats();

  // ─────────────────────────────────────────────────────────────
  // 🎬 RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`
        bg-gradient-to-br ${resultInfo.bgGradient} backdrop-blur-xl rounded-3xl 
        shadow-2xl border ${resultInfo.borderColor} max-w-2xl w-full max-h-[90vh] overflow-y-auto
      `}
      >
        {/* Header */}
        <div className="text-center p-8 border-b border-white/10">
          <div className="text-8xl mb-4 animate-bounce">{resultInfo.icon}</div>
          <h1
            className={`text-4xl lg:text-5xl font-black mb-3 ${resultInfo.textColor}`}
          >
            {resultInfo.title}
          </h1>
          <p className="text-xl lg:text-2xl text-white font-semibold">
            {resultInfo.subtitle}
          </p>
        </div>

        {/* Game Statistics */}
        <div className="p-6 space-y-6">
          {/* Blind Phase Stats */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-xl">👁️‍🗨️</span>
              Blind Phase Performance
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">⚪ White moves:</span>
                  <span className="text-white font-bold">
                    {blindStats.whiteBlind}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">⚫ Black moves:</span>
                  <span className="text-white font-bold">
                    {blindStats.blackBlind}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total submitted:</span>
                  <span className="text-white font-bold">
                    {blindStats.whiteBlind + blindStats.blackBlind}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">✅ Valid moves:</span>
                  <span className="text-green-400 font-bold">
                    {blindStats.validBlind}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">❌ Invalid moves:</span>
                  <span className="text-red-400 font-bold">
                    {blindStats.totalBlind - blindStats.validBlind}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">📊 Accuracy:</span>
                  <span className="text-yellow-400 font-bold">
                    {blindStats.totalBlind > 0
                      ? Math.round(
                          (blindStats.validBlind / blindStats.totalBlind) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Phase Stats */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-xl">⚡</span>
              Live Phase Summary
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {liveStats.totalLive}
                </div>
                <div className="text-sm text-gray-400">Total moves</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {liveStats.whiteLive}
                </div>
                <div className="text-sm text-gray-400">⚪ White</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {liveStats.blackLive}
                </div>
                <div className="text-sm text-gray-400">⚫ Black</div>
              </div>
            </div>
          </div>

          {/* Overall Game Summary */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/30">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Game Summary
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total game moves:</span>
                  <span className="text-white font-bold">
                    {blindStats.totalBlind + liveStats.totalLive}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Blind phase:</span>
                  <span className="text-blue-300 font-bold">
                    {blindStats.totalBlind}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">Live phase:</span>
                  <span className="text-green-300 font-bold">
                    {liveStats.totalLive}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Game result:</span>
                  <span className={`font-bold ${resultInfo.textColor}`}>
                    {result.winner === 'draw'
                      ? 'Draw'
                      : `${result.winner === 'white' ? 'White' : 'Black'} wins`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win method:</span>
                  <span className="text-white font-bold capitalize">
                    {result.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Blind accuracy:</span>
                  <span className="text-yellow-400 font-bold">
                    {blindStats.totalBlind > 0
                      ? Math.round(
                          (blindStats.validBlind / blindStats.totalBlind) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-4 justify-center">
            <button
              onClick={onRematch}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500
                       text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 
                       transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/30
                       flex items-center gap-3 text-lg"
            >
              <span className="text-2xl">🔄</span>
              Play Again
            </button>

            <button
              onClick={onLeaveTable}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600
                       text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 
                       transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-gray-500/30
                       flex items-center gap-3 text-lg"
            >
              <span className="text-2xl">🚪</span>
              Leave Game
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Great game! Thanks for playing BlindChess Battle! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedGameEndModal;
