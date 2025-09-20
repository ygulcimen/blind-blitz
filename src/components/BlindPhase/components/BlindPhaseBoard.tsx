// components/BlindPhase/components/BlindPhaseBoard.tsx
import React from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../../shared/ChessBoard/UnifiedChessBoard';

interface BlindPhaseBoardProps {
  game: Chess;
  isWhite: boolean;
  pieceIndicators: { [square: string]: any };
  squareStyles: { [square: string]: any };
  onPieceDrop: (from: string, to: string, piece: string) => boolean;
}

export const BlindPhaseBoard: React.FC<BlindPhaseBoardProps> = ({
  game,
  isWhite,
  pieceIndicators,
  squareStyles,
  onPieceDrop,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8 relative">
      {/* Board glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
      </div>

      <div className="relative z-10">
        <UnifiedChessBoard
          fen={game.fen()}
          game={game}
          isFlipped={!isWhite}
          onPieceDrop={onPieceDrop}
          pieceIndicators={pieceIndicators}
          customSquareStyles={squareStyles}
          phase="blind"
          boardWidth={Math.min(
            700,
            window.innerWidth * 0.5,
            window.innerHeight * 0.85
          )}
        />
      </div>
    </div>
  );
};
