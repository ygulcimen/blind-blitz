// components/LivePhase/PlayerBar/CapturedPieces.tsx
import React from 'react';

interface CapturedPiecesProps {
  pieces: { piece: string; count: number }[];
  color: 'white' | 'black';
  materialAdvantage?: number; // Show +3 if this player has advantage
}

// Unicode chess pieces
const PIECE_SYMBOLS = {
  white: {
    p: '♙',
    n: '♘',
    b: '♗',
    r: '♖',
    q: '♕',
    k: '♔',
  },
  black: {
    p: '♟',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
    k: '♚',
  },
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  pieces,
  color,
  materialAdvantage,
}) => {
  if (pieces.length === 0 && !materialAdvantage) {
    return null; // Don't render if no captured pieces and no advantage
  }

  // Get the pieces to display (opponent's pieces that were captured)
  const opponentColor = color === 'white' ? 'black' : 'white';

  return (
    <div className="flex items-center gap-0.5 text-xs sm:text-sm lg:text-base">
      {pieces.map(({ piece, count }) => (
        <div key={piece} className="flex items-center opacity-60">
          <span className="text-gray-400">
            {PIECE_SYMBOLS[opponentColor][piece as keyof typeof PIECE_SYMBOLS.white]}
          </span>
          {count > 1 && (
            <span className="text-[9px] sm:text-[10px] text-gray-500 ml-0.5">
              {count}
            </span>
          )}
        </div>
      ))}
      {materialAdvantage && materialAdvantage > 0 && (
        <span className="text-[9px] sm:text-[10px] lg:text-xs text-green-400 font-semibold ml-1">
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
};
