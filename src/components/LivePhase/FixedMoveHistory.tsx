// components/LivePhase/FixedMoveHistory.tsx - FIXED INVALID MOVE VISIBILITY
import React from 'react';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
}

interface LichessMoveHistoryProps {
  blindMoves: MoveLogItem[];
  liveMoves: string[];
}

const LichessMoveHistory: React.FC<LichessMoveHistoryProps> = ({
  blindMoves,
  liveMoves,
}) => {
  // ─────────────────────────────────────────────────────────────
  // 📊 PROCESS BLIND PHASE MOVES - FIXED MAPPING
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
  // 🎨 RENDER MOVE PAIR - ENHANCED INVALID MOVE VISIBILITY
  // ─────────────────────────────────────────────────────────────

  const renderMove = (move: any, isWhite: boolean) => {
    if (!move) return <span className="w-16 text-center text-gray-500">-</span>;

    const baseClasses =
      'w-16 text-sm font-mono cursor-pointer px-2 py-1 rounded text-center block transition-all duration-200';

    if (!move.isValid) {
      return (
        <span
          className={`${baseClasses} text-red-300 line-through bg-red-900/40 border border-red-600/50 animate-pulse`}
          title="❌ Invalid move - rejected during blind phase"
        >
          <span className="relative">
            {move.san}
            <span className="absolute -top-1 -right-1 text-xs">❌</span>
          </span>
        </span>
      );
    }

    return (
      <span
        className={`${baseClasses} ${
          isWhite
            ? 'text-white hover:bg-gray-600 bg-gray-700/30'
            : 'text-gray-200 hover:bg-gray-600 bg-gray-700/20'
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
        className={`flex items-center gap-2 py-1.5 px-2 rounded transition-colors ${
          isCurrentMove
            ? 'bg-blue-900/40 border border-blue-600/30'
            : hasInvalidMove
            ? 'bg-red-900/20 border border-red-800/30'
            : 'hover:bg-gray-700/30'
        }`}
      >
        {/* Move Number */}
        <span
          className={`text-sm font-mono w-6 text-right font-bold ${
            hasInvalidMove ? 'text-red-400' : 'text-gray-400'
          }`}
        >
          {pair.number}.
        </span>

        {/* White Move */}
        {renderMove(pair.white, true)}

        {/* Black Move */}
        {renderMove(pair.black, false)}

        {/* Phase Indicator */}
        <span className="text-xs ml-1">
          {pair.isBlindPhase ? (
            <span className="text-blue-400" title="Blind phase move">
              👁️‍🗨️
            </span>
          ) : (
            <span className="text-green-400" title="Live phase move">
              ⚡
            </span>
          )}
        </span>

        {/* Invalid Move Indicator */}
        {hasInvalidMove && (
          <span
            className="text-red-400 text-xs animate-pulse"
            title="Contains invalid move(s)"
          >
            ⚠️
          </span>
        )}
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
    blindWhite: blindMoves.filter((m) => m.player === 'P1').length,
    blindBlack: blindMoves.filter((m) => m.player === 'P2').length,
    liveTotal: liveMoves.length,
    totalMoves: blindMoves.length + liveMoves.length,
  };

  // ─────────────────────────────────────────────────────────────
  // 🎬 RENDER - INCREASED SIZE
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-800 rounded-lg flex-1 max-h-96">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <span>📋</span> Game Moves
          </h3>
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>{stats.totalMoves} total</span>
            {stats.blindInvalid > 0 && (
              <span className="text-red-400 font-bold">
                {stats.blindInvalid} ❌
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Move List - INCREASED HEIGHT */}
      <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar">
        {allMoves.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-8">
            <div className="text-2xl mb-2">🎭</div>
            <div>No moves yet</div>
            <div className="text-xs mt-1">Game will start soon...</div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Blind Phase Header */}
            {blindPairs.length > 0 && (
              <div className="text-xs text-blue-300 font-bold mb-1 flex items-center gap-1 px-2">
                <span>👁️‍🗨️</span> Blind Phase ({stats.blindWhite}⚪ +{' '}
                {stats.blindBlack}⚫)
                {stats.blindInvalid > 0 && (
                  <span className="text-red-400 ml-2">
                    {stats.blindInvalid} invalid ❌
                  </span>
                )}
              </div>
            )}

            {/* Blind Phase Moves */}
            {blindPairs.map((pair, index) => renderMovePair(pair, index))}

            {/* Live Phase Header */}
            {livePairs.length > 0 && (
              <div className="text-xs text-green-300 font-bold mb-1 mt-2 flex items-center gap-1 px-2 border-t border-gray-600 pt-2">
                <span>⚡</span> Live Phase ({stats.liveTotal} moves)
              </div>
            )}

            {/* Live Phase Moves */}
            {livePairs.map((pair, index) =>
              renderMovePair(pair, blindPairs.length + index)
            )}
          </div>
        )}
      </div>

      {/* Footer Stats - ENHANCED */}
      {stats.totalMoves > 0 && (
        <div className="p-2 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              👁️‍🗨️ {stats.blindValid}/{stats.blindTotal}
              {stats.blindTotal > 0 && (
                <span className="text-yellow-400">
                  ({Math.round((stats.blindValid / stats.blindTotal) * 100)}%)
                </span>
              )}
              {stats.blindInvalid > 0 && (
                <span className="text-red-400 font-bold">
                  {stats.blindInvalid} ❌
                </span>
              )}
            </span>
            <span>⚡ {stats.liveTotal}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LichessMoveHistory;
