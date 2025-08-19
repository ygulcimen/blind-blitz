// components/AnimatedReveal/AnimatedRevealScreen.tsx - EPIC BEAST MODE REDESIGN
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import {
  Zap,
  Target,
  Shield,
  Crown,
  Star,
  Eye,
  Bot,
  Swords,
  Skull,
} from 'lucide-react';

export type GameMode = 'classic' | 'robot_chaos';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
  moveNumber?: number;
}

interface AnimatedRevealScreenProps {
  initialFen: string;
  moveLog: MoveLogItem[];
  finalFen: string;
  onRevealComplete: () => void;
  gameMode?: GameMode;
}

const AnimatedRevealScreen: React.FC<AnimatedRevealScreenProps> = ({
  initialFen,
  moveLog,
  finalFen,
  onRevealComplete,
  gameMode = 'classic',
}) => {
  console.log('🚨 === ANIMATED REVEAL SCREEN ===');
  console.log('🚨 Game Mode:', gameMode);
  console.log('🚨 Received initialFen:', initialFen);
  console.log('🚨 Received moveLog:', JSON.stringify(moveLog, null, 2));
  console.log('🚨 Received finalFen:', finalFen);
  console.log('🚨 Move log length:', moveLog.length);

  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [displayFen, setDisplayFen] = useState(initialFen);
  const [showMoveEffect, setShowMoveEffect] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [currentMove, setCurrentMove] = useState<MoveLogItem | null>(null);

  const totalMoves = moveLog.length;
  const progressPercentage =
    totalMoves > 0 ? ((currentMoveIndex + 1) / totalMoves) * 100 : 0;

  const getGameModeInfo = (mode: GameMode) => {
    switch (mode) {
      case 'classic':
        return {
          name: 'CHAOS COLLISION',
          subtitle: 'Strategic Warfare Unfolds',
          icon: '⚔️',
          secondaryIcon: '🕶️',
          color: 'orange',
          gradient: 'from-orange-400 via-red-500 to-yellow-500',
          bgGradient: 'from-orange-500/20 via-red-500/15 to-yellow-500/10',
          progressGradient: 'from-orange-500 via-red-500 to-yellow-400',
          glowColor: 'shadow-orange-500/30',
          borderColor: 'border-orange-500/50',
          description: 'Blind moves colliding in epic battle',
        };
      case 'robot_chaos':
        return {
          name: 'ROBOT MAYHEM',
          subtitle: 'AI Destruction Protocol Active',
          icon: '🤖',
          secondaryIcon: '💥',
          color: 'purple',
          gradient: 'from-purple-400 via-blue-500 to-green-400',
          bgGradient: 'from-purple-500/20 via-blue-500/15 to-green-500/10',
          progressGradient: 'from-purple-500 via-blue-500 to-green-400',
          glowColor: 'shadow-purple-500/30',
          borderColor: 'border-purple-500/50',
          description: 'Chaotic robots wreaking digital havoc',
        };
      default:
        return {
          name: 'BATTLE REVEAL',
          subtitle: 'Unknown Protocol',
          icon: '⚔️',
          secondaryIcon: '❓',
          color: 'orange',
          gradient: 'from-orange-400 to-red-400',
          bgGradient: 'from-orange-500/20 to-red-500/10',
          progressGradient: 'from-orange-500 to-red-500',
          glowColor: 'shadow-orange-500/30',
          borderColor: 'border-orange-500/50',
          description: 'Moves revealing',
        };
    }
  };

  const modeInfo = getGameModeInfo(gameMode);

  // ─────────────────────────────────────────────────────────────
  // 🎬 SIMULATION LOGIC (Keep original functionality)
  // ─────────────────────────────────────────────────────────────

  const generateBoardStates = (): string[] => {
    const states = [initialFen];
    const game = new Chess(initialFen);

    moveLog.forEach((move, index) => {
      if (move.from && move.to && !move.isInvalid) {
        const currentTurn = game.turn();
        const isWhiteMove = move.player === 'P1';

        if (
          (isWhiteMove && currentTurn === 'w') ||
          (!isWhiteMove && currentTurn === 'b')
        ) {
          try {
            game.move({ from: move.from, to: move.to, promotion: 'q' });
          } catch (e) {
            console.warn(`Move ${index + 1} failed normally:`, move);
          }
        } else {
          const targetTurn = isWhiteMove ? 'w' : 'b';
          const hackedFen = game.fen().replace(/ [wb] /, ` ${targetTurn} `);
          const tempGame = new Chess(hackedFen);

          try {
            const result = tempGame.move({
              from: move.from,
              to: move.to,
              promotion: 'q',
            });
            if (result) {
              const flippedBackFen = tempGame
                .fen()
                .replace(/ [wb] /, ` ${currentTurn} `);
              game.load(flippedBackFen);
            }
          } catch (e) {
            console.warn(`Move ${index + 1} failed in forced mode:`, move);
          }
        }
      }

      states.push(game.fen());
    });

    return states;
  };

  const [boardStates] = useState(() => generateBoardStates());

  // ─────────────────────────────────────────────────────────────
  // 🎭 ANIMATION FLOW (Keep original functionality)
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarting(false);
      if (totalMoves > 0) {
        playNextMove();
      } else {
        setTimeout(() => onRevealComplete(), 1000);
      }
    }, 800);

    return () => clearTimeout(startTimer);
  }, [totalMoves, onRevealComplete]);

  useEffect(() => {
    if (
      !isStarting &&
      currentMoveIndex >= 0 &&
      currentMoveIndex < totalMoves - 1
    ) {
      const timer = setTimeout(
        () => {
          playNextMove();
        },
        gameMode === 'robot_chaos' ? 1000 : 1200
      ); // Faster for robot chaos

      return () => clearTimeout(timer);
    } else if (
      currentMoveIndex >= totalMoves - 1 &&
      !isStarting &&
      totalMoves > 0
    ) {
      const endTimer = setTimeout(() => {
        onRevealComplete();
      }, 1500);

      return () => clearTimeout(endTimer);
    }
  }, [currentMoveIndex, isStarting, totalMoves, onRevealComplete, gameMode]);

  const playNextMove = () => {
    const nextIndex = currentMoveIndex + 1;

    if (nextIndex >= totalMoves) {
      console.log('All moves processed, completing reveal');
      onRevealComplete();
      return;
    }

    console.log(`Playing move ${nextIndex + 1} of ${totalMoves}`);

    setShowMoveEffect(true);
    setTimeout(() => setShowMoveEffect(false), 600);

    setCurrentMove(moveLog[nextIndex]);

    if (nextIndex + 1 < boardStates.length) {
      setDisplayFen(boardStates[nextIndex + 1]);
      console.log(
        `Updated to board state ${nextIndex + 1}:`,
        boardStates[nextIndex + 1]
      );
    } else {
      setDisplayFen(finalFen);
      console.log('Using final FEN:', finalFen);
    }

    setCurrentMoveIndex(nextIndex);
  };

  // ─────────────────────────────────────────────────────────────
  // 🎨 EPIC UI COMPONENTS
  // ─────────────────────────────────────────────────────────────

  const EpicHeader: React.FC = () => (
    <div className="relative">
      {/* Epic glow effect */}
      <div
        className={`absolute inset-0 rounded-2xl blur-xl bg-gradient-to-r ${modeInfo.bgGradient} animate-pulse`}
      />

      <div
        className={`relative px-8 py-6 rounded-2xl border-2 backdrop-blur-xl ${modeInfo.borderColor} ${modeInfo.glowColor} shadow-2xl`}
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="relative">
            <div className="text-5xl animate-spin-slow">{modeInfo.icon}</div>
            <div className="absolute -bottom-1 -right-1 text-2xl animate-bounce">
              {modeInfo.secondaryIcon}
            </div>
          </div>

          <div className="text-center">
            <h1
              className={`text-3xl font-black bg-gradient-to-r ${modeInfo.gradient} bg-clip-text text-transparent animate-pulse mb-1`}
            >
              {modeInfo.name}
            </h1>
            <p className="text-sm text-gray-300 font-bold tracking-wider uppercase">
              {modeInfo.subtitle}
            </p>
          </div>
        </div>

        {!isStarting && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-bold text-white">
                Strike {currentMoveIndex >= 0 ? currentMoveIndex + 1 : 0} of{' '}
                {totalMoves}
              </span>
            </div>

            {/* Epic progress bar */}
            <div className="relative w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/20">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${modeInfo.progressGradient}`}
                style={{ width: `${progressPercentage}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        )}

        {isStarting && (
          <div className="text-center">
            <div className="text-lg text-gray-300 mb-3 font-medium">
              {modeInfo.description}
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-0" />
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200" />
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const BattleSequence: React.FC = () => {
    const getMoveStats = () => {
      const p1Moves = moveLog.filter((m) => m.player === 'P1').length;
      const p2Moves = moveLog.filter((m) => m.player === 'P2').length;
      const validMoves = moveLog.filter((m) => !m.isInvalid).length;
      const invalidMoves = moveLog.filter((m) => m.isInvalid).length;
      return { p1Moves, p2Moves, validMoves, invalidMoves };
    };

    const stats = getMoveStats();

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-black text-white flex items-center justify-center gap-2 mb-2">
            <Swords className="w-6 h-6 text-red-400" />
            {gameMode === 'robot_chaos'
              ? 'Robot Destruction Log'
              : 'Battle Chronicle'}
          </h3>
          <div className="text-sm text-gray-400">
            {totalMoves} strikes of{' '}
            {gameMode === 'robot_chaos' ? 'digital chaos' : 'blind fury'}
          </div>
        </div>

        {/* Epic Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-500/30 rounded-xl p-3 text-center backdrop-blur-sm shadow-lg shadow-blue-500/20">
            <div className="text-2xl mb-1">👑</div>
            <div className="text-blue-400 font-black text-lg">
              {stats.p1Moves}
            </div>
            <div className="text-xs text-gray-300 font-bold">White</div>
          </div>

          <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/30 border border-gray-500/30 rounded-xl p-3 text-center backdrop-blur-sm shadow-lg shadow-gray-500/20">
            <div className="text-2xl mb-1">⚔️</div>
            <div className="text-gray-300 font-black text-lg">
              {stats.p2Moves}
            </div>
            <div className="text-xs text-gray-300 font-bold">Black</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-800/30 border border-green-500/30 rounded-xl p-3 text-center backdrop-blur-sm shadow-lg shadow-green-500/20">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-green-400 font-black text-lg">
              {stats.validMoves}
            </div>
            <div className="text-xs text-gray-300 font-bold">Valid</div>
          </div>

          <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-500/30 rounded-xl p-3 text-center backdrop-blur-sm shadow-lg shadow-red-500/20">
            <div className="text-2xl mb-1">💥</div>
            <div className="text-red-400 font-black text-lg">
              {stats.invalidMoves}
            </div>
            <div className="text-xs text-gray-300 font-bold">Failed</div>
          </div>
        </div>

        {/* Compact Move List */}
        <div className="space-y-2">
          <div className="text-sm font-bold text-gray-300 text-center">
            Strike History
          </div>

          {/* Group moves in pairs - Compact Version */}
          <div className="space-y-1">
            {Array.from({ length: Math.ceil(totalMoves / 2) }).map(
              (_, pairIndex) => {
                const whiteMove = moveLog.find(
                  (m, i) => m.player === 'P1' && Math.floor(i / 2) === pairIndex
                );
                const blackMove = moveLog.find(
                  (m, i) => m.player === 'P2' && Math.floor(i / 2) === pairIndex
                );
                const isCurrentPair =
                  Math.floor(currentMoveIndex / 2) === pairIndex;

                return (
                  <div
                    key={pairIndex}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
                      isCurrentPair
                        ? `bg-gradient-to-r ${modeInfo.bgGradient} ${modeInfo.borderColor} shadow-lg scale-105`
                        : 'bg-gray-800/30 border-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrentPair
                            ? 'bg-yellow-500 text-black'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {pairIndex + 1}
                      </div>
                      {isCurrentPair && (
                        <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                      )}
                    </div>

                    <div className="flex gap-3 text-sm font-bold font-mono">
                      <span
                        className={
                          whiteMove?.isInvalid
                            ? 'text-red-400 line-through'
                            : 'text-white'
                        }
                      >
                        {whiteMove?.san ?? '—'}
                        {whiteMove?.isInvalid && ' 💥'}
                      </span>
                      <span
                        className={
                          blackMove?.isInvalid
                            ? 'text-red-400 line-through'
                            : 'text-gray-300'
                        }
                      >
                        {blackMove?.san ?? '—'}
                        {blackMove?.isInvalid && ' 💥'}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    );
  };

  const CurrentMoveDisplay: React.FC = () => {
    if (!currentMove || currentMoveIndex < 0 || isStarting) return null;

    return (
      <div className="space-y-4">
        {/* Epic Current Move */}
        <div
          className={`relative ${
            showMoveEffect ? 'animate-pulse scale-105' : ''
          }`}
        >
          <div
            className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
              showMoveEffect
                ? `bg-gradient-to-r ${modeInfo.bgGradient}`
                : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
            }`}
          />

          <div
            className={`relative bg-black/40 backdrop-blur-xl border-2 rounded-2xl p-6 transition-all duration-500 ${
              showMoveEffect ? modeInfo.borderColor : 'border-white/20'
            } shadow-2xl`}
          >
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-3 font-bold uppercase tracking-wider">
                {gameMode === 'robot_chaos' ? 'Robot Strike' : 'Current Strike'}
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-4xl animate-bounce">
                  {currentMove.isInvalid
                    ? '💥'
                    : gameMode === 'robot_chaos'
                    ? '🤖'
                    : '⚔️'}
                </div>

                <div className="text-center">
                  <div
                    className={`text-3xl font-black ${
                      currentMove.isInvalid ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {currentMove.san}
                  </div>
                  <div className="text-sm text-gray-300 font-bold">
                    {currentMove.player === 'P1' ? '👑 White' : '⚔️ Black'}
                    {gameMode === 'robot_chaos' ? ' Robot' : ' Warrior'}
                  </div>
                </div>

                <div className="text-3xl">
                  {currentMove.player === 'P1' ? '👑' : '⚔️'}
                </div>
              </div>

              {currentMove.isInvalid && (
                <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-3 animate-pulse">
                  <div className="text-red-400 font-black text-sm flex items-center justify-center gap-2">
                    <Skull className="w-4 h-4" />
                    {gameMode === 'robot_chaos'
                      ? 'ROBOT MALFUNCTION!'
                      : 'STRIKE FAILED!'}
                    <Skull className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completion Status */}
        {progressPercentage >= 100 && (
          <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-2xl p-4 shadow-2xl shadow-green-500/20">
            <div className="text-center text-green-400 font-black text-lg animate-bounce flex items-center justify-center gap-2">
              <span className="text-2xl">🎉</span>
              <span>
                {gameMode === 'robot_chaos'
                  ? 'CHAOS COMPLETE!'
                  : 'BATTLE COMPLETE!'}
              </span>
              <span className="text-2xl">🎉</span>
            </div>
            <div className="text-center text-sm text-gray-300 mt-2 font-bold">
              Entering live combat arena...
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 🎬 RENDER - EPIC BEAST MODE LAYOUT
  // ─────────────────────────────────────────────────────────────

  // Handle empty move log
  if (totalMoves === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden relative">
        {/* Epic animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/[0.07] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/[0.05] rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 flex items-center justify-center h-full w-full">
          <div className="text-center max-w-2xl mx-auto px-6">
            <div className="text-8xl mb-8 animate-bounce">{modeInfo.icon}</div>
            <h2
              className={`text-5xl font-black mb-6 bg-gradient-to-r ${modeInfo.gradient} bg-clip-text text-transparent animate-pulse`}
            >
              {gameMode === 'robot_chaos'
                ? 'SILENT ROBOTS'
                : 'SILENT BATTLEFIELD'}
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-bold">
              {gameMode === 'robot_chaos'
                ? 'The robots made no moves! Proceeding to live combat...'
                : 'No moves made! Proceeding to live combat...'}
            </p>
            <div className="flex justify-center space-x-4">
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-0" />
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce delay-200" />
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      {/* EPIC LAYOUT: Left Battle Log, Center Board, Right Current Move */}

      {/* Left: Battle Sequence */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-orange-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <BattleSequence />
        </div>
      </div>

      {/* Center: Epic Chess Board + Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Epic Header */}
        <div className="mb-6 w-full max-w-2xl">
          <EpicHeader />
        </div>

        {/* Board with epic glow effect */}
        <div className="relative">
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              showMoveEffect
                ? `bg-gradient-to-r ${modeInfo.bgGradient} blur-2xl scale-110`
                : 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-xl'
            } rounded-3xl animate-pulse`}
          />

          <div className="relative z-10">
            <UnifiedChessBoard
              fen={displayFen}
              boardWidth={Math.min(
                650,
                window.innerWidth * 0.4,
                window.innerHeight * 0.6
              )}
              phase="reveal"
              showMoveEffect={showMoveEffect}
              animationDuration={1000}
              gameEnded={false}
            />
          </div>

          {/* Epic move effect overlay */}
          {showMoveEffect && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div
                  className={`w-32 h-32 bg-gradient-to-r ${modeInfo.progressGradient} opacity-30 rounded-full animate-ping`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Players + Current Move Display */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-blue-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Players Section */}
          <div className="space-y-4 mb-6">
            {/* White Player */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm shadow-lg shadow-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-lg">C</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">👑</span>
                    <span className="text-white font-bold">ChessKnight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">
                      1650
                    </span>
                    <span className="text-xs text-blue-300 bg-blue-900/40 px-2 py-1 rounded">
                      EXPERT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Black Player */}
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/30 border border-gray-500/30 rounded-xl p-4 backdrop-blur-sm shadow-lg shadow-gray-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-lg">
                    {gameMode === 'robot_chaos' ? '🤖' : 'G'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">⚔️</span>
                    <span className="text-white font-bold">
                      {gameMode === 'robot_chaos'
                        ? 'CyberMaster'
                        : 'GrandSlayer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm">
                      1847
                    </span>
                    <span className="text-xs text-gray-300 bg-gray-900/40 px-2 py-1 rounded">
                      MASTER
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Move Display */}
          <div className="flex-1 flex flex-col justify-center">
            <CurrentMoveDisplay />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedRevealScreen;
