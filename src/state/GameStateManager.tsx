// state/GameStateManager.tsx - Updated for clean database structure
import { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import {
  simulateBlindMoves,
  simulateBlindMovesWithRewards,
} from '../utils/simulateBlindMoves';
import {
  cleanBlindMovesService as blindMovesService,
  type BlindGameState,
} from '../services/cleanBlindMovesService';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';
import {
  liveMovesService,
  type LiveGameState,
} from '../services/liveMovesService';
import { supabase } from '../lib/supabase';
import { goldRewardsService } from '../services/goldRewardsService';

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

const validateAndFixFEN = (fen: string): string => {
  if (!fen || typeof fen !== 'string') {
    console.warn('Invalid FEN provided, using default:', fen);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  const parts = fen.split(' ');

  if (parts.length < 4) {
    console.warn('FEN missing required parts, using default:', fen);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  const rows = parts[0].split('/');
  if (rows.length !== 8) {
    console.warn('FEN piece data invalid (not 8 rows), using default:', fen);
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

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

  const initializeGame = useCallback(async () => {
    if (!gameId) return;

    console.log('Initializing game:', gameId);

    try {
      const { data: room, error: roomErr } = await supabase
        .from('game_rooms')
        .select('status')
        .eq('id', gameId)
        .single();

      if (roomErr || !room) {
        console.warn('initializeGame: room not found or error', roomErr);
        return;
      }

      if (room.status !== 'blind') {
        console.log('initializeGame: room.status is not blind, skipping init');
        return;
      }

      const { data: players } = await supabase
        .from('game_room_players')
        .select('player_id')
        .eq('room_id', gameId);

      if (!players || players.length < 2) {
        console.log(
          'initializeGame: need 2 players, found',
          players?.length || 0
        );
        return;
      }

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
        console.log('Recovering game state for:', gameId);

        const liveGameState = await liveMovesService.getGameState(gameId);
        if (liveGameState && !liveGameState.game_ended) {
          console.log('Found active live game, transitioning to LIVE');

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

          return 'LIVE';
        }

        const { data: room } = await supabase
          .from('game_rooms')
          .select('status')
          .eq('id', gameId)
          .single();

        if (!room) {
          console.warn('Room not found');
          return 'WAITING';
        }

        console.log('Room status:', room.status);

        switch (room.status) {
          case 'live':
            console.log('Room is live but no live game state found');
            return 'WAITING';

          case 'revealing':
          case 'reveal':
            console.log('Room is in reveal phase');
            const blindState = await blindMovesService.getBlindGameState(
              gameId
            );
            if (blindState) {
              const { data: room } = await supabase
                .from('game_rooms')
                .select('entry_fee, game_mode')
                .eq('id', gameId)
                .single();

              let fen, log;
              if (room?.game_mode === 'classic') {
                const result = simulateBlindMovesWithRewards(
                  blindState.whiteMoves,
                  blindState.blackMoves,
                  room.entry_fee
                );
                fen = result.fen;
                log = result.log;
              } else {
                const result = simulateBlindMoves(
                  blindState.whiteMoves,
                  blindState.blackMoves
                );
                fen = result.fen;
                log = result.log;
              }

              setGameState((prev) => ({
                ...prev,
                phase: 'REVEAL',
                reveal: { finalFen: fen, moveLog: log, isComplete: false },
              }));
              return 'REVEAL';
            }
            break;

          case 'blind':
            console.log('Room is in blind phase');
            await initializeGame();
            return 'BLIND';

          default:
            console.log('Room is waiting');
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

  // Updated to use cleanBlindMovesService
  const saveBlindMove = useCallback(
    async (move: { from: string; to: string; san: string }) => {
      if (!gameId || !gameState.blind.myColor) return false;

      const success = await blindMovesService.addBlindMove(
        gameId,
        gameState.blind.myColor,
        move
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
    [gameId, gameState.blind.myColor]
  );

  // Updated to use cleanBlindMovesService
  const undoBlindMove = useCallback(async () => {
    if (
      !gameId ||
      !gameState.blind.myColor ||
      gameState.blind.myMoves.length === 0
    ) {
      return false;
    }

    const success = await blindMovesService.removeLastMove(
      gameId,
      gameState.blind.myColor
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

  // This method isn't in cleanBlindMovesService, so we'll remove it or implement differently
  const clearBlindMoves = useCallback(async () => {
    if (!gameId || !gameState.blind.myColor) return false;

    // For now, just clear local state since cleanBlindMovesService doesn't have this method
    setGameState((prev) => ({
      ...prev,
      blind: {
        ...prev.blind,
        myMoves: [],
      },
    }));

    return true;
  }, [gameId, gameState.blind.myColor]);

  // Updated to use cleanBlindMovesService
  const submitBlindMoves = useCallback(async () => {
    if (
      !gameId ||
      !gameState.blind.myColor ||
      gameState.blind.myMoves.length === 0
    ) {
      return false;
    }

    const success = await blindMovesService.submitMoves(
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
        timer: { ...prev.timer, isRunning: false },
      }));
    }

    return success;
  }, [gameId, gameState.blind.myColor, gameState.blind.myMoves.length]);

  // Updated proceedToReveal to work with new reward system
  // Updated proceedToReveal function in GameStateManager.tsx

  const proceedToReveal = useCallback(async () => {
    if (!gameId) {
      console.error('No gameId available for reveal');
      return;
    }

    console.log(
      'Proceeding to reveal phase - calculating rewards and waiting...'
    );

    try {
      const freshBlindState = await blindMovesService.getBlindGameState(gameId);
      if (!freshBlindState) {
        console.error('Failed to get fresh blind state for reveal');
        return;
      }

      // Get entry fee for reward calculation
      const { data: room } = await supabase
        .from('game_rooms')
        .select('entry_fee')
        .eq('id', gameId)
        .single();

      const entryFee = room?.entry_fee || 100;

      // Use FIXED simulation with reward calculation
      const { fen, log, whiteGold, blackGold } = simulateBlindMovesWithRewards(
        freshBlindState.whiteMoves,
        freshBlindState.blackMoves,
        entryFee
      );

      console.log('✅ Calculated rewards:', { whiteGold, blackGold });

      // Save the calculated rewards to database
      const { error: saveError } = await supabase.rpc(
        'save_calculated_rewards',
        {
          p_game_id: gameId,
          p_white_player_id: freshBlindState.whitePlayerId,
          p_black_player_id: freshBlindState.blackPlayerId,
          p_white_gold: whiteGold,
          p_black_gold: blackGold,
        }
      );

      if (saveError) {
        console.error('❌ Failed to save calculated rewards:', saveError);
        // Continue anyway - we can still show the game
      } else {
        console.log('✅ Rewards saved to database');
      }

      // ✅ WAIT for rewards to be available before proceeding
      console.log('⏳ Waiting for rewards to be processed...');
      await goldRewardsService.waitForRewardsToBeCalculated(gameId);
      console.log('✅ Rewards are now available');

      // Prepare FEN for live phase (always White to move)
      const parts = fen.split(' ');
      if (parts.length >= 2) parts[1] = 'w';
      const liveFenWhiteToMove = parts.join(' ');

      // Initialize live game
      await liveMovesService.initializeLiveGame(
        gameId,
        freshBlindState.whitePlayerId,
        freshBlindState.blackPlayerId,
        liveFenWhiteToMove
      );

      // Update game state to reveal phase
      setGameState((prev) => ({
        ...prev,
        phase: 'REVEAL',
        reveal: { finalFen: fen, moveLog: log, isComplete: false },
        live: { ...prev.live, game: new Chess(fen), fen: fen },
        timer: { ...prev.timer, isRunning: false },
      }));

      console.log('✅ Reveal phase ready with rewards available');
    } catch (error) {
      console.error('❌ Failed to proceed to reveal:', error);
    }
  }, [gameId]);

  // Updated to work with cleanBlindMovesService structure
  const handleBlindGameUpdate = useCallback(
    (blindGameState: BlindGameState) => {
      const { myColor } = gameState.blind;
      if (!myColor) return;

      console.log('Blind game state updated:', {
        whiteMoves: blindGameState.whiteMoves.length,
        blackMoves: blindGameState.blackMoves.length,
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
          ? blindGameState.blackMoves.length
          : blindGameState.whiteMoves.length;

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
          myMoves: latestMoves,
          opponentMoveCount,
          mySubmitted,
          opponentSubmitted,
          bothSubmitted: blindGameState.bothSubmitted,
        },
      }));

      // Check if both submitted and auto-transition
      if (blindGameState.bothSubmitted && gameState.phase === 'BLIND') {
        console.log('Both players submitted, transitioning to reveal');
        setTimeout(() => {
          proceedToReveal();
        }, 1000);
      }
    },
    [gameState.blind.myColor, gameState.phase, proceedToReveal]
  );

  const handleLiveGameUpdate = useCallback((liveGameState: LiveGameState) => {
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

    if (liveGameState.game_ended) {
      setGameState((prev) => ({
        ...prev,
        timer: { ...prev.timer, isRunning: false },
      }));
    }
  }, []);

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
    async (from: string, to: string): Promise<boolean> => {
      if (!gameId || gameState.phase !== 'LIVE' || gameState.live.gameEnded) {
        return false;
      }

      const result = await liveMovesService.makeMove(gameId, from, to);

      if (result.success && result.move) {
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

  // Setup subscriptions
  useEffect(() => {
    if (!gameId) return;

    console.log('Setting up game subscriptions for:', gameId);

    subscriptionsRef.current.forEach((cleanup) => cleanup());
    subscriptionsRef.current = [];

    const blindCleanup = blindMovesService.subscribeToBlindMoves(
      gameId,
      handleBlindGameUpdate
    );
    subscriptionsRef.current.push(blindCleanup);

    const liveCleanup = liveMovesService.subscribeToGameUpdates(gameId, {
      onGameStateUpdate: handleLiveGameUpdate,
    });
    subscriptionsRef.current.push(liveCleanup);

    const roomChannel = supabase
      .channel(`room-${gameId}`)
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
            const newStatus = (payload.new as any)?.status;
            if (!newStatus) return;

            if (newStatus === 'blind') {
              if (hasStartedRef.current) return;
              hasStartedRef.current = true;

              await initializeGame();

              const bs = await blindMovesService.getBlindGameState(gameId);

              if (bs) {
                const myColor = await deriveMyColor(bs);
                setGameState((prev) => {
                  const iAmWhite = myColor === 'white';
                  return {
                    ...prev,
                    blind: {
                      ...prev.blind,
                      myColor,
                      maxMoves: prev.blind.maxMoves,
                      myMoves: myColor
                        ? iAmWhite
                          ? bs.whiteMoves
                          : bs.blackMoves
                        : prev.blind.myMoves,
                      opponentMoveCount: myColor
                        ? iAmWhite
                          ? bs.blackMoves.length
                          : bs.whiteMoves.length
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

                transitionToPhase('BLIND');
              }

              return;
            }

            if (newStatus === 'revealing') {
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
  }, [
    gameId,
    handleBlindGameUpdate,
    handleLiveGameUpdate,
    initializeGame,
    deriveMyColor,
    transitionToPhase,
  ]);

  // Initialize game on mount
  useEffect(() => {
    if (!gameId) return;

    const initWithRecovery = async () => {
      console.log('Initializing game with state recovery');

      const recoveredPhase = await recoverGameState(gameId);

      if (recoveredPhase === 'WAITING') {
        const timer = setTimeout(() => {
          initializeGame();
        }, 100);
        return () => clearTimeout(timer);
      }
    };

    initWithRecovery();
  }, [gameId, recoverGameState, initializeGame]);

  // Client-side timer
  useEffect(() => {
    if (!gameState.timer.isRunning) return;

    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      setGameState((prev) => {
        if (prev.phase === 'BLIND') {
          const newWhiteTime = Math.max(0, prev.timer.whiteTime - elapsed);
          const newBlackTime = Math.max(0, prev.timer.blackTime - elapsed);

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
          const isWhiteTurn = prev.live.game.turn() === 'w';

          if (isWhiteTurn) {
            const newTime = Math.max(0, prev.timer.whiteTime - elapsed);
            if (newTime === 0 && gameId) {
              liveMovesService.handleTimeout(gameId, 'white');
            }
            return { ...prev, timer: { ...prev.timer, whiteTime: newTime } };
          } else {
            const newTime = Math.max(0, prev.timer.blackTime - elapsed);
            if (newTime === 0 && gameId) {
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
