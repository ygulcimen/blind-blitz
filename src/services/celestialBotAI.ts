// src/services/celestialBotAI.ts
// AI engine for Marvel Celestial bots - handles both blind and live phases

import { Chess } from 'chess.js';
import { BlindChessRuleEngine } from './chess/BlindChessRuleEngine';
import { EnhancedPieceTracker } from './chess/EnhancedPieceTracker';
// import { getStockfishBot } from './stockfishBot'; // Disabled temporarily

// Bot configuration from database
export interface BotConfig {
  name: string;
  title: string;
  personality: string;
  difficulty: 'medium' | 'medium-hard' | 'hard' | 'expert' | 'god';
  blind_phase: {
    strategy: 'aggressive' | 'defensive' | 'balanced' | 'aggressive_development' | 'optimal';
    move_quality: number; // 0-1, how good the moves are
    blunder_chance: number; // 0-1, probability of making a bad move
  };
  live_phase: {
    depth: number; // Search depth for minimax
    think_time_ms: number; // How long to "think"
    randomness: number; // 0-1, adds variety to moves
    aggression: number; // 0-1, preference for attacking moves
  };
}

// Piece values for evaluation
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Position bonuses for different pieces
const PAWN_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

/**
 * Evaluate board position (material + position)
 */
function evaluatePosition(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = board[row][col];
      if (square) {
        const piece = square.type;
        const color = square.color;
        const pieceValue = PIECE_VALUES[piece as keyof typeof PIECE_VALUES];

        let positionBonus = 0;
        const squareIndex = row * 8 + col;

        if (piece === 'p') {
          positionBonus = color === 'w' ? PAWN_TABLE[squareIndex] : PAWN_TABLE[63 - squareIndex];
        } else if (piece === 'n') {
          positionBonus = color === 'w' ? KNIGHT_TABLE[squareIndex] : KNIGHT_TABLE[63 - squareIndex];
        }

        const totalValue = pieceValue + positionBonus;
        score += color === 'w' ? totalValue : -totalValue;
      }
    }
  }

  return score;
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluatePosition(chess);
  }

  const moves = chess.moves({ verbose: true });

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Generate blind phase moves (5 moves without seeing the board)
 * Based on bot's strategy and personality
 * NOW ENFORCES: Max 2 moves per piece rule!
 */
export async function generateBlindPhaseMoves(
  config: BotConfig,
  color: 'white' | 'black'
): Promise<string[]> {
  console.log(`🤖 ${config.name} generating blind phase moves...`);

  const chess = new Chess();
  const moves: string[] = [];
  const { strategy, move_quality, blunder_chance } = config.blind_phase;

  // 🔥 CREATE RULE ENGINE AND PIECE TRACKER (max 2 moves per piece, max 5 total moves)
  const ruleEngine = new BlindChessRuleEngine(2, 5);
  const pieceTracker = ruleEngine.getPieceTracker();

  // Set the board to the bot's color turn
  // In blind phase, each player makes their own 5 moves independently
  // So we need to ensure the board starts with the bot's color to move
  const fen = chess.fen().split(' ');
  fen[1] = color === 'white' ? 'w' : 'b';
  chess.load(fen.join(' '));

  // Simulate thinking time
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  for (let i = 0; i < 5; i++) {
    // Ensure it's the bot's turn before generating moves
    const currentFen = chess.fen().split(' ');
    currentFen[1] = color === 'white' ? 'w' : 'b';
    chess.load(currentFen.join(' '));

    // 🔥 FILTER LEGAL MOVES: Only moves from pieces that haven't exhausted their move limit
    const allLegalMoves = chess.moves({ verbose: true });
    const legalMoves = allLegalMoves.filter((move) => {
      const piece = chess.get(move.from as any);
      if (!piece) return false;

      // Check if this piece can still move (hasn't used up its 2 moves)
      return pieceTracker.canPieceMove(piece, move.from);
    });

    if (legalMoves.length === 0) {
      console.log(`  Move ${i + 1}: No legal moves available (all pieces exhausted or no moves)`);
      break;
    }

    let selectedMove;

    // Check for blunder
    if (Math.random() < blunder_chance) {
      // Make a random weak move
      selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      console.log(`  Move ${i + 1}: Blunder! ${selectedMove.san}`);
    } else {
      // Evaluate moves based on strategy
      const evaluatedMoves = legalMoves.map((move) => {
        chess.move(move);
        let score = evaluatePosition(chess);

        // Apply strategy modifiers
        if (strategy === 'aggressive' || strategy === 'aggressive_development') {
          // Favor moves that attack or develop pieces
          if (move.captured) score += 50; // Captures are good
          if (move.piece === 'n' || move.piece === 'b') score += 20; // Develop knights/bishops
        } else if (strategy === 'defensive') {
          // Favor safe moves
          if (!move.captured) score += 10; // Non-captures safer
        } else if (strategy === 'optimal') {
          // Use deeper search for optimal play
          score = minimax(chess, 3, -Infinity, Infinity, chess.turn() === 'w');
        }

        chess.undo();
        return { move, score };
      });

      // Sort by score
      evaluatedMoves.sort((a, b) => b.score - a.score);

      // Select based on move quality
      const topMoveCount = Math.max(1, Math.floor(evaluatedMoves.length * (1 - move_quality)));
      const randomIndex = Math.floor(Math.random() * topMoveCount);
      selectedMove = evaluatedMoves[randomIndex].move;

      console.log(`  Move ${i + 1}: ${selectedMove.san} (score: ${evaluatedMoves[randomIndex].score})`);
    }

    // 🔥 VALIDATE MOVE WITH RULE ENGINE
    const validation = ruleEngine.validateMove(chess, {
      from: selectedMove.from,
      to: selectedMove.to,
      promotion: selectedMove.promotion,
    });

    if (!validation.isValid) {
      console.error(`  ❌ Move ${i + 1} validation failed:`, validation.violations);
      // Skip this move and try to continue (shouldn't happen due to filtering above)
      continue;
    }

    // Make the move on the board
    const moveResult = chess.move(selectedMove);
    if (!moveResult) {
      console.error(`  ❌ Move ${i + 1} failed to execute: ${selectedMove.san}`);
      continue;
    }

    // 🔥 RECORD MOVE IN PIECE TRACKER
    ruleEngine.processMove(chess, {
      from: selectedMove.from,
      to: selectedMove.to,
      san: moveResult.san,
    }, i + 1);

    moves.push(selectedMove.san);

    // 🔥 LOG PIECE TRACKER STATE
    const piece = chess.get(selectedMove.to as any);
    if (piece) {
      const moveCount = pieceTracker.getPieceMoveCount(piece, selectedMove.to);
      console.log(`    ↳ ${piece.type.toUpperCase()} at ${selectedMove.to}: ${moveCount}/2 moves used`);
    }
  }

  console.log(`✅ ${config.name} completed blind phase: ${moves.join(', ')}`);
  console.log(`📊 Final tracker state: ${pieceTracker.getTotalMoves()} total moves, ${pieceTracker.getMovementSummary().exhaustedPieces} exhausted pieces`);
  return moves;
}

/**
 * Calculate best move for live phase using Stockfish or minimax
 */
export async function calculateLivePhaseMove(
  fen: string,
  config: BotConfig
): Promise<string | null> {
  console.log(`🤖 ${config.name} calculating live phase move...`);

  try {
    const chess = new Chess(fen);
    if (chess.isGameOver()) {
      return null;
    }

    const { randomness, think_time_ms } = config.live_phase;

    // TODO: Stockfish integration disabled temporarily due to Web Worker compatibility issues
    // The stockfish.js package requires a different integration approach for Vite
    // For now, all bots use the minimax algorithm with different depths based on difficulty

    // if (config.difficulty === 'hard' || config.difficulty === 'expert' || config.difficulty === 'god') {
    //   try {
    //     console.log(`🧠 Using Stockfish for ${config.difficulty} bot...`);
    //     const stockfish = getStockfishBot();
    //     await stockfish.initialize();
    //     const skillLevelMap = { hard: 12, expert: 16, god: 20 };
    //     const skillLevel = skillLevelMap[config.difficulty];
    //     const stockfishMove = await stockfish.getBestMove(fen, skillLevel, think_time_ms);
    //     if (stockfishMove) {
    //       const move = chess.move({
    //         from: stockfishMove.from,
    //         to: stockfishMove.to,
    //         promotion: stockfishMove.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    //       });
    //       if (move) {
    //         console.log(`✅ Stockfish selected move: ${move.san}`);
    //         return move.san;
    //       }
    //     }
    //     console.warn('⚠️ Stockfish failed, falling back to minimax');
    //   } catch (error) {
    //     console.error('❌ Stockfish error:', error);
    //     console.log('🔄 Falling back to minimax algorithm');
    //   }
    // }

    // Use minimax algorithm with depth based on difficulty
    const { aggression } = config.live_phase;

    // Stronger bots use deeper search - this makes a HUGE difference!
    const depthMap: Record<string, number> = {
      'medium': 2,        // ~1200 ELO
      'medium-hard': 3,   // ~1500 ELO
      'hard': 4,          // ~1800 ELO
      'expert': 5,        // ~2100 ELO
      'god': 6,           // ~2400+ ELO
    };
    const maxDepth = depthMap[config.difficulty] || 2;

    console.log(`🤖 ${config.name} using minimax depth ${maxDepth} (${config.difficulty})`);

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    // Evaluate all moves with difficulty-based depth
    const isWhite = chess.turn() === 'w';
    const evaluatedMoves = legalMoves.map((move) => {
      chess.move(move);
      let score = minimax(chess, maxDepth - 1, -Infinity, Infinity, !isWhite);

      // Apply aggression modifier
      if (aggression > 0.5) {
        if (move.captured) score += 30 * aggression;
        if (chess.inCheck()) score += 20 * aggression;
      }

      chess.undo();
      return { move: move.san, score };
    });

    // Sort by score
    evaluatedMoves.sort((a, b) => (isWhite ? b.score - a.score : a.score - b.score));

    // Apply randomness
    let selectedMove: string;
    if (randomness > 0 && evaluatedMoves.length > 1) {
      const topN = Math.max(1, Math.floor(evaluatedMoves.length * randomness));
      const randomIndex = Math.floor(Math.random() * Math.min(topN, 5));
      selectedMove = evaluatedMoves[randomIndex].move;
    } else {
      selectedMove = evaluatedMoves[0].move;
    }

    console.log(`✅ Selected move: ${selectedMove}`);
    return selectedMove;
  } catch (error) {
    console.error(`❌ Error calculating move:`, error);
    return null;
  }
}

/**
 * Quick opening book moves for variety
 */
export function getOpeningMove(fen: string): string | null {
  const chess = new Chess(fen);
  const moveCount = chess.history().length;

  if (moveCount > 6) return null;

  const openingBook: Record<string, string[]> = {
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e4', 'd4', 'Nf3', 'c4'],
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['e5', 'c5', 'e6', 'c6'],
    'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['d5', 'Nf6', 'e6', 'c6'],
  };

  const possibleMoves = openingBook[fen];
  if (possibleMoves && possibleMoves.length > 0) {
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  return null;
}

/**
 * Check if game ended and determine winner
 */
export function checkGameEnd(fen: string): {
  isGameOver: boolean;
  result: 'checkmate' | 'stalemate' | 'draw' | null;
  winner: 'white' | 'black' | null;
} {
  const chess = new Chess(fen);

  if (!chess.isGameOver()) {
    return { isGameOver: false, result: null, winner: null };
  }

  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'black' : 'white';
    return { isGameOver: true, result: 'checkmate', winner };
  }

  if (chess.isStalemate()) {
    return { isGameOver: true, result: 'stalemate', winner: null };
  }

  if (chess.isDraw()) {
    return { isGameOver: true, result: 'draw', winner: null };
  }

  return { isGameOver: true, result: 'draw', winner: null };
}

export const celestialBotAI = {
  generateBlindPhaseMoves,
  calculateLivePhaseMove,
  getOpeningMove,
  checkGameEnd,
};
