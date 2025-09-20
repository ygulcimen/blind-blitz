// components/BlindPhase/components/BlindBattleSequence.tsx
import React from 'react';
import { Target, Zap } from 'lucide-react';

interface BlindBattleSequenceProps {
  myMoves: any[];
  maxMoves: number;
}

export const BlindBattleSequence: React.FC<BlindBattleSequenceProps> = ({
  myMoves,
  maxMoves,
}) => {
  return (
    <div className="space-y-2">
      <div className="text-center mb-3">
        <h3 className="text-lg font-black text-white flex items-center justify-center gap-2 mb-1">
          <Target className="w-5 h-5 text-blue-400" />
          My Battle Plan
        </h3>
        <div className="text-xs text-gray-400">
          {myMoves.length}/{maxMoves} strikes planned
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: maxMoves }).map((_, i) => {
          const move = myMoves[i];
          const isActive = i < myMoves.length;
          const isCurrent = i === myMoves.length - 1;

          return (
            <div
              key={i}
              className={`relative p-2 rounded-lg border transition-all duration-300 ${
                isActive
                  ? isCurrent
                    ? 'bg-blue-900/40 border-blue-400/50 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800/60 border-gray-600/50'
                  : 'bg-gray-900/30 border-gray-700/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-white'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {move?.san ?? '—'}
                  </span>
                  {isActive && <Zap className="w-3 h-3 text-yellow-400" />}
                </div>
                {isCurrent && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
