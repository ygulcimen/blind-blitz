// components/shared/ChessBoard/UnifiedChessBoard.tsx
import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Chess } from 'chess.js';
import type { SquareIndicator } from '../../../services/chess';

// ═══════════════════════════════════════════════════════════════
// 🎯 UNIFIED CHESS BOARD COMPONENT
// ═══════════════════════════════════════════════════════════════

interface UnifiedChessBoardProps {
  // Core chess props
  fen: string;
  game?: Chess;
  boardWidth?: number;
  isFlipped?: boolean;

  // Interaction props
  onPieceDrop?: (from: string, to: string, piece: string) => boolean;
  onSquareClick?: (square: string) => void;
  gameEnded?: boolean;

  // Visual feedback props
  pieceIndicators?: { [square: string]: SquareIndicator };
  customSquareStyles?: { [square: string]: any };
  lastMove?: { from: string; to: string } | null;

  // Phase-specific props
  phase?: 'blind' | 'reveal' | 'live';
  currentTurn?: 'w' | 'b';

  // Animation props
  animationDuration?: number;
  showMoveEffect?: boolean;
}

export const UnifiedChessBoard: React.FC<UnifiedChessBoardProps> = ({
  fen,
  game,
  boardWidth = 480,
  isFlipped = false,
  onPieceDrop,
  onSquareClick,
  gameEnded = false,
  pieceIndicators = {},
  customSquareStyles = {},
  lastMove = null,
  phase = 'live',
  currentTurn = 'w',
  animationDuration = 200,
  showMoveEffect = false,
}) => {
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 🎨 SQUARE STYLING SYSTEM
  // ─────────────────────────────────────────────────────────────

  const getEnhancedSquareStyles = (): { [square: string]: any } => {
    const styles: { [square: string]: any } = { ...customSquareStyles };

    // Base transition for all squares
    const baseStyle = {
      transition: 'all 0.3s ease',
      borderRadius: '4px',
    };

    // Piece indicators (for blind phase)
    Object.entries(pieceIndicators).forEach(([square, indicator]) => {
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

    // Last move highlight (for live phase)
    if (lastMove && phase === 'live') {
      [lastMove.from, lastMove.to].forEach((square) => {
        styles[square] = {
          ...styles[square],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          border: '3px solid #3b82f6',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
        };
      });
    }

    // Move effect animation (for animated reveal)
    if (showMoveEffect && lastMove) {
      [lastMove.from, lastMove.to].forEach((square) => {
        styles[square] = {
          ...styles[square],
          backgroundColor: 'rgba(255, 215, 0, 0.6)',
          border: '3px solid #ffd700',
          boxShadow: '0 0 25px rgba(255, 215, 0, 0.8)',
          transform: 'scale(1.05)',
        };
      });
    }

    // Hover effect
    if (hoveredSquare && !gameEnded) {
      styles[hoveredSquare] = {
        ...styles[hoveredSquare],
        backgroundColor: 'rgba(168, 85, 247, 0.3)',
        border: '2px solid #a855f7',
        cursor: 'pointer',
      };
    }

    return styles;
  };

  // ─────────────────────────────────────────────────────────────
  // 🎮 INTERACTION HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handlePieceDrop = (
    from: string,
    to: string,
    piece: string
  ): boolean => {
    if (gameEnded || !onPieceDrop) return false;

    const result = onPieceDrop(from, to, piece);

    if (result && phase === 'blind') {
      // Show brief success effect for blind phase
      setHoveredSquare(to);
      setTimeout(() => setHoveredSquare(null), 500);
    }

    return result;
  };

  const handleSquareClick = (square: string) => {
    if (gameEnded) return;

    setHoveredSquare(square);
    setTimeout(() => setHoveredSquare(null), 300);

    onSquareClick?.(square);
  };

  // ─────────────────────────────────────────────────────────────
  // 🎨 BOARD STYLING BY PHASE
  // ─────────────────────────────────────────────────────────────

  const getBoardContainerStyle = () => {
    const baseClasses = 'relative bg-gradient-to-br rounded-xl shadow-2xl';

    switch (phase) {
      case 'blind':
        return `${baseClasses} from-amber-100 to-amber-200 p-4`;
      case 'reveal':
        return `${baseClasses} from-blue-100 to-purple-200 p-4`;
      case 'live':
        return `${baseClasses} from-slate-100 to-slate-200 p-4`;
      default:
        return `${baseClasses} from-gray-100 to-gray-200 p-4`;
    }
  };

  const getBoardStyle = () => {
    const baseStyle = {
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    };

    if (phase === 'reveal' || showMoveEffect) {
      return {
        ...baseStyle,
        boxShadow:
          '0 0 40px rgba(59, 130, 246, 0.4), 0 8px 32px rgba(0,0,0,0.3)',
      };
    }

    return baseStyle;
  };

  // ─────────────────────────────────────────────────────────────
  // 🎯 PIECE MOVE INDICATORS (for blind phase)
  // ─────────────────────────────────────────────────────────────

  const renderPieceIndicators = () => {
    if (phase !== 'blind' || Object.keys(pieceIndicators).length === 0) {
      return null;
    }

    return (
      <div className="absolute inset-4 pointer-events-none">
        {Object.entries(pieceIndicators).map(([square, indicator]) => {
          const file = square.charCodeAt(0) - 97;
          const rank = parseInt(square[1]) - 1;
          const x = isFlipped
            ? (7 - file) * (boardWidth / 8)
            : file * (boardWidth / 8);
          const y = isFlipped
            ? rank * (boardWidth / 8)
            : (7 - rank) * (boardWidth / 8);

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
                left: `${x + (boardWidth / 8) * 0.7}px`,
                top: `${y + (boardWidth / 8) * 0.15}px`,
                fontSize: '10px',
                minWidth: '20px',
                textAlign: 'center',
                zIndex: 10,
              }}
            >
              {indicator.moveCount}
            </div>
          );
        })}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 🎭 PHASE-SPECIFIC OVERLAYS
  // ─────────────────────────────────────────────────────────────

  const renderPhaseOverlay = () => {
    if (phase === 'reveal' && showMoveEffect) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-red-500/20 rounded-lg animate-pulse" />
        </div>
      );
    }

    if (gameEnded) {
      return (
        <div className="absolute inset-0 bg-black/20 rounded-lg pointer-events-none flex items-center justify-center">
          <div className="bg-white/90 rounded-lg px-4 py-2">
            <span className="text-gray-800 font-bold text-lg">Game Over</span>
          </div>
        </div>
      );
    }

    return null;
  };

  // ─────────────────────────────────────────────────────────────
  // 🎬 RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className={getBoardContainerStyle()}>
      {renderPhaseOverlay()}

      <Chessboard
        boardOrientation={isFlipped ? 'black' : 'white'}
        position={fen}
        onPieceDrop={handlePieceDrop}
        onSquareClick={handleSquareClick}
        boardWidth={boardWidth}
        customSquareStyles={getEnhancedSquareStyles()}
        customBoardStyle={getBoardStyle()}
        animationDuration={animationDuration}
        arePiecesDraggable={!gameEnded}
      />

      {renderPieceIndicators()}
    </div>
  );
};

export default UnifiedChessBoard;
