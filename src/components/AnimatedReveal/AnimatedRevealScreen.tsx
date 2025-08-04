// components/AnimatedReveal/AnimatedRevealScreen.tsx - WITH GAME MODE SUPPORT
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';

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
          name: 'Classic Battle',
          icon: '⚔️',
          color: 'orange',
          gradient: 'from-orange-400 to-red-400',
          bgGradient: 'from-orange-500/20 via-orange-500/20 to-red-500/20',
          progressGradient: 'from-orange-500 to-red-500',
          description: 'Strategic moves colliding',
        };
      case 'robot_chaos':
        return {
          name: 'Robot Mayhem',
          icon: '🤖',
          color: 'purple',
          gradient: 'from-purple-400 to-blue-400',
          bgGradient: 'from-purple-500/20 via-blue-500/20 to-green-500/20',
          progressGradient: 'from-purple-500 to-blue-500',
          description: 'Chaotic AI destruction unfolding',
        };
      default:
        return {
          name: 'Battle',
          icon: '⚔️',
          color: 'orange',
          gradient: 'from-orange-400 to-red-400',
          bgGradient: 'from-orange-500/20 via-orange-500/20 to-red-500/20',
          progressGradient: 'from-orange-500 to-red-500',
          description: 'Moves revealing',
        };
    }
  };

  const modeInfo = getGameModeInfo(gameMode);

  // ─────────────────────────────────────────────────────────────
  // 🎬 SIMULATION LOGIC
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
  // 🎭 ANIMATION FLOW
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
  // 🎨 UI HELPERS
  // ─────────────────────────────────────────────────────────────

  const getPlayerIcon = (player: 'P1' | 'P2') => {
    return player === 'P1' ? '⚪' : '⚫';
  };

  const getMoveStatusIcon = (isInvalid: boolean) => {
    return isInvalid ? '💥' : gameMode === 'robot_chaos' ? '🤖' : '⚡';
  };

  const getMoveStats = () => {
    const p1Moves = moveLog.filter((m) => m.player === 'P1').length;
    const p2Moves = moveLog.filter((m) => m.player === 'P2').length;
    const validMoves = moveLog.filter((m) => !m.isInvalid).length;
    const invalidMoves = moveLog.filter((m) => m.isInvalid).length;

    return { p1Moves, p2Moves, validMoves, invalidMoves };
  };

  const stats = getMoveStats();

  // ─────────────────────────────────────────────────────────────
  // 🎬 RENDER - MODE-AWARE DESIGN
  // ─────────────────────────────────────────────────────────────

  // Handle empty move log
  if (totalMoves === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center max-w-xl mx-auto">
            <div className="text-6xl mb-6 animate-bounce">{modeInfo.icon}</div>
            <h2 className="text-3xl font-black mb-4">
              <span
                className={`bg-gradient-to-r ${modeInfo.gradient} bg-clip-text text-transparent`}
              >
                {gameMode === 'robot_chaos'
                  ? 'Silent Robots'
                  : 'Silent Battlefield'}
              </span>
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              {gameMode === 'robot_chaos'
                ? 'The robots made no moves! Proceeding to live combat...'
                : 'No moves made! Proceeding to live combat...'}
            </p>
            <div className="flex justify-center space-x-2">
              <div
                className={`w-2 h-2 bg-${
                  modeInfo.color === 'purple' ? 'purple' : 'blue'
                }-500 rounded-full animate-bounce delay-0`}
              ></div>
              <div
                className={`w-2 h-2 bg-${
                  modeInfo.color === 'purple' ? 'blue' : 'purple'
                }-500 rounded-full animate-bounce delay-200`}
              ></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 p-4 pt-16 min-h-screen">
        {/* LAYOUT MATCHING BLINDPHASE - LEFT MOVELOG, CENTER BOARD, RIGHT STATS */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[calc(100vh-5rem)]">
            {/* LEFT COLUMN: Move Log */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg animate-pulse">{modeInfo.icon}</span>
                  <h3
                    className={`text-base font-bold bg-gradient-to-r ${modeInfo.gradient} bg-clip-text text-transparent`}
                  >
                    {gameMode === 'robot_chaos' ? 'Robot Log' : 'Battle Log'}
                  </h3>
                </div>

                {/* Progress Section */}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="font-medium">
                      {gameMode === 'robot_chaos'
                        ? 'Robot Progress'
                        : 'Chaos Progress'}
                    </span>
                    <span
                      className={`font-bold text-${
                        modeInfo.color === 'purple' ? 'purple' : 'orange'
                      }-400`}
                    >
                      {currentMoveIndex >= 0 ? currentMoveIndex + 1 : 0}/
                      {totalMoves}
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-700/50 rounded-full h-2 overflow-hidden border border-gray-600/30">
                    <div
                      className={`bg-gradient-to-r ${modeInfo.progressGradient} h-2 rounded-full transition-all duration-1000 ease-out relative`}
                      style={{
                        width: `${
                          currentMoveIndex >= 0
                            ? ((currentMoveIndex + 1) / totalMoves) * 100
                            : 0
                        }%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  {progressPercentage >= 100 && (
                    <div className="text-center text-green-400 font-bold text-xs animate-bounce">
                      🎉{' '}
                      {gameMode === 'robot_chaos'
                        ? 'Robots Complete!'
                        : 'Battle Complete!'}
                    </div>
                  )}
                </div>

                {/* Move List */}
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-400 mb-2 px-2 text-xs font-semibold border-b border-gray-700/50 pb-1">
                    <span>Turn</span>
                    <span>Moves</span>
                  </div>

                  {/* Group moves in pairs */}
                  {Array.from({ length: Math.ceil(totalMoves / 2) }).map(
                    (_, pairIndex) => {
                      const whiteMove = moveLog.find(
                        (m, i) =>
                          m.player === 'P1' && Math.floor(i / 2) === pairIndex
                      );
                      const blackMove = moveLog.find(
                        (m, i) =>
                          m.player === 'P2' && Math.floor(i / 2) === pairIndex
                      );
                      const isCurrentPair =
                        Math.floor(currentMoveIndex / 2) === pairIndex;

                      return (
                        <div
                          key={pairIndex}
                          className={`border border-gray-700/50 rounded-lg py-2 px-3 text-xs transition-all duration-300 ${
                            isCurrentPair
                              ? gameMode === 'robot_chaos'
                                ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-600/50 shadow-md'
                                : 'bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-600/50 shadow-md'
                              : 'bg-gray-800/30'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span
                              className={`font-bold ${
                                gameMode === 'robot_chaos'
                                  ? 'text-purple-400'
                                  : 'text-orange-400'
                              }`}
                            >
                              {pairIndex + 1}.
                            </span>
                            <div className="flex gap-3">
                              <span
                                className={`font-bold ${
                                  whiteMove?.isInvalid
                                    ? 'text-red-400 line-through'
                                    : 'text-gray-200'
                                }`}
                              >
                                {whiteMove?.san ?? '—'}
                                {whiteMove?.isInvalid && ' 💥'}
                              </span>
                              <span
                                className={`font-bold ${
                                  blackMove?.isInvalid
                                    ? 'text-red-400 line-through'
                                    : 'text-gray-300'
                                }`}
                              >
                                {blackMove?.san ?? '—'}
                                {blackMove?.isInvalid && ' 💥'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: Chess Board */}
            <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col justify-center space-y-3">
              {/* Starting Phase Display */}
              {isStarting && (
                <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-white/20 p-4 mx-auto max-w-lg text-center">
                  <div className="text-3xl mb-3 animate-spin">
                    {modeInfo.icon}
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      gameMode === 'robot_chaos'
                        ? 'text-purple-400'
                        : 'text-orange-400'
                    } mb-2`}
                  >
                    {modeInfo.name}
                  </div>
                  <div className="text-sm text-gray-300">
                    {modeInfo.description} - {totalMoves} moves...
                  </div>
                </div>
              )}

              {/* Chess Board */}
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className={`absolute -inset-3 transition-all duration-500 ${
                      showMoveEffect
                        ? `bg-gradient-to-r ${modeInfo.bgGradient}`
                        : 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-red-500/5'
                    } rounded-xl blur-lg animate-pulse`}
                  />

                  <div className="relative">
                    <UnifiedChessBoard
                      fen={displayFen}
                      boardWidth={Math.min(420, window.innerWidth - 120)}
                      phase="reveal"
                      showMoveEffect={showMoveEffect}
                      animationDuration={1000}
                      gameEnded={false}
                    />
                  </div>

                  {showMoveEffect && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div
                          className={`w-20 h-20 ${
                            gameMode === 'robot_chaos'
                              ? 'bg-purple-400/30'
                              : 'bg-yellow-400/30'
                          } rounded-full animate-ping`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Battle Stats + Current Move */}
            <div className="lg:col-span-1 order-3 lg:order-3 space-y-4">
              {/* Header */}
              {isStarting ? (
                <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                  <h1 className="text-lg font-black mb-2">
                    <span
                      className={`bg-gradient-to-r ${modeInfo.gradient} bg-clip-text text-transparent`}
                    >
                      {gameMode === 'robot_chaos'
                        ? 'ROBOT CHAOS'
                        : 'CHAOS UNFOLDS'}
                    </span>
                  </h1>
                  <p className="text-xs text-gray-300 mb-2">
                    <span
                      className={`${
                        gameMode === 'robot_chaos'
                          ? 'text-purple-400'
                          : 'text-yellow-400'
                      } font-semibold`}
                    >
                      {totalMoves} moves
                    </span>{' '}
                    {gameMode === 'robot_chaos'
                      ? 'computing...'
                      : 'colliding...'}
                  </p>
                  <div className="text-xs text-gray-400 animate-pulse flex items-center gap-2">
                    <span>{modeInfo.icon}</span>
                    <span>Preparing...</span>
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                  <h1 className="text-lg font-black mb-2">
                    <span
                      className={`bg-gradient-to-r ${modeInfo.gradient} bg-clip-text text-transparent`}
                    >
                      {gameMode === 'robot_chaos'
                        ? 'ROBOTS ACTIVE'
                        : 'BATTLE ACTIVE'}
                    </span>
                  </h1>
                  <div className="text-sm text-gray-300">
                    Move {currentMoveIndex >= 0 ? currentMoveIndex + 1 : 0} of{' '}
                    {totalMoves}
                  </div>
                </div>
              )}

              {/* Battle Statistics */}
              <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
                <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                  <span>📊</span>
                  <span>
                    {gameMode === 'robot_chaos'
                      ? 'Robot Stats'
                      : 'Battle Stats'}
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-600/30 rounded-lg p-2 text-center">
                    <div className="text-gray-400 mb-1">⚪ White</div>
                    <div className="text-blue-400 font-bold text-sm">
                      {stats.p1Moves}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/30 border border-gray-600/30 rounded-lg p-2 text-center">
                    <div className="text-gray-400 mb-1">⚫ Black</div>
                    <div className="text-gray-400 font-bold text-sm">
                      {stats.p2Moves}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-600/30 rounded-lg p-2 text-center">
                    <div className="text-gray-400 mb-1">✓ Valid</div>
                    <div className="text-green-400 font-bold text-sm">
                      {stats.validMoves}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-600/30 rounded-lg p-2 text-center">
                    <div className="text-gray-400 mb-1">✗ Invalid</div>
                    <div className="text-red-400 font-bold text-sm">
                      {stats.invalidMoves}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Move Display */}
              {currentMove && currentMoveIndex >= 0 && !isStarting && (
                <div
                  className={`bg-black/30 backdrop-blur-lg rounded-xl border shadow-lg transition-all duration-500 p-4 ${
                    showMoveEffect
                      ? gameMode === 'robot_chaos'
                        ? 'border-purple-400/50 bg-purple-900/20 scale-105'
                        : 'border-yellow-400/50 bg-yellow-900/20 scale-105'
                      : 'border-white/20'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2 font-medium">
                      {gameMode === 'robot_chaos'
                        ? 'Robot Move'
                        : 'Current Move'}
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="text-2xl animate-bounce">
                        {getMoveStatusIcon(currentMove.isInvalid)}
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-xl font-black ${
                            currentMove.isInvalid
                              ? 'text-red-400'
                              : gameMode === 'robot_chaos'
                              ? 'text-purple-400'
                              : 'text-green-400'
                          }`}
                        >
                          {currentMove.san}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-xl">
                          {getPlayerIcon(currentMove.player)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-300">
                      {currentMove.player === 'P1' ? 'White' : 'Black'}
                      {gameMode === 'robot_chaos' ? ' Robot' : ' Player'}
                    </div>
                    {currentMove.isInvalid && (
                      <div className="text-red-400 text-sm font-bold animate-pulse mt-2">
                        ❌{' '}
                        {gameMode === 'robot_chaos'
                          ? 'ROBOT ERROR!'
                          : 'MOVE REJECTED!'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completion Status */}
              {progressPercentage >= 100 && !isStarting && (
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-4">
                  <div className="text-center text-green-400 font-bold text-sm animate-bounce flex items-center justify-center gap-2">
                    <span className="text-lg">🎉</span>
                    <span>
                      {gameMode === 'robot_chaos'
                        ? 'Chaos Complete!'
                        : 'Complete!'}
                    </span>
                  </div>
                  <div className="text-center text-xs text-gray-300 mt-1">
                    Entering live combat...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedRevealScreen;
