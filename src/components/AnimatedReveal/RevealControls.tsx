// components/AnimatedReveal/components/RevealControls.tsx
import React from 'react';
import { Target, Clock } from 'lucide-react';
import { CleanMoveHistory } from './CleanMoveHistory';

interface ModeInfo {
  progressGradient: string;
}

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  isCapture?: boolean;
  moveNumber?: number;
}

interface MoveStats {
  p1Moves: number;
  p2Moves: number;
  validMoves: number;
  invalidMoves: number;
}

interface RevealControlsProps {
  modeInfo: ModeInfo;
  currentMoveIndex: number;
  totalMoves: number;
  progressPercentage: number;
  moveLog: MoveLogItem[];
  isStarting: boolean;
  moveStats: MoveStats;
}

export const RevealControls: React.FC<RevealControlsProps> = ({
  modeInfo,
  currentMoveIndex,
  totalMoves,
  progressPercentage,
  moveLog,
  isStarting,
  moveStats,
}) => {
  return (
    <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-red-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Progress Section */}
        <div className="p-6">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-400" />
                Battle Progress
              </span>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-lg ${
                  currentMoveIndex >= totalMoves - 1
                    ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                    : 'text-gray-400'
                }`}
              >
                {currentMoveIndex >= 0 ? currentMoveIndex + 1 : 0}/{totalMoves}
              </span>
            </div>

            <div className="relative w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/20 mb-3">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${modeInfo.progressGradient}`}
                style={{ width: `${progressPercentage}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>

            <div className="text-center text-xs text-gray-400">
              {isStarting
                ? 'Preparing to reveal...'
                : 'Strategic warfare unfolds'}
            </div>
          </div>
        </div>

        {/* Move History - Clean Version */}
        <div className="flex-1 px-6 pb-6">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm h-full">
            <CleanMoveHistory
              moveLog={moveLog}
              currentMoveIndex={currentMoveIndex}
              totalMoves={totalMoves}
            />
          </div>
        </div>

        {/* Status */}
        <div className="px-6 pb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-900/30 border border-orange-600/30 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-xs text-orange-300 font-bold uppercase tracking-wider">
                {isStarting ? 'Analyzing' : 'Revealing Battle'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
