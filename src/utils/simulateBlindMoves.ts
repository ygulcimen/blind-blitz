// utils/simulateBlindMoves.ts - FIXED REWARD SYSTEM
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

// ✅ FIXED: Correct reward system implementation
export const simulateBlindMovesWithRewards = (
  whiteMoves: BlindSequence,
  blackMoves: BlindSequence,
  entryFee: number
): SimulationResultWithRewards => {
  const game = new Chess();
  const log: MoveLogItemWithRewards[] = [];

  // ✅ FIXED: Use exact fixed amounts as specified
  const VALID_REWARD = 5; // Fixed +5 gold per valid move
  const INVALID_PENALTY = 5; // Fixed -5 gold for invalid move
  const OPPONENT_BONUS = 10; // Fixed +10 gold for opponent when player makes invalid move
  const CAPTURE_REWARD = 15; // Fixed +15 gold per capture

  let whiteGold = 0;
  let blackGold = 0;
  let checkmateOccurred = false;
  let checkmateWinner: 'white' | 'black' | undefined;

  console.log('🎬 Starting FIXED simulation with rewards:', {
    whiteMoves: whiteMoves.length,
    blackMoves: blackMoves.length,
    entryFee,
    VALID_REWARD,
    INVALID_PENALTY,
    OPPONENT_BONUS,
    CAPTURE_REWARD,
  });

  let whiteIndex = 0;
  let blackIndex = 0;

  // Process moves in strict chess turn order
  while (whiteIndex < whiteMoves.length || blackIndex < blackMoves.length) {
    // ✅ Check for checkmate before each move
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'black' : 'white'; // Previous player won
      checkmateOccurred = true;
      checkmateWinner = winner;

      console.log(
        `🏆 CHECKMATE! ${winner.toUpperCase()} WINS during blind phase!`
      );

      // Add checkmate log entry
      log.push({
        player: winner === 'white' ? 'P1' : 'P2',
        san: 'CHECKMATE',
        isInvalid: false,
        goldReward: 0, // Will get entire pot later
        rewardType: 'checkmate',
        isCapture: false,
      });

      break; // End simulation immediately
    }

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

        // Update gold totals
        const lastLogEntry = log[log.length - 1];
        if (lastLogEntry) {
          whiteGold += lastLogEntry.goldReward || 0;
          // If invalid move, opponent gets bonus
          if (lastLogEntry.rewardType === 'invalid') {
            blackGold += OPPONENT_BONUS;
          }
        }

        whiteIndex++;

        if (!success) {
          forceTurnChange(game, 'b');
        }
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

        // Update gold totals
        const lastLogEntry = log[log.length - 1];
        if (lastLogEntry) {
          blackGold += lastLogEntry.goldReward || 0;
          console.log(
            `🔍 Black move: ${lastLogEntry.san}, reward: ${lastLogEntry.goldReward}, running total: ${blackGold}`
          );
          // If invalid move, opponent gets bonus
          if (lastLogEntry.rewardType === 'invalid') {
            whiteGold += OPPONENT_BONUS;
            console.log(
              `💰 White gets opponent bonus: +${OPPONENT_BONUS}, running total: ${whiteGold}`
            );
          }
        }

        blackIndex++;

        if (!success) {
          forceTurnChange(game, 'w');
        }
      } else {
        forceTurnChange(game, 'w');
      }
    }
  }

  // ✅ FIXED: Handle negative balance redistribution
  if (!checkmateOccurred) {
    if (whiteGold < 0) {
      console.log(
        `⚠️ White gold negative (${whiteGold}), redistributing to Black`
      );
      blackGold += Math.abs(whiteGold); // Add negative amount as positive to opponent
      whiteGold = 0; // Set to 0
    }

    if (blackGold < 0) {
      console.log(
        `⚠️ Black gold negative (${blackGold}), redistributing to White`
      );
      whiteGold += Math.abs(blackGold); // Add negative amount as positive to opponent
      blackGold = 0; // Set to 0
    }
  }

  console.log('🎬 FIXED simulation complete:', {
    finalFen: game.fen(),
    totalMoves: log.length,
    validMoves: log.filter((m) => !m.isInvalid).length,
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

// Helper function with reward tracking
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
    // Check if this would be a capture by counting pieces before/after
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

      // ✅ FIXED: Use fixed amounts, not percentages
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

  // ✅ FIXED: Invalid move - use fixed penalty amount
  log.push({
    player: isWhite ? 'P1' : 'P2',
    san: move.san,
    isInvalid: true,
    from: move.from,
    to: move.to,
    goldReward: -invalidPenalty, // Fixed -5 gold
    rewardType: 'invalid',
    isCapture: false,
  });
  return false;
}

// Helper function to force turn change
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
