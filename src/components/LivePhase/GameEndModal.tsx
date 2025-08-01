import React from 'react';

interface GameEndModalProps {
  result: {
    type: string;
    winner: string;
    reason: string;
  };
  onRematch: () => void;
  onLeaveTable: () => void;
}

const GameEndModal: React.FC<GameEndModalProps> = ({
  result,
  onRematch,
  onLeaveTable,
}) => {
  const getResultIcon = () => {
    switch (result.type) {
      case 'checkmate':
        return '🏆';
      case 'draw':
        return '🤝';
      case 'resignation':
        return '🏳️';
      case 'timeout':
        return '⏰';
      case 'abort':
        return '⚡';
      default:
        return '🎯';
    }
  };

  const getResultMessage = () => {
    if (result.winner === 'draw') {
      return 'Game ended in a draw!';
    }
    return `${result.winner === 'white' ? 'White' : 'Black'} wins!`;
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/20 p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{getResultIcon()}</div>
          <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
          <p className="text-xl text-gray-300">{getResultMessage()}</p>
          <p className="text-sm text-gray-400 mt-2">by {result.reason}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRematch}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600
                       text-white font-bold py-3 px-6 rounded-lg
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       shadow-lg hover:shadow-green-500/40"
          >
            🔄 Rematch
          </button>
          <button
            onClick={onLeaveTable}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600
                       text-white font-bold py-3 px-6 rounded-lg
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       shadow-lg hover:shadow-gray-500/40"
          >
            🚪 Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
