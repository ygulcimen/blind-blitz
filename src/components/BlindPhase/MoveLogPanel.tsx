import React from 'react';
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

const MoveLogPanel: React.FC<MoveLogPanelProps> = ({
  moves,
  maxMoves,
  moveSummary,
}) => {
  const remainingMoves = maxMoves - moveSummary.totalMoves;
  const progressPercentage = (moveSummary.totalMoves / maxMoves) * 100;

  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 p-3">
      {/* Header - COMPACT */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-lg animate-pulse">🎯</span>
        <h3 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Attack Sequence
        </h3>
      </div>

      {/* Progress Section - SIMPLIFIED */}
      <div className="mb-3 space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span className="font-medium">Progress</span>
          <span
            className={`font-bold text-xs ${
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

        <div className="relative w-full bg-gray-700/50 rounded-full h-2 overflow-hidden border border-gray-600/30">
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

      {/* Move List - ULTRA COMPACT */}
      <div className="space-y-1">
        <div className="flex justify-between text-gray-400 mb-2 px-2 text-xs font-semibold border-b border-gray-700/50 pb-1">
          <span>#</span>
          <span>Move</span>
        </div>

        {Array.from({ length: maxMoves }).map((_, i) => {
          const move = moves[i];
          const isActive = i < moves.length;
          const isCurrent = i === moves.length - 1;

          return (
            <div
              key={i}
              className={`
                flex justify-between items-center border border-gray-700/50 rounded-lg py-2 px-2 text-xs
                transition-all duration-300 transform
                ${
                  isActive
                    ? isCurrent
                      ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-600/50 shadow-md scale-[1.01] animate-pulse'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                    : 'bg-gray-900/30 opacity-60'
                }
              `}
            >
              <span
                className={`font-bold text-sm ${
                  isActive
                    ? isCurrent
                      ? 'text-blue-300'
                      : 'text-blue-400'
                    : 'text-gray-500'
                }`}
              >
                {i + 1}
              </span>

              <span
                className={`font-bold text-sm ${
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

      {/* Statistics - CLEAN 2-COLUMN GRID */}
      <div className="mt-3 pt-2 border-t border-gray-700/50">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-600/30 rounded-lg p-2 text-center">
            <div className="text-gray-400 text-xs mb-0.5">Moves Played</div>
            <div className="text-blue-400 font-bold text-sm">
              {moveSummary.totalMoves}
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-600/30 rounded-lg p-2 text-center">
            <div className="text-gray-400 text-xs mb-0.5">Moves Left</div>
            <div
              className={`font-bold text-sm ${
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
    </div>
  );
};

export default MoveLogPanel;
