import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import type { SquareIndicator } from '../../services/chess';

interface BlindChessBoardProps {
  position: string;
  isWhite: boolean;
  onPieceDrop: (from: string, to: string, piece: string) => boolean;
  indicators: { [square: string]: SquareIndicator };
}

const BlindChessBoard = ({
  position,
  isWhite,
  onPieceDrop,
  indicators,
}: BlindChessBoardProps) => {
  const [lastMoveHighlight, setLastMoveHighlight] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);

  const handlePieceDrop = (
    from: string,
    to: string,
    piece: string
  ): boolean => {
    const result = onPieceDrop(from, to, piece);

    if (result) {
      // Show move highlight animation
      setLastMoveHighlight({ from, to });
      setTimeout(() => {
        setLastMoveHighlight(null);
      }, 800);
    }

    return result;
  };

  const getEnhancedSquareStyles = (): { [square: string]: any } => {
    const styles: { [square: string]: any } = {};

    // Piece status indicators
    Object.entries(indicators).forEach(([square, indicator]) => {
      const baseStyle = {
        transition: 'all 0.3s ease',
        borderRadius: '4px',
      };

      switch (indicator.status) {
        case 'exhausted':
          styles[square] = {
            ...baseStyle,
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            border: '2px solid #ef4444',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
          };
          break;
        case 'warning':
          styles[square] = {
            ...baseStyle,
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            border: '2px solid #f59e0b',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
          };
          break;
        default:
          styles[square] = {
            ...baseStyle,
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            border: '2px solid #22c55e',
          };
      }
    });

    // Last move highlight
    if (lastMoveHighlight) {
      [lastMoveHighlight.from, lastMoveHighlight.to].forEach((square) => {
        styles[square] = {
          ...styles[square],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: '3px solid #3b82f6',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
        };
      });
    }

    // Hover effect
    if (hoveredSquare) {
      styles[hoveredSquare] = {
        ...styles[hoveredSquare],
        backgroundColor: 'rgba(168, 85, 247, 0.3)',
        border: '2px solid #a855f7',
        cursor: 'pointer',
      };
    }

    return styles;
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-xl shadow-2xl">
        <Chessboard
          boardOrientation={isWhite ? 'white' : 'black'}
          position={position}
          onPieceDrop={handlePieceDrop}
          boardWidth={500}
          customSquareStyles={getEnhancedSquareStyles()}
          onSquareClick={(square) => setHoveredSquare(square)}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* Enhanced piece move indicators */}
      <div className="absolute inset-4 pointer-events-none">
        {Object.entries(indicators).map(([square, indicator]) => {
          const file = square.charCodeAt(0) - 97;
          const rank = parseInt(square[1]) - 1;
          const x = isWhite ? file * 62.5 : (7 - file) * 62.5;
          const y = isWhite ? (7 - rank) * 62.5 : rank * 62.5;

          return (
            <div
              key={square}
              className={`
                absolute text-white text-xs font-bold rounded-full px-2 py-1 
                shadow-lg transition-all duration-300 transform hover:scale-110
                ${
                  indicator.status === 'exhausted'
                    ? 'bg-red-600 animate-pulse'
                    : indicator.status === 'warning'
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }
              `}
              style={{
                left: `${x + 45}px`,
                top: `${y + 8}px`,
                fontSize: '10px',
                minWidth: '24px',
                textAlign: 'center',
                zIndex: 10,
              }}
            >
              {indicator.moveCount}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlindChessBoard;
