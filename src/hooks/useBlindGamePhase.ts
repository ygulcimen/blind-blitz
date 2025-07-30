// hooks/useBlindGamePhase.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { simulateBlindMoves } from '../utils/simulateBlindMoves';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';

export type Phase =
  | 'P1_INPUT'
  | 'P2_INPUT'
  | 'REVEAL'
  | 'ANIMATED_REVEAL'
  | 'PLAY';

const TIMER_DURATION = 5;

interface RevealedState {
  fen: string;
  log: MoveLogItem[];
}

interface UseBlindGamePhaseReturn {
  phase: Phase;
  p1Moves: BlindSequence;
  p2Moves: BlindSequence;
  submitMoves: (moves: BlindSequence) => void;
  revealedState: RevealedState;
  timeLeft: number;
  timerDuration: number; // 🔧 ADD THIS
  isTimerActive: boolean;
  resetTimer: () => void;
  startNewRound: () => void;
  handleAnimatedRevealComplete: () => void;
  handleMovesUpdate: (moves: BlindSequence) => void;
}

export function useBlindGamePhase(): UseBlindGamePhaseReturn {
  const [phase, setPhase] = useState<Phase>('P1_INPUT');
  const [p1Moves, setP1Moves] = useState<BlindSequence>([]);
  const [p2Moves, setP2Moves] = useState<BlindSequence>([]);
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
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  // Timer logic
  useEffect(() => {
    if (
      isTimerActive &&
      timeLeft > 0 &&
      phase !== 'REVEAL' &&
      phase !== 'ANIMATED_REVEAL' &&
      phase !== 'PLAY'
    ) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft((t) => t - 1);
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

        setP2Moves(currentMovesRef.current);
        setResultFen(fen);
        setResultLog(log);
        setPhase('REVEAL');
      }
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeLeft, isTimerActive, phase, p1Moves]);

  const handleMovesUpdate = useCallback((moves: BlindSequence) => {
    currentMovesRef.current = moves;
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(TIMER_DURATION);
    setIsTimerActive(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const startNewRound = useCallback(() => {
    setPhase('P1_INPUT');
    setP1Moves([]);
    setP2Moves([]);
    setResultFen('');
    setResultLog([]);
    currentMovesRef.current = [];
    resetTimer();
    setHasSubmitted(false);
  }, [resetTimer]);

  const submitMoves = useCallback(
    (seq: BlindSequence) => {
      if (hasSubmitted) return;

      setHasSubmitted(true);
      setIsTimerActive(false);

      if (phase === 'P1_INPUT') {
        setP1Moves(seq);
        setPhase('P2_INPUT');
        resetTimer();
      } else if (phase === 'P2_INPUT') {
        setP2Moves(seq);

        const { fen, log } = simulateBlindMoves(p1Moves, seq);

        setResultFen(fen);
        setResultLog(log);
        setPhase('REVEAL');
      }

      setHasSubmitted(false);
    },
    [hasSubmitted, phase, p1Moves, resetTimer]
  );

  const handleAnimatedRevealComplete = useCallback(() => {
    setPhase('PLAY');
  }, []);

  return {
    phase,
    p1Moves,
    p2Moves,
    submitMoves,
    revealedState: { fen: resultFen, log: resultLog },
    timeLeft,
    timerDuration: TIMER_DURATION, // 🔧 ADD THIS
    isTimerActive,
    resetTimer,
    startNewRound,
    handleAnimatedRevealComplete,
    handleMovesUpdate,
  };
}
