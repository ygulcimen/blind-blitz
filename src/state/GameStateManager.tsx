// state/GameStateManager.tsx - FIXED: Clean architecture with single source of truth
import { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { simulateBlindMoves } from '../utils/simulateBlindMoves';
import {
  blindMovesService,
  type BlindGameState,
} from '../services/blindMovesService';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';
import {
  liveMovesService,
  type LiveGameState,
} from '../services/liveMovesService';
import { supabase } from '../lib/supabase';

export type GamePhase =
  | 'WAITING'
  | 'BLIND'
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
  myMoves: BlindSequence;
  opponentMoveCount: number;
  opponentSubmitted: boolean;
  mySubmitted: boolean;
  bothSubmitted: boolean;
  myColor: 'white' | 'black' | null;
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
// Add this function at the top of GameStateManager.tsx, after your imports
const validateAndFixFEN = (fen: string): string => {
  if (!fen || typeof fen !== 'string') {
    console.warn('Invalid FEN provided, using default:', fen);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  const parts = fen.split(' ');

  // Check if FEN has minimum required parts
  if (parts.length < 4) {
    console.warn('FEN missing required parts, using default:', fen);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  // Check if piece placement has exactly 8 rows
  const rows = parts[0].split('/');
  if (rows.length !== 8) {
    console.warn('FEN piece data invalid (not 8 rows), using default:', fen);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  // Validate each row has valid characters
  for (const row of rows) {
    if (!/^[rnbqkpRNBQKP1-8]+$/.test(row)) {
      console.warn('FEN contains invalid characters, using default:', fen);
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
  }

  return fen;
};
export const useGameStateManager = (gameId?: string) => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    phase: 'WAITING',
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
  const subscriptionsRef = useRef<(() => void)[]>([]);
  const hasStartedRef = useRef(false);

  const deriveMyColor = useCallback(
    async (bs: BlindGameState): Promise<'white' | 'black' | null> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const myId = user?.id;
        if (!myId) return null;
        if (bs.whitePlayerId === myId) return 'white';
        if (bs.blackPlayerId === myId) return 'black';
        return null;
      } catch (e) {
        console.error('deriveMyColor failed:', e);
        return null;
      }
    },
    []
  );

  // Initialize game - now much simpler since database handles most logic
  // Initialize game - check room status first
  // In GameStateManager.tsx, modify the initializeGame function:
  const initializeGame = useCallback(async () => {
    if (!gameId) return;

    console.log('Initializing game:', gameId);

    try {
      // 1) Önce oda durumunu öğren (WAITING mi BLIND mi?)
      const { data: room, error: roomErr } = await supabase
        .from('game_rooms')
        .select('status')
        .eq('id', gameId)
        .single();

      if (roomErr || !room) {
        console.warn('initializeGame: room not found or error', roomErr);
        return;
      }

      // Sadece BLIND durumunda init et; WAITING iken asla
      if (room.status !== 'blind') {
        console.log('initializeGame: room.status is not blind, skipping init');
        return;
      }

      // 2) En az 2 oyuncu var mı?
      const { data: players } = await supabase
        .from('game_room_players')
        .select('player_id')
        .eq('room_id', gameId);

      if (!players || players.length < 2) {
        console.log(
          'initializeGame: need 2 players, found',
          players?.length || 0
        );
        return; // WAITING'de kal
      }

      // 3) Artık blind state oluştur/çek
      const blindGameState = await blindMovesService.initializeBlindGame(
        gameId
      );
      console.log('Blind game initialized/pulled:', !!blindGameState);
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  }, [gameId]);

  const recoverGameState = useCallback(
    async (gameId: string) => {
      try {
        console.log('🔄 Recovering game state for:', gameId);

        // Check if live game exists
        const liveGameState = await liveMovesService.getGameState(gameId);
        if (liveGameState && !liveGameState.game_ended) {
          console.log('📍 Found active live game, transitioning to LIVE');

          const safeFen = validateAndFixFEN(liveGameState.current_fen);

          setGameState((prev) => ({
            ...prev,
            phase: 'LIVE',
            live: {
              ...prev.live,
              game: new Chess(safeFen),
              fen: safeFen,
              gameEnded: liveGameState.game_ended,
              gameResult: liveGameState.game_result,
            },
            timer: {
              ...prev.timer,
              whiteTime: liveGameState.white_time_ms,
              blackTime: liveGameState.black_time_ms,
              isRunning: !liveGameState.game_ended,
              duration: LIVE_TIMER_DURATION,
              increment: LIVE_INCREMENT,
            },
          }));

          // Set up subscriptions for live game
          return 'LIVE';
        }

        // Check room status from database
        const { data: room } = await supabase
          .from('game_rooms')
          .select('status')
          .eq('id', gameId)
          .single();

        if (!room) {
          console.warn('Room not found');
          return 'WAITING';
        }

        console.log('🏠 Room status:', room.status);

        switch (room.status) {
          case 'live':
            // Should have been caught above, but fallback
            console.log('📍 Room is live but no live game state found');
            return 'WAITING';

          case 'revealing':
          case 'reveal':
            console.log('📍 Room is in reveal phase');
            // Get blind game state and simulate
            const blindState = await blindMovesService.getBlindGameState(
              gameId
            );
            if (blindState) {
              const { fen, log } = simulateBlindMoves(
                blindState.whiteMoves,
                blindState.blackMoves
              );
              setGameState((prev) => ({
                ...prev,
                phase: 'REVEAL',
                reveal: { finalFen: fen, moveLog: log, isComplete: false },
              }));
              return 'REVEAL';
            }
            break;

          case 'blind':
            console.log('📍 Room is in blind phase');
            // Initialize blind game state
            await initializeGame();
            return 'BLIND';

          default:
            console.log('📍 Room is waiting');
            return 'WAITING';
        }

        return 'WAITING';
      } catch (error) {
        console.error('Failed to recover game state:', error);
        return 'WAITING';
      }
    },
    [initializeGame]
  );

  // Save blind move - simplified
  const saveBlindMove = useCallback(
    async (move: { from: string; to: string; san: string }) => {
      if (!gameId || !gameState.blind.myColor) return false;

      // FIXED: Use the correct move number (current moves + 1)
      const moveNumber = gameState.blind.myMoves.length + 1;

      const success = await blindMovesService.saveBlindMove(
        gameId,
        gameState.blind.myColor,
        moveNumber, // This should be 1, 2, 3, 4, 5...
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
  // Undo blind move - simplified
  const undoBlindMove = useCallback(async () => {
    if (
      !gameId ||
      !gameState.blind.myColor ||
      gameState.blind.myMoves.length === 0
    ) {
      return false;
    }

    const success = await blindMovesService.deleteBlindMove(
      gameId,
      gameState.blind.myColor,
      gameState.blind.myMoves.length
    );

    // Local state update happens via subscription
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

  // Clear blind moves
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

  // Submit blind moves - database triggers handle phase transition
  const submitBlindMoves = useCallback(async () => {
    if (
      !gameId ||
      !gameState.blind.myColor ||
      gameState.blind.myMoves.length === 0
    ) {
      return false;
    }

    const success = await blindMovesService.submitBlindMoves(
      gameId,
      gameState.blind.myColor
    );

    // Database triggers will handle the "both submitted" check and phase transition
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

  // Proceed to reveal phase - called when both players submit
  // In GameStateManager.tsx, replace your current proceedToReveal function with this:
  const proceedToReveal = useCallback(async () => {
    if (!gameId) {
      console.error('No gameId available for reveal');
      return;
    }

    console.log('Proceeding to reveal phase');

    try {
      // Fetch fresh blind game state from database
      const freshBlindState = await blindMovesService.getBlindGameState(gameId);
      if (!freshBlindState) {
        console.error('Failed to get fresh blind state for reveal');
        return;
      }

      // Use the fresh moves data
      const { fen, log } = simulateBlindMoves(
        freshBlindState.whiteMoves,
        freshBlindState.blackMoves
      );

      console.log('Reveal simulation complete:', {
        totalMoveLog: log.length,
        moveLog: log,
      });

      // Rest of the function...
      const parts = fen.split(' ');
      if (parts.length >= 2) parts[1] = 'w';
      const liveFenWhiteToMove = parts.join(' ');

      await liveMovesService.initializeLiveGame(
        gameId,
        freshBlindState.whitePlayerId,
        freshBlindState.blackPlayerId,
        liveFenWhiteToMove
      );

      setGameState((prev) => ({
        ...prev,
        phase: 'REVEAL',
        reveal: { finalFen: fen, moveLog: log, isComplete: false },
        live: { ...prev.live, game: new Chess(fen), fen: fen },
        timer: { ...prev.timer, isRunning: false },
      }));
    } catch (error) {
      console.error('Failed to proceed to reveal:', error);
    }
  }, [gameId]);

  // Handle blind game updates from real-time subscriptions
  const handleBlindGameUpdate = useCallback(
    (blindGameState: BlindGameState) => {
      const { myColor } = gameState.blind;
      if (!myColor) return;

      console.log('Blind game state updated:', {
        whiteMoves: blindGameState.whiteMoveCount,
        blackMoves: blindGameState.blackMoveCount,
        whiteSubmitted: blindGameState.whiteSubmitted,
        blackSubmitted: blindGameState.blackSubmitted,
        bothSubmitted: blindGameState.bothSubmitted,
      });

      const latestMoves =
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

      setGameState((prev) => {
        const already = prev.blind.myMoves.length;
        const incoming = latestMoves.length;

        return {
          ...prev,
          blind: {
            ...prev.blind,
            myMoves:
              incoming > already
                ? [...prev.blind.myMoves, ...latestMoves.slice(already)]
                : prev.blind.myMoves, // keep what we had
            opponentMoveCount,
            mySubmitted,
            opponentSubmitted,
            bothSubmitted: blindGameState.bothSubmitted,
          },
        };
      });

      // Transition to reveal if both submitted
      if (blindGameState.bothSubmitted && gameState.phase === 'BLIND') {
        console.log('Both players submitted - transitioning to reveal');
        proceedToReveal();
      }
    },
    [gameState.blind.myColor, gameState.phase, proceedToReveal]
  );

  // Handle live game updates
  const lastLiveRef = useRef<{ mc: number | null; ended: boolean | null }>({
    mc: null,
    ended: null,
  });
  const handleLiveGameUpdate = useCallback((liveGameState: LiveGameState) => {
    if (
      liveGameState.move_count !== lastLiveRef.current.mc ||
      liveGameState.game_ended !== lastLiveRef.current.ended
    ) {
      console.log('Live update:', {
        currentTurn: liveGameState.current_turn,
        moveCount: liveGameState.move_count,
        gameEnded: liveGameState.game_ended,
      });
      lastLiveRef.current = {
        mc: liveGameState.move_count ?? null,
        ended: !!liveGameState.game_ended,
      };
    }

    setGameState((prev) => ({
      ...prev,
      live: {
        ...prev.live,
        game: new Chess(liveGameState.current_fen),
        fen: liveGameState.current_fen,
        gameEnded: liveGameState.game_ended,
        gameResult: liveGameState.game_result,
      },
      timer: {
        ...prev.timer,
        whiteTime: liveGameState.white_time_ms,
        blackTime: liveGameState.black_time_ms,
      },
    }));

    // Stop timer when game ends
    if (liveGameState.game_ended) {
      setGameState((prev) => ({
        ...prev,
        timer: { ...prev.timer, isRunning: false },
      }));
    }
  }, []);

  // Phase transitions - simplified since database handles most logic
  const transitionToPhase = useCallback((newPhase: GamePhase) => {
    console.log('Transitioning to phase:', newPhase);

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
        case 'ANIMATED_REVEAL':
          return {
            ...next,
            timer: { ...next.timer, isRunning: false },
          };

        case 'LIVE':
          let correctedFen = prev.reveal.finalFen;

          // 🔧 FIX: Validate and fallback to default FEN
          if (
            !correctedFen ||
            typeof correctedFen !== 'string' ||
            correctedFen.split('/').length !== 8
          ) {
            console.warn(
              'Invalid finalFen detected, using default starting position:',
              correctedFen
            );
            correctedFen =
              'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
          }

          const fenParts = correctedFen.split(' ');
          fenParts[1] = 'w'; // Ensure white starts
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

  // Make live move - now uses service layer
  const makeLiveMove = useCallback(
    async (from: string, to: string): Promise<boolean> => {
      if (!gameId || gameState.phase !== 'LIVE' || gameState.live.gameEnded) {
        return false;
      }

      const result = await liveMovesService.makeMove(gameId, from, to);

      if (result.success && result.move) {
        // Update local state immediately for responsiveness
        // Real update will come via subscription
        const gameCopy = new Chess(gameState.live.fen);
        const move = gameCopy.move({ from, to, promotion: 'q' });

        if (move) {
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
        }
      }

      return result.success;
    },
    [gameId, gameState.phase, gameState.live.gameEnded, gameState.live.fen]
  );

  // End game - database triggers handle gold distribution
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

  // Setup real-time subscriptions - simplified
  useEffect(() => {
    if (!gameId) return;

    console.log('Setting up game subscriptions for:', gameId);

    // Clear existing subscriptions
    subscriptionsRef.current.forEach((cleanup) => cleanup());
    subscriptionsRef.current = [];

    // Subscribe to blind moves updates
    const blindCleanup = blindMovesService.subscribeToBlindMoves(
      gameId,
      handleBlindGameUpdate
    );
    subscriptionsRef.current.push(blindCleanup);

    // Subscribe to live game updates
    const liveCleanup = liveMovesService.subscribeToGameUpdates(gameId, {
      onGameStateUpdate: handleLiveGameUpdate,
    });
    subscriptionsRef.current.push(liveCleanup);

    // 🔥 Subscribe to room status updates (WAITING → BLIND → REVEALING, etc.)
    const roomChannel = supabase
      .channel(`room-${gameId}`)
      // inside useEffect where roomChannel is defined (in the UPDATE handler)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          try {
            const newStatus = (payload.new as any)?.status as
              | string
              | undefined;
            if (!newStatus) return;

            // WAITING → BLIND
            if (newStatus === 'blind') {
              // avoid double inits if multiple UPDATEs arrive
              if (hasStartedRef.current) return;
              hasStartedRef.current = true;

              // Ensure DB-side structures exist (colors/rows/triggers)
              await initializeGame();

              // Pull blind game state from DB and build local state
              const bs = (await blindMovesService.getBlindGameState(
                gameId
              )) as BlindGameState | null;

              if (bs) {
                const myColor = await deriveMyColor(bs);
                setGameState((prev) => {
                  const iAmWhite = myColor === 'white';
                  return {
                    ...prev,
                    blind: {
                      ...prev.blind,
                      myColor, // derived here
                      // keep your local maxMoves (DB doesn’t provide it)
                      maxMoves: prev.blind.maxMoves,
                      // map fields from BlindGameState according to myColor
                      myMoves: myColor
                        ? iAmWhite
                          ? bs.whiteMoves
                          : bs.blackMoves
                        : prev.blind.myMoves,
                      opponentMoveCount: myColor
                        ? iAmWhite
                          ? bs.blackMoveCount
                          : bs.whiteMoveCount
                        : prev.blind.opponentMoveCount,
                      mySubmitted: myColor
                        ? iAmWhite
                          ? bs.whiteSubmitted
                          : bs.blackSubmitted
                        : prev.blind.mySubmitted,
                      opponentSubmitted: myColor
                        ? iAmWhite
                          ? bs.blackSubmitted
                          : bs.whiteSubmitted
                        : prev.blind.opponentSubmitted,
                      bothSubmitted: bs.bothSubmitted,
                    },
                    // make sure BLIND timers are running/fresh
                    timer: {
                      ...prev.timer,
                      isRunning: true,
                      duration: BLIND_TIMER_DURATION,
                      increment: 0,
                      whiteTime: BLIND_TIMER_DURATION,
                      blackTime: BLIND_TIMER_DURATION,
                    },
                  };
                });

                // Switch UI to BLIND
                transitionToPhase('BLIND');
              }

              return;
            }

            // (Optional) handle later phases if you flip room.status in DB
            if (newStatus === 'reveal') {
              transitionToPhase('REVEAL');
              return;
            }

            if (newStatus === 'live') {
              transitionToPhase('LIVE');
              return;
            }
          } catch (e) {
            console.error('Room status handler failed:', e);
          }
        }
      )

      .subscribe();
    subscriptionsRef.current.push(() => {
      supabase.removeChannel(roomChannel);
    });

    return () => {
      subscriptionsRef.current.forEach((cleanup) => cleanup());
      subscriptionsRef.current = [];
    };
  }, [gameId, handleBlindGameUpdate, handleLiveGameUpdate]);

  // Initialize game on mount
  useEffect(() => {
    if (!gameId) return;

    const initWithRecovery = async () => {
      console.log('🚀 Initializing game with state recovery');

      // First, try to recover the current game state
      const recoveredPhase = await recoverGameState(gameId);

      // If we're still in WAITING, try the normal initialization
      if (recoveredPhase === 'WAITING') {
        const timer = setTimeout(() => {
          initializeGame();
        }, 100);
        return () => clearTimeout(timer);
      }
    };

    initWithRecovery();
  }, [gameId, recoverGameState]);

  // Client-side timer - only for display, server handles authoritative timing
  useEffect(() => {
    if (!gameState.timer.isRunning) return;

    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      setGameState((prev) => {
        if (prev.phase === 'BLIND') {
          // Both timers count down in blind phase
          const newWhiteTime = Math.max(0, prev.timer.whiteTime - elapsed);
          const newBlackTime = Math.max(0, prev.timer.blackTime - elapsed);

          // Auto-submit on timeout
          if (
            (newWhiteTime === 0 || newBlackTime === 0) &&
            !prev.blind.mySubmitted
          ) {
            setTimeout(() => submitBlindMoves(), 100);
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
          // Current player's timer counts down
          const isWhiteTurn = prev.live.game.turn() === 'w';

          if (isWhiteTurn) {
            const newTime = Math.max(0, prev.timer.whiteTime - elapsed);
            if (newTime === 0 && gameId) {
              // Let server handle timeout
              liveMovesService.handleTimeout(gameId, 'white');
            }
            return { ...prev, timer: { ...prev.timer, whiteTime: newTime } };
          } else {
            const newTime = Math.max(0, prev.timer.blackTime - elapsed);
            if (newTime === 0 && gameId) {
              // Let server handle timeout
              liveMovesService.handleTimeout(gameId, 'black');
            }
            return { ...prev, timer: { ...prev.timer, blackTime: newTime } };
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
  }, [gameState.timer.isRunning, gameState.phase, gameId, submitBlindMoves]);

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
    // Blind phase methods
    saveBlindMove,
    undoBlindMove,
    clearBlindMoves,
    submitBlindMoves,
    // Phase transition methods
    startAnimatedReveal,
    completeAnimatedReveal,
    transitionToPhase,
    // Live phase methods
    makeLiveMove,
    endGame,
  };
};
