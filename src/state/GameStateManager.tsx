// state/GameStateManager.ts - FIXED USEEFFECT DEPENDENCIES
import { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { simulateBlindMoves } from '../utils/simulateBlindMoves';
import {
  blindMovesService,
  type BlindGameState,
} from '../services/blindMovesService';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';
import { liveMovesService } from '../services/liveMovesService';

// Updated phases - no more P1/P2!
export type GamePhase =
  | 'BLIND' // ✅ Single simultaneous blind phase
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
  myMoves: BlindSequence; // My moves
  opponentMoveCount: number; // How many moves opponent has (but not what they are)
  opponentSubmitted: boolean; // Has opponent submitted?
  mySubmitted: boolean; // Have I submitted?
  bothSubmitted: boolean; // Are we ready for reveal?
  myColor: 'white' | 'black' | null; // What color am I?
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
const BLIND_TIMER_DURATION = 100 * 1000; // 100 seconds
const LIVE_TIMER_DURATION = 3 * 60 * 1000; // 3 minutes
const LIVE_INCREMENT = 2 * 1000; // 2 seconds

export const useGameStateManager = (gameId?: string) => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    phase: 'BLIND',
    blind: {
      myMoves: [],
      opponentMoveCount: 0,
      opponentSubmitted: false,
      mySubmitted: false,
      bothSubmitted: false,
      myColor: null,
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

  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // ✅ Initialize multiplayer blind game
  const initializeBlindGame = useCallback(async () => {
    if (!gameId) return;

    console.log('🎯 Initializing multiplayer blind game...');

    // Get my color
    const myColor = await blindMovesService.getPlayerColor(gameId);

    // Get current game state
    const blindGameState = await blindMovesService.getBlindGameState(gameId);

    if (blindGameState && myColor) {
      const myMoves =
        myColor === 'white'
          ? blindGameState.whiteMoves
          : blindGameState.blackMoves;
      const opponentMoveCount =
        myColor === 'white'
          ? blindGameState.blackMoveCount
          : blindGameState.whiteMoveCount;
      const mySubmitted =
        myColor === 'white'
          ? blindGameState.whiteSubmitted
          : blindGameState.blackSubmitted;
      const opponentSubmitted =
        myColor === 'white'
          ? blindGameState.blackSubmitted
          : blindGameState.whiteSubmitted;

      setGameState((prev) => ({
        ...prev,
        blind: {
          ...prev.blind,
          myColor,
          myMoves,
          opponentMoveCount,
          mySubmitted,
          opponentSubmitted,
          bothSubmitted: blindGameState.bothSubmitted,
        },
      }));

      console.log(
        `🎯 Initialized as ${myColor} player with ${myMoves.length} moves`
      );
    }
  }, [gameId]);

  // ✅ Save a blind move to database
  const saveBlindMove = useCallback(
    async (move: { from: string; to: string; san: string }) => {
      if (!gameId || !gameState.blind.myColor) return false;

      const moveNumber = gameState.blind.myMoves.length + 1;
      const success = await blindMovesService.saveBlindMove(
        gameId,
        gameState.blind.myColor,
        moveNumber,
        move.from,
        move.to,
        move.san
      );

      if (success) {
        setGameState((prev) => ({
          ...prev,
          blind: {
            ...prev.blind,
            myMoves: [...prev.blind.myMoves, move],
          },
        }));
      }

      return success;
    },
    [gameId, gameState.blind.myColor, gameState.blind.myMoves.length]
  );

  // ✅ Undo last blind move
  const undoBlindMove = useCallback(async () => {
    if (
      !gameId ||
      !gameState.blind.myColor ||
      gameState.blind.myMoves.length === 0
    )
      return false;

    const moveNumber = gameState.blind.myMoves.length;
    const success = await blindMovesService.deleteBlindMove(
      gameId,
      gameState.blind.myColor,
      moveNumber
    );

    if (success) {
      setGameState((prev) => ({
        ...prev,
        blind: {
          ...prev.blind,
          myMoves: prev.blind.myMoves.slice(0, -1),
        },
      }));
    }

    return success;
  }, [gameId, gameState.blind.myColor, gameState.blind.myMoves.length]);

  // ✅ Clear all blind moves
  const clearBlindMoves = useCallback(async () => {
    if (!gameId || !gameState.blind.myColor) return false;

    const success = await blindMovesService.clearBlindMoves(
      gameId,
      gameState.blind.myColor
    );

    if (success) {
      setGameState((prev) => ({
        ...prev,
        blind: {
          ...prev.blind,
          myMoves: [],
        },
      }));
    }

    return success;
  }, [gameId, gameState.blind.myColor]);

  // ✅ Submit blind moves
  const submitBlindMoves = useCallback(async () => {
    if (
      !gameId ||
      !gameState.blind.myColor ||
      gameState.blind.myMoves.length === 0
    )
      return false;

    const success = await blindMovesService.submitBlindMoves(
      gameId,
      gameState.blind.myColor
    );

    if (success) {
      setGameState((prev) => ({
        ...prev,
        blind: {
          ...prev.blind,
          mySubmitted: true,
        },
      }));
    }

    return success;
  }, [gameId, gameState.blind.myColor, gameState.blind.myMoves.length]);

  // ✅ Proceed to reveal phase
  const proceedToReveal = useCallback(
    async (whiteMoves: BlindSequence, blackMoves: BlindSequence) => {
      const { fen, log } = simulateBlindMoves(whiteMoves, blackMoves);

      // Initialize live game
      if (gameId) {
        const blindState = await blindMovesService.getBlindGameState(gameId);
        if (blindState) {
          const parts = fen.split(' ');
          if (parts.length >= 2) parts[1] = 'w';
          const liveFenWhiteToMove = parts.join(' ');

          await liveMovesService.initializeLiveGame(
            gameId,
            blindState.whitePlayerId,
            blindState.blackPlayerId,
            liveFenWhiteToMove
          );
        }
      }

      setGameState((prev) => ({
        ...prev,
        phase: 'REVEAL',
        reveal: { finalFen: fen, moveLog: log, isComplete: false },
        live: { ...prev.live, game: new Chess(fen), fen: fen },
        timer: { ...prev.timer, isRunning: false },
      }));
    },
    [gameId]
  );

  // ✅ FIX: Handle blind game state updates from real-time - MOVED OUTSIDE OF USEEFFECT
  const handleBlindGameUpdate = useCallback(
    (blindGameState: BlindGameState) => {
      if (!gameState.blind.myColor) return;

      const myMoves =
        gameState.blind.myColor === 'white'
          ? blindGameState.whiteMoves
          : blindGameState.blackMoves;
      const opponentMoveCount =
        gameState.blind.myColor === 'white'
          ? blindGameState.blackMoveCount
          : blindGameState.whiteMoveCount;
      const mySubmitted =
        gameState.blind.myColor === 'white'
          ? blindGameState.whiteSubmitted
          : blindGameState.blackSubmitted;
      const opponentSubmitted =
        gameState.blind.myColor === 'white'
          ? blindGameState.blackSubmitted
          : blindGameState.whiteSubmitted;

      setGameState((prev) => ({
        ...prev,
        blind: {
          ...prev.blind,
          opponentMoveCount,
          opponentSubmitted,
          bothSubmitted: blindGameState.bothSubmitted,
        },
      }));

      // If both submitted, proceed to reveal
      if (blindGameState.bothSubmitted && gameState.phase === 'BLIND') {
        console.log('🎬 Both players submitted - starting reveal!');
        proceedToReveal(blindGameState.whiteMoves, blindGameState.blackMoves);
      }
    },
    [gameState.blind.myColor, gameState.phase, proceedToReveal]
  );

  // ✅ Phase transitions
  const transitionToPhase = useCallback((newPhase: GamePhase) => {
    setGameState((prev) => {
      const next = { ...prev, phase: newPhase };

      switch (newPhase) {
        case 'BLIND':
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
          const correctedFen = prev.reveal.finalFen;
          const fenParts = correctedFen.split(' ');
          fenParts[1] = 'w';
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
    [gameState.phase, gameState.live.gameEnded, gameState.live.fen]
  );

  const endGame = useCallback((result: any) => {
    setGameState((prev) => ({
      ...prev,
      live: {
        ...prev.live,
        gameEnded: true,
        gameResult: result,
      },
      timer: { ...prev.timer, isRunning: false },
    }));
  }, []);

  // ✅ FIX: Setup real-time subscription with proper dependencies
  useEffect(() => {
    if (!gameId) return;

    console.log('🔗 Setting up blind moves subscription...');

    const unsubscribe = blindMovesService.subscribeToBlindMoves(
      gameId,
      handleBlindGameUpdate
    );

    return unsubscribe;
  }, [gameId, handleBlindGameUpdate]);

  // ✅ Initialize game on mount
  // ✅ Initialize game on mount with retry logic
  useEffect(() => {
    if (!gameId) return;

    console.log('🚀 GameStateManager useEffect triggered with gameId:', gameId);

    let retryCount = 0;
    const maxRetries = 3;

    const tryInitialize = async () => {
      console.log(`🔄 Attempt ${retryCount + 1} to initialize game`);

      try {
        await initializeBlindGame();

        // Check if we got a color after initialization
        setTimeout(() => {
          const currentColor = gameState.blind.myColor;
          console.log('🔍 Color check after initialization:', currentColor);

          if (!currentColor && retryCount < maxRetries) {
            retryCount++;
            console.log(
              `🔄 Retrying initialization (${retryCount}/${maxRetries})`
            );
            setTimeout(tryInitialize, 1000); // Retry after 1 second
          }
        }, 500);
      } catch (error) {
        console.error('❌ Error during initialization:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryInitialize, 1000);
        }
      }
    };

    tryInitialize();
  }, [gameId, initializeBlindGame]);

  // Timer management
  useEffect(() => {
    if (!gameState.timer.isRunning) return;

    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      setGameState((prev) => {
        if (prev.phase === 'BLIND') {
          // In simultaneous mode, both timers run down together
          const newWhiteTime = Math.max(0, prev.timer.whiteTime - elapsed);
          const newBlackTime = Math.max(0, prev.timer.blackTime - elapsed);

          if (newWhiteTime === 0 || newBlackTime === 0) {
            // Time's up! Auto-submit if not already submitted
            if (!prev.blind.mySubmitted) {
              console.log('⏰ Time up - auto-submitting moves!');
              setTimeout(() => submitBlindMoves(), 100);
            }
          }

          return {
            ...prev,
            timer: {
              ...prev.timer,
              whiteTime: newWhiteTime,
              blackTime: newBlackTime,
            },
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
    // ✅ New multiplayer methods
    initializeBlindGame,
    saveBlindMove,
    undoBlindMove,
    clearBlindMoves,
    submitBlindMoves,
    // ✅ Existing methods
    startAnimatedReveal,
    completeAnimatedReveal,
    makeLiveMove,
    endGame,
    transitionToPhase,
  };
};
