// utils/simulateBlindMoves.ts
import { Chess } from 'chess.js';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';

interface SimulationResult {
  fen: string;
  log: MoveLogItem[];
}

export const simulateBlindMoves = (
  p1Moves: BlindSequence,
  p2Moves: BlindSequence
): SimulationResult => {
  const game = new Chess();
  const log: MoveLogItem[] = [];

  // Simple approach: process moves in chess turn order
  // If a player has no move for their turn, skip to next turn
  let p1Index = 0;
  let p2Index = 0;

  // Calculate total moves to process
  const totalMoves = p1Moves.length + p2Moves.length;
  let processedMoves = 0;

  while (processedMoves < totalMoves) {
    const currentTurn = game.turn(); // 'w' for white, 'b' for black

    if (currentTurn === 'w' && p1Index < p1Moves.length) {
      // White's turn and White has a move
      const p1Move = p1Moves[p1Index];

      try {
        const chessMove = game.move({
          from: p1Move.from,
          to: p1Move.to,
          promotion: 'q',
        });

        if (chessMove) {
          log.push({
            player: 'P1',
            san: chessMove.san,
            isInvalid: false,
            from: p1Move.from,
            to: p1Move.to,
          });
        } else {
          log.push({
            player: 'P1',
            san: p1Move.san,
            isInvalid: true,
            from: p1Move.from,
            to: p1Move.to,
          });
        }
      } catch (error) {
        log.push({
          player: 'P1',
          san: p1Move.san,
          isInvalid: true,
          from: p1Move.from,
          to: p1Move.to,
        });
      }

      p1Index++;
      processedMoves++;
    } else if (currentTurn === 'b' && p2Index < p2Moves.length) {
      // Black's turn and Black has a move
      const p2Move = p2Moves[p2Index];

      try {
        const chessMove = game.move({
          from: p2Move.from,
          to: p2Move.to,
          promotion: 'q',
        });

        if (chessMove) {
          log.push({
            player: 'P2',
            san: chessMove.san,
            isInvalid: false,
            from: p2Move.from,
            to: p2Move.to,
          });
        } else {
          log.push({
            player: 'P2',
            san: p2Move.san,
            isInvalid: true,
            from: p2Move.from,
            to: p2Move.to,
          });
        }
      } catch (error) {
        log.push({
          player: 'P2',
          san: p2Move.san,
          isInvalid: true,
          from: p2Move.from,
          to: p2Move.to,
        });
      }

      p2Index++;
      processedMoves++;
    } else {
      // Current player has no more moves, so we need to force a turn change
      // We'll do this by making a null move (skip turn)

      if (currentTurn === 'w' && p2Index < p2Moves.length) {
        // White has no move, but Black does - process Black's move out of turn
        const p2Move = p2Moves[p2Index];

        // We need to temporarily change turn to black
        // Since chess.js doesn't allow this easily, we'll handle it differently
        // Create a new game state where it's black's turn
        const tempGame = new Chess(game.fen().replace(' w ', ' b '));

        try {
          const chessMove = tempGame.move({
            from: p2Move.from,
            to: p2Move.to,
            promotion: 'q',
          });

          if (chessMove) {
            // Apply the move to our main game by setting the position
            game.load(tempGame.fen().replace(' b ', ' w '));

            log.push({
              player: 'P2',
              san: chessMove.san,
              isInvalid: false,
              from: p2Move.from,
              to: p2Move.to,
            });
          } else {
            log.push({
              player: 'P2',
              san: p2Move.san,
              isInvalid: true,
              from: p2Move.from,
              to: p2Move.to,
            });
          }
        } catch (error) {
          log.push({
            player: 'P2',
            san: p2Move.san,
            isInvalid: true,
            from: p2Move.from,
            to: p2Move.to,
          });
        }

        p2Index++;
        processedMoves++;
      } else if (currentTurn === 'b' && p1Index < p1Moves.length) {
        // Black has no move, but White does - process White's move out of turn
        const p1Move = p1Moves[p1Index];

        // Create a temporary game state where it's white's turn
        const tempGame = new Chess(game.fen().replace(' b ', ' w '));

        try {
          const chessMove = tempGame.move({
            from: p1Move.from,
            to: p1Move.to,
            promotion: 'q',
          });

          if (chessMove) {
            // Apply the move to our main game
            game.load(tempGame.fen().replace(' w ', ' b '));

            log.push({
              player: 'P1',
              san: chessMove.san,
              isInvalid: false,
              from: p1Move.from,
              to: p1Move.to,
            });
          } else {
            log.push({
              player: 'P1',
              san: p1Move.san,
              isInvalid: true,
              from: p1Move.from,
              to: p1Move.to,
            });
          }
        } catch (error) {
          log.push({
            player: 'P1',
            san: p1Move.san,
            isInvalid: true,
            from: p1Move.from,
            to: p1Move.to,
          });
        }

        p1Index++;
        processedMoves++;
      } else {
        // Both players exhausted or some other edge case
        break;
      }
    }
  }

  return {
    fen: game.fen(),
    log,
  };
};
