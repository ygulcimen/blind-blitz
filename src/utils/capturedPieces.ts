// utils/capturedPieces.ts - Calculate captured pieces from FEN
import { Chess } from 'chess.js';

export interface CapturedPieces {
  white: { piece: string; count: number }[];
  black: { piece: string; count: number }[];
  materialAdvantage: {
    color: 'white' | 'black' | 'equal';
    value: number;
  };
}

const PIECE_VALUES: { [key: string]: number } = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

const STARTING_PIECES = {
  white: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  black: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
};

export function getCapturedPieces(fen: string): CapturedPieces {
  try {
    const chess = new Chess(fen);
    const board = chess.board();

    // Count pieces currently on board
    const currentPieces = {
      white: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      black: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    board.forEach((row) => {
      row.forEach((square) => {
        if (square) {
          const color = square.color === 'w' ? 'white' : 'black';
          const piece = square.type;
          currentPieces[color][piece]++;
        }
      });
    });

    // Calculate captured pieces (starting - current)
    const capturedByWhite: { [key: string]: number } = {};
    const capturedByBlack: { [key: string]: number } = {};

    // White captured black pieces
    for (const [piece, startCount] of Object.entries(STARTING_PIECES.black)) {
      const captured = startCount - currentPieces.black[piece as keyof typeof currentPieces.black];
      if (captured > 0 && piece !== 'k') {
        // Don't show captured kings
        capturedByWhite[piece] = captured;
      }
    }

    // Black captured white pieces
    for (const [piece, startCount] of Object.entries(STARTING_PIECES.white)) {
      const captured = startCount - currentPieces.white[piece as keyof typeof currentPieces.white];
      if (captured > 0 && piece !== 'k') {
        // Don't show captured kings
        capturedByBlack[piece] = captured;
      }
    }

    // Calculate material advantage
    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (const [piece, count] of Object.entries(capturedByWhite)) {
      whiteMaterial += PIECE_VALUES[piece] * count;
    }

    for (const [piece, count] of Object.entries(capturedByBlack)) {
      blackMaterial += PIECE_VALUES[piece] * count;
    }

    const materialDiff = whiteMaterial - blackMaterial;

    return {
      white: Object.entries(capturedByWhite)
        .map(([piece, count]) => ({ piece, count }))
        .sort((a, b) => PIECE_VALUES[b.piece] - PIECE_VALUES[a.piece]), // Sort by value
      black: Object.entries(capturedByBlack)
        .map(([piece, count]) => ({ piece, count }))
        .sort((a, b) => PIECE_VALUES[b.piece] - PIECE_VALUES[a.piece]),
      materialAdvantage: {
        color: materialDiff > 0 ? 'white' : materialDiff < 0 ? 'black' : 'equal',
        value: Math.abs(materialDiff),
      },
    };
  } catch (error) {
    console.error('Error calculating captured pieces:', error);
    return {
      white: [],
      black: [],
      materialAdvantage: { color: 'equal', value: 0 },
    };
  }
}
