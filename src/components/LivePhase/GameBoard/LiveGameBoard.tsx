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
    if (large) {
      // For the 60% center panel, use more space efficiently while respecting container bounds
      return Math.min(
        560, // Reduced from 600 to account for container padding
        window.innerWidth * 0.42, // Reduced from 0.45 to prevent overflow
        window.innerHeight * 0.70 // Reduced from 0.75 to prevent vertical overflow
      );
    } else {
      // Original sizing for compact mode
      return Math.min(
        480, // Reduced from 500
        window.innerWidth * 0.38, // Reduced from 0.4
        window.innerHeight * 0.55 // Reduced from 0.6
      );
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Board glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl blur-xl animate-pulse" />
      </div>

      <div className="relative z-[1000]">
        <UnifiedChessBoard
              fen={liveGameState.current_fen}
              game={chessGame}
              onPieceDrop={onPieceDrop}
              isFlipped={myColor === 'black'}
              boardWidth={calculateBoardWidth()}
              gameEnded={liveGameState.game_ended}
              currentTurn={liveGameState.current_turn === 'white' ? 'w' : 'b'}
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