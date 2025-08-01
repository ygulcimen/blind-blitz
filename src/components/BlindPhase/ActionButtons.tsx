import React from 'react';
import type { BlindSequence } from '../../types/BlindTypes';

interface ActionButtonsProps {
  moves: BlindSequence;
  onUndo: () => void;
  onReset: () => void;
  onSubmit: (moves: BlindSequence) => void;
  maxMoves: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  moves,
  onUndo,
  onReset,
  onSubmit,
  maxMoves,
}) => {
  const isComplete = moves.length === maxMoves;
  const hasMovesTo = moves.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-2xl">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!hasMovesTo}
        className="group bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 
                   disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                   px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl text-white font-bold shadow-lg
                   transition-all duration-300 transform hover:scale-105 active:scale-95
                   flex items-center justify-center gap-3 text-sm lg:text-base
                   border border-yellow-500/30 hover:border-yellow-400/50 disabled:border-gray-600/30"
      >
        <span className="text-lg group-hover:animate-spin">↶</span>
        <span>Undo Last Move</span>
      </button>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                   px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl text-white font-bold shadow-lg
                   transition-all duration-300 transform hover:scale-105 active:scale-95
                   flex items-center justify-center gap-3 text-sm lg:text-base
                   border border-red-500/30 hover:border-red-400/50"
      >
        <span className="text-lg group-hover:animate-spin">🔄</span>
        <span>Reset All</span>
      </button>

      {/* Submit Button */}
      <button
        onClick={() => onSubmit(moves)}
        disabled={moves.length === 0}
        className={`px-6 lg:px-8 py-3 lg:py-3.5 rounded-xl text-white font-bold shadow-xl
                   transition-all duration-300 transform hover:scale-105 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   flex items-center justify-center gap-3 text-sm lg:text-base flex-1 sm:flex-none
                   border ${
                     isComplete
                       ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-green-500/30 hover:border-green-400/50 animate-pulse shadow-green-500/30'
                       : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-blue-500/30 hover:border-blue-400/50'
                   }`}
      >
        {isComplete ? (
          <>
            <span className="text-lg animate-bounce">🚀</span>
            <span>Launch Attack!</span>
          </>
        ) : (
          <>
            <span className="text-lg">⚡</span>
            <span>
              Submit ({moves.length}/{maxMoves})
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default ActionButtons;
