// components/AnimatedReveal/AnimatedRevealScreen.tsx - Using Proven Layout
import React from 'react';
import { useAnimatedReveal } from '../../hooks/useAnimatedReveal';

// Component imports
import { SimpleRevealPanel } from './SimpleRevealPanel';
import { RevealBoard } from './RevealBoard';
import { RevealControls } from './RevealControls';
import { LoadingReveal } from './LoadingReveal';

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
  gameId?: string;
}

const AnimatedRevealScreen: React.FC<AnimatedRevealScreenProps> = ({
  initialFen,
  moveLog,
  finalFen,
  onRevealComplete,
  gameMode = 'classic',
  gameId,
}) => {
  const {
    // Animation state
    currentMoveIndex,
    displayFen,
    showMoveEffect,
    isStarting,
    currentMove,
    progressPercentage,
    totalMoves,

    // Game data
    playerInfo,
    myColor,
    moveStats,
    modeInfo,

    // Status
    isEmpty,
    isReady,
    playerDataLoaded,
  } = useAnimatedReveal({
    initialFen,
    moveLog,
    finalFen,
    gameMode,
    gameId,
    onRevealComplete,
  });

  // Show loading while player data is loading or if game is empty
  if (!isReady || isEmpty) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 animate-spin">⚔️</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
            {!playerDataLoaded ? 'Loading Player Data...' : 'Preparing Battle Reveal...'}
          </div>
          <div className="text-sm sm:text-base text-gray-400">
            {!playerDataLoaded ? 'Fetching game participants' : 'Analyzing battle moves'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Epic animated background - Same as BlindPhase */}
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

      {/* Left: Simple Panel - Hidden on mobile */}
      <div className="hidden lg:block">
        <SimpleRevealPanel
          playerInfo={playerInfo}
          myColor={myColor}
          gameMode={gameMode}
          modeInfo={modeInfo}
          currentMove={currentMove}
          isStarting={isStarting}
          moveLog={moveLog}
        />
      </div>

      {/* Center: Board Only - Main focus on mobile */}
      <RevealBoard
        displayFen={displayFen}
        myColor={myColor}
        showMoveEffect={showMoveEffect}
        modeInfo={modeInfo}
      />

      {/* Right: Controls - Hidden on mobile */}
      <div className="hidden lg:block">
        <RevealControls
          modeInfo={modeInfo}
          currentMoveIndex={currentMoveIndex}
          totalMoves={totalMoves}
          progressPercentage={progressPercentage}
          moveLog={moveLog}
          isStarting={isStarting}
          moveStats={moveStats}
        />
      </div>

      {/* Mobile Bottom Panel - Progress & Move Info */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="p-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Revealing Moves
              </span>
              <span className="text-xs text-white font-bold">
                {currentMoveIndex}/{totalMoves}
              </span>
            </div>
            <div className="relative w-full h-2 bg-black/50 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out ${
                  modeInfo.gradient
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Current Move Display */}
          {currentMove && !isStarting && (
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-white/10">
              <span className="text-xs text-gray-400">Move:</span>
              <span className={`text-sm font-black ${
                currentMove.player === 'P1' ? 'text-blue-400' : 'text-purple-400'
              }`}>
                {currentMove.san}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimatedRevealScreen;
