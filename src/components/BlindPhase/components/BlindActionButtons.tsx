// components/BlindPhase/components/BlindActionButtons.tsx
import React from 'react';
import { Undo, RotateCcw, Send, Rocket, Shield, EyeOff } from 'lucide-react';

interface BlindActionButtonsProps {
  myMoves: any[];
  mySubmitted: boolean;
  isSubmitting: boolean;
  isComplete: boolean;
  isSubmitDisabled: boolean;
  maxMoves: number;
  onUndo: () => void;
  onReset: () => void;
  onSubmit: () => Promise<void>;
}

export const BlindActionButtons: React.FC<BlindActionButtonsProps> = ({
  myMoves,
  mySubmitted,
  isSubmitting,
  isComplete,
  isSubmitDisabled,
  maxMoves,
  onUndo,
  onReset,
  onSubmit,
}) => {
  return (
    <div className="space-y-4">
      {/* Control Buttons Row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onUndo}
          disabled={myMoves.length === 0 || mySubmitted}
          title="Undo Last Strike"
          className={`relative overflow-hidden p-4 rounded-xl transition-all duration-300 ${
            myMoves.length > 0 && !mySubmitted
              ? 'bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:scale-105'
              : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
          }`}
        >
          <Undo className="w-6 h-6 mx-auto" />
        </button>

        <button
          onClick={onReset}
          disabled={mySubmitted}
          title="Reset All Strikes"
          className={`relative overflow-hidden p-4 rounded-xl transition-all duration-300 ${
            !mySubmitted
              ? 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/25 hover:scale-105'
              : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
          }`}
        >
          <RotateCcw className="w-6 h-6 mx-auto" />
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        className={`w-full relative overflow-hidden py-6 px-6 rounded-xl transition-all duration-300 ${
          mySubmitted
            ? 'bg-green-900/50 text-green-400 border border-green-500/30 cursor-not-allowed'
            : isSubmitting
            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed animate-pulse'
            : isComplete
            ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-400 hover:via-emerald-400 hover:to-green-500 text-white animate-pulse shadow-xl shadow-green-500/40 hover:scale-105'
            : myMoves.length > 0
            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
            : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {mySubmitted ? (
            <>
              <Shield className="w-8 h-8" />
              <span className="text-sm font-bold">SUBMITTED</span>
            </>
          ) : isSubmitting ? (
            <>
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold">SUBMITTING...</span>
            </>
          ) : isComplete ? (
            <Rocket className="w-8 h-8" />
          ) : myMoves.length > 0 ? (
            <Send className="w-7 h-7" />
          ) : (
            <EyeOff className="w-7 h-7" />
          )}
        </div>
      </button>

      {/* Progress Dots */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          {Array.from({ length: maxMoves }).map((_, i) => (
            <div
              key={i}
              className={`relative transition-all duration-500 ${
                i < myMoves.length ? 'scale-125' : 'scale-100'
              }`}
            >
              {/* Main Dot */}
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i < myMoves.length
                    ? 'bg-gradient-to-r from-purple-400 to-blue-500 shadow-md shadow-purple-400/50'
                    : 'bg-slate-600 border border-slate-500'
                }`}
              />

              {/* Pulsing Ring for Active Moves */}
              {i < myMoves.length && (
                <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" />
              )}

              {/* Current Move Indicator */}
              {i === myMoves.length - 1 && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
