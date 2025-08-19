import React from 'react';
import type { BlindSequence } from '../../types/BlindTypes';
import { EyeOff, Target, TrendingUp } from 'lucide-react';

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
  const isComplete = moveSummary.totalMoves === maxMoves;

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-6 shadow-2xl">
      {/* 🎨 REDESIGNED: Epic Header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <EyeOff className="w-6 h-6 text-purple-400 animate-pulse" />
        <h3 className="text-xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Blind Sequence
        </h3>
        <Target className="w-6 h-6 text-blue-400" />
      </div>

      {/* 🎨 REDESIGNED: Epic Progress Section */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-300 font-bold">Progress</span>
          <div className="flex items-center gap-2">
            <span
              className={`font-black text-lg ${
                isComplete
                  ? 'text-green-400'
                  : remainingMoves <= 1
                  ? 'text-yellow-400'
                  : 'text-purple-400'
              }`}
            >
              {moveSummary.totalMoves}/{maxMoves}
            </span>
            {isComplete && <span className="text-xl animate-bounce">🚀</span>}
          </div>
        </div>

        {/* 🎨 REDESIGNED: Epic Progress Bar */}
        <div className="relative w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border-2 border-slate-600/30 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
              isComplete
                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600'
                : remainingMoves <= 1
                ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500'
                : 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>

        {/* 🎨 REDESIGNED: Status Message */}
        {isComplete && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/50 rounded-xl px-4 py-2">
              <span className="text-green-400 font-black text-sm uppercase tracking-wider animate-pulse">
                🎯 SEQUENCE COMPLETE!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 🎨 REDESIGNED: Epic Move List */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-slate-400 mb-4 px-3 text-sm font-bold uppercase tracking-wider border-b border-slate-600/50 pb-3">
          <span>Move #</span>
          <span>Notation</span>
        </div>

        {Array.from({ length: maxMoves }).map((_, i) => {
          const move = moves[i];
          const isActive = i < moves.length;
          const isCurrent = i === moves.length - 1;

          return (
            <div
              key={i}
              className={`
                flex justify-between items-center rounded-xl py-3 px-4 text-sm
                transition-all duration-500 transform border-2
                ${
                  isActive
                    ? isCurrent
                      ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/60 border-purple-500/60 shadow-lg shadow-purple-500/20 scale-[1.02] animate-pulse'
                      : 'bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-slate-600/40 shadow-md hover:scale-[1.01]'
                    : 'bg-gradient-to-r from-slate-900/40 to-slate-800/40 border-slate-700/30 opacity-60'
                }
              `}
            >
              {/* Move Number */}
              <div className="flex items-center gap-3">
                <span
                  className={`font-black text-lg ${
                    isActive
                      ? isCurrent
                        ? 'text-purple-300'
                        : 'text-blue-400'
                      : 'text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                {isCurrent && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                )}
              </div>

              {/* Move Notation */}
              <span
                className={`font-black text-lg ${
                  isActive
                    ? isCurrent
                      ? 'text-purple-300'
                      : 'text-white'
                    : 'text-slate-500'
                }`}
              >
                {move?.san ?? '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* 🎨 REDESIGNED: Epic Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-2 border-purple-600/40 rounded-xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <div className="text-slate-400 text-xs uppercase tracking-wider font-bold">
              Moves Made
            </div>
          </div>
          <div className="text-purple-400 font-black text-2xl">
            {moveSummary.totalMoves}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-2 border-blue-600/40 rounded-xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <div className="text-slate-400 text-xs uppercase tracking-wider font-bold">
              Remaining
            </div>
          </div>
          <div
            className={`font-black text-2xl ${
              remainingMoves === 0
                ? 'text-green-400'
                : remainingMoves <= 1
                ? 'text-yellow-400'
                : 'text-blue-400'
            }`}
          >
            {remainingMoves}
          </div>
        </div>
      </div>

      {/* 🎨 REDESIGNED: Atmospheric Bottom Section */}
      <div className="mt-6 pt-4 border-t border-slate-600/50">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-xs">
            <EyeOff className="w-3 h-3" />
            <span className="italic">Planning moves in darkness...</span>
            <EyeOff className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveLogPanel;
