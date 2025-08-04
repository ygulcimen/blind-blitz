// state/GameStateManager.ts - UPDATED FOR ROBOT CHAOS TESTING
import { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { simulateBlindMoves } from '../utils/simulateBlindMoves';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';

// ... (keep all the type definitions the same) ...

export type GamePhase =
  | 'BLIND_P1'
  | 'BLIND_P2'
  | 'REVEAL'
  | 'ANIMATED_REVEAL'
  | 'LIVE';

export interface TimerState {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  duration: number;
  increment: number;
}

export interface BlindPhaseState {
  p1Moves: BlindSequence;
  p2Moves: BlindSequence;
  maxMoves: number;
  maxMovesPerPiece: number;
}

export interface LivePhaseState {
  game: Chess;
  fen: string;
  moveHistory: string[];
  lastMove: { from: string; to: string } | null;
  gameEnded: boolean;
  gameResult: any | null;
}

export interface RevealState {
  finalFen: string;
  moveLog: MoveLogItem[];
  isComplete: boolean;
}

export interface GameState {
  phase: GamePhase;
  blind: BlindPhaseState;
  live: LivePhaseState;
  reveal: RevealState;
  timer: TimerState;
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const BLIND_TIMER_DURATION = 25;
const LIVE_TIMER_DURATION = 3 * 60 * 1000; // 3 minutes
const LIVE_INCREMENT = 2 * 1000; // 2 seconds

export const useGameStateManager = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    phase: 'BLIND_P1',
    blind: {
      p1Moves: [],
      p2Moves: [],
      maxMoves: 5,
      maxMovesPerPiece: 2,
    },
    live: {
      game: new Chess(INITIAL_FEN),
      fen: INITIAL_FEN,
      moveHistory: [],
      lastMove: null,
      gameEnded: false,
      gameResult: null,
    },
    reveal: {
      finalFen: '',
      moveLog: [],
      isComplete: false,
    },
    timer: {
      whiteTime: BLIND_TIMER_DURATION,
      blackTime: BLIND_TIMER_DURATION,
      isRunning: true,
      duration: BLIND_TIMER_DURATION,
      increment: 0,
    },
  }));

  // Timer management
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const currentMovesRef = useRef<BlindSequence>([]);
  const p1MovesRef = useRef<BlindSequence>([]);

  const startTimer = useCallback((duration: number, increment = 0) => {
    setGameState((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        whiteTime: duration,
        blackTime: duration,
        duration,
        increment,
        isRunning: true,
      },
    }));
    lastTickRef.current = Date.now();
  }, []);

  const stopTimer = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      timer: { ...prev.timer, isRunning: false },
    }));
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const addIncrement = useCallback(
    (player: 'white' | 'black') => {
      if (gameState.timer.increment > 0) {
        setGameState((prev) => ({
          ...prev,
          timer: {
            ...prev.timer,
            whiteTime:
              player === 'white'
                ? prev.timer.whiteTime + prev.timer.increment
                : prev.timer.whiteTime,
            blackTime:
              player === 'black'
                ? prev.timer.blackTime + prev.timer.increment
                : prev.timer.blackTime,
          },
        }));
      }
    },
    [gameState.timer.increment]
  );

  const transitionToPhase = useCallback((newPhase: GamePhase) => {
    setGameState((prev) => {
      const next = { ...prev, phase: newPhase };

      switch (newPhase) {
        case 'BLIND_P1':
          return {
            ...next,
            timer: {
              ...next.timer,
              whiteTime: BLIND_TIMER_DURATION,
              blackTime: BLIND_TIMER_DURATION,
              duration: BLIND_TIMER_DURATION,
              increment: 0,
              isRunning: true,
            },
          };

        case 'BLIND_P2':
          return {
            ...next,
            timer: {
              ...next.timer,
              whiteTime: BLIND_TIMER_DURATION,
              blackTime: BLIND_TIMER_DURATION,
              duration: BLIND_TIMER_DURATION,
              increment: 0,
              isRunning: true,
            },
          };

        case 'REVEAL':
          return {
            ...next,
            timer: { ...next.timer, isRunning: false },
          };

        case 'ANIMATED_REVEAL':
          return {
            ...next,
            timer: { ...next.timer, isRunning: false },
          };

        case 'LIVE':
          // 🔧 FIX: Ensure live phase always starts with white's turn
          const correctedFen = prev.reveal.finalFen;
          const fenParts = correctedFen.split(' ');
          fenParts[1] = 'w'; // Force white to move first in live phase
          const whiteTurnFen = fenParts.join(' ');

          return {
            ...next,
            live: {
              ...next.live,
              game: new Chess(whiteTurnFen),
              fen: whiteTurnFen,
            },
            timer: {
              whiteTime: LIVE_TIMER_DURATION,
              blackTime: LIVE_TIMER_DURATION,
              duration: LIVE_TIMER_DURATION,
              increment: LIVE_INCREMENT,
              isRunning: true,
            },
          };

        default:
          return next;
      }
    });

    lastTickRef.current = Date.now();
  }, []);

  const updateBlindMoves = useCallback((moves: BlindSequence) => {
    currentMovesRef.current = moves;
  }, []);

  // 🎯 UPDATED: submitBlindMoves now accepts optional player parameter for Robot Chaos
  const submitBlindMoves = useCallback(
    (moves: BlindSequence, player?: 'P1' | 'P2') => {
      // If player is explicitly specified (Robot Chaos mode)
      if (player === 'P1') {
        p1MovesRef.current = moves;
        setGameState((prev) => ({
          ...prev,
          blind: { ...prev.blind, p1Moves: moves },
        }));
        return; // Don't transition yet, wait for P2
      }

      if (player === 'P2') {
        setGameState((prev) => ({
          ...prev,
          blind: { ...prev.blind, p2Moves: moves },
        }));

        // Now we have both P1 and P2 moves, proceed to reveal
        const { fen, log } = simulateBlindMoves(p1MovesRef.current, moves);

        setGameState((prev) => ({
          ...prev,
          reveal: {
            finalFen: fen,
            moveLog: log,
            isComplete: false,
          },
          live: {
            ...prev.live,
            game: new Chess(fen),
            fen: fen,
          },
        }));

        transitionToPhase('REVEAL');
        return;
      }

      // 🎯 Original logic for classic mode (no player specified)
      if (gameState.phase === 'BLIND_P1') {
        p1MovesRef.current = moves;

        setGameState((prev) => ({
          ...prev,
          blind: { ...prev.blind, p1Moves: moves },
        }));
        transitionToPhase('BLIND_P2');
      } else if (gameState.phase === 'BLIND_P2') {
        setGameState((prev) => ({
          ...prev,
          blind: { ...prev.blind, p2Moves: moves },
        }));

        const { fen, log } = simulateBlindMoves(p1MovesRef.current, moves);

        setGameState((prev) => ({
          ...prev,
          reveal: {
            finalFen: fen,
            moveLog: log,
            isComplete: false,
          },
          live: {
            ...prev.live,
            game: new Chess(fen),
            fen: fen,
          },
        }));

        transitionToPhase('REVEAL');
      }
    },
    [gameState.phase, transitionToPhase]
  );

  const startAnimatedReveal = useCallback(() => {
    transitionToPhase('ANIMATED_REVEAL');
  }, [transitionToPhase]);

  const completeAnimatedReveal = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      reveal: { ...prev.reveal, isComplete: true },
    }));
    transitionToPhase('LIVE');
  }, [transitionToPhase]);

  const makeLiveMove = useCallback(
    (from: string, to: string): boolean => {
      if (gameState.phase !== 'LIVE' || gameState.live.gameEnded) {
        return false;
      }

      const gameCopy = new Chess(gameState.live.fen);

      try {
        const move = gameCopy.move({
          from: from as any,
          to: to as any,
          promotion: 'q',
        });

        if (!move) return false;

        // Add increment for the current player
        const currentPlayer =
          gameState.live.game.turn() === 'w' ? 'white' : 'black';
        addIncrement(currentPlayer);

        setGameState((prev) => ({
          ...prev,
          live: {
            ...prev.live,
            game: gameCopy,
            fen: gameCopy.fen(),
            moveHistory: [...prev.live.moveHistory, move.san],
            lastMove: { from, to },
          },
        }));

        lastTickRef.current = Date.now();
        return true;
      } catch (error) {
        return false;
      }
    },
    [
      gameState.phase,
      gameState.live.gameEnded,
      gameState.live.fen,
      gameState.live.game,
      addIncrement,
    ]
  );

  const endGame = useCallback(
    (result: any) => {
      setGameState((prev) => ({
        ...prev,
        live: {
          ...prev.live,
          gameEnded: true,
          gameResult: result,
        },
      }));
      stopTimer();
    },
    [stopTimer]
  );

  const resetGame = useCallback(() => {
    const initialGame = new Chess(INITIAL_FEN);

    setGameState({
      phase: 'BLIND_P1',
      blind: {
        p1Moves: [],
        p2Moves: [],
        maxMoves: 5,
        maxMovesPerPiece: 2,
      },
      live: {
        game: initialGame,
        fen: INITIAL_FEN,
        moveHistory: [],
        lastMove: null,
        gameEnded: false,
        gameResult: null,
      },
      reveal: {
        finalFen: '',
        moveLog: [],
        isComplete: false,
      },
      timer: {
        whiteTime: BLIND_TIMER_DURATION,
        blackTime: BLIND_TIMER_DURATION,
        isRunning: true,
        duration: BLIND_TIMER_DURATION,
        increment: 0,
      },
    });

    currentMovesRef.current = [];
    p1MovesRef.current = [];
    lastTickRef.current = Date.now();
  }, []);

  // Timer effects (same as before)
  useEffect(() => {
    if (!gameState.timer.isRunning) return;

    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      setGameState((prev) => {
        if (prev.phase === 'BLIND_P1') {
          const newTime = Math.max(0, prev.timer.whiteTime - elapsed / 1000);
          if (newTime === 0) {
            setTimeout(() => submitBlindMoves(currentMovesRef.current), 100);
          }
          return {
            ...prev,
            timer: { ...prev.timer, whiteTime: newTime },
          };
        } else if (prev.phase === 'BLIND_P2') {
          const newTime = Math.max(0, prev.timer.blackTime - elapsed / 1000);
          if (newTime === 0) {
            setTimeout(() => submitBlindMoves(currentMovesRef.current), 100);
          }
          return {
            ...prev,
            timer: { ...prev.timer, blackTime: newTime },
          };
        } else if (prev.phase === 'LIVE') {
          const isWhiteTurn = prev.live.game.turn() === 'w';

          if (isWhiteTurn) {
            const newTime = Math.max(0, prev.timer.whiteTime - elapsed);
            if (newTime === 0) {
              setTimeout(
                () => endGame({ type: 'timeout', winner: 'black' }),
                100
              );
            }
            return {
              ...prev,
              timer: { ...prev.timer, whiteTime: newTime },
            };
          } else {
            const newTime = Math.max(0, prev.timer.blackTime - elapsed);
            if (newTime === 0) {
              setTimeout(
                () => endGame({ type: 'timeout', winner: 'white' }),
                100
              );
            }
            return {
              ...prev,
              timer: { ...prev.timer, blackTime: newTime },
            };
          }
        }
        return prev;
      });
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.timer.isRunning, gameState.phase, submitBlindMoves, endGame]);

  // Auto-transition from REVEAL to ANIMATED_REVEAL
  useEffect(() => {
    if (gameState.phase === 'REVEAL') {
      const timer = setTimeout(() => {
        startAnimatedReveal();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, startAnimatedReveal]);

  return {
    gameState,
    updateBlindMoves,
    submitBlindMoves,
    startAnimatedReveal,
    completeAnimatedReveal,
    makeLiveMove,
    endGame,
    startTimer,
    stopTimer,
    addIncrement,
    resetGame,
    transitionToPhase,
  };
};
