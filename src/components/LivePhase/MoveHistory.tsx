// components/LivePhase/MoveHistory.tsx
import React from 'react';

interface MoveHistoryProps {
  blindMoves: any[]; // Your BlindSequence type
  liveMoves: string[];
  compact?: boolean;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({
  blindMoves,
  liveMoves,
  compact = false,
}) => {
  // Combine moves for display
  const allMoves = [];

  // Add blind moves (simplified)
  const blindMoveCount = Math.ceil(blindMoves.length / 2);
  for (let i = 0; i < blindMoveCount; i++) {
    allMoves.push({
      white: blindMoves[i * 2]?.san || '—',
      black: blindMoves[i * 2 + 1]?.san || '—',
      isBlind: true,
    });
  }

  // Add live moves
  for (let i = 0; i < liveMoves.length; i += 2) {
    allMoves.push({
      white: liveMoves[i] || '—',
      black: liveMoves[i + 1] || '—',
      isBlind: false,
    });
  }

  return (
    <div
      className={`bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl 
        ${compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'}`}
    >
      {/* Header */}
      <div className="mb-2 sm:mb-3">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h3
            className={`font-bold text-white flex items-center gap-1 sm:gap-2
            ${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}
          >
            📜 Move History
          </h3>
          <span className="text-xs text-gray-400 bg-gray-800/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
            {allMoves.length} turns
          </span>
        </div>
      </div>

      {/* Move List */}
      <div
        className={`space-y-0.5 sm:space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
          ${compact ? 'max-h-32' : 'max-h-64'}`}
      >
        {allMoves.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm">No moves yet</div>
          </div>
        ) : (
          allMoves.map((move, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 py-1 px-3 rounded-lg transition-all duration-300
                ${
                  move.isBlind
                    ? 'bg-amber-100/20 border border-amber-300/30'
                    : 'bg-gray-800/30'
                }
              `}
            >
              {/* Turn number */}
              <span className="text-xs font-mono min-w-[20px] font-bold text-gray-400">
                {index + 1}.
              </span>

              {/* White move */}
              <div className="flex-1 flex items-center gap-1">
                <span className="text-xs">⚪</span>
                {move.isBlind && (
                  <span className="text-amber-400 text-sm">🕶️</span>
                )}
                <span
                  className={`text-sm ${
                    move.isBlind ? 'text-amber-500 italic' : 'text-white'
                  }`}
                >
                  {move.white}
                </span>
              </div>

              {/* Black move */}
              <div className="flex-1 flex items-center gap-1">
                <span className="text-xs">⚫</span>
                {move.isBlind && (
                  <span className="text-amber-400 text-sm">🕶️</span>
                )}
                <span
                  className={`text-sm ${
                    move.isBlind ? 'text-amber-500 italic' : 'text-white'
                  }`}
                >
                  {move.black}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
