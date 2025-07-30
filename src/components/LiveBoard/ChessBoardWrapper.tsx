import React from 'react';
import { Chessboard } from 'react-chessboard';

interface ChessBoardWrapperProps {
  fen: string;
  onPieceDrop: (source: string, target: string) => boolean;
  boardWidth?: number;
  showLiveIndicator?: boolean;
}

const ChessBoardWrapper: React.FC<ChessBoardWrapperProps> = ({
  fen,
  onPieceDrop,
  boardWidth = 420,
  showLiveIndicator = true,
}) => {
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
      <div className="relative bg-black/40 backdrop-blur-lg p-4 rounded-2xl border-2 border-white/20 shadow-2xl">
        <Chessboard
          position={fen}
          onPieceDrop={onPieceDrop}
          boardWidth={boardWidth}
          boardOrientation="white"
          customBoardStyle={{
            borderRadius: '12px',
            boxShadow:
              '0 20px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
          }}
        />
      </div>
      {showLiveIndicator && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
          LIVE 🔴
        </div>
      )}
    </div>
  );
};

export default ChessBoardWrapper;
