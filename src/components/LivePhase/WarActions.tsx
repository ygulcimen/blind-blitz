// components/LivePhase/WarActions.tsx
import React from 'react';
import { ArrowLeft, Flag, Handshake, RotateCcw, LogOut } from 'lucide-react';

interface WarActionsProps {
  gameEnded: boolean;
  drawOffered: 'white' | 'black' | null;
  currentTurn: string;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onRematch: () => void;
  onLeave: () => void;
  /** NEW: show/hide the abandon button here (we'll move it global) */
  showLeave?: boolean;
}

export const WarActions: React.FC<WarActionsProps> = ({
  gameEnded,
  drawOffered,
  currentTurn,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onRematch,
  onLeave,
  showLeave = false, // default: hidden
}) => {
  if (gameEnded) {
    return (
      <div className="space-y-3">
        <div className="bg-green-900/40 border border-green-500/50 rounded-xl p-4 text-center">
          <div className="text-green-400 font-black mb-3 flex items-center justify-center gap-2">
            <Flag className="w-5 h-5" />
            WAR OVER
            <Flag className="w-5 h-5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRematch}
              className="p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25"
              title="Request Rematch"
            >
              <RotateCcw className="w-6 h-6 mx-auto" />
            </button>
            <button
              onClick={onLeave}
              className="p-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl transition-all duration-300 hover:scale-105"
              title="Leave Battlefield"
            >
              <LogOut className="w-6 h-6 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drawOffered && (
        <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-xl p-3 animate-pulse">
          <div className="text-center text-yellow-400 font-bold text-sm mb-2 flex items-center justify-center gap-2">
            <Handshake className="w-4 h-4" />
            Peace Offered
          </div>
          {((drawOffered === 'white' && currentTurn === 'b') ||
            (drawOffered === 'black' && currentTurn === 'w')) && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onAcceptDraw}
                className="bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition-all duration-300 hover:scale-105 text-xl"
                title="Accept Peace"
              >
                ✅
              </button>
              <button
                onClick={onDeclineDraw}
                className="bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-all duration-300 hover:scale-105 text-xl"
                title="Reject Peace"
              >
                ❌
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={onOfferDraw}
          disabled={!!drawOffered}
          className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
          title="Offer Peace Treaty"
        >
          <Handshake className="w-6 h-6 mx-auto" />
        </button>

        <button
          onClick={onResign}
          className="w-full p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/25"
          title="Surrender Battle"
        >
          <Flag className="w-6 h-6 mx-auto" />
        </button>
      </div>

      {/* NEW: Abandon button only if explicitly requested */}
      {showLeave && (
        <button
          onClick={onLeave}
          className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800/60 hover:bg-red-600/60 border border-slate-600/50 hover:border-red-500/50 rounded-xl transition-all duration-300 text-white font-bold text-sm"
          title="⚠️ Warning: This counts as surrender!"
        >
          <ArrowLeft className="w-4 h-4" />
          Abandon Battlefield
        </button>
      )}
    </div>
  );
};
