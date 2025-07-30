// components/LiveBoard/GameBoard.tsx
import React from 'react';
import { Chessboard } from 'react-chessboard';

interface GameBoardProps {
  fen: string;
  onPieceDrop: (source: string, target: string) => boolean;
  boardWidth?: number;
  gameEnded: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
  fen,
  onPieceDrop,
  boardWidth = 420,
  gameEnded,
}) => {
  const handlePieceDrop = (
    sourceSquare: string,
    targetSquare: string
  ): boolean => {
    if (gameEnded) return false;
    return onPieceDrop(sourceSquare, targetSquare);
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-xl shadow-2xl">
        <Chessboard
          position={fen}
          onPieceDrop={handlePieceDrop}
          boardWidth={boardWidth}
          boardOrientation="white"
          arePiecesDraggable={!gameEnded}
          animationDuration={800}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {!gameEnded && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
          LIVE 🔴
        </div>
      )}
    </div>
  );
};

export default GameBoard;
