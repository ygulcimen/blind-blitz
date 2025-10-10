// components/BlindPhase/MultiplayerBlindPhaseScreen.tsx - Refactored
import React from 'react';
import { useBlindPhaseState } from '../../hooks/useBlindPhaseState';

// Component imports
import { LoadingBlindPhase } from './components/LoadingBlindPhase';
import { BlindPhasePlayerPanel } from './components/BlindPhasePlayerPanel';
import { BlindPhaseBoard } from './components/BlindPhaseBoard';
import { BlindPhaseControls } from './components/BlindPhaseControls';
import { BlindPhaseHeader } from './components/BlindPhaseHeader';
import { BlindActionButtons } from './components/BlindActionButtons';

interface MultiplayerBlindPhaseScreenProps {
  gameState: any;
  gameId?: string;
}

const MultiplayerBlindPhaseScreen: React.FC<
  MultiplayerBlindPhaseScreenProps
> = ({ gameState, gameId }) => {
  const {
    // Game state
    game,
    pieceIndicators,
    squareStyles,

    // Player data
    myColor,
    myPlayerData,

    // Move data
    myMoves,
    mySubmitted,

    // UI state
    isSubmitting,

    // Computed values
    isWhite,
    moveSummary,
    remainingMoves,
    isComplete,
    isSubmitDisabled,

    // Actions
    handleDrop,
    handleUndo,
    handleReset,
    handleSubmit,
    handleLobbyReturn,

    // Constants
    MAX_MOVES,
  } = useBlindPhaseState(gameState, gameId);

  // Show loading screen while color assignment happens
  if (!myColor) {
    return <LoadingBlindPhase />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col lg:flex-row overflow-hidden relative">
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

      {/* Left: Player Panel - Hidden on mobile */}
      <div className="hidden lg:block">
        <BlindPhasePlayerPanel
          myPlayerData={myPlayerData}
          myMoves={myMoves}
          mySubmitted={mySubmitted}
          maxMoves={MAX_MOVES}
          remainingMoves={remainingMoves}
        />
      </div>

      {/* Center: Board - Main focus on mobile */}
      <BlindPhaseBoard
        game={game}
        isWhite={isWhite}
        pieceIndicators={pieceIndicators}
        squareStyles={squareStyles}
        onPieceDrop={handleDrop}
      />

      {/* Right: Controls - Hidden on mobile */}
      <div className="hidden lg:block">
        <BlindPhaseControls
          timer={gameState.gameState.timer}
          myMoves={myMoves}
          mySubmitted={mySubmitted}
          isSubmitting={isSubmitting}
          isComplete={isComplete}
          isSubmitDisabled={isSubmitDisabled}
          maxMoves={MAX_MOVES}
          moveSummary={moveSummary}
          onUndo={handleUndo}
          onReset={handleReset}
          onSubmit={handleSubmit}
          onLobbyReturn={handleLobbyReturn}
        />
      </div>

      {/* Mobile Bottom Panel - Timer, Progress & Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="p-3">
          {/* Compact Timer & Progress */}
          <div className="flex items-center justify-between mb-3">
            <BlindPhaseHeader timer={gameState.gameState.timer} />
            <div className="text-xs">
              <span className="text-white font-bold">{moveSummary.totalMoves}/{MAX_MOVES}</span>
              <span className="text-gray-400 ml-1">moves</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <BlindActionButtons
            myMoves={myMoves}
            mySubmitted={mySubmitted}
            isSubmitting={isSubmitting}
            isComplete={isComplete}
            isSubmitDisabled={isSubmitDisabled}
            maxMoves={MAX_MOVES}
            onUndo={handleUndo}
            onReset={handleReset}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default MultiplayerBlindPhaseScreen;
