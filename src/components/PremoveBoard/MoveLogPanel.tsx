import type { BlindSequence } from '../../types/BlindTypes';

interface MoveLogPanelProps {
  moves: BlindSequence;
  maxMoves: number;
  moveSummary: {
    totalMoves: number;
    totalPiecesMoved: number;
    exhaustedPieces: number;
  };
}

const MoveLogPanel = ({ moves, maxMoves, moveSummary }: MoveLogPanelProps) => {
  const remainingMoves = maxMoves - moveSummary.totalMoves;
  const progressPercentage = (moveSummary.totalMoves / maxMoves) * 100;

  return (
    <div
      className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur 
                    rounded-xl shadow-2xl w-full px-4 sm:px-5 lg:px-6 py-4 lg:py-5 
                    text-xs sm:text-sm font-mono border border-gray-700/50
                    min-w-[280px] lg:min-w-[320px] max-w-[400px]"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xl sm:text-2xl">🎯</span>
        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Attack Sequence
        </h3>
      </div>

      {/* Enhanced progress section */}
      <div className="mb-4 lg:mb-5 space-y-3">
        <div className="flex justify-between text-xs text-gray-400">
          <span className="font-medium">Battle Progress</span>
          <span
            className={`font-bold text-sm ${
              remainingMoves === 0
                ? 'text-red-400'
                : remainingMoves <= 1
                ? 'text-yellow-400'
                : 'text-green-400'
            }`}
          >
            {moveSummary.totalMoves}/{maxMoves}
          </span>
        </div>

        <div className="relative w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out relative ${
              remainingMoves === 0
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : remainingMoves <= 1
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {progressPercentage === 100 && (
          <div className="text-center text-green-400 font-bold text-xs animate-bounce">
            🚀 Ready to launch!
          </div>
        )}
      </div>

      {/* Simplified move list - just # and Move */}
      <div className="space-y-2">
        <div className="flex justify-between text-gray-400 mb-3 px-2 text-xs font-semibold border-b border-gray-700 pb-2">
          <span>Move #</span>
          <span>Your Move</span>
        </div>

        {Array.from({ length: maxMoves }).map((_, i) => {
          const move = moves[i];
          const isActive = i < moves.length;
          const isCurrent = i === moves.length - 1;

          return (
            <div
              key={i}
              className={`
                flex justify-between items-center border border-gray-700/50 rounded-lg py-3 px-3 text-sm
                transition-all duration-300 transform
                ${
                  isActive
                    ? isCurrent
                      ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-600/50 shadow-lg scale-[1.02]'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                    : 'bg-gray-900/30 opacity-60'
                }
              `}
            >
              <span
                className={`font-bold text-lg ${
                  isActive ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                {i + 1}
              </span>

              <span
                className={`font-bold text-lg ${
                  isActive
                    ? isCurrent
                      ? 'text-blue-300'
                      : 'text-gray-200'
                    : 'text-gray-500'
                }`}
              >
                {move?.san ?? '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Enhanced statistics */}
      <div className="mt-4 lg:mt-5 pt-3 lg:pt-4 border-t border-gray-700/50 space-y-2">
        <div className="grid grid-cols-2 gap-3 lg:gap-4 text-xs">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-gray-400 text-xs">Pieces Moved</div>
            <div className="text-blue-400 font-bold text-base lg:text-lg">
              {moveSummary.totalPiecesMoved}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-gray-400 text-xs">Exhausted</div>
            <div className="text-red-400 font-bold text-base lg:text-lg">
              {moveSummary.exhaustedPieces}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-gray-400 text-xs">Moves Remaining</div>
          <div
            className={`font-bold text-xl lg:text-2xl ${
              remainingMoves === 0
                ? 'text-red-400'
                : remainingMoves <= 1
                ? 'text-yellow-400'
                : 'text-green-400'
            }`}
          >
            {remainingMoves}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveLogPanel;
