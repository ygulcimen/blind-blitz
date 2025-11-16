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

    // Try opening book first - this makes bots MUCH stronger in opening!
    const openingMove = getOpeningMove(fen, config.difficulty);
    if (openingMove) {
      console.log(`📖 ${config.name} using opening book move: ${openingMove}`);
      return openingMove;
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

    // Use minimax algorithm
    const { aggression } = config.live_phase;

    // ALWAYS use depth 2 to prevent freezing
    // TODO: Need alternative approach for stronger bots (e.g., better evaluation, opening book)
    const maxDepth = 2;

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    // Evaluate all moves with limited depth
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
 * Comprehensive opening book - makes bots play like masters in opening!
 * This is the key to strong bot play without increasing depth
 */
export function getOpeningMove(fen: string, difficulty: string = 'medium'): string | null {
  const chess = new Chess(fen);
  const moveCount = chess.history().length;

  // Use opening book for first 10 moves (harder bots use it longer)
  const bookDepth = difficulty === 'god' || difficulty === 'expert' ? 12 : difficulty === 'hard' ? 10 : 8;
  if (moveCount > bookDepth) return null;

  // Comprehensive opening book with master-level moves
  const openingBook: Record<string, string[]> = {
    // Move 1 - White's first move
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e4', 'd4', 'Nf3', 'c4'],

    // Black responses to 1.e4
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['e5', 'c5', 'e6', 'c6', 'd6', 'Nf6'],

    // Black responses to 1.d4
    'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['d5', 'Nf6', 'e6', 'c5', 'g6'],

    // Italian Game: 1.e4 e5 2.Nf3
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': ['Nf3', 'Nc3', 'Bc4'],

    // Italian Game: 1.e4 e5 2.Nf3 Nc6
    'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3': ['Bc4', 'Bb5', 'Nc3', 'd4'],

    // Italian Game: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 (Giuoco Piano)
    'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4': ['c3', 'd3', 'Nc3', 'O-O'],

    // Ruy Lopez: 1.e4 e5 2.Nf3 Nc6 3.Bb5
    'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3': ['a6', 'Nf6', 'Bc5', 'd6'],

    // Sicilian Defense: 1.e4 c5 2.Nf3
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2': ['Nf3', 'd4', 'Nc3'],

    // Sicilian Defense: 1.e4 c5 2.Nf3 d6
    'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3': ['d4', 'Bb5+', 'c3'],

    // Sicilian Dragon: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6
    'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6': ['Be3', 'Be2', 'f3', 'Bc4'],

    // French Defense: 1.e4 e6 2.d4
    'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': ['d4', 'd3', 'Nf3'],

    // French Defense: 1.e4 e6 2.d4 d5
    'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3': ['Nc3', 'Nd2', 'e5', 'exd5'],

    // Caro-Kann: 1.e4 c6 2.d4
    'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': ['d4', 'Nc3', 'd3'],

    // Caro-Kann: 1.e4 c6 2.d4 d5
    'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3': ['Nc3', 'Nd2', 'e5', 'exd5'],

    // Queen's Gambit: 1.d4 d5 2.c4
    'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2': ['c4', 'Nf3', 'Bf4'],

    // Queen's Gambit Accepted: 1.d4 d5 2.c4 dxc4
    'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3': ['Nf3', 'e3', 'e4'],

    // Queen's Gambit Declined: 1.d4 d5 2.c4 e6
    'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3': ['Nc3', 'Nf3', 'cxd5'],

    // King's Indian Defense: 1.d4 Nf6 2.c4 g6
    'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3': ['Nc3', 'Nf3', 'g3'],

    // King's Indian Defense: 1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4
    'rnbqk2r/ppppppbp/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4': ['d6', 'O-O', 'c5'],

    // Nimzo-Indian: 1.d4 Nf6 2.c4 e6 3.Nc3 Bb4
    'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4': ['Qc2', 'e3', 'Nf3', 'a3'],
  };

  const possibleMoves = openingBook[fen];
  if (possibleMoves && possibleMoves.length > 0) {
    // God/Expert bots always pick best moves, lower difficulty adds randomness
    if (difficulty === 'god' || difficulty === 'expert') {
      return possibleMoves[0]; // First move is typically strongest
    } else if (difficulty === 'hard') {
      return possibleMoves[Math.floor(Math.random() * Math.min(2, possibleMoves.length))]; // Top 2 moves
    } else {
      return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // Any move
    }
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
