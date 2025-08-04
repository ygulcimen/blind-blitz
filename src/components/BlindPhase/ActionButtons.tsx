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
  const hasMoves = moves.length > 0;

  return (
    <div className="w-full space-y-2">
      {/* Top Row: Undo and Reset - COMPACT */}
      <div className="grid grid-cols-2 gap-2">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!hasMoves}
          className="group bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 
                     disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                     px-3 py-2 rounded-lg text-white font-bold shadow-lg
                     transition-all duration-300 transform hover:scale-105 active:scale-95
                     flex items-center justify-center gap-1.5 text-xs
                     border border-amber-500/30 hover:border-amber-400/50 disabled:border-gray-600/30"
          title="Undo Last Move"
        >
          <span className="text-lg group-hover:rotate-[-30deg] transition-transform duration-300">
            ↶
          </span>
          <span>Undo</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                     px-3 py-2 rounded-lg text-white font-bold shadow-lg
                     transition-all duration-300 transform hover:scale-105 active:scale-95
                     flex items-center justify-center gap-1.5 text-xs
                     border border-red-500/30 hover:border-red-400/50"
          title="Reset All Moves"
        >
          <span className="text-lg group-hover:rotate-180 transition-transform duration-500">
            🔄
          </span>
          <span>Reset</span>
        </button>
      </div>

      {/* Bottom Row: Submit Button - COMPACT */}
      <button
        onClick={() => onSubmit(moves)}
        disabled={moves.length === 0}
        className={`w-full px-4 py-3 rounded-lg text-white font-bold shadow-xl
                   transition-all duration-300 transform hover:scale-105 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   flex items-center justify-center gap-2 text-sm
                   border ${
                     isComplete
                       ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-green-500/30 hover:border-green-400/50 animate-pulse shadow-green-500/30'
                       : moves.length > 0
                       ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-blue-500/30 hover:border-blue-400/50'
                       : 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500/30 cursor-not-allowed'
                   }`}
        title={
          isComplete
            ? 'Launch your complete attack!'
            : `Submit ${moves.length} moves`
        }
      >
        {isComplete ? (
          <>
            <span className="text-xl animate-bounce">🚀</span>
            <span>Launch Attack!</span>
          </>
        ) : moves.length > 0 ? (
          <>
            <span className="text-xl">⚡</span>
            <span>
              Submit ({moves.length}/{maxMoves})
            </span>
          </>
        ) : (
          <>
            <span className="text-xl opacity-50">⚡</span>
            <span>Make Your Moves</span>
          </>
        )}
      </button>

      {/* Move Counter Visual - COMPACT */}
      <div className="flex justify-center">
        <div className="flex gap-1">
          {Array.from({ length: maxMoves }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i < moves.length
                  ? 'bg-blue-400 shadow-lg shadow-blue-400/50 scale-110'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
