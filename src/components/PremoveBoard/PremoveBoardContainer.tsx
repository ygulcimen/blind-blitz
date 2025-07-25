import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import PremoveBoard from './index';
import ViolationToast from './ViolationToast';
import type { BlindSequence } from '../../types/BlindTypes';
import {
  EnhancedPieceTracker,
  BlindChessRuleEngine,
  VisualFeedbackHelper,
  type SquareIndicator,
  type ViolationDisplay,
} from '../../services/chess';

interface Props {
  player: 'P1' | 'P2';
  onSubmit: (moves: BlindSequence) => void;
  onReset: () => void;
  onMovesUpdate?: (moves: BlindSequence) => void;
}

const MAX_MOVES = 5;
const MAX_PER_PIECE = 2;

const PremoveBoardContainer = ({
  player,
  onSubmit,
  onReset,
  onMovesUpdate,
}: Props) => {
  const isWhite = player === 'P1';
  const colourLetter = isWhite ? 'w' : 'b';

  const [game, setGame] = useState(() => {
    const g = new Chess();
    g.setTurn(colourLetter);
    return g;
  });

  const [queuedMoves, setQueuedMoves] = useState<BlindSequence>([]);
  const [pieceTracker] = useState(
    () => new EnhancedPieceTracker(MAX_PER_PIECE, MAX_MOVES)
  );
  const [ruleEngine] = useState(
    () => new BlindChessRuleEngine(MAX_PER_PIECE, MAX_MOVES)
  );
  const [pieceIndicators, setPieceIndicators] = useState<{
    [square: string]: SquareIndicator;
  }>({});

  // Enhanced violation handling
  const [violations, setViolations] = useState<ViolationDisplay[]>([]);
  const [showViolation, setShowViolation] = useState(false);

  const showViolationTemporarily = (violationList: ViolationDisplay[]) => {
    setViolations(violationList);
    setShowViolation(true);

    setTimeout(() => {
      setShowViolation(false);
      setTimeout(() => setViolations([]), 500);
    }, 2500);
  };

  useEffect(() => {
    setPieceIndicators(
      VisualFeedbackHelper.getPieceIndicators(game, ruleEngine, colourLetter)
    );
  }, [game, ruleEngine, colourLetter]);

  useEffect(() => {
    if (onMovesUpdate) {
      onMovesUpdate(queuedMoves);
    }
  }, [queuedMoves, onMovesUpdate]);

  const handleDrop = (from: string, to: string, piece: string): boolean => {
    // Enhanced validation with better feedback
    if (queuedMoves.length >= MAX_MOVES) {
      showViolationTemporarily([
        {
          icon: '🛑',
          message:
            'Maximum 5 moves reached! Submit your sequence or undo moves.',
          severity: 'error',
          color: '#ef4444',
        },
      ]);
      return false;
    }

    if ((isWhite && piece[0] !== 'w') || (!isWhite && piece[0] !== 'b')) {
      showViolationTemporarily([
        {
          icon: '❌',
          message: `Only ${isWhite ? 'white' : 'black'} pieces can be moved!`,
          severity: 'error',
          color: '#ef4444',
        },
      ]);
      return false;
    }

    const testMove = { from, to, promotion: 'q' as const };
    const validation = ruleEngine.validateMove(game, testMove);

    if (!validation.isValid) {
      // Convert rule violations to display violations
      const displayViolations = validation.violations.map((violation) => ({
        icon: violation.severity === 'ERROR' ? '🚫' : '⚠️',
        message: violation.message,
        severity:
          violation.severity === 'ERROR'
            ? ('error' as const)
            : ('warning' as const),
        color: violation.severity === 'ERROR' ? '#ef4444' : '#f59e0b',
      }));

      showViolationTemporarily(displayViolations);
      return false;
    }

    const next = new Chess(game.fen());
    const mv = next.move(testMove);
    if (!mv) {
      showViolationTemporarily([
        {
          icon: '⚠️',
          message: 'Invalid chess move! Check piece movement rules.',
          severity: 'warning',
          color: '#f59e0b',
        },
      ]);
      return false;
    }
    next.setTurn(colourLetter);

    pieceTracker.recordMove(next, from, to, mv.san, queuedMoves.length + 1);
    ruleEngine.processMove(
      next,
      { from, to, san: mv.san },
      queuedMoves.length + 1
    );

    setGame(next);
    const newMoves = [...queuedMoves, { from, to, san: mv.san }];
    setQueuedMoves(newMoves);

    // Clear any existing violations on successful move
    setViolations([]);

    return true;
  };

  const handleUndo = () => {
    if (!queuedMoves.length) return;
    const newQueue = queuedMoves.slice(0, -1);
    const g = new Chess();
    g.setTurn(colourLetter);
    pieceTracker.reset();
    ruleEngine.reset();

    newQueue.forEach((move, index) => {
      g.move({ from: move.from, to: move.to, promotion: 'q' });
      g.setTurn(colourLetter);
      pieceTracker.recordMove(g, move.from, move.to, move.san, index + 1);
      ruleEngine.processMove(g, move, index + 1);
    });

    setGame(g);
    setQueuedMoves(newQueue);
    setViolations([]); // Clear violations on undo
  };

  const handleReset = () => {
    const g = new Chess();
    g.setTurn(colourLetter);
    setGame(g);
    setQueuedMoves([]);
    setViolations([]);
    pieceTracker.reset();
    ruleEngine.reset();
    onReset();
  };

  const handleManualSubmit = () => {
    onSubmit(queuedMoves);
  };

  const moveSummary = pieceTracker.getMovementSummary();
  const squareStyles = VisualFeedbackHelper.getEnhancedSquareStyles(
    game,
    pieceTracker,
    colourLetter
  );

  return (
    <div className="relative">
      {/* Violation Toast - positioned above the board */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
        <ViolationToast show={showViolation} violations={violations} />
      </div>

      <PremoveBoard
        game={game}
        isWhite={isWhite}
        squareStyles={squareStyles}
        pieceIndicators={pieceIndicators}
        moves={queuedMoves}
        maxMoves={MAX_MOVES}
        moveSummary={moveSummary}
        onDrop={handleDrop}
        onUndo={handleUndo}
        onReset={handleReset}
        onSubmit={handleManualSubmit}
      />
    </div>
  );
};

export default PremoveBoardContainer;
