// screens/GameScreen.tsx - FINAL VERSION WITHOUT TEST MODE
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStateManager } from '../state/GameStateManager';
import {
  ViolationToast,
  useViolations,
} from '../components/shared/ViolationSystem';
import WaitingRoomScreen from '../components/WaitingRoom/WaitingRoomScreen';
import BlindPhaseScreen from '../components/BlindPhase/BlindPhaseScreen';
import AnimatedRevealScreen from '../components/AnimatedReveal/AnimatedRevealScreen';
import LivePhaseScreen from '../components/LivePhase/LivePhaseScreen';

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const gameState = useGameStateManager();
  const { violations, showViolation } = useViolations();

  // Track if game has actually started
  const [gameStarted, setGameStarted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // 🎮 GAME START HANDLER
  // ─────────────────────────────────────────────────────────────

  const handleGameStart = () => {
    setGameStarted(true);
  };

  // ─────────────────────────────────────────────────────────────
  // 🎮 MAIN RENDER LOGIC
  // ─────────────────────────────────────────────────────────────

  // If game hasn't started yet, show waiting room
  if (!gameStarted) {
    return <WaitingRoomScreen onGameStart={handleGameStart} />;
  }

  // Once game started, show the actual game phases
  const renderGamePhase = () => {
    switch (gameState.gameState.phase) {
      case 'BLIND_P1':
        return <BlindPhaseScreen player="P1" gameState={gameState} />;

      case 'BLIND_P2':
        return <BlindPhaseScreen player="P2" gameState={gameState} />;

      case 'REVEAL':
        return <RevealTransitionScreen />;

      case 'ANIMATED_REVEAL':
        return (
          <AnimatedRevealScreen
            initialFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            moveLog={gameState.gameState.reveal.moveLog}
            finalFen={gameState.gameState.reveal.finalFen}
            onRevealComplete={gameState.completeAnimatedReveal}
          />
        );

      case 'LIVE':
        return <LivePhaseScreen gameState={gameState} />;

      default:
        return <RevealTransitionScreen />;
    }
  };

  const renderGameHeader = () => {
    const { phase } = gameState.gameState;

    // Don't show header during live phase (it has its own)
    if (phase === 'LIVE') return null;

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Game Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowExitModal(true)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                title="Exit Game"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-2xl">♟️</span>
                <div>
                  <div className="text-white font-bold">BlindChess Battle</div>
                  <div className="text-gray-400 text-sm">
                    {gameId ? `Game #${gameId}` : 'Practice Game'}
                  </div>
                </div>
              </div>
            </div>

            {/* Phase Indicator */}
            <div className="text-center">
              <div className="text-white font-bold">
                {phase === 'BLIND_P1' && '⚪ White Blind Phase'}
                {phase === 'BLIND_P2' && '⚫ Black Blind Phase'}
                {phase === 'REVEAL' && '🎬 Revealing Moves...'}
                {phase === 'ANIMATED_REVEAL' && '⚔️ Battle Unfolds'}
              </div>
            </div>

            {/* Empty space for balance */}
            <div className="w-16"></div>
          </div>
        </div>
      </div>
    );
  };

  const handleExitGame = () => {
    setShowExitModal(false);
    navigate('/lobby');
  };

  const handleContinueGame = () => {
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Game Header */}
      {renderGameHeader()}

      {/* Main Game Content */}
      <div className="relative z-10">{renderGamePhase()}</div>

      {/* Violation System */}
      <ViolationToast
        show={showViolation}
        violations={violations}
        position="top"
      />

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <ExitGameModal
          onContinue={handleContinueGame}
          onExit={handleExitGame}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 🎬 REVEAL TRANSITION SCREEN
// ─────────────────────────────────────────────────────────────

const RevealTransitionScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-8 animate-spin">⚔️</div>

        <h2 className="text-4xl lg:text-5xl font-black mb-4">
          <span className="bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
            Preparing Battlefield
          </span>
        </h2>

        <p className="text-xl text-gray-300 mb-8">
          The blind moves are about to collide! ⚡
        </p>

        <div className="flex justify-center space-x-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-0"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce delay-400"></div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 🚪 EXIT GAME MODAL
// ─────────────────────────────────────────────────────────────

const ExitGameModal: React.FC<{
  onContinue: () => void;
  onExit: () => void;
}> = ({ onContinue, onExit }) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🚪</div>
          <h3 className="text-xl font-bold text-white mb-2">Exit Game?</h3>
          <p className="text-gray-300 text-sm">
            Are you sure you want to leave this BlindChess battle? Your progress
            will be lost.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onContinue}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500
                       text-white font-bold py-3 px-4 rounded-xl 
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       shadow-lg hover:shadow-green-500/30"
          >
            ⚔️ Continue Battle
          </button>
          <button
            onClick={onExit}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                       text-white font-bold py-3 px-4 rounded-xl 
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       shadow-lg hover:shadow-red-500/30"
          >
            🏃 Exit to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
