// components/LivePhase/FixedGameControls.tsx
import React from 'react';

interface FixedGameControlsProps {
  drawOffered: 'white' | 'black' | null;
  currentTurn: 'w' | 'b';
  liveMoveCount: number;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onAbort: () => void;
}

const FixedGameControls: React.FC<FixedGameControlsProps> = ({
  drawOffered,
  currentTurn,
  liveMoveCount,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onAbort,
}) => {
  const canAbort = liveMoveCount < 2; // Can only abort if less than 2 live moves
  const currentPlayer = currentTurn === 'w' ? 'white' : 'black';
  const isDrawOfferedByCurrentPlayer = drawOffered === currentPlayer;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4">
        {/* Draw Offer Section */}
        {drawOffered && (
          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/40 rounded-xl">
            <div className="text-center mb-3">
              <div className="text-lg font-bold text-yellow-300 flex items-center justify-center gap-2">
                <span className="text-xl">🤝</span>
                Draw Offered by {drawOffered === 'white' ? 'White' : 'Black'}
              </div>
              <p className="text-sm text-yellow-200 mt-1">
                {isDrawOfferedByCurrentPlayer
                  ? 'Waiting for opponent to respond...'
                  : 'Your opponent offers a draw'}
              </p>
            </div>

            {!isDrawOfferedByCurrentPlayer && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onAcceptDraw}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600
                           text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 
                           transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/30
                           flex items-center gap-2"
                >
                  <span className="text-lg">✅</span>
                  Accept Draw
                </button>
                <button
                  onClick={onDeclineDraw}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                           text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 
                           transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/30
                           flex items-center gap-2"
                >
                  <span className="text-lg">❌</span>
                  Decline
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Controls */}
        <div className="flex flex-wrap gap-3 justify-center items-center">
          {/* Resign Button */}
          <button
            onClick={onResign}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                     text-white font-bold py-3 px-5 rounded-xl transition-all duration-200 
                     transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/30
                     flex items-center gap-2 min-w-[120px]"
          >
            <span className="text-lg">🏳️</span>
            Resign
          </button>

          {/* Draw Offer Button */}
          {!drawOffered && (
            <button
              onClick={onOfferDraw}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500
                       text-white font-bold py-3 px-5 rounded-xl transition-all duration-200 
                       transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-yellow-500/30
                       flex items-center gap-2 min-w-[120px]"
            >
              <span className="text-lg">🤝</span>
              Offer Draw
            </button>
          )}

          {/* Abort Button (only available early in game) */}
          {canAbort && (
            <button
              onClick={onAbort}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600
                       text-white font-bold py-3 px-5 rounded-xl transition-all duration-200 
                       transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-gray-500/30
                       flex items-center gap-2 min-w-[120px]"
            >
              <span className="text-lg">⏹️</span>
              Abort
            </button>
          )}
        </div>

        {/* Status Info */}
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-400 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              {currentPlayer === 'white' ? '⚪ White' : '⚫ Black'} to move
            </span>
            <span>•</span>
            <span>Move {Math.floor(liveMoveCount / 2) + 1}</span>
            {canAbort && (
              <>
                <span>•</span>
                <span className="text-yellow-400">⚠️ Abort available</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedGameControls;
