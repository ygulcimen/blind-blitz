// components/shared/ChessBoard/UnifiedChessBoard.tsx - OPTIMIZED FOR PERFORMANCE
import React, { useState, useMemo, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Chess } from 'chess.js';
import type { SquareIndicator } from '../../../services/chess';

type MoveHint =
  | { to: string; kind: 'quiet' }
  | { to: string; kind: 'capture' }
  | { to: string; kind: 'enpassant' }
  | { to: string; kind: 'castle' };

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
  animationDuration = 150,
  showMoveEffect = false,
}) => {
  // State
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<MoveHint[]>([]);

  // Legal moves calculation
  const getPossibleMoves = useCallback(
    (square: string): MoveHint[] => {
      if (!game || gameEnded) return [];

      try {
        const moves = game.moves({
          square: square as any,
          verbose: true,
        }) as any[];
        return moves.map((m) => {
          // flags: 'c' capture, 'e' en passant, 'k' king-side castle, 'q' queen-side castle
          if (m.flags?.includes('e'))
            return { to: m.to, kind: 'enpassant' } as MoveHint;
          if (m.flags?.includes('k') || m.flags?.includes('q'))
            return { to: m.to, kind: 'castle' } as MoveHint;
          if (m.flags?.includes('c'))
            return { to: m.to, kind: 'capture' } as MoveHint;
          return { to: m.to, kind: 'quiet' } as MoveHint;
        });
      } catch {
        return [];
      }
    },
    [game, gameEnded]
  );
  const getEffectiveTurn = useCallback((): 'w' | 'b' => {
    if (phase === 'live') {
      if (currentTurn) return currentTurn;
      if (game) return game.turn() as 'w' | 'b';
    }
    return 'w';
  }, [phase, currentTurn, game]);

  // Square click handler
  const handleSquareClick = useCallback(
    (square: string) => {
      if (gameEnded) return;

      // If clicking on selected square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If a piece is selected and clicking on legal move, make the move
      if (selectedSquare && legalMoves.some((m) => m.to === square)) {
        const piece = game?.get(selectedSquare as any);
        if (piece && onPieceDrop) {
          const success = onPieceDrop(
            selectedSquare,
            square,
            piece.color + piece.type
          );
          if (success) {
            setSelectedSquare(null);
            setLegalMoves([]);
            return;
          }
        }
      }

      // Select new square and show its legal moves
      const piece = game?.get(square as any);
      if (piece && !gameEnded) {
        // Check if it's the correct player's turn in live phase
        if (phase === 'live') {
          const turn = getEffectiveTurn();
          const pieceColor = piece.color as 'w' | 'b';
          if (
            (turn === 'w' && pieceColor !== 'w') ||
            (turn === 'b' && pieceColor !== 'b')
          ) {
            setSelectedSquare(null);
            setLegalMoves([]);
            return;
          }
        }

        setSelectedSquare(square);
        setLegalMoves(getPossibleMoves(square));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }

      onSquareClick?.(square);
    },
    [
      selectedSquare,
      legalMoves,
      gameEnded,
      game,
      onPieceDrop,
      getPossibleMoves,
      onSquareClick,
      phase,
    ]
  );

  // Piece drop handler - strict validation
  const handlePieceDrop = useCallback(
    (from: string, to: string, piece: string): boolean => {
      if (gameEnded || !onPieceDrop) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return false;
      }

      // Don't hard-reject here; let parent validate + optimistically update FEN.
      // This avoids the immediate snap-back visual.
      const accepted = onPieceDrop(from, to, piece);

      // Clear local selection regardless
      setSelectedSquare(null);
      setLegalMoves([]);

      // IMPORTANT:
      // - If parent returns true and updates `fen` immediately (optimistic),
      //   the piece will stay where dropped (no bounce).
      // - If parent later rejects (server error), parent will rollback `fen`,
      //   causing a single smooth revert—no initial snap-back.
      return accepted; // <-- return true to prevent the instant snap-back
    },
    [gameEnded, onPieceDrop]
  );

  // Drag begin handler
  const handlePieceDragBegin = useCallback(
    (piece: string, square: string) => {
      if (gameEnded) return false;

      // Check if it's the correct player's turn in live phase
      if (phase === 'live') {
        const turn = getEffectiveTurn();
        const pieceColor = piece[0] as 'w' | 'b';
        if (
          (turn === 'w' && pieceColor !== 'w') ||
          (turn === 'b' && pieceColor !== 'b')
        ) {
          return false;
        }
      }

      // Show legal moves for the piece being dragged
      setSelectedSquare(square);
      setLegalMoves(getPossibleMoves(square));

      return true;
    },
    [gameEnded, phase, game, getPossibleMoves]
  );

  // Drag end handler
  const handlePieceDragEnd = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  // Draggable piece validation
  const isDraggablePiece = useCallback(
    ({ piece, sourceSquare }: { piece: string; sourceSquare: string }) => {
      if (gameEnded) return false;

      // In live phase, only allow current player's pieces
      if (phase === 'live') {
        const turn = getEffectiveTurn();
        const pieceColor = piece[0] as 'w' | 'b';
        return (
          (turn === 'w' && pieceColor === 'w') ||
          (turn === 'b' && pieceColor === 'b')
        );
      }

      // In blind phase, allow all pieces (but check turn validation in drag begin)
      return true;
    },
    [gameEnded, phase, getEffectiveTurn]
  );

  // Square styles
  const getSquareStyles = useMemo((): { [square: string]: any } => {
    const styles: { [square: string]: any } = {};

    // Apply custom styles from props
    Object.assign(styles, customSquareStyles);

    // Last move highlight (live phase only)
    if (lastMove && phase === 'live') {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.15)', // Subtle yellow
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.25)', // More visible destination
      };
    }

    // Selected piece highlight
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(0, 150, 255, 0.3)', // Blue
        border: '2px solid rgba(0, 150, 255, 0.6)',
      };
    }

    // Legal move hints
    legalMoves.forEach((m) => {
      if (m.to === selectedSquare) return;
      const base = styles[m.to] || {};
      const occupied = !!game?.get(m.to as any);
      if (occupied) {
        styles[m.to] = {
          ...base,
          boxShadow: 'inset 0 0 0 6px rgba(0, 200, 0, 0.45)',
        };
      } else {
        styles[m.to] = {
          ...base,
          // small dot ~12% radius
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(0,200,0,0.75) 0 12%, rgba(0,0,0,0) 13%)',
        };
      }
    });
    // Blind phase piece indicators
    if (phase === 'blind') {
      Object.entries(pieceIndicators).forEach(([square, indicator]) => {
        const opacity =
          indicator.status === 'exhausted'
            ? 0.4
            : indicator.status === 'warning'
            ? 0.3
            : 0.2;

        styles[square] = {
          ...styles[square],
          backgroundColor: `rgba(${
            indicator.status === 'exhausted'
              ? '255, 0, 0'
              : indicator.status === 'warning'
              ? '255, 165, 0'
              : '0, 255, 0'
          }, ${opacity})`,
        };
      });
    }

    return styles;
  }, [
    customSquareStyles,
    lastMove,
    phase,
    selectedSquare,
    legalMoves,
    pieceIndicators,
  ]);

  const handleMouseOverSquare = useCallback(
    (square: string) => {
      if (selectedSquare || gameEnded || !game) return;
      const piece = game.get(square as any);
      if (!piece) return;
      if (phase === 'live') {
        const turn = getEffectiveTurn();
        if (piece.color !== turn) return;
      }
      setLegalMoves(getPossibleMoves(square));
    },
    [selectedSquare, gameEnded, game, phase, getEffectiveTurn, getPossibleMoves]
  );

  const handleMouseOutSquare = useCallback(() => {
    if (!selectedSquare) setLegalMoves([]);
  }, [selectedSquare]);

  // Board styling
  const boardContainerClass = useMemo(() => {
    return 'relative rounded-lg shadow-xl bg-gradient-to-br from-amber-50 to-amber-100';
  }, []);

  const boardStyle = useMemo(
    () => ({
      borderRadius: '8px',
    }),
    []
  );

  // Piece indicators for blind phase
  const renderPieceIndicators = useMemo(() => {
    if (phase !== 'blind' || Object.keys(pieceIndicators).length === 0) {
      return null;
    }

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {Object.entries(pieceIndicators).map(([square, indicator]) => {
          const file = square.charCodeAt(0) - 97;
          const rank = parseInt(square[1]) - 1;
          const squareSize = boardWidth / 8;
          const x = isFlipped ? (7 - file) * squareSize : file * squareSize;
          const y = isFlipped ? rank * squareSize : (7 - rank) * squareSize;

          return (
            <div
              key={square}
              className={`absolute text-white text-xs font-bold rounded-full 
                ${
                  indicator.status === 'exhausted'
                    ? 'bg-red-500'
                    : indicator.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }
              `}
              style={{
                left: x + squareSize * 0.75,
                top: y + squareSize * 0.1,
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                zIndex: 10,
              }}
            >
              {indicator.moveCount}
            </div>
          );
        })}
      </div>
    );
  }, [phase, pieceIndicators, boardWidth, isFlipped]);

  // Render
  return (
    <div className={boardContainerClass}>
      <Chessboard
        boardOrientation={isFlipped ? 'black' : 'white'}
        position={fen}
        onPieceDrop={handlePieceDrop}
        onPieceDragBegin={handlePieceDragBegin}
        onPieceDragEnd={handlePieceDragEnd}
        onSquareClick={handleSquareClick}
        onMouseOverSquare={handleMouseOverSquare}
        onMouseOutSquare={handleMouseOutSquare}
        onSquareRightClick={() => {
          setSelectedSquare(null);
          setLegalMoves([]);
        }}
        isDraggablePiece={isDraggablePiece}
        boardWidth={boardWidth}
        customSquareStyles={getSquareStyles}
        customBoardStyle={boardStyle}
        animationDuration={animationDuration}
        arePiecesDraggable={!gameEnded}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        showBoardNotation={false}
      />

      {renderPieceIndicators}

      {gameEnded && (
        <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default UnifiedChessBoard;
