import React from 'react';
import type { BlindSequence } from '../../types/BlindTypes';
import { Undo, RotateCcw, Send, Zap, Rocket, EyeOff } from 'lucide-react';

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
    <div className="w-full space-y-3">
      {/* 🎨 COMPACT: Control Buttons Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* 🔥 COMPACT Undo Button */}
        <button
          onClick={onUndo}
          disabled={!hasMoves}
          className={`group relative px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all duration-300 transform border overflow-hidden ${
            hasMoves
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border-amber-500/50 hover:border-amber-400/70 hover:scale-105 active:scale-95 shadow-amber-500/30'
              : 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500/30 opacity-50 cursor-not-allowed'
          }`}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          <div className="relative flex items-center justify-center gap-2">
            <Undo
              className={`w-4 h-4 transition-transform duration-300 ${
                hasMoves ? 'group-hover:rotate-[-30deg]' : ''
              }`}
            />
            <span>UNDO</span>
          </div>
        </button>

        {/* 🔥 COMPACT Reset Button */}
        <button
          onClick={onReset}
          className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-2 rounded-lg text-white font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border border-red-500/50 hover:border-red-400/70 shadow-red-500/30 overflow-hidden"
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          <div className="relative flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>RESET</span>
          </div>
        </button>
      </div>

      {/* 🚀 COMPACT Submit Button */}
      <button
        onClick={() => onSubmit(moves)}
        disabled={moves.length === 0}
        className={`w-full px-6 py-3 rounded-lg text-white font-bold text-base shadow-lg transition-all duration-300 transform border relative overflow-hidden ${
          isComplete
            ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-500 hover:via-emerald-500 hover:to-green-600 border-green-500/50 hover:border-green-400/70 animate-pulse shadow-green-500/40 hover:scale-105 active:scale-95'
            : moves.length > 0
            ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 border-purple-500/50 hover:border-purple-400/70 shadow-purple-500/40 hover:scale-105 active:scale-95'
            : 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500/30 opacity-50 cursor-not-allowed shadow-slate-500/20'
        }`}
      >
        {/* Epic Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Pulsing Background for Complete State */}
        {isComplete && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse" />
        )}

        <div className="relative flex items-center justify-center gap-3">
          {isComplete ? (
            <>
              <Rocket className="w-5 h-5 animate-bounce" />
              <span className="text-lg">LAUNCH BLIND ATTACK!</span>
            </>
          ) : moves.length > 0 ? (
            <>
              <Send className="w-4 h-4" />
              <span>
                SUBMIT {moves.length} MOVE{moves.length > 1 ? 'S' : ''}
              </span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 opacity-50" />
              <span>MAKE YOUR BLIND MOVES</span>
            </>
          )}
        </div>
      </button>

      {/* 🎨 COMPACT Move Progress Visualization */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          {Array.from({ length: maxMoves }).map((_, i) => (
            <div
              key={i}
              className={`relative transition-all duration-500 ${
                i < moves.length ? 'scale-125' : 'scale-100'
              }`}
            >
              {/* Main Dot */}
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i < moves.length
                    ? 'bg-gradient-to-r from-purple-400 to-blue-500 shadow-md shadow-purple-400/50'
                    : 'bg-slate-600 border border-slate-500'
                }`}
              />

              {/* Pulsing Ring for Active Moves */}
              {i < moves.length && (
                <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" />
              )}

              {/* Current Move Indicator */}
              {i === moves.length - 1 && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
