// components/AnimatedReveal/components/CleanMoveHistory.tsx
import React from 'react';
import { Scroll, Zap } from 'lucide-react';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
  moveNumber?: number;
}

interface CleanMoveHistoryProps {
  moveLog: MoveLogItem[];
  currentMoveIndex: number;
  totalMoves: number;
}

export const CleanMoveHistory: React.FC<CleanMoveHistoryProps> = ({
  moveLog,
  currentMoveIndex,
  totalMoves,
}) => {
  // Create move pairs for display
  const createMovePairs = () => {
    const p1Moves = moveLog.filter((m) => m.player === 'P1');
    const p2Moves = moveLog.filter((m) => m.player === 'P2');
    const pairs = [];
    const maxMoves = Math.max(p1Moves.length, p2Moves.length);

    for (let i = 0; i < maxMoves; i++) {
      pairs.push({
        moveNumber: i + 1,
        white: p1Moves[i] || null,
        black: p2Moves[i] || null,
        isCurrentPair: Math.floor(currentMoveIndex / 2) === i,
      });
    }
    return pairs;
  };

  const movePairs = createMovePairs();

  return (
    <div className="flex flex-col h-full">
      {/* Clean Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
          <Scroll className="w-5 h-5 text-orange-400" />
          <span>Move History</span>
        </h3>
        <div className="text-sm text-gray-400">{totalMoves} blind strikes</div>
      </div>

      {/* Move List - NO SCROLL, just show all */}
      <div className="flex-1 space-y-2">
        {movePairs.map((pair, index) => {
          const isHighlighted = pair.isCurrentPair && currentMoveIndex >= 0;

          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                isHighlighted
                  ? 'bg-gradient-to-r from-orange-900/60 to-red-900/60 border-orange-500/60 shadow-lg animate-pulse'
                  : 'bg-gray-800/40 border-gray-700/40 hover:bg-gray-800/60'
              }`}
            >
              {/* Move Number */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isHighlighted
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {pair.moveNumber}
                </div>
                {isHighlighted && (
                  <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                )}
              </div>

              {/* Moves - Clean Format */}
              <div className="flex gap-6 text-sm font-mono font-bold">
                {/* White Move */}
                <div className="w-12 text-center">
                  {pair.white ? (
                    <span
                      className={
                        pair.white.isInvalid
                          ? 'text-red-400 line-through'
                          : 'text-white'
                      }
                    >
                      {pair.white.san}
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>

                {/* Black Move */}
                <div className="w-12 text-center">
                  {pair.black ? (
                    <span
                      className={
                        pair.black.isInvalid
                          ? 'text-red-400 line-through'
                          : 'text-gray-300'
                      }
                    >
                      {pair.black.san}
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NO FOOTER - Removed Battle Analysis and other labels */}
    </div>
  );
};
