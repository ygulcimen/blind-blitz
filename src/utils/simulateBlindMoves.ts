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
  entryFee: number,
  gameMode?: 'classic' | 'robot_chaos'
): SimulationResultWithRewards => {
  const game = new Chess();
  const log: MoveLogItemWithRewards[] = [];

  // For RoboChaos: run simulation but return 0 rewards
  if (gameMode === 'robot_chaos') {
    let whiteIndex = 0;
    let blackIndex = 0;

    // Simulate moves without rewards
    while (whiteIndex < whiteMoves.length || blackIndex < blackMoves.length) {
      const isWhiteTurn = game.turn() === 'w';

      if (isWhiteTurn) {
        if (whiteIndex < whiteMoves.length) {
          const move = whiteMoves[whiteIndex];
          try {
            const chessMove = game.move({
              from: move.from,
              to: move.to,
              promotion: 'q',
            });
            if (chessMove) {
              log.push({
                player: 'P1',
                san: chessMove.san,
                isInvalid: false,
                from: move.from,
                to: move.to,
                goldReward: 0,
              });
            } else {
              log.push({
                player: 'P1',
                san: move.san,
                isInvalid: true,
                from: move.from,
                to: move.to,
                goldReward: 0,
              });
              forceTurnChange(game, 'b');
            }
          } catch {
            log.push({
              player: 'P1',
              san: move.san,
              isInvalid: true,
              from: move.from,
              to: move.to,
              goldReward: 0,
            });
            forceTurnChange(game, 'b');
          }
          whiteIndex++;
        } else {
          forceTurnChange(game, 'b');
        }
      } else {
        if (blackIndex < blackMoves.length) {
          const move = blackMoves[blackIndex];
          try {
            const chessMove = game.move({
              from: move.from,
              to: move.to,
              promotion: 'q',
            });
            if (chessMove) {
              log.push({
                player: 'P2',
                san: chessMove.san,
                isInvalid: false,
                from: move.from,
                to: move.to,
                goldReward: 0,
              });
            } else {
              log.push({
                player: 'P2',
                san: move.san,
                isInvalid: true,
                from: move.from,
                to: move.to,
                goldReward: 0,
              });
              forceTurnChange(game, 'w');
            }
          } catch {
            log.push({
              player: 'P2',
              san: move.san,
              isInvalid: true,
              from: move.from,
              to: move.to,
              goldReward: 0,
            });
            forceTurnChange(game, 'w');
          }
          blackIndex++;
        } else {
          forceTurnChange(game, 'w');
        }
      }
    }

    // Determine who starts live phase based on who is in check
    const parts = game.fen().split(' ');

    // Test if WHITE is in check
    parts[1] = 'w';
    let whiteInCheck = false;
    try {
      const testWhite = new Chess(parts.join(' '));
      whiteInCheck = testWhite.inCheck();
    } catch (e) {
      whiteInCheck = false;
    }

    // Test if BLACK is in check
    parts[1] = 'b';
    let blackInCheck = false;
    try {
      const testBlack = new Chess(parts.join(' '));
      blackInCheck = testBlack.inCheck();
    } catch (e) {
      blackInCheck = false;
    }

    // Decision logic
    if (blackInCheck && !whiteInCheck) {
      // Only black is in check - black starts
      console.log('⚠️ Black is in check - Black starts live phase');
      parts[1] = 'b';
    } else if (whiteInCheck && !blackInCheck) {
      // Only white is in check - white starts
      console.log('⚠️ White is in check - White starts live phase');
      parts[1] = 'w';
    } else {
      // Normal case (no one in check) - white starts
      console.log('✅ Normal position - White starts live phase');
      parts[1] = 'w';
    }

    game.load(parts.join(' '));

    return {
      fen: game.fen(),
      log,
      whiteGold: 0,
      blackGold: 0,
      checkmateOccurred: false,
    };
  }

  // Calculate scaled rewards based on entry fee
  const totalPot = entryFee * 2;
  const commission = Math.floor(totalPot * 0.05);
  const availablePot = totalPot - commission;
  const blindPhasePool = Math.floor(availablePot * 0.4); // 40% for blind phase

  // Scale rewards proportionally with entry fee (100g = base)
  const scaleFactor = entryFee / 100;
  const VALID_REWARD = Math.round(5 * scaleFactor); // 5g at 100g entry, scales proportionally
  const INVALID_PENALTY = Math.round(5 * scaleFactor); // 5g penalty at 100g entry
  const OPPONENT_BONUS = Math.round(10 * scaleFactor); // 10g opponent bonus at 100g entry
  const CAPTURE_REWARD = Math.round(10 * scaleFactor); // 10g capture at 100g entry

  let whiteGold = 0;
  let blackGold = 0;
  let checkmateOccurred = false;
  let checkmateWinner: 'white' | 'black' | undefined;

  console.log('🎬 Starting simulation with checkmate detection:', {
    whiteMoves: whiteMoves.length,
    blackMoves: blackMoves.length,
    entryFee,
  });

  console.log('💰 Blind Phase Reward Structure:', {
    totalPot,
    commission,
    availablePot,
    blindPhasePool,
    validReward: VALID_REWARD,
    captureReward: CAPTURE_REWARD,
    invalidPenalty: INVALID_PENALTY,
    opponentBonus: OPPONENT_BONUS,
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

  // Determine who starts live phase based on who is in check
  const parts = game.fen().split(' ');

  // Test if WHITE is in check
  parts[1] = 'w';
  let whiteInCheck = false;
  try {
    const testWhite = new Chess(parts.join(' '));
    whiteInCheck = testWhite.inCheck();
  } catch (e) {
    whiteInCheck = false;
  }

  // Test if BLACK is in check
  parts[1] = 'b';
  let blackInCheck = false;
  try {
    const testBlack = new Chess(parts.join(' '));
    blackInCheck = testBlack.inCheck();
  } catch (e) {
    blackInCheck = false;
  }

  // Decision logic
  if (blackInCheck && !whiteInCheck) {
    // Only black is in check - black starts
    console.log('⚠️ Black is in check - Black starts live phase');
    parts[1] = 'b';
  } else if (whiteInCheck && !blackInCheck) {
    // Only white is in check - white starts
    console.log('⚠️ White is in check - White starts live phase');
    parts[1] = 'w';
  } else {
    // Normal case (no one in check) - white starts
    console.log('✅ Normal position - White starts live phase');
    parts[1] = 'w';
  }

  game.load(parts.join(' '));
  console.log('🎯 FINAL FEN BEING RETURNED:', game.fen());

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
