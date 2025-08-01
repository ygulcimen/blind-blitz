// components/BlindPhase/BlindPhaseScreen.tsx - FIXED BOARD STATE ISSUE
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import { useViolations } from '../shared/ViolationSystem';
import {
  BlindChessRuleEngine,
  EnhancedPieceTracker,
  VisualFeedbackHelper,
} from '../../services/chess';
import type { BlindSequence } from '../../types/BlindTypes';
import MoveLogPanel from './MoveLogPanel';
import ActionButtons from './ActionButtons';
import LegendPanel from './LegendPanel';

interface BlindPhaseScreenProps {
  player: 'P1' | 'P2';
  gameState: any; // Will be properly typed with GameStateManager
}

const MAX_MOVES = 5;
const MAX_PER_PIECE = 2;
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const BlindPhaseScreen: React.FC<BlindPhaseScreenProps> = ({
  player,
  gameState,
}) => {
  const isWhite = player === 'P1';
  const colourLetter = isWhite ? 'w' : 'b';
  const { showViolations, createViolation, clearViolations } = useViolations();

  // ─────────────────────────────────────────────────────────────
  // 🏗️ LOCAL STATE - EACH PLAYER GETS FRESH BOARD!
  // ─────────────────────────────────────────────────────────────

  const [game, setGame] = useState(() => {
    // 🔧 FIX: Always start with fresh initial position
    const g = new Chess(INITIAL_FEN);
    // Set turn to current player so they can move their pieces
    if (!isWhite) {
      // For black player, we need to flip the FEN to make it black's turn
      const fenParts = g.fen().split(' ');
      fenParts[1] = 'b'; // Set active color to black
      g.load(fenParts.join(' '));
    }
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
    [square: string]: any;
  }>({});

  // ─────────────────────────────────────────────────────────────
  // 🔄 EFFECTS
  // ─────────────────────────────────────────────────────────────

  // Update piece indicators when game state changes
  useEffect(() => {
    setPieceIndicators(
      VisualFeedbackHelper.getPieceIndicators(game, ruleEngine, colourLetter)
    );
  }, [game, ruleEngine, colourLetter]);

  // Notify parent of moves update
  useEffect(() => {
    gameState.updateBlindMoves(queuedMoves);
  }, [queuedMoves, gameState]);

  // 🔧 FIX: Reset board when player changes
  useEffect(() => {
    const freshGame = new Chess(INITIAL_FEN);
    if (!isWhite) {
      const fenParts = freshGame.fen().split(' ');
      fenParts[1] = 'b';
      freshGame.load(fenParts.join(' '));
    }
    setGame(freshGame);
    setQueuedMoves([]);
    pieceTracker.reset();
    ruleEngine.reset();
    clearViolations();
  }, [player, isWhite, pieceTracker, ruleEngine, clearViolations]);

  // ─────────────────────────────────────────────────────────────
  // 🎮 MOVE HANDLING
  // ─────────────────────────────────────────────────────────────

  const handleDrop = (from: string, to: string, piece: string): boolean => {
    // Check move limit
    if (queuedMoves.length >= MAX_MOVES) {
      showViolations([
        createViolation.moveLimit(queuedMoves.length, MAX_MOVES),
      ]);
      return false;
    }

    // Check piece ownership
    if ((isWhite && piece[0] !== 'w') || (!isWhite && piece[0] !== 'b')) {
      showViolations([createViolation.wrongTurn(isWhite ? 'white' : 'black')]);
      return false;
    }

    // Validate move with rule engine
    const testMove = { from, to, promotion: 'q' as const };
    const validation = ruleEngine.validateMove(game, testMove);

    if (!validation.isValid) {
      const displayViolations = validation.violations.map((violation) => {
        switch (violation.type) {
          case 'PIECE_EXHAUSTED':
            return createViolation.pieceExhausted(
              piece.slice(1), // piece type
              violation.pieceId
                ? pieceTracker.getPieceMoveCount(game.get(from as any), from)
                : 0,
              MAX_PER_PIECE
            );
          case 'MOVE_LIMIT':
            return createViolation.moveLimit(queuedMoves.length, MAX_MOVES);
          case 'INVALID_MOVE':
            return createViolation.invalidMove(violation.message);
          default:
            return createViolation.invalidMove();
        }
      });

      showViolations(displayViolations);
      return false;
    }

    // Execute the move on the player's own board
    const next = new Chess(game.fen());
    const mv = next.move(testMove);

    if (!mv) {
      showViolations([createViolation.invalidMove()]);
      return false;
    }

    // 🔧 FIX: Keep the turn the same so player can keep making moves
    const fenParts = next.fen().split(' ');
    fenParts[1] = colourLetter; // Keep it as current player's turn
    next.load(fenParts.join(' '));

    // Update tracking
    pieceTracker.recordMove(next, from, to, mv.san, queuedMoves.length + 1);
    ruleEngine.processMove(
      next,
      { from, to, san: mv.san },
      queuedMoves.length + 1
    );

    // Update state
    setGame(next);
    setQueuedMoves((prev) => [...prev, { from, to, san: mv.san }]);
    clearViolations();

    return true;
  };

  const handleUndo = () => {
    if (!queuedMoves.length) return;

    const newQueue = queuedMoves.slice(0, -1);

    // Rebuild game state from scratch
    const g = new Chess(INITIAL_FEN);
    if (!isWhite) {
      const fenParts = g.fen().split(' ');
      fenParts[1] = 'b';
      g.load(fenParts.join(' '));
    }

    pieceTracker.reset();
    ruleEngine.reset();

    // Replay moves
    newQueue.forEach((move, index) => {
      const tempMove = g.move({ from: move.from, to: move.to, promotion: 'q' });
      if (tempMove) {
        // Keep turn as current player
        const fenParts = g.fen().split(' ');
        fenParts[1] = colourLetter;
        g.load(fenParts.join(' '));

        pieceTracker.recordMove(g, move.from, move.to, move.san, index + 1);
        ruleEngine.processMove(g, move, index + 1);
      }
    });

    setGame(g);
    setQueuedMoves(newQueue);
    clearViolations();
  };

  const handleReset = () => {
    const g = new Chess(INITIAL_FEN);
    if (!isWhite) {
      const fenParts = g.fen().split(' ');
      fenParts[1] = 'b';
      g.load(fenParts.join(' '));
    }

    setGame(g);
    setQueuedMoves([]);
    pieceTracker.reset();
    ruleEngine.reset();
    clearViolations();
    // Don't call gameState.resetGame() - that would reset the entire game
  };

  const handleSubmit = () => {
    gameState.submitBlindMoves(queuedMoves);
  };

  // ─────────────────────────────────────────────────────────────
  // 📊 COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────

  const moveSummary = pieceTracker.getMovementSummary();
  const remainingMoves = MAX_MOVES - moveSummary.totalMoves;
  const squareStyles = VisualFeedbackHelper.getEnhancedSquareStyles(
    game,
    pieceTracker,
    colourLetter
  );

  // Get timer values from gameState
  const { timer } = gameState.gameState;
  const timeLeft = isWhite ? timer.whiteTime : timer.blackTime;

  // ─────────────────────────────────────────────────────────────
  // 🕐 TIMER COMPONENT
  // ─────────────────────────────────────────────────────────────

  const BlindTimer: React.FC = () => {
    const percentage = (timeLeft / timer.duration) * 100;
    const isCritical = timeLeft <= 3;
    const isWarning = timeLeft <= 5 && timeLeft > 3;

    return (
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`
          px-6 py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 transform
          ${
            isCritical
              ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse scale-110 border-2 border-red-300'
              : isWarning
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-2 border-yellow-300'
              : 'bg-gradient-to-r from-green-500 to-green-600 border-2 border-white/20'
          }
          text-white backdrop-blur-lg
        `}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-bounce">
              {isWhite ? '⚪' : '⚫'}
            </div>
            <div className="text-center">
              <div className="text-xs opacity-90 leading-tight">
                {isWhite ? 'White' : 'Black'} Turn
              </div>
              <div className="text-2xl font-black leading-tight">
                {Math.ceil(timeLeft)}s
              </div>
            </div>
          </div>

          <div className="mt-2 w-full bg-black/30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-1000 ease-linear"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {isCritical && (
            <div className="text-center text-xs mt-1 animate-pulse font-bold">
              ⚠️ TIME RUNNING OUT!
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 🎨 RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* 🕐 BEAUTIFUL TIMER - Top Right */}
      <BlindTimer />

      <div className="relative z-10 pt-20 pb-8 px-4 lg:px-8">
        {/* Beautiful Header */}
        <div className="text-center mb-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 ${
                isWhite
                  ? 'bg-white border-white shadow-white/50'
                  : 'bg-gray-800 border-white shadow-white/30'
              } shadow-lg animate-pulse`}
            />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
                {isWhite ? 'White' : 'Black'} Blind Attack
              </span>
            </h1>
            <div
              className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 ${
                isWhite
                  ? 'bg-white border-white shadow-white/50'
                  : 'bg-gray-800 border-white shadow-white/30'
              } shadow-lg animate-pulse`}
            />
          </div>

          {/* Enhanced Status Bar */}
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/10 shadow-xl max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-8 text-sm lg:text-base">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Max 2 moves per piece</span>
              </div>

              <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

              <div
                className={`flex items-center gap-3 font-bold ${
                  remainingMoves === 0
                    ? 'text-red-400'
                    : remainingMoves <= 1
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    remainingMoves === 0
                      ? 'bg-red-400'
                      : remainingMoves <= 1
                      ? 'bg-yellow-400'
                      : 'bg-green-400'
                  }`}
                ></div>
                <span>
                  {moveSummary.totalMoves}/{MAX_MOVES} moves • {remainingMoves}{' '}
                  remaining
                </span>
              </div>

              <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

              {/* Timer Info in Header */}
              <div
                className={`flex items-center gap-2 font-bold ${
                  timeLeft <= 3
                    ? 'text-red-400'
                    : timeLeft <= 5
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}
              >
                <div className="text-lg animate-bounce">⏰</div>
                <span>{Math.ceil(timeLeft)}s left</span>
              </div>
            </div>
          </div>

          {/* 🔧 DEBUG INFO - Remove in production */}
          <div className="mt-4 bg-purple-900/20 border border-purple-500/30 rounded-lg p-2 text-xs">
            <div className="text-purple-300">
              🧪 Debug: Player {player} | Turn: {game.turn()} | Moves:{' '}
              {queuedMoves.length}
            </div>
          </div>
        </div>

        {/* Main Content - Better Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Chess Board - Center Column */}
            <div className="xl:col-span-7 flex flex-col items-center space-y-6">
              {/* Chess Board */}
              <div className="w-full max-w-2xl">
                <UnifiedChessBoard
                  fen={game.fen()}
                  game={game}
                  isFlipped={!isWhite}
                  onPieceDrop={handleDrop}
                  pieceIndicators={pieceIndicators}
                  customSquareStyles={squareStyles}
                  phase="blind"
                  boardWidth={Math.min(550, window.innerWidth - 80)}
                />
              </div>

              {/* Action Buttons */}
              <ActionButtons
                moves={queuedMoves}
                onUndo={handleUndo}
                onReset={handleReset}
                onSubmit={handleSubmit}
                maxMoves={MAX_MOVES}
              />

              {/* Legend - For mobile */}
              <div className="xl:hidden w-full max-w-2xl">
                <LegendPanel />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="xl:col-span-5 space-y-6">
              {/* Move Log */}
              <MoveLogPanel
                moves={queuedMoves}
                maxMoves={MAX_MOVES}
                moveSummary={moveSummary}
              />

              {/* Legend - For desktop */}
              <div className="hidden xl:block">
                <LegendPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlindPhaseScreen;
