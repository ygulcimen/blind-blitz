import React from 'react';
import type { BlindSequence } from '../../types/BlindTypes';

interface RobotMoveLogProps {
  moves: BlindSequence;
}

const RobotMoveLog: React.FC<RobotMoveLogProps> = ({ moves }) => {
  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-3">
      <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center">
        <span className="text-base mr-2">🤖</span>
        Robot Moves
      </h3>
      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
        {moves.map((move, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-1.5 bg-purple-900/20 rounded-lg border border-purple-500/30 text-xs"
          >
            <span className="text-purple-300 font-mono">
              {index + 1}. {move.san}
            </span>
            <span className="text-gray-400">
              {move.from}→{move.to}
            </span>
          </div>
        ))}
        {moves.length === 0 && (
          <div className="text-gray-500 text-xs text-center py-3">
            Robot calculating...
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <div className="text-purple-400 font-bold text-sm">
          {moves.length}/5 moves
        </div>
      </div>
    </div>
  );
};

export default RobotMoveLog;
