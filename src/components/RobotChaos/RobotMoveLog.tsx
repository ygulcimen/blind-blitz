import React from 'react';
import type { BlindSequence } from '../../types/BlindTypes';

interface RobotMoveLogProps {
  moves: BlindSequence;
  maxMoves: number;
}

const RobotMoveLog: React.FC<RobotMoveLogProps> = ({ moves, maxMoves }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl shadow-purple-500/20 h-full flex flex-col">
      <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center justify-between">
        <span className="flex items-center">
          <span className="text-base mr-2">🤖</span>
          Robot Battle Sequence
        </span>
        <span className="text-xs text-gray-400 font-normal">
          {moves.length}/{maxMoves}
        </span>
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
        {moves.map((move, index) => (
          <div
            key={index}
            className="group relative bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/40 p-2.5 transition-all duration-200 hover:border-purple-400/60 hover:from-purple-900/40 hover:to-indigo-900/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600/50 rounded-md flex items-center justify-center text-xs font-bold text-purple-200">
                  {index + 1}
                </div>
                <span className="text-white font-mono text-sm font-semibold">
                  {move.san}
                </span>
              </div>
              <span className="text-gray-400 text-xs font-mono">
                {move.from}→{move.to}
              </span>
            </div>
          </div>
        ))}

        {moves.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2 animate-pulse">🤖</div>
            <div className="text-gray-400 text-sm">
              Robot calculating chaos...
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="mt-3 pt-3 border-t border-purple-500/30">
        <div className="text-center">
          <div className="text-xs text-purple-300 font-medium">
            🎯 Chaos Protocol Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotMoveLog;
