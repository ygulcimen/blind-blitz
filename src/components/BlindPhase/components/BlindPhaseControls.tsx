// components/BlindPhase/components/BlindPhaseControls.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { BlindPhaseHeader } from './BlindPhaseHeader';
import { BlindProgressDisplay } from './BlindProgressDisplay';
import { BlindActionButtons } from './BlindActionButtons';

interface BlindPhaseControlsProps {
  timer: any;
  myMoves: any[];
  mySubmitted: boolean;
  isSubmitting: boolean;
  isComplete: boolean;
  isSubmitDisabled: boolean;
  maxMoves: number;
  moveSummary: any;
  onUndo: () => void;
  onReset: () => void;
  onSubmit: () => Promise<void>;
  onLobbyReturn: () => void;
}

export const BlindPhaseControls: React.FC<BlindPhaseControlsProps> = ({
  timer,
  myMoves,
  mySubmitted,
  isSubmitting,
  isComplete,
  isSubmitDisabled,
  maxMoves,
  moveSummary,
  onUndo,
  onReset,
  onSubmit,
  onLobbyReturn,
}) => {
  return (
    <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-blue-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Epic Timer */}
        <div className="p-6">
          <BlindPhaseHeader timer={timer} />
        </div>

        {/* Progress Section */}
        <div className="px-6 pb-6">
          <BlindProgressDisplay
            totalMoves={moveSummary.totalMoves}
            maxMoves={maxMoves}
            isComplete={isComplete}
            myMoves={myMoves}
          />
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <BlindActionButtons
            myMoves={myMoves}
            mySubmitted={mySubmitted}
            isSubmitting={isSubmitting}
            isComplete={isComplete}
            isSubmitDisabled={isSubmitDisabled}
            maxMoves={maxMoves}
            onUndo={onUndo}
            onReset={onReset}
            onSubmit={onSubmit}
          />
        </div>

        {/* Return to Lobby Button */}
        <div className="px-6 pb-6 mt-auto">
          <button
            onClick={onLobbyReturn}
            className="group flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/60 hover:bg-red-600/60 border border-slate-600/50 hover:border-red-500/50 rounded-xl transition-all duration-300 backdrop-blur-sm w-full"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Return to Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
};
