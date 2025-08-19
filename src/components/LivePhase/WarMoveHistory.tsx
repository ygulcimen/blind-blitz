// components/LivePhase/WarMoveHistory.tsx - FIXED LIKE OLD VERSION
import React from 'react';
import { Swords } from 'lucide-react';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
}

interface WarMoveHistoryProps {
  liveMoves: string[];
  blindMoves: MoveLogItem[];
}

export const WarMoveHistory: React.FC<WarMoveHistoryProps> = ({
  liveMoves,
  blindMoves,
}) => {
  // ─────────────────────────────────────────────────────────────
  // 📊 PROCESS BLIND PHASE MOVES - SAME AS OLD VERSION
  // ─────────────────────────────────────────────────────────────

  const processBlindMoves = () => {
    const pairs: Array<{
      number: number;
      white: { san: string; isValid: boolean } | null;
      black: { san: string; isValid: boolean } | null;
      isBlindPhase: boolean;
    }> = [];
    let moveNumber = 1;

    // Group moves by move number (each pair of P1->P2 or just P1)
    const groupedMoves: {
      [key: number]: {
        white?: { san: string; isValid: boolean };
        black?: { san: string; isValid: boolean };
      };
    } = {};

    blindMoves.forEach((move) => {
      const currentMoveNum = moveNumber;

      if (move.player === 'P1') {
        // P1 = White player
        if (!groupedMoves[currentMoveNum]) {
          groupedMoves[currentMoveNum] = {};
        }
        groupedMoves[currentMoveNum].white = {
          san: move.san,
          isValid: !move.isInvalid,
        };
      } else {
        // P2 = Black player
        // Find the most recent move number that has a white move but no black move
        let targetMoveNum = currentMoveNum;
        while (targetMoveNum > 0) {
          if (
            groupedMoves[targetMoveNum]?.white &&
            !groupedMoves[targetMoveNum]?.black
          ) {
            break;
          }
          targetMoveNum--;
        }

        if (targetMoveNum > 0 && groupedMoves[targetMoveNum]?.white) {
          // Add black move to existing white move
          groupedMoves[targetMoveNum].black = {
            san: move.san,
            isValid: !move.isInvalid,
          };
        } else {
          // No white move found, create new move number
          if (!groupedMoves[currentMoveNum]) {
            groupedMoves[currentMoveNum] = {};
          }
          groupedMoves[currentMoveNum].black = {
            san: move.san,
            isValid: !move.isInvalid,
          };
        }
      }

      // Increment move number for next iteration
      if (move.player === 'P1') {
        moveNumber++;
      }
    });

    // Convert grouped moves to pairs array
    const sortedMoveNumbers = Object.keys(groupedMoves)
      .map((n) => parseInt(n))
      .sort((a, b) => a - b);

    sortedMoveNumbers.forEach((num) => {
      const moves = groupedMoves[num];
      pairs.push({
        number: num,
        white: moves.white || null,
        black: moves.black || null,
        isBlindPhase: true,
      });
    });

    const nextMoveNumber = Math.max(...sortedMoveNumbers, 0) + 1;
    return { pairs, nextMoveNumber };
  };

  // ─────────────────────────────────────────────────────────────
  // 📊 PROCESS LIVE PHASE MOVES
  // ─────────────────────────────────────────────────────────────

  const processLiveMoves = (startMoveNumber: number) => {
    const pairs: Array<{
      number: number;
      white: { san: string; isValid: boolean } | null;
      black: { san: string; isValid: boolean } | null;
      isBlindPhase: boolean;
    }> = [];

    for (let i = 0; i < liveMoves.length; i += 2) {
      const moveNumber = startMoveNumber + Math.floor(i / 2);
      const whiteMove = liveMoves[i];
      const blackMove = liveMoves[i + 1];

      pairs.push({
        number: moveNumber,
        white: whiteMove ? { san: whiteMove, isValid: true } : null,
        black: blackMove ? { san: blackMove, isValid: true } : null,
        isBlindPhase: false,
      });
    }

    return pairs;
  };

  // ─────────────────────────────────────────────────────────────
  // 📊 COMBINE ALL MOVES
  // ─────────────────────────────────────────────────────────────

  const { pairs: blindPairs, nextMoveNumber } = processBlindMoves();
  const livePairs = processLiveMoves(nextMoveNumber);
  const allMoves = [...blindPairs, ...livePairs];

  // ─────────────────────────────────────────────────────────────
  // 🎨 RENDER MOVE PAIR - WAR STYLE
  // ─────────────────────────────────────────────────────────────

  const renderMove = (move: any, isWhite: boolean) => {
    if (!move)
      return (
        <span className="w-16 text-center text-gray-500 font-mono text-sm">
          —
        </span>
      );

    if (!move.isValid) {
      return (
        <span
          className="w-16 text-center text-red-400 line-through font-mono text-sm font-bold"
          title="❌ Invalid move - rejected during blind phase"
        >
          {move.san}
        </span>
      );
    }

    return (
      <span
        className={`w-16 text-center font-mono text-sm font-bold ${
          isWhite ? 'text-white' : 'text-gray-300'
        }`}
        title={`${isWhite ? 'White' : 'Black'}: ${move.san}`}
      >
        {move.san}
      </span>
    );
  };

  const renderMovePair = (pair: any, index: number) => {
    const isCurrentMove = index === allMoves.length - 1 && !pair.isBlindPhase;
    const hasInvalidMove =
      (pair.white && !pair.white.isValid) ||
      (pair.black && !pair.black.isValid);

    return (
      <div
        key={`${pair.isBlindPhase ? 'blind' : 'live'}-${pair.number}`}
        className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
          isCurrentMove
            ? 'bg-red-900/40 border border-red-400/50 shadow-lg shadow-red-500/20'
            : pair.isBlindPhase
            ? 'bg-purple-900/30 border border-purple-600/30'
            : 'bg-red-900/20 border border-red-600/20'
        }`}
      >
        {/* Move Number */}
        <div className="flex items-center gap-2">
          <span
            className={`font-bold text-sm w-6 ${
              hasInvalidMove
                ? 'text-red-400'
                : pair.isBlindPhase
                ? 'text-purple-400'
                : 'text-red-400'
            }`}
          >
            {pair.number}.
          </span>
          {pair.isBlindPhase ? (
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
              title="Blind move"
            />
          ) : (
            <div
              className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
              title="Live move"
            />
          )}
        </div>

        <div className="flex gap-6 flex-1 justify-center">
          {renderMove(pair.white, true)}
          {renderMove(pair.black, false)}
        </div>

        {/* Invalid Move Indicator */}
        {hasInvalidMove && <span className="text-red-400 text-sm">❌</span>}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 📊 STATISTICS
  // ─────────────────────────────────────────────────────────────

  const stats = {
    blindTotal: blindMoves.length,
    blindValid: blindMoves.filter((m) => !m.isInvalid).length,
    blindInvalid: blindMoves.filter((m) => m.isInvalid).length,
    liveTotal: liveMoves.length,
    totalMoves: blindMoves.length + liveMoves.length,
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-black text-white flex items-center justify-center gap-2 mb-1">
          <Swords className="w-5 h-5 text-red-400" />
          War Log
        </h3>
        <div className="text-sm text-gray-400">
          {stats.totalMoves} total strikes
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-3 backdrop-blur-sm max-h-80 overflow-y-auto">
        {allMoves.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <div className="text-3xl mb-2">⚔️</div>
            <div className="text-sm font-bold">No strikes yet...</div>
            <div className="text-xs text-gray-600 mt-1">
              The war awaits your move!
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Blind Phase Header */}
            {blindPairs.length > 0 && (
              <div className="text-xs text-purple-300 font-bold mb-2 flex items-center gap-1 px-2 border-b border-purple-600/30 pb-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span>
                  Blind Phase ({stats.blindValid} valid, {stats.blindInvalid}{' '}
                  invalid)
                </span>
              </div>
            )}

            {/* Blind Phase Moves */}
            {blindPairs.map((pair, index) => renderMovePair(pair, index))}

            {/* Live Phase Header */}
            {livePairs.length > 0 && (
              <div className="text-xs text-red-300 font-bold mb-2 mt-3 flex items-center gap-1 px-2 border-t border-red-600/30 pt-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>Live Combat ({stats.liveTotal} moves)</span>
              </div>
            )}

            {/* Live Phase Moves */}
            {livePairs.map((pair, index) =>
              renderMovePair(pair, blindPairs.length + index)
            )}
          </div>
        )}
      </div>

      {/* War Status */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-600/30 rounded-lg px-3 py-1">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-xs text-red-300 font-bold">LIVE COMBAT</span>
        </div>
      </div>
    </div>
  );
};
