// components/LivePhase/BeautifulGameModals.tsx
import React from 'react';

interface ResignModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentPlayer: 'white' | 'black';
}

interface DrawOfferModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentPlayer: 'white' | 'black';
}

export const BeautifulResignModal: React.FC<ResignModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  currentPlayer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-red-900/40 via-gray-900/90 to-black/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/30 max-w-md w-full transform animate-scale-in">
        {/* Header with dramatic icon */}
        <div className="text-center p-8 pb-4">
          <div className="text-8xl mb-4 animate-pulse">🏳️</div>
          <h2 className="text-3xl font-black text-red-400 mb-2 tracking-wide">
            SURRENDER?
          </h2>
          <p className="text-gray-300 text-lg">
            You're about to resign the game
          </p>
        </div>

        {/* Warning section */}
        <div className="px-8 pb-6">
          <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚠️</span>
              <span className="text-red-300 font-bold">Warning</span>
            </div>
            <p className="text-red-200 text-sm">
              This action cannot be undone. Your opponent will be declared the
              winner.
            </p>
          </div>

          {/* Player indicator */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2">
              <span className="text-2xl">
                {currentPlayer === 'white' ? '⚪' : '⚫'}
              </span>
              <span className="text-white font-bold capitalize">
                {currentPlayer}
              </span>
              <span className="text-gray-400">resigning</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600
                       text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 
                       transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-gray-500/30
                       flex items-center justify-center gap-2"
            >
              <span className="text-xl">↩️</span>
              <span>Continue Playing</span>
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                       text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 
                       transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/30
                       flex items-center justify-center gap-2"
            >
              <span className="text-xl">🏳️</span>
              <span>Resign Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BeautifulDrawOfferModal: React.FC<DrawOfferModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  currentPlayer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-yellow-900/40 via-gray-900/90 to-black/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-500/30 max-w-md w-full transform animate-scale-in">
        {/* Header with peaceful icon */}
        <div className="text-center p-8 pb-4">
          <div className="text-8xl mb-4 animate-bounce">🤝</div>
          <h2 className="text-3xl font-black text-yellow-400 mb-2 tracking-wide">
            OFFER DRAW?
          </h2>
          <p className="text-gray-300 text-lg">Propose a peaceful resolution</p>
        </div>

        {/* Info section */}
        <div className="px-8 pb-6">
          <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">ℹ️</span>
              <span className="text-yellow-300 font-bold">Draw Offer</span>
            </div>
            <p className="text-yellow-200 text-sm">
              Your opponent can accept or decline this offer. The game continues
              if declined.
            </p>
          </div>

          {/* Player indicator */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2">
              <span className="text-2xl">
                {currentPlayer === 'white' ? '⚪' : '⚫'}
              </span>
              <span className="text-white font-bold capitalize">
                {currentPlayer}
              </span>
              <span className="text-gray-400">offering draw</span>
            </div>
          </div>

          {/* Motivational text */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm italic">
              "Sometimes the best battles end in mutual respect" ⚔️
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600
                       text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 
                       transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-gray-500/30
                       flex items-center justify-center gap-2"
            >
              <span className="text-xl">⚔️</span>
              <span>Keep Fighting</span>
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500
                       text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 
                       transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-yellow-500/30
                       flex items-center justify-center gap-2"
            >
              <span className="text-xl">🤝</span>
              <span>Offer Draw</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
