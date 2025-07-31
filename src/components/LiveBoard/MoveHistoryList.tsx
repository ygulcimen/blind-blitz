// components/LiveBoard/MoveHistoryList.tsx - Responsive sizing
import React, { useEffect, useRef } from 'react';
import MoveHistoryRow from './MoveHistoryRow';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
}

interface MoveHistoryListProps {
  whiteMoves: MoveLogItem[];
  blackMoves: MoveLogItem[];
  liveMoveHistory: string[];
  compact?: boolean;
}

const MoveHistoryList: React.FC<MoveHistoryListProps> = ({
  whiteMoves,
  blackMoves,
  liveMoveHistory,
  compact = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Combine blind moves and live moves into a single list
  const allMoves = (() => {
    const moves: Array<{
      white?: string;
      black?: string;
      isBlind: boolean;
      whiteInvalid?: boolean;
      blackInvalid?: boolean;
    }> = [];

    // Add blind moves
    const maxBlindTurns = Math.max(whiteMoves.length, blackMoves.length);
    for (let i = 0; i < maxBlindTurns; i++) {
      moves.push({
        white: whiteMoves[i]?.san,
        black: blackMoves[i]?.san,
        isBlind: true,
        whiteInvalid: whiteMoves[i]?.isInvalid,
        blackInvalid: blackMoves[i]?.isInvalid,
      });
    }

    // Add live moves (pairs of SAN strings)
    for (let i = 0; i < liveMoveHistory.length; i += 2) {
      moves.push({
        white: liveMoveHistory[i],
        black: liveMoveHistory[i + 1],
        isBlind: false,
        whiteInvalid: false,
        blackInvalid: false,
      });
    }

    return moves;
  })();

  // Auto-scroll to bottom when new moves are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMoves.length]);

  // Calculate statistics
  const blindMovesCount = allMoves.filter((move) => move.isBlind).length;
  const liveMovesCount = allMoves.filter((move) => !move.isBlind).length;
  const invalidMovesCount = allMoves.filter(
    (move) => move.whiteInvalid || move.blackInvalid
  ).length;

  return (
    <div
      className={`bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl 
        ${compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'}`}
    >
      {/* Compact header */}
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

        {/* Compact statistics bar */}
        {(blindMovesCount > 0 || liveMovesCount > 0) && (
          <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-xs">
            {blindMovesCount > 0 && (
              <div className="bg-amber-900/30 border border-amber-600/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                <span className="text-amber-400">🕶️ {blindMovesCount}</span>
              </div>
            )}
            {liveMovesCount > 0 && (
              <div className="bg-green-900/30 border border-green-600/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                <span className="text-green-400">⚡ {liveMovesCount}</span>
              </div>
            )}
            {invalidMovesCount > 0 && (
              <div className="bg-red-900/30 border border-red-600/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                <span className="text-red-400">❌ {invalidMovesCount}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responsive move list */}
      <div
        ref={scrollRef}
        className={`space-y-0.5 sm:space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
          ${
            compact
              ? 'max-h-24 sm:max-h-32 lg:max-h-40'
              : 'max-h-40 sm:max-h-48 lg:max-h-64 xl:max-h-80'
          }`}
      >
        {allMoves.length === 0 ? (
          <div className="text-center py-3 sm:py-4 text-gray-400">
            <div className="text-gray-500 text-lg sm:text-2xl mb-1 sm:mb-2">
              🎯
            </div>
            <div className="text-gray-400 text-xs sm:text-sm font-medium">
              No moves yet
            </div>
            <div className="text-gray-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
              The battle begins...
            </div>
          </div>
        ) : (
          allMoves.map((move, index) => {
            const isLastMove = index === allMoves.length - 1;

            return (
              <MoveHistoryRow
                key={index}
                turnNumber={index + 1}
                whiteMove={move.white}
                blackMove={move.black}
                isBlind={move.isBlind}
                whiteInvalid={move.whiteInvalid}
                blackInvalid={move.blackInvalid}
                isLastMove={isLastMove}
              />
            );
          })
        )}
      </div>

      {/* Compact footer */}
      {allMoves.length > 0 && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Battle in progress</span>
            </div>
            <div className="text-gray-500 truncate max-w-[80px] sm:max-w-none">
              Latest:{' '}
              {allMoves[allMoves.length - 1]?.white ||
                allMoves[allMoves.length - 1]?.black ||
                '—'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoveHistoryList;
