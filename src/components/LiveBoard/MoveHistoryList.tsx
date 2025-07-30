import React from 'react';
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

  return (
    <div
      className={`bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📜 Move History
        </h3>
        <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
          {allMoves.length} turns
        </span>
      </div>

      <div
        className={`space-y-1 ${
          compact ? 'max-h-32' : 'max-h-64'
        } overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent`}
      >
        {allMoves.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            No moves yet
          </div>
        ) : (
          allMoves.map((move, index) => (
            <MoveHistoryRow
              key={index}
              turnNumber={index + 1}
              whiteMove={move.white}
              blackMove={move.black}
              isBlind={move.isBlind}
              whiteInvalid={move.whiteInvalid}
              blackInvalid={move.blackInvalid}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MoveHistoryList;
