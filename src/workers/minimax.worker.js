// src/workers/minimax.worker.js
// Web Worker for minimax calculations

// Import chess.js
import { Chess } from 'chess.js';

// Piece values
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Position bonuses
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

// Evaluate position
function evaluatePosition(chess) {
  let score = 0;
  const board = chess.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = board[row][col];
      if (square) {
        const piece = square.type;
        const color = square.color;
        const pieceValue = PIECE_VALUES[piece];

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

// Minimax with alpha-beta pruning
function minimax(chess, depth, alpha, beta, maximizingPlayer) {
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

// Listen for messages
self.onmessage = function(e) {
  const { fen, depth, aggression } = e.data;

  try {
    const chess = new Chess(fen);

    if (chess.isGameOver()) {
      self.postMessage({ error: 'Game is over' });
      return;
    }

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) {
      self.postMessage({ error: 'No legal moves' });
      return;
    }

    const isWhite = chess.turn() === 'w';

    // Evaluate all moves
    const evaluatedMoves = legalMoves.map((move) => {
      chess.move(move);
      let score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite);

      // Apply aggression
      if (aggression > 0.5) {
        if (move.captured) score += 30 * aggression;
        if (chess.inCheck()) score += 20 * aggression;
      }

      chess.undo();
      return { move: move.san, score };
    });

    // Sort
    evaluatedMoves.sort((a, b) => (isWhite ? b.score - a.score : a.score - b.score));

    // Return
    self.postMessage({
      bestMove: evaluatedMoves[0].move,
      score: evaluatedMoves[0].score,
      allMoves: evaluatedMoves
    });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
