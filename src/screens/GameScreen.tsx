// screens/GameScreen.tsx - FIXED: No header during blind phases
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useGameStateManager } from '../state/GameStateManager';
import {
  ViolationToast,
  useViolations,
} from '../components/shared/ViolationSystem';
//import WaitingRoomScreen from '../components/WaitingRoom/WaitingRoomScreen';
//import BlindPhaseScreen from '../components/BlindPhase/BlindPhaseScreen';
import RobotChaosBlindPhase from '../components/RobotChaos/RobotChaosBlindPhase';
import AnimatedRevealScreen from '../components/AnimatedReveal/AnimatedRevealScreen';
import RealWaitingRoomScreen from '../components/WaitingRoom/RealWaitingRoomScreen';
import MultiplayerBlindPhaseScreen from '../components/BlindPhase/MultiplayerBlindPhaseScreen';
import MultiplayerLivePhaseScreen from '../components/LivePhase/MultiplayerLivePhaseScreen';

export type GameMode = 'classic' | 'robot_chaos';

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const location = useLocation();
  const gameState = useGameStateManager(gameId);
  const { violations, showViolation } = useViolations();

  // Track if game has actually started
  const [gameStarted, setGameStarted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('classic');

  // Extract game mode from navigation state or URL params
  useEffect(() => {
    // Check if game mode was passed via navigation state
    const navigationState = location.state as { gameMode?: GameMode } | null;
    if (navigationState?.gameMode) {
      setGameMode(navigationState.gameMode);
      return;
    }

    // Check URL params for game mode
    const urlParams = new URLSearchParams(location.search);
    const modeParam = urlParams.get('mode') as GameMode;
    if (modeParam === 'classic' || modeParam === 'robot_chaos') {
      setGameMode(modeParam);
      return;
    }

    // Default to classic mode
    setGameMode('classic');
  }, [location]);

  // ─────────────────────────────────────────────────────────────
  // 🎮 GAME START HANDLER
  // ─────────────────────────────────────────────────────────────

  const handleGameStart = (gameMode?: GameMode) => {
    // ✅ Set the game mode from the waiting room
    if (gameMode) {
      setGameMode(gameMode);
    }
    setGameStarted(true);
  };

  // ─────────────────────────────────────────────────────────────
  // 🎮 MAIN RENDER LOGIC
  // ─────────────────────────────────────────────────────────────

  // If game hasn't started yet, show waiting room
  // If game hasn't started yet, show waiting room
  if (gameState.gameState.phase === 'WAITING') {
    return <RealWaitingRoomScreen onGameStart={handleGameStart} />;
  }

  // Once game started, show the actual game phases
  // In GameScreen.tsx, update the phase rendering:
  // In GameScreen.tsx, update the phase rendering:
  const renderGamePhase = () => {
    switch (gameState.gameState.phase) {
      case 'BLIND': // ✅ Single blind phase instead of BLIND_P1/BLIND_P2
        return gameMode === 'robot_chaos' ? (
          <RobotChaosBlindPhase gameState={gameState} gameId={gameId} />
        ) : (
          <MultiplayerBlindPhaseScreen gameState={gameState} gameId={gameId} />
        );

      case 'REVEAL':
        return <RevealTransitionScreen gameMode={gameMode} />;

      case 'ANIMATED_REVEAL':
        return (
          <AnimatedRevealScreen
            initialFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            moveLog={gameState.gameState.reveal.moveLog}
            finalFen={gameState.gameState.reveal.finalFen}
            onRevealComplete={gameState.completeAnimatedReveal}
            gameMode={gameMode}
            gameId={gameId} // ← Add this line
          />
        );

      case 'LIVE':
        return (
          <MultiplayerLivePhaseScreen gameState={gameState} gameId={gameId} />
        );

      default:
        return <RevealTransitionScreen gameMode={gameMode} />;
    }
  };

  const getGameModeInfo = (mode: GameMode) => {
    switch (mode) {
      case 'classic':
        return {
          name: 'Classic Blind',
          icon: '🕶️',
          color: 'blue',
          description: 'Player-controlled blind moves',
        };
      case 'robot_chaos':
        return {
          name: 'Robot Chaos',
          icon: '🤖',
          color: 'purple',
          description: 'AI robots make chaotic moves',
        };
      default:
        return {
          name: 'Unknown',
          icon: '❓',
          color: 'gray',
          description: 'Unknown mode',
        };
    }
  };

  const renderGameHeader = () => {
    const { phase } = gameState.gameState;
    const modeInfo = getGameModeInfo(gameMode);

    // 🎯 FIXED: Don't show header during ANY game phase - only during REVEAL transition
    // 🎯 FIXED: Don't show header during ANY game phase - only during REVEAL transition
    if (phase === 'LIVE' || phase === 'BLIND' || phase === 'ANIMATED_REVEAL') {
      return null;
    }

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
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

              <div className="flex items-center space-x-3">
                <span className="text-2xl">{modeInfo.icon}</span>
                <div>
                  <div className="text-white font-bold text-lg">
                    BlindChess {modeInfo.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {gameId ? `Game #${gameId}` : modeInfo.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Phase Indicator */}
            <div className="text-center">
              <div className="text-white font-bold">
                {phase === 'REVEAL' && '🎬 Revealing Moves...'}
              </div>
            </div>

            {/* Game Mode Badge */}
            <div
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                modeInfo.color === 'blue'
                  ? 'bg-blue-900/30 border-blue-500/50 text-blue-400'
                  : 'bg-purple-900/30 border-purple-500/50 text-purple-400'
              }`}
            >
              {modeInfo.icon} {modeInfo.name}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleExitGame = () => {
    setShowExitModal(false);
    navigate('/games');
  };

  const handleContinueGame = () => {
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Modern Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Game Header - Only shows during REVEAL and ANIMATED_REVEAL phases */}
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
          gameMode={gameMode}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 🎬 REVEAL TRANSITION SCREEN - MODERNIZED
// ─────────────────────────────────────────────────────────────

const RevealTransitionScreen: React.FC<{ gameMode: GameMode }> = ({
  gameMode,
}) => {
  const isRobotMode = gameMode === 'robot_chaos';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        <div className="text-8xl mb-8 animate-spin">
          {isRobotMode ? '🤖' : '⚔️'}
        </div>

        <h2 className="text-4xl lg:text-5xl font-black mb-6">
          <span
            className={`bg-gradient-to-r ${
              isRobotMode
                ? 'from-purple-400 via-blue-500 to-green-500'
                : 'from-red-400 via-orange-500 to-yellow-500'
            } bg-clip-text text-transparent animate-pulse`}
          >
            {isRobotMode ? 'Robot Chaos Processing' : 'Preparing Battlefield'}
          </span>
        </h2>

        <p className="text-xl text-gray-400 mb-12 leading-relaxed">
          {isRobotMode
            ? 'The robots have finished their mayhem! 🤖💥'
            : 'The blind moves are about to collide! ⚡'}
        </p>

        <div className="flex justify-center space-x-4">
          <div
            className={`w-4 h-4 ${
              isRobotMode ? 'bg-purple-500' : 'bg-blue-500'
            } rounded-full animate-bounce delay-0`}
          ></div>
          <div
            className={`w-4 h-4 ${
              isRobotMode ? 'bg-blue-500' : 'bg-purple-500'
            } rounded-full animate-bounce delay-200`}
          ></div>
          <div
            className={`w-4 h-4 ${
              isRobotMode ? 'bg-green-500' : 'bg-red-500'
            } rounded-full animate-bounce delay-400`}
          ></div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 🚪 EXIT GAME MODAL - MODERNIZED
// ─────────────────────────────────────────────────────────────

const ExitGameModal: React.FC<{
  onContinue: () => void;
  onExit: () => void;
  gameMode: GameMode;
}> = ({ onContinue, onExit, gameMode }) => {
  const modeInfo =
    gameMode === 'robot_chaos'
      ? { name: 'Robot Chaos', icon: '🤖' }
      : { name: 'Classic Blind', icon: '🕶️' };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/90 border border-gray-700 rounded-2xl shadow-2xl backdrop-blur-sm p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚪</div>
          <h3 className="text-2xl font-bold text-white mb-3">Exit Game?</h3>
          <p className="text-gray-400 leading-relaxed">
            Are you sure you want to leave this {modeInfo.name} battle? Your
            progress and any entry fees will be lost.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-2">
            <span className="text-xl">{modeInfo.icon}</span>
            <span className="text-gray-300 text-sm font-medium">
              {modeInfo.name} Mode
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onContinue}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl 
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       shadow-lg hover:shadow-green-500/25"
          >
            {gameMode === 'robot_chaos'
              ? '🤖 Continue Chaos'
              : '⚔️ Continue Battle'}
          </button>
          <button
            onClick={onExit}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl 
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       shadow-lg hover:shadow-red-500/25"
          >
            🏃 Exit to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
