import { useBlindGamePhase } from '../hooks/useBlindGamePhase';
import AnimatedReveal from '../components/AnimatedReveal';
import LiveBoard from '../components/LiveBoard';
import type { GameResult } from '../components/GameEndModal';
import PremoveBoardContainer from '../components/PremoveBoard/PremoveBoardContainer';
import RevealTransitionScreen from '../components/RevealTransitionScreen';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const GameScreen = () => {
  const {
    phase,
    p1Moves,
    p2Moves,
    submitMoves,
    revealedState,
    timeLeft,
    timerDuration, // 🔧 Get this from hook instead of hardcoding
    startNewRound,
    handleAnimatedRevealComplete,
    handleMovesUpdate,
  } = useBlindGamePhase();

  // Handle game end from LiveBoard
  const handleGameEnd = (result: GameResult) => {
    // Optional: Save game to localStorage, analytics, etc.
  };

  // Handle rematch - restart the entire blind chess cycle
  const handleRematch = () => {
    startNewRound();
  };

  // Handle leave table
  const handleLeaveTable = () => {
    startNewRound();
  };

  // Handle abort during live phase
  const handleAbortGame = () => {
    startNewRound();
  };

  // Enhanced Timer Component
  const TimerDisplay = () => {
    if (phase === 'REVEAL' || phase === 'ANIMATED_REVEAL' || phase === 'PLAY')
      return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`
            px-4 py-2 lg:px-6 lg:py-3 rounded-xl font-bold shadow-2xl
            transition-all duration-300 transform
            ${
              timeLeft <= 5
                ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse scale-110'
                : timeLeft <= 10
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }
            text-white border-2 ${
              timeLeft <= 5 ? 'border-red-300' : 'border-white/20'
            }
          `}
        >
          <div className="flex items-center gap-2 text-sm lg:text-base">
            <span className="text-lg lg:text-xl">
              {phase === 'P1_INPUT' ? '⚪' : '⚫'}
            </span>
            <div className="flex flex-col items-center">
              <span className="text-xs opacity-90 leading-tight">
                {phase === 'P1_INPUT' ? 'White' : 'Black'}
              </span>
              <span className="text-lg lg:text-xl font-bold leading-tight">
                {String(timeLeft).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <div className="mt-1 w-full bg-black/20 rounded-full h-1">
            <div
              className="bg-white rounded-full h-1 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render different phases
  if (phase === 'REVEAL')
    return <RevealTransitionScreen message="⚔️ Preparing the battlefield..." />;

  if (phase === 'P1_INPUT')
    return (
      <>
        <TimerDisplay />
        <PremoveBoardContainer
          key="P1"
          player="P1"
          onSubmit={submitMoves}
          onReset={startNewRound}
          onMovesUpdate={handleMovesUpdate}
        />
      </>
    );

  if (phase === 'P2_INPUT')
    return (
      <>
        <TimerDisplay />
        <PremoveBoardContainer
          key="P2"
          player="P2"
          onSubmit={submitMoves}
          onReset={startNewRound}
          onMovesUpdate={handleMovesUpdate}
        />
      </>
    );

  if (phase === 'ANIMATED_REVEAL')
    return (
      <AnimatedReveal
        initialFen={INITIAL_FEN}
        moveLog={revealedState.log}
        finalFen={revealedState.fen}
        onRevealComplete={handleAnimatedRevealComplete}
      />
    );

  if (phase === 'PLAY')
    return (
      <LiveBoard
        startingFen={revealedState.fen}
        blindMoveLog={revealedState.log}
        onGameEnd={handleGameEnd}
        onRematch={handleRematch}
        onLeaveTable={handleLeaveTable}
        onAbortGame={handleAbortGame}
      />
    );

  return null;
};

export default GameScreen;
