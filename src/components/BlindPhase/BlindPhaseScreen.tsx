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
import {
  ArrowLeft,
  EyeOff,
  Undo,
  RotateCcw,
  Send,
  Rocket,
  Zap,
  Target,
  Shield,
  Crown,
  Star,
} from 'lucide-react';

interface BlindPhaseScreenProps {
  player: 'P1' | 'P2';
  gameState: any;
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

  // Mock player data (replace with real data)
  const currentPlayer = {
    name: isWhite ? 'ChessKnight' : 'GrandSlayer',
    rating: isWhite ? 1650 : 1847,
    isHost: isWhite,
  };

  // ═══════════════════════════════════════════════════════════════
  // STATE - Keep all original logic
  // ═══════════════════════════════════════════════════════════════

  const [game, setGame] = useState(() => {
    const g = new Chess(INITIAL_FEN);
    if (!isWhite) {
      const fenParts = g.fen().split(' ');
      fenParts[1] = 'b';
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

  // ═══════════════════════════════════════════════════════════════
  // EFFECTS - Keep all original logic
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    setPieceIndicators(
      VisualFeedbackHelper.getPieceIndicators(game, ruleEngine, colourLetter)
    );
  }, [game, ruleEngine, colourLetter]);

  useEffect(() => {
    gameState.updateBlindMoves(queuedMoves);
  }, [queuedMoves, gameState]);

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

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS - Keep all original logic
  // ═══════════════════════════════════════════════════════════════

  const handleDrop = (from: string, to: string, piece: string): boolean => {
    if (queuedMoves.length >= MAX_MOVES) {
      showViolations([
        createViolation.moveLimit(queuedMoves.length, MAX_MOVES),
      ]);
      return false;
    }

    if ((isWhite && piece[0] !== 'w') || (!isWhite && piece[0] !== 'b')) {
      showViolations([createViolation.wrongTurn(isWhite ? 'white' : 'black')]);
      return false;
    }

    const testMove = { from, to, promotion: 'q' as const };
    const validation = ruleEngine.validateMove(game, testMove);

    if (!validation.isValid) {
      const displayViolations = validation.violations.map((violation) => {
        switch (violation.type) {
          case 'PIECE_EXHAUSTED':
            return createViolation.pieceExhausted(
              piece.slice(1),
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

    const next = new Chess(game.fen());
    const mv = next.move(testMove);

    if (!mv) {
      showViolations([createViolation.invalidMove()]);
      return false;
    }

    const fenParts = next.fen().split(' ');
    fenParts[1] = colourLetter;
    next.load(fenParts.join(' '));

    pieceTracker.recordMove(next, from, to, mv.san, queuedMoves.length + 1);
    ruleEngine.processMove(
      next,
      { from, to, san: mv.san },
      queuedMoves.length + 1
    );

    setGame(next);
    setQueuedMoves((prev) => [...prev, { from, to, san: mv.san }]);
    clearViolations();
    return true;
  };

  const handleUndo = () => {
    if (!queuedMoves.length) return;
    const newQueue = queuedMoves.slice(0, -1);
    const g = new Chess(INITIAL_FEN);
    if (!isWhite) {
      const fenParts = g.fen().split(' ');
      fenParts[1] = 'b';
      g.load(fenParts.join(' '));
    }
    pieceTracker.reset();
    ruleEngine.reset();
    newQueue.forEach((move, index) => {
      const tempMove = g.move({ from: move.from, to: move.to, promotion: 'q' });
      if (tempMove) {
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
  };

  const handleSubmit = () => {
    gameState.submitBlindMoves(queuedMoves);
  };

  const handleLobbyReturn = () => {
    // Show resignation warning
    if (
      window.confirm(
        '⚠️ SURRENDER WARNING ⚠️\n\nReturning to lobby will count as a RESIGNATION and you will lose this battle!\n\nAre you sure you want to surrender?'
      )
    ) {
      window.location.href = '/games';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎮 EPIC COMPONENTS
  // ═══════════════════════════════════════════════════════════════

  // In BlindPhaseScreen.tsx - Fix the EpicTimer component

  const EpicTimer: React.FC = () => {
    const { timer } = gameState.gameState;
    const timeLeftMs = isWhite ? timer.whiteTime : timer.blackTime;

    // Convert milliseconds to seconds for display
    const timeLeft = Math.ceil(timeLeftMs / 1000); // Convert ms to seconds

    const percentage = (timeLeftMs / timer.duration) * 100;
    const isCritical = timeLeft <= 5; // 5 seconds
    const isWarning = timeLeft <= 10 && timeLeft > 5; // 10 seconds

    return (
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-300 ${
            isCritical
              ? 'bg-red-500/40 animate-pulse'
              : isWarning
              ? 'bg-yellow-500/30'
              : 'bg-blue-500/20'
          }`}
        />

        <div
          className={`relative px-8 py-6 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ${
            isCritical
              ? 'bg-red-900/30 border-red-400/50 shadow-lg shadow-red-500/25'
              : isWarning
              ? 'bg-yellow-900/30 border-yellow-400/50 shadow-lg shadow-yellow-500/25'
              : 'bg-blue-900/30 border-blue-400/50 shadow-lg shadow-blue-500/25'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`text-4xl ${isCritical ? 'animate-bounce' : ''}`}>
                {isWhite ? '👑' : '⚔️'}
              </div>
              {isCritical && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </div>

            <div className="flex-1 text-center">
              <div className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">
                {isWhite ? 'WHITE EMPIRE' : 'BLACK LEGION'} • BLIND ASSAULT
              </div>
              <div className="text-3xl font-black text-white leading-none mb-2">
                {timeLeft}s {/* Now shows seconds like "100s, 99s, 98s..." */}
              </div>

              {/* Epic progress bar */}
              <div className="relative w-full h-2 bg-black/50 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear ${
                    isCritical
                      ? 'bg-gradient-to-r from-red-400 to-red-600'
                      : isWarning
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>

            <EyeOff
              className={`w-6 h-6 text-white ${
                isCritical ? 'animate-pulse' : ''
              }`}
            />
          </div>

          {isCritical && (
            <div className="mt-3 text-center text-red-300 text-sm font-bold uppercase tracking-wider animate-pulse">
              ⚡ FINAL MOMENTS! ⚡
            </div>
          )}
        </div>
      </div>
    );
  };

  const PlayerCard: React.FC = () => (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl shadow-purple-500/20 relative">
      {/* Host Crown */}
      {currentPlayer.isHost && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-2 py-1 rounded-lg text-xs font-black shadow-lg">
          HOST
        </div>
      )}

      {/* Player Avatar - Compact */}
      <div className="text-center">
        <div className="relative inline-block mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-xl">
            <span className="text-white font-black text-lg drop-shadow-lg">
              {currentPlayer.name[0]}
            </span>
          </div>
          {currentPlayer.isHost && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
              <Crown className="w-3 h-3 text-white fill-current" />
            </div>
          )}
        </div>

        <h3 className="text-sm font-black mb-1 tracking-wide text-white">
          {currentPlayer.name}
        </h3>

        <div className="flex items-center justify-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-yellow-400 font-bold text-sm">
            {currentPlayer.rating}
          </span>
          <div className="px-1 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300 font-bold">
            {currentPlayer.rating > 1800
              ? 'MASTER'
              : currentPlayer.rating > 1600
              ? 'EXPERT'
              : 'WARRIOR'}
          </div>
        </div>

        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-900/40 text-purple-300 text-xs">
          {currentPlayer.isHost ? (
            <Shield className="w-3 h-3" />
          ) : (
            <Target className="w-3 h-3" />
          )}
          <span className="font-bold">
            {currentPlayer.isHost ? 'Master' : 'Challenger'}
          </span>
        </div>
      </div>
    </div>
  );

  const BattleSequence: React.FC = () => (
    <div className="space-y-2">
      <div className="text-center mb-3">
        <h3 className="text-lg font-black text-white flex items-center justify-center gap-2 mb-1">
          <Target className="w-5 h-5 text-blue-400" />
          Battle Sequence
        </h3>
        <div className="text-xs text-gray-400">
          {queuedMoves.length}/{MAX_MOVES} strikes planned
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: MAX_MOVES }).map((_, i) => {
          const move = queuedMoves[i];
          const isActive = i < queuedMoves.length;
          const isCurrent = i === queuedMoves.length - 1;

          return (
            <div
              key={i}
              className={`relative p-2 rounded-lg border transition-all duration-300 ${
                isActive
                  ? isCurrent
                    ? 'bg-blue-900/40 border-blue-400/50 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800/60 border-gray-600/50'
                  : 'bg-gray-900/30 border-gray-700/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-white'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>

                  <span
                    className={`font-mono text-sm font-bold ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {move?.san ?? '—'}
                  </span>
                  {isActive && <Zap className="w-3 h-3 text-yellow-400" />}
                </div>

                {isCurrent && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const moveSummary = pieceTracker.getMovementSummary();
  const remainingMoves = MAX_MOVES - moveSummary.totalMoves;
  const squareStyles = VisualFeedbackHelper.getEnhancedSquareStyles(
    game,
    pieceTracker,
    colourLetter
  );
  const isComplete = queuedMoves.length === MAX_MOVES;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden relative">
      {/* Epic animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/[0.07] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/[0.05] rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Left: Battle Sequence */}
      <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col relative">
        {/* Panel glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Player Card - Compact */}
          <div className="mb-4">
            <PlayerCard />
          </div>

          {/* Battle Sequence - Compact to show all 5 */}
          <div className="flex-1">
            <BattleSequence />
          </div>

          {/* Bottom Stats */}
          <div className="mt-4 p-3 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-300 font-medium mb-1">
                ⚔️ Battle Rules ⚔️
              </div>
              <div className="text-xs text-gray-500">
                Max 2 strikes per piece • {remainingMoves} remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Epic Chess Board */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Board glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
        </div>

        <div className="relative z-10">
          <UnifiedChessBoard
            fen={game.fen()}
            game={game}
            isFlipped={!isWhite}
            onPieceDrop={handleDrop}
            pieceIndicators={pieceIndicators}
            customSquareStyles={squareStyles}
            phase="blind"
            boardWidth={Math.min(
              700,
              window.innerWidth * 0.5,
              window.innerHeight * 0.85
            )}
          />
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col relative">
        {/* Panel glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-blue-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Epic Timer */}
          <div className="p-6">
            <EpicTimer />
          </div>

          {/* Progress Section */}
          <div className="px-6 pb-6">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Mission Progress
                </span>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-lg ${
                    isComplete
                      ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                      : 'text-gray-400'
                  }`}
                >
                  {moveSummary.totalMoves}/{MAX_MOVES}
                </span>
              </div>

              <div className="flex gap-1">
                {Array.from({ length: MAX_MOVES }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                      i < queuedMoves.length
                        ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 shadow-lg shadow-blue-500/50'
                        : 'bg-gray-700/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Icon-Only Action Buttons */}
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleUndo}
                disabled={queuedMoves.length === 0}
                title="Undo Last Strike"
                className={`relative overflow-hidden p-4 rounded-xl transition-all duration-300 ${
                  queuedMoves.length > 0
                    ? 'bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:scale-105 hover:shadow-amber-500/40'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
                }`}
              >
                <Undo className="w-6 h-6 mx-auto" />
              </button>

              <button
                onClick={handleReset}
                title="Reset All Strikes"
                className="relative overflow-hidden p-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:scale-105 hover:shadow-red-500/40"
              >
                <RotateCcw className="w-6 h-6 mx-auto" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={queuedMoves.length === 0}
              className={`w-full relative overflow-hidden py-6 px-6 rounded-xl transition-all duration-300 ${
                isComplete
                  ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-400 hover:via-emerald-400 hover:to-green-500 text-white animate-pulse shadow-xl shadow-green-500/40 hover:scale-105'
                  : queuedMoves.length > 0
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
                  : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center">
                {isComplete ? (
                  <Rocket className="w-8 h-8" />
                ) : queuedMoves.length > 0 ? (
                  <Send className="w-7 h-7" />
                ) : (
                  <EyeOff className="w-7 h-7" />
                )}
              </div>

              {/* Epic button glow */}
              {(isComplete || queuedMoves.length > 0) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              )}
            </button>
          </div>

          {/* Return to Lobby Button - Bottom Right */}
          <div className="px-6 pb-6 mt-auto">
            <button
              onClick={handleLobbyReturn}
              className="group flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/60 hover:bg-red-600/60 border border-slate-600/50 hover:border-red-500/50 rounded-xl transition-all duration-300 backdrop-blur-sm w-full"
              title="⚠️ Warning: This counts as surrender!"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm">Return to Lobby</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlindPhaseScreen;
