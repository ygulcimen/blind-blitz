// components/BlindPhase/MultiplayerBlindPhaseScreen.tsx - OPTIMIZED
import React, { memo } from 'react';
import { useBlindPhaseState } from '../../hooks/useBlindPhaseState';
import { Clock } from 'lucide-react';

// Component imports
import { LoadingBlindPhase } from './components/LoadingBlindPhase';
import { BlindPhasePlayerPanel } from './components/BlindPhasePlayerPanel';
import { BlindPhaseBoard } from './components/BlindPhaseBoard';
import { BlindPhaseControls } from './components/BlindPhaseControls';
import { BlindPhaseHeader } from './components/BlindPhaseHeader';
import { BlindActionButtons } from './components/BlindActionButtons';
import { ResignationModal } from '../shared/ResignationModal/ResignationModal';

interface MultiplayerBlindPhaseScreenProps {
  gameState: any;
  gameId?: string;
}

// Memoized to prevent re-renders from parent timer updates
const MultiplayerBlindPhaseScreen: React.FC<
  MultiplayerBlindPhaseScreenProps
> = memo(({ gameState, gameId }) => {
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
    opponentSubmitted,

    // UI state
    isSubmitting,
    showLobbyConfirm,

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
    handleConfirmLobbyReturn,
    handleCancelLobbyReturn,

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

      {/* Waiting for Opponent Overlay */}
      {mySubmitted && !opponentSubmitted && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 flex items-center justify-center">
          <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-2 border-purple-400/60 rounded-3xl p-10 shadow-2xl max-w-lg mx-4 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-6">
              {/* Animated Clock Icon with Rotating Ring */}
              <div className="relative inline-block">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 w-28 h-28 -m-6">
                  <div className="absolute inset-0 border-4 border-transparent border-t-purple-400/40 border-r-blue-400/40 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                </div>

                {/* Glowing background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-2xl animate-pulse" />

                {/* Clock icon */}
                <Clock className="relative w-16 h-16 text-purple-300 animate-pulse" strokeWidth={2.5} />
              </div>

              {/* Main Message with Gradient Text */}
              <div>
                <h3 className="text-3xl font-black mb-2 bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
                  Moves Submitted!
                </h3>
                <p className="text-purple-100 text-xl font-semibold">
                  Waiting for opponent...
                </p>
              </div>

              {/* Move Summary */}
              <div className="bg-black/30 rounded-xl p-4 border border-purple-400/30">
                <div className="text-sm text-purple-300 mb-2">Your moves submitted:</div>
                <div className="text-2xl font-black text-white">
                  {moveSummary.totalMoves} / {MAX_MOVES}
                </div>
              </div>

              {/* Animated Progress Dots */}
              <div className="flex justify-center gap-2 pt-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
              </div>

              {/* Hint Text */}
              <p className="text-purple-300/70 text-sm italic">
                Hang tight! The reveal will begin shortly...
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Return to Lobby Confirmation Modal */}
      <ResignationModal
        isOpen={showLobbyConfirm}
        onConfirm={handleConfirmLobbyReturn}
        onCancel={handleCancelLobbyReturn}
        title="Return to Lobby?"
        message="Returning to the lobby will resign you from this game. Are you sure you want to leave?"
        confirmText="Yes, Leave"
        cancelText="Stay"
      />
    </div>
  );
});

MultiplayerBlindPhaseScreen.displayName = 'MultiplayerBlindPhaseScreen';

export default MultiplayerBlindPhaseScreen;
