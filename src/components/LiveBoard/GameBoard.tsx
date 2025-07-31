// components/LiveBoard/GameBoard.tsx
import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';

interface GameBoardProps {
  fen: string;
  onPieceDrop: (source: string, target: string) => boolean;
  boardWidth?: number;
  gameEnded: boolean;
  currentTurn: 'w' | 'b';
  lastMove?: { from: string; to: string } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  fen,
  onPieceDrop,
  boardWidth = 420,
  gameEnded,
  currentTurn,
  lastMove = null,
}) => {
  const [lastMoveHighlight, setLastMoveHighlight] = useState<{
    from: string;
    to: string;
  } | null>(lastMove);
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);

  const handlePieceDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ): boolean => {
    if (gameEnded) return false;

    const result = onPieceDrop(sourceSquare, targetSquare);

    if (result) {
      // Show move highlight animation
      setLastMoveHighlight({ from: sourceSquare, to: targetSquare });
      setTimeout(() => {
        setLastMoveHighlight(null);
      }, 1200);
    }

    setDraggedPiece(null);
    return result;
  };

  const handlePieceDragBegin = (piece: string, sourceSquare: string) => {
    setDraggedPiece(sourceSquare);
    return true;
  };

  const handlePieceDragEnd = () => {
    setDraggedPiece(null);
  };

  const getEnhancedSquareStyles = (): { [square: string]: any } => {
    const styles: { [square: string]: any } = {};

    // Last move highlight with pulsing effect
    if (lastMoveHighlight) {
      [lastMoveHighlight.from, lastMoveHighlight.to].forEach((square) => {
        styles[square] = {
          backgroundColor: 'rgba(59, 130, 246, 0.4)',
          border: '3px solid #3b82f6',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
        };
      });
    }

    // Hover effect for interactive squares
    if (hoveredSquare && !gameEnded) {
      styles[hoveredSquare] = {
        ...styles[hoveredSquare],
        backgroundColor: 'rgba(168, 85, 247, 0.25)',
        border: '2px solid #a855f7',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      };
    }

    // Dragged piece source highlighting
    if (draggedPiece) {
      styles[draggedPiece] = {
        ...styles[draggedPiece],
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        border: '2px solid #22c55e',
        borderRadius: '4px',
        boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)',
        transition: 'all 0.2s ease',
      };
    }

    // Turn indicator - highlight squares with pieces that can move
    if (!gameEnded && currentTurn) {
      // This is a simplified version - in a real implementation you'd
      // analyze the FEN to determine which pieces can move
      Object.keys(styles).forEach((square) => {
        if (!styles[square]) {
          styles[square] = {};
        }
        styles[square].transition = 'all 0.3s ease';
      });
    }

    return styles;
  };

  const handleSquareClick = (square: string) => {
    if (!gameEnded) {
      setHoveredSquare(square);
      // Auto-clear hover after a short delay
      setTimeout(() => {
        setHoveredSquare(null);
      }, 1500);
    }
  };

  const handleSquareRightClick = (square: string) => {
    // Optional: Add right-click functionality for marking squares
    console.log(`Right-clicked square: ${square}`);
  };

  return (
    <div className="relative">
      {/* Enhanced glowing border effect */}
      <div className="absolute -inset-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>

      {/* Board container with enhanced styling */}
      <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-xl shadow-2xl">
        <Chessboard
          position={fen}
          onPieceDrop={handlePieceDrop}
          onPieceDragBegin={handlePieceDragBegin}
          onPieceDragEnd={handlePieceDragEnd}
          onSquareClick={handleSquareClick}
          onSquareRightClick={handleSquareRightClick}
          boardWidth={boardWidth}
          boardOrientation="white"
          arePiecesDraggable={!gameEnded}
          animationDuration={300}
          customSquareStyles={getEnhancedSquareStyles()}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
          // Enhanced piece styling
          customPieces={undefined} // Keep default pieces but with enhanced interactions
        />
      </div>

      {/* Live indicator with enhanced animation */}
      {!gameEnded && (
        <div className="absolute -top-3 -right-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse opacity-30 scale-110"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
              LIVE 🔴
            </div>
          </div>
        </div>
      )}

      {/* Drag feedback overlay */}
      {draggedPiece && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-dashed border-green-400 rounded-lg animate-pulse opacity-50"></div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
