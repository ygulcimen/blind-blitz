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
  // Calculate responsive board width
  const getBoardWidth = () => {
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (isMobile) {
      // On mobile: use most of the screen width and account for bottom panel
      return Math.min(
        window.innerWidth * 0.92,
        (window.innerHeight - 180) * 0.85 // 180px for bottom panel + padding
      );
    }
    // On desktop: original calculation
    return Math.min(
      700,
      window.innerWidth * 0.5,
      window.innerHeight * 0.85
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-8 relative pb-28 lg:pb-8">
      {/* Board glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
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
          boardWidth={getBoardWidth()}
        />
      </div>
    </div>
  );
};
