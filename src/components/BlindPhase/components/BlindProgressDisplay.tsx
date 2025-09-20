// components/BlindPhase/components/BlindProgressDisplay.tsx
import React from 'react';
import { Shield } from 'lucide-react';

interface BlindProgressDisplayProps {
  totalMoves: number;
  maxMoves: number;
  isComplete: boolean;
  myMoves: any[];
}

export const BlindProgressDisplay: React.FC<BlindProgressDisplayProps> = ({
  totalMoves,
  maxMoves,
  isComplete,
  myMoves,
}) => {
  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          Mission Progress
        </span>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-lg ${
            isComplete
              ? 'bg-green-900/50 text-green-400 border border-green-500/30'
              : 'text-gray-400'
          }`}
        >
          {totalMoves}/{maxMoves}
        </span>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: maxMoves }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-3 rounded-full transition-all duration-500 ${
              i < myMoves.length
                ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 shadow-lg shadow-blue-500/50'
                : 'bg-gray-700/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
