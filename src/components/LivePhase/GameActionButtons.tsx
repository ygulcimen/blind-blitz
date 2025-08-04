// components/LivePhase/GameActionButtons.tsx - Updated for Live Phase
import React from 'react';

interface GameActionButtonsProps {
  drawOffered: 'white' | 'black' | null;
  currentTurn: 'w' | 'b';
  canAbort: boolean;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onAbort: () => void;
}

const GameActionButtons: React.FC<GameActionButtonsProps> = ({
  drawOffered,
  currentTurn,
  canAbort,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onAbort,
}) => {
  const currentPlayer = currentTurn === 'w' ? 'white' : 'black';
  const isDrawOfferedByCurrentPlayer = drawOffered === currentPlayer;

  return (
    <div className="bg-gray-800 rounded-lg p-3 space-y-3">
      {/* Draw Offer Section */}
      {drawOffered && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
          <div className="text-sm text-yellow-300 mb-2 text-center flex items-center justify-center gap-2">
            <span>🤝</span>
            Draw offered by {drawOffered === 'white' ? 'White' : 'Black'}
          </div>

          {!isDrawOfferedByCurrentPlayer ? (
            <div className="flex gap-2">
              <button
                onClick={onAcceptDraw}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded transition-colors flex items-center justify-center text-lg"
                title="Accept Draw"
              >
                ✅
              </button>
              <button
                onClick={onDeclineDraw}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded transition-colors flex items-center justify-center text-lg"
                title="Decline Draw"
              >
                ❌
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-yellow-200">
              Waiting for opponent...
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Icon Only */}
      <div className="flex gap-2">
        {/* Resign Button */}
        <button
          onClick={onResign}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg transition-colors flex items-center justify-center text-lg"
          title="Resign Game"
        >
          🏳️
        </button>

        {/* Draw Offer Button */}
        {!drawOffered && (
          <button
            onClick={onOfferDraw}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-lg transition-colors flex items-center justify-center text-lg"
            title="Offer Draw"
          >
            🤝
          </button>
        )}

        {/* Abort Button (only if canAbort is true) */}
        {canAbort && (
          <button
            onClick={onAbort}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors flex items-center justify-center text-lg"
            title="Abort Game"
          >
            ⏹️
          </button>
        )}
      </div>

      {/* Game Status */}
      <div className="text-center text-sm pt-2 border-t border-gray-700">
        <div className="text-gray-400 mb-1">Current Turn</div>
        <div className="text-white font-bold flex items-center justify-center gap-2">
          <span>{currentTurn === 'w' ? '⚪' : '⚫'}</span>
          <span>{currentTurn === 'w' ? 'White' : 'Black'} to move</span>
        </div>
      </div>
    </div>
  );
};

export default GameActionButtons;
