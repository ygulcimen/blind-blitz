// utils/simulateBlindMoves.ts
import { Chess } from 'chess.js';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';

interface SimulationResult {
  fen: string;
  log: MoveLogItem[];
}

// In simulateBlindMoves.ts - IMPROVED VERSION
export const simulateBlindMoves = (
  whiteMoves: BlindSequence,
  blackMoves: BlindSequence
): SimulationResult => {
  const game = new Chess();
  const log: MoveLogItem[] = [];

  console.log('🎬 Starting simulation:', {
    whiteMoves: whiteMoves.length,
    blackMoves: blackMoves.length,
  });

  let whiteIndex = 0;
  let blackIndex = 0;

  // Process moves in strict chess turn order
  while (whiteIndex < whiteMoves.length || blackIndex < blackMoves.length) {
    const isWhiteTurn = game.turn() === 'w';

    if (isWhiteTurn) {
      if (whiteIndex < whiteMoves.length) {
        // White has a move and it's their turn
        const move = whiteMoves[whiteIndex];
        const success = attemptMove(game, move, 'White', log);
        whiteIndex++;

        // Only advance turn if move was successful
        if (!success) {
          // Force turn change for invalid moves
          const currentFen = game.fen();
          const fenParts = currentFen.split(' ');
          fenParts[1] = 'b'; // Switch to black
          try {
            game.load(fenParts.join(' '));
          } catch (e) {
            console.warn('Failed to force turn change');
          }
        }
      } else {
        // White has no more moves, skip turn
        const currentFen = game.fen();
        const fenParts = currentFen.split(' ');
        fenParts[1] = 'b';
        try {
          game.load(fenParts.join(' '));
        } catch (e) {
          break; // Can't continue
        }
      }
    } else {
      if (blackIndex < blackMoves.length) {
        // Black has a move and it's their turn
        const move = blackMoves[blackIndex];
        const success = attemptMove(game, move, 'Black', log);
        blackIndex++;

        if (!success) {
          // Force turn change for invalid moves
          const currentFen = game.fen();
          const fenParts = currentFen.split(' ');
          fenParts[1] = 'w';
          try {
            game.load(fenParts.join(' '));
          } catch (e) {
            console.warn('Failed to force turn change');
          }
        }
      } else {
        // Black has no more moves, skip turn
        const currentFen = game.fen();
        const fenParts = currentFen.split(' ');
        fenParts[1] = 'w';
        try {
          game.load(fenParts.join(' '));
        } catch (e) {
          break;
        }
      }
    }
  }

  console.log('🎬 Simulation complete:', {
    finalFen: game.fen(),
    totalMoves: log.length,
    validMoves: log.filter((m) => !m.isInvalid).length,
  });

  return { fen: game.fen(), log };
};

// Helper function to attempt a move
function attemptMove(
  game: Chess,
  move: { from: string; to: string; san: string },
  playerName: string,
  log: MoveLogItem[]
): boolean {
  try {
    const chessMove = game.move({
      from: move.from,
      to: move.to,
      promotion: 'q',
    });

    if (chessMove) {
      log.push({
        player: playerName === 'White' ? 'P1' : 'P2',
        san: chessMove.san,
        isInvalid: false,
        from: move.from,
        to: move.to,
      });
      return true;
    }
  } catch (error) {
    // Move failed
  }

  // Log invalid move
  log.push({
    player: playerName === 'White' ? 'P1' : 'P2',
    san: move.san,
    isInvalid: true,
    from: move.from,
    to: move.to,
  });
  return false;
}
