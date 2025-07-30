interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
}

/**
 * Normalizes the starting FEN to ensure White always moves first
 */
export const normalizeStartingFen = (fen: string): string => {
  const parts = fen.split(' ');
  if (parts.length >= 2) {
    parts[1] = 'w'; // Force White to move first
    return parts.join(' ');
  }
  return fen;
};

/**
 * Separates moves by player (P1 = White, P2 = Black)
 */
export const getWhiteBlackMoves = (moves: MoveLogItem[]) => {
  const whiteMoves = moves.filter((move) => move.player === 'P1');
  const blackMoves = moves.filter((move) => move.player === 'P2');
  return { whiteMoves, blackMoves };
};
