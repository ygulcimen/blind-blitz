// components/LivePhase/GameControls.tsx
import React from 'react';

interface GameControlsProps {
  drawOffered: 'white' | 'black' | null;
  currentTurn: 'w' | 'b';
  liveMoveCount: number;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  onAbort: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  drawOffered,
  currentTurn,
  liveMoveCount,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onAbort,
}) => {
  const isCurrentPlayerDraw =
    drawOffered === (currentTurn === 'w' ? 'white' : 'black');
  const isOpponentDraw = drawOffered && !isCurrentPlayerDraw;

  return (
    <div className="mt-4 lg:mt-6 flex gap-3 justify-center max-w-2xl mx-auto px-4">
      {/* Resign Button */}
      <button
        onClick={onResign}
        title="Resign Game"
        className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white 
                   w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                   rounded-xl lg:rounded-2xl 
                   font-bold text-lg sm:text-xl lg:text-2xl
                   transition-all duration-300 transform hover:scale-110 active:scale-95
                   shadow-lg hover:shadow-red-500/40 border border-red-400/50
                   flex items-center justify-center"
      >
        <span className="group-hover:animate-pulse">🏳️</span>
      </button>

      {/* Draw Controls */}
      {!drawOffered ? (
        <button
          onClick={onOfferDraw}
          title="Offer Draw"
          className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white 
                     w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                     rounded-xl lg:rounded-2xl 
                     font-bold text-lg sm:text-xl lg:text-2xl
                     transition-all duration-300 transform hover:scale-110 active:scale-95
                     shadow-lg hover:shadow-blue-500/40 border border-blue-400/50
                     flex items-center justify-center"
        >
          <span className="group-hover:animate-pulse">🤝</span>
        </button>
      ) : isOpponentDraw ? (
        <div className="flex gap-2">
          <button
            onClick={onAcceptDraw}
            title="Accept Draw"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white 
                       w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                       rounded-xl lg:rounded-2xl 
                       font-bold text-lg sm:text-xl lg:text-2xl
                       transition-all duration-300 transform hover:scale-110 active:scale-95
                       shadow-lg hover:shadow-green-500/40
                       flex items-center justify-center"
          >
            ✅
          </button>
          <button
            onClick={onDeclineDraw}
            title="Decline Draw"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white 
                       w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                       rounded-xl lg:rounded-2xl 
                       font-bold text-lg sm:text-xl lg:text-2xl
                       transition-all duration-300 transform hover:scale-110 active:scale-95
                       shadow-lg hover:shadow-red-500/40
                       flex items-center justify-center"
          >
            ❌
          </button>
        </div>
      ) : (
        <button
          disabled
          title="Draw Offered"
          className="bg-gradient-to-r from-blue-400 to-blue-500 text-white 
                     w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                     rounded-xl lg:rounded-2xl 
                     font-bold text-lg sm:text-xl lg:text-2xl
                     opacity-75 cursor-not-allowed shadow-lg
                     flex items-center justify-center relative"
        >
          🤝
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Abort Button - only for early game */}
      {liveMoveCount < 2 && (
        <button
          onClick={onAbort}
          title="Abort Game"
          className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white 
                     w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                     rounded-xl lg:rounded-2xl 
                     font-bold text-lg sm:text-xl lg:text-2xl
                     transition-all duration-300 transform hover:scale-110 active:scale-95
                     shadow-lg hover:shadow-gray-500/40 border border-gray-400/50
                     flex items-center justify-center"
        >
          <span className="group-hover:animate-pulse">⚡</span>
        </button>
      )}
    </div>
  );
};

export default GameControls;
