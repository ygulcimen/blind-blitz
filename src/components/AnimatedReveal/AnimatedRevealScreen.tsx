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
  } = useAnimatedReveal({
    initialFen,
    moveLog,
    finalFen,
    gameMode,
    gameId,
    onRevealComplete,
  });

  // Show loading while determining state
  if (isEmpty) {
    return <LoadingReveal modeInfo={modeInfo} gameMode={gameMode} />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden relative">
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

      {/* Left: Simple Panel */}
      <SimpleRevealPanel
        playerInfo={playerInfo}
        myColor={myColor}
        gameMode={gameMode}
        modeInfo={modeInfo}
        currentMove={currentMove}
        isStarting={isStarting}
        moveLog={moveLog}
      />

      {/* Center: Board Only - Same as BlindPhase */}
      <RevealBoard
        displayFen={displayFen}
        myColor={myColor}
        showMoveEffect={showMoveEffect}
        modeInfo={modeInfo}
      />

      {/* Right: Controls */}
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
  );
};

export default AnimatedRevealScreen;
