import { useState, useEffect, useRef } from 'react';
import AnimatedReveal from '../components/AnimatedReveal';
import LiveBoard from '../components/LiveBoard';
import { simulateBlindMoves } from '../utils/simulateBlindMoves';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';
import PremoveBoardContainer from '../components/PremoveBoard/PremoveBoardContainer';

// Enhanced Phase system with ANIMATED_REVEAL
type Phase = 'P1_INPUT' | 'P2_INPUT' | 'REVEAL' | 'ANIMATED_REVEAL' | 'PLAY';

const TIMER_DURATION = 20;
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const GameScreen = () => {
  const [phase, setPhase] = useState<Phase>('P1_INPUT');
  const [p1Moves, setP1Moves] = useState<BlindSequence>([]);
  const [resultFen, setResultFen] = useState('');
  const [resultLog, setResultLog] = useState<MoveLogItem[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const timerRef = useRef<number | null>(null);
  const currentMovesRef = useRef<BlindSequence>([]);

  // Auto transition from REVEAL to ANIMATED_REVEAL
  useEffect(() => {
    if (phase === 'REVEAL') {
      const timeout = setTimeout(() => {
        setPhase('ANIMATED_REVEAL');
      }, 2500); // Show RevealBoard for 2.5 seconds, then start animation
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  useEffect(() => {
    if (
      isTimerActive &&
      timeLeft > 0 &&
      phase !== 'REVEAL' &&
      phase !== 'ANIMATED_REVEAL' &&
      phase !== 'PLAY'
    ) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (
      timeLeft === 0 &&
      phase !== 'REVEAL' &&
      phase !== 'ANIMATED_REVEAL' &&
      phase !== 'PLAY'
    ) {
      setIsTimerActive(false);
      if (phase === 'P1_INPUT') {
        setP1Moves(currentMovesRef.current);
        setPhase('P2_INPUT');
        resetTimer();
      } else if (phase === 'P2_INPUT') {
        const { fen, log } = simulateBlindMoves(
          p1Moves,
          currentMovesRef.current
        );
        setResultFen(fen);
        setResultLog(log);
        setPhase('REVEAL');
      }
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeLeft, isTimerActive, phase, p1Moves]);

  const handleMovesUpdate = (moves: BlindSequence) => {
    currentMovesRef.current = moves;
  };

  const resetTimer = () => {
    setTimeLeft(TIMER_DURATION);
    setIsTimerActive(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  };

  const handleResetAll = () => {
    setPhase('P1_INPUT');
    setP1Moves([]);
    setResultFen('');
    setResultLog([]);
    currentMovesRef.current = [];
    resetTimer();
  };

  const handleP1Submit = (seq: BlindSequence) => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    setIsTimerActive(false);
    setP1Moves(seq);
    setPhase('P2_INPUT');
    resetTimer();
    setHasSubmitted(false);
  };

  const handleP2Submit = (seq: BlindSequence) => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    setIsTimerActive(false);
    const { fen, log } = simulateBlindMoves(p1Moves, seq);
    setResultFen(fen);
    setResultLog(log);
    setPhase('REVEAL');
    setHasSubmitted(false);
  };

  // Handle AnimatedReveal completion
  const handleAnimatedRevealComplete = () => {
    setPhase('PLAY');
  };

  // Enhanced Timer Component with responsive design
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

          {/* Progress bar */}
          <div className="mt-1 w-full bg-black/20 rounded-full h-1">
            <div
              className="bg-white rounded-full h-1 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (phase === 'P1_INPUT')
    return (
      <>
        <TimerDisplay />
        <PremoveBoardContainer
          key="P1"
          player="P1"
          onSubmit={handleP1Submit}
          onReset={handleResetAll}
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
          onSubmit={handleP2Submit}
          onReset={handleResetAll}
          onMovesUpdate={handleMovesUpdate}
        />
      </>
    );

  if (phase === 'ANIMATED_REVEAL')
    return (
      <AnimatedReveal
        initialFen={INITIAL_FEN}
        moveLog={resultLog}
        finalFen={resultFen}
        onRevealComplete={handleAnimatedRevealComplete}
      />
    );

  if (phase === 'PLAY')
    return <LiveBoard startingFen={resultFen} blindMoveLog={resultLog} />;

  return null;
};

export default GameScreen;
