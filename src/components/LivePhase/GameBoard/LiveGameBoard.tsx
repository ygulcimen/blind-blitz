import React from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../../shared/ChessBoard/UnifiedChessBoard';
import type { LiveGameState, LiveMove } from '../../../services/liveMovesService';

interface LiveGameBoardProps {
  liveGameState: LiveGameState;
  chessGame: Chess;
  myColor: 'white' | 'black';
  liveMoves: LiveMove[];
  onPieceDrop: (from: string, to: string, piece: string) => boolean;
  compact?: boolean;
  large?: boolean;
}

export const LiveGameBoard: React.FC<LiveGameBoardProps> = ({
  liveGameState,
  chessGame,
  myColor,
  liveMoves,
  onPieceDrop,
  compact = false,
  large = false,
}) => {
  const calculateBoardWidth = () => {
    const isMobile = window.innerWidth < 1024; // lg breakpoint

    if (large) {
      if (isMobile) {
        // Mobile: Board is the hero element, use most of screen width
        // Account for mobile bottom panel (approximately 250px)
        return Math.min(
          window.innerWidth * 0.92, // Use 92% of screen width
          (window.innerHeight - 300) * 0.85 // Account for player bars + bottom panel
        );
      } else {
        // Desktop: Original responsive sizing
        const maxBoardSize = Math.min(
          560, // Maximum board size
          Math.max(320, window.innerWidth * 0.35), // Scale with viewport
          window.innerHeight * 0.65 // Scale with height
        );

        // Adjust for narrow viewports
        if (window.innerWidth < 1200) {
          return Math.min(maxBoardSize, window.innerWidth * 0.45);
        }

        return maxBoardSize;
      }
    } else {
      // Compact mode sizing (responsive)
      return Math.min(
        400,
        Math.max(280, window.innerWidth * (isMobile ? 0.85 : 0.3)),
        window.innerHeight * 0.50
      );
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Board glow effect - Responsive */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl blur-xl animate-pulse" />
      </div>

      <div className="relative z-10">
        <UnifiedChessBoard
              fen={liveGameState.current_fen}
              game={chessGame}
              onPieceDrop={onPieceDrop}
              isFlipped={myColor === 'black'}
              boardWidth={calculateBoardWidth()}
              gameEnded={liveGameState.game_ended}
              currentTurn={liveGameState.current_turn === 'white' ? 'w' : 'b'}
              myColor={myColor === 'white' ? 'w' : 'b'}
              lastMove={
                liveMoves.length > 0
                  ? {
                      from: liveMoves[liveMoves.length - 1].move_from,
                      to: liveMoves[liveMoves.length - 1].move_to,
                    }
                  : null
              }
              phase="live"
            />
      </div>
    </div>
  );
};