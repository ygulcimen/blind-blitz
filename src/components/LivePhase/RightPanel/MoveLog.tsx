import React, { useEffect, useRef } from 'react';
import { Card } from '../../ui/card';
import type { LiveMove } from '../../../services/liveMovesService';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
  moveNumber?: number;
}

interface MoveLogProps {
  liveMoves: LiveMove[];
  blindMoves: MoveLogItem[];
  className?: string;
}

export const MoveLog: React.FC<MoveLogProps> = ({
  liveMoves,
  blindMoves,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new moves are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveMoves.length]);

  // Combine blind moves and live moves into a unified format
  const allMoves = React.useMemo(() => {
    const moves: Array<{
      moveNumber: number;
      white?: string;
      black?: string;
      isBlindPhase?: boolean;
      whiteInvalid?: boolean;
      blackInvalid?: boolean;
    }> = [];

    // Process blind moves first
    const blindMovePairs = new Map<number, { white?: string; black?: string; whiteInvalid?: boolean; blackInvalid?: boolean }>();

    blindMoves.forEach(move => {
      const moveNum = move.moveNumber || Math.ceil((blindMoves.indexOf(move) + 1) / 2);
      if (!blindMovePairs.has(moveNum)) {
        blindMovePairs.set(moveNum, {});
      }
      const pair = blindMovePairs.get(moveNum)!;

      if (move.player === 'P1') {
        pair.white = move.san;
        pair.whiteInvalid = move.isInvalid;
      } else {
        pair.black = move.san;
        pair.blackInvalid = move.isInvalid;
      }
    });

    // Add blind moves to the list
    blindMovePairs.forEach((pair, moveNum) => {
      moves.push({
        moveNumber: moveNum,
        white: pair.white,
        black: pair.black,
        isBlindPhase: true,
        whiteInvalid: pair.whiteInvalid,
        blackInvalid: pair.blackInvalid,
      });
    });

    // Process live moves
    const liveMovePairs = new Map<number, { white?: string; black?: string }>();

    liveMoves.forEach((move, index) => {
      const moveNum = Math.ceil((index + 1) / 2) + blindMovePairs.size;
      if (!liveMovePairs.has(moveNum)) {
        liveMovePairs.set(moveNum, {});
      }
      const pair = liveMovePairs.get(moveNum)!;

      if (index % 2 === 0) {
        pair.white = move.move_san;
      } else {
        pair.black = move.move_san;
      }
    });

    // Add live moves to the list
    liveMovePairs.forEach((pair, moveNum) => {
      moves.push({
        moveNumber: moveNum,
        white: pair.white,
        black: pair.black,
        isBlindPhase: false,
      });
    });

    return moves.sort((a, b) => a.moveNumber - b.moveNumber);
  }, [liveMoves, blindMoves]);

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b border-gray-600">
        <h3 className="text-sm font-semibold text-white">📝 Move History</h3>
      </div>

      <div
        ref={scrollRef}
        className="max-h-96 overflow-y-auto p-2"
      >
        {allMoves.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No moves yet...
          </div>
        ) : (
          <>
            {/* Blind Phase Section */}
            {allMoves.some(move => move.isBlindPhase) && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                    Blind Phase ({allMoves.filter(move => move.isBlindPhase).length} moves)
                  </h4>
                  <div className="flex-1 h-px bg-purple-400/30"></div>
                </div>
                <div className="space-y-1">
                  {allMoves
                    .filter(move => move.isBlindPhase)
                    .map((move) => (
                      <div
                        key={`blind-${move.moveNumber}`}
                        className="flex items-center gap-2 p-2 rounded text-sm bg-purple-900/20 border border-purple-500/20"
                      >
                        {/* Move Number */}
                        <span className="text-purple-400 w-8 text-right font-mono text-xs">
                          {move.moveNumber}.
                        </span>

                        {/* White Move */}
                        <div className="flex-1">
                          {move.white ? (
                            <span className={`font-mono text-xs ${
                              move.whiteInvalid ? 'text-red-300 line-through' : 'text-purple-200'
                            }`}>
                              {move.white}
                            </span>
                          ) : (
                            <span className="text-purple-500 text-xs">—</span>
                          )}
                        </div>

                        {/* Black Move */}
                        <div className="flex-1">
                          {move.black ? (
                            <span className={`font-mono text-xs ${
                              move.blackInvalid ? 'text-red-300 line-through' : 'text-purple-200'
                            }`}>
                              {move.black}
                            </span>
                          ) : (
                            <span className="text-purple-500 text-xs">—</span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Live Combat Section */}
            {allMoves.some(move => !move.isBlindPhase) && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
                    Live Combat ({allMoves.filter(move => !move.isBlindPhase).length} moves)
                  </h4>
                  <div className="flex-1 h-px bg-blue-400/30"></div>
                </div>
                <div className="space-y-1">
                  {allMoves
                    .filter(move => !move.isBlindPhase)
                    .map((move) => (
                      <div
                        key={`live-${move.moveNumber}`}
                        className="flex items-center gap-2 p-2 rounded text-sm bg-blue-900/30 border border-blue-400/30 shadow-sm"
                      >
                        {/* Move Number */}
                        <span className="text-blue-300 w-8 text-right font-mono text-sm font-medium">
                          {move.moveNumber}.
                        </span>

                        {/* White Move */}
                        <div className="flex-1">
                          {move.white ? (
                            <span className="font-mono text-sm text-white font-medium">
                              {move.white}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </div>

                        {/* Black Move */}
                        <div className="flex-1">
                          {move.black ? (
                            <span className="font-mono text-sm text-white font-medium">
                              {move.black}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};