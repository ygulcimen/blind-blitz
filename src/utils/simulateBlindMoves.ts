// utils/simulateBlindMoves.ts - COMPLETE FIXED VERSION
import { Chess } from 'chess.js';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';

export interface MoveLogItemWithRewards extends MoveLogItem {
  goldReward?: number;
  rewardType?: 'valid' | 'invalid' | 'capture' | 'checkmate';
  isCapture?: boolean;
}

interface SimulationResultWithRewards {
  fen: string;
  log: MoveLogItemWithRewards[];
  whiteGold: number;
  blackGold: number;
  checkmateOccurred: boolean;
  checkmateWinner?: 'white' | 'black';
}

export const simulateBlindMovesWithRewards = (
  whiteMoves: BlindSequence,
  blackMoves: BlindSequence,
  entryFee: number
): SimulationResultWithRewards => {
  const game = new Chess();
  const log: MoveLogItemWithRewards[] = [];

  // Fixed reward amounts
  const VALID_REWARD = 5;
  const INVALID_PENALTY = 5;
  const OPPONENT_BONUS = 10;
  const CAPTURE_REWARD = 15;

  let whiteGold = 0;
  let blackGold = 0;
  let checkmateOccurred = false;
  let checkmateWinner: 'white' | 'black' | undefined;

  console.log('🎬 Starting simulation with checkmate detection:', {
    whiteMoves: whiteMoves.length,
    blackMoves: blackMoves.length,
    entryFee,
  });

  let whiteIndex = 0;
  let blackIndex = 0;

  // Process moves in strict chess turn order
  while (whiteIndex < whiteMoves.length || blackIndex < blackMoves.length) {
    const isWhiteTurn = game.turn() === 'w';

    if (isWhiteTurn) {
      if (whiteIndex < whiteMoves.length) {
        const move = whiteMoves[whiteIndex];
        const success = attemptMoveWithRewards(
          game,
          move,
          'White',
          log,
          VALID_REWARD,
          INVALID_PENALTY,
          CAPTURE_REWARD
        );

        // Check for checkmate immediately after successful move
        if (success && game.isCheckmate()) {
          checkmateOccurred = true;
          checkmateWinner = 'white';

          // Update the last move to indicate checkmate
          const lastMove = log[log.length - 1];
          if (lastMove) {
            lastMove.san = lastMove.san + '#';
            lastMove.rewardType = 'checkmate';
          }

          console.log('🏆 CHECKMATE! White wins with', lastMove?.san);
          break;
        }

        // Update gold totals
        const lastLogEntry = log[log.length - 1];
        if (lastLogEntry) {
          whiteGold += lastLogEntry.goldReward || 0;
          if (lastLogEntry.rewardType === 'invalid') {
            blackGold += OPPONENT_BONUS;
          }
        }

        whiteIndex++;
        if (!success) forceTurnChange(game, 'b');
      } else {
        forceTurnChange(game, 'b');
      }
    } else {
      if (blackIndex < blackMoves.length) {
        const move = blackMoves[blackIndex];
        const success = attemptMoveWithRewards(
          game,
          move,
          'Black',
          log,
          VALID_REWARD,
          INVALID_PENALTY,
          CAPTURE_REWARD
        );

        // Check for checkmate immediately after successful move
        if (success && game.isCheckmate()) {
          checkmateOccurred = true;
          checkmateWinner = 'black';

          // Update the last move to indicate checkmate
          const lastMove = log[log.length - 1];
          if (lastMove) {
            lastMove.san = lastMove.san + '#';
            lastMove.rewardType = 'checkmate';
          }

          console.log('🏆 CHECKMATE! Black wins with', lastMove?.san);
          break;
        }

        // Update gold totals
        const lastLogEntry = log[log.length - 1];
        if (lastLogEntry) {
          blackGold += lastLogEntry.goldReward || 0;
          if (lastLogEntry.rewardType === 'invalid') {
            whiteGold += OPPONENT_BONUS;
          }
        }

        blackIndex++;
        if (!success) forceTurnChange(game, 'w');
      } else {
        forceTurnChange(game, 'w');
      }
    }
  }

  // Handle negative balance redistribution (only if no checkmate)
  if (!checkmateOccurred) {
    if (whiteGold < 0) {
      console.log(
        `⚠️ White gold negative (${whiteGold}), redistributing to Black`
      );
      blackGold += Math.abs(whiteGold);
      whiteGold = 0;
    }

    if (blackGold < 0) {
      console.log(
        `⚠️ Black gold negative (${blackGold}), redistributing to White`
      );
      whiteGold += Math.abs(blackGold);
      blackGold = 0;
    }
  }

  console.log('🎬 Simulation complete:', {
    finalFen: game.fen(),
    totalMoves: log.length,
    whiteGold,
    blackGold,
    checkmateOccurred,
    checkmateWinner,
  });

  return {
    fen: game.fen(),
    log,
    whiteGold,
    blackGold,
    checkmateOccurred,
    checkmateWinner,
  };
};

function attemptMoveWithRewards(
  game: Chess,
  move: { from: string; to: string; san: string },
  playerName: string,
  log: MoveLogItemWithRewards[],
  validReward: number,
  invalidPenalty: number,
  captureReward: number
): boolean {
  const isWhite = playerName === 'White';

  try {
    const beforePieces = game
      .board()
      .flat()
      .filter((p) => p !== null).length;

    const chessMove = game.move({
      from: move.from,
      to: move.to,
      promotion: 'q',
    });

    if (chessMove) {
      const afterPieces = game
        .board()
        .flat()
        .filter((p) => p !== null).length;
      const isCapture = beforePieces > afterPieces;

      const goldReward = isCapture ? captureReward : validReward;
      const rewardType = isCapture ? 'capture' : 'valid';

      log.push({
        player: isWhite ? 'P1' : 'P2',
        san: chessMove.san,
        isInvalid: false,
        from: move.from,
        to: move.to,
        goldReward,
        rewardType,
        isCapture,
      });
      return true;
    }
  } catch (error) {
    // Move failed
  }

  // Invalid move
  log.push({
    player: isWhite ? 'P1' : 'P2',
    san: move.san,
    isInvalid: true,
    from: move.from,
    to: move.to,
    goldReward: -invalidPenalty,
    rewardType: 'invalid',
    isCapture: false,
  });
  return false;
}

function forceTurnChange(game: Chess, newTurn: 'w' | 'b'): void {
  try {
    const currentFen = game.fen();
    const fenParts = currentFen.split(' ');
    fenParts[1] = newTurn;
    game.load(fenParts.join(' '));
  } catch (e) {
    console.warn('Failed to force turn change to', newTurn);
  }
}

// Original function for backward compatibility
export const simulateBlindMoves = (
  whiteMoves: BlindSequence,
  blackMoves: BlindSequence
): { fen: string; log: MoveLogItem[] } => {
  const result = simulateBlindMovesWithRewards(whiteMoves, blackMoves, 100);
  return {
    fen: result.fen,
    log: result.log.map((item) => ({
      player: item.player,
      san: item.san,
      isInvalid: item.isInvalid,
      from: item.from,
      to: item.to,
    })),
  };
};
