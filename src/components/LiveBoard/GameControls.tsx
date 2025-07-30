import React from 'react';

interface GameControlsProps {
  gameEnded: boolean;
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
  gameEnded,
  drawOffered,
  currentTurn,
  liveMoveCount,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onAbort,
}) => {
  if (gameEnded) return null;

  const isCurrentPlayerDraw =
    drawOffered === (currentTurn === 'w' ? 'white' : 'black');
  const isOpponentDraw = drawOffered && !isCurrentPlayerDraw;

  return (
    <div className="mt-12 flex flex-wrap gap-4 justify-center">
      <button
        onClick={onResign}
        className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-red-500/50 border border-red-400/50"
      >
        <span className="flex items-center gap-3">
          🏳️ <span className="group-hover:animate-pulse">RESIGN</span>
        </span>
      </button>

      {!drawOffered ? (
        <button
          onClick={onOfferDraw}
          className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-blue-500/50 border border-blue-400/50"
        >
          <span className="flex items-center gap-3">
            🤝 <span className="group-hover:animate-pulse">OFFER DRAW</span>
          </span>
        </button>
      ) : isOpponentDraw ? (
        <div className="flex gap-2">
          <button
            onClick={onAcceptDraw}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-green-500/50"
          >
            ✅ ACCEPT
          </button>
          <button
            onClick={onDeclineDraw}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-red-500/50"
          >
            ❌ DECLINE
          </button>
        </div>
      ) : (
        <button
          disabled
          className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg opacity-75 cursor-not-allowed shadow-lg"
        >
          🤝 DRAW OFFERED
        </button>
      )}

      {liveMoveCount < 2 && (
        <button
          onClick={onAbort}
          className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-gray-500/50 border border-gray-400/50"
        >
          <span className="flex items-center gap-3">
            ⚡ <span className="group-hover:animate-pulse">ABORT</span>
          </span>
        </button>
      )}
    </div>
  );
};

export default GameControls;
