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
import { guestAuthService } from '../services/guestAuthService';

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
const BLIND_TIMER_DURATION = 30 * 1000; // 30 seconds
const LIVE_TIMER_DURATION = 5 * 60 * 1000; // 5 minutes
const LIVE_INCREMENT = 0; // No increment

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
  const blindPhaseStartTimeRef = useRef<number | null>(null);
  const revealTriggeredRef = useRef(false);

  const deriveMyColor = useCallback(
    async (bs: BlindGameState): Promise<'white' | 'black' | null> => {
      try {
        // Try authenticated user first
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let myId = user?.id;

        // If no authenticated user, check for guest player
        if (!myId) {
          const guestPlayer = guestAuthService.getCurrentGuestPlayer();
          if (guestPlayer) {
            myId = guestPlayer.id;
            console.log('🎮 Guest player detected in GameStateManager:', guestPlayer.username);
          }
        }

        if (!myId) {
          console.warn('No player ID found (neither authenticated nor guest)');
          return null;
        }

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
        return;
      }

      const { data: players } = await supabase
        .from('game_room_players')
        .select('player_id')
        .eq('room_id', gameId);

      if (!players || players.length < 2) {
        return;
      }

      const blindGameState = await blindMovesService.initializeBlindGame(
        gameId
      );
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  }, [gameId]);

  const recoverGameState = useCallback(
    async (gameId: string) => {
      try {
        const liveGameState = await liveMovesService.getGameState(gameId);
        if (liveGameState && !liveGameState.game_ended) {
          console.log('Game started - transitioning to LIVE');

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

        switch (room.status) {
          case 'live':
            // Live game exists but no game_live_state yet - wait for it to be created
            console.log('Room status is live but no game state yet - staying on current phase');
            return gameState.phase; // Don't change phase, wait for game state to be created

          case 'revealing':
          case 'reveal':
            // Room is in revealing state - trigger proceedToReveal if not already done
            console.log('🔄 Room in revealing state, triggering proceedToReveal');
            if (!revealTriggeredRef.current) {
              revealTriggeredRef.current = true;
              proceedToReveal().catch(err => {
                console.error('Failed in recoverGameState reveal:', err);
                revealTriggeredRef.current = false;
              });
            }
            return 'BLIND'; // Stay in BLIND until proceedToReveal completes
            break;

          case 'blind':
            await initializeGame();

            // Load blind game state to get start time
            const bs = await blindMovesService.getBlindGameState(gameId);
            if (bs?.blindPhaseStartedAt) {
              blindPhaseStartTimeRef.current = new Date(
                bs.blindPhaseStartedAt
              ).getTime();
            } else {
              blindPhaseStartTimeRef.current = Date.now();
              console.warn('No blind phase start time found during recovery');
            }

            return 'BLIND';

          default:
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

  // Add the missing updateBlindMoves function for robot chaos
  const updateBlindMoves = useCallback((moves: BlindSequence) => {
    setGameState((prev) => ({
      ...prev,
      blind: {
        ...prev.blind,
        myMoves: moves,
      },
    }));
  }, []);

  // Updated to directly insert moves into game_blind_moves table
  const submitBlindMoves = useCallback(
    async (moves?: BlindSequence, player?: 'P1' | 'P2') => {
      if (!gameId) {
        return false;
      }

      // If moves and player are provided (robot chaos mode), use them
      if (moves && player) {
        const color = player === 'P1' ? 'white' : 'black';

        // Get player_id based on color
        const playerIdQuery = await supabase
          .from('game_room_players')
          .select('player_id')
          .eq('room_id', gameId)
          .eq('color', color)
          .single();

        if (!playerIdQuery.data) {
          console.error('📤 Player ID not found for color:', color);
          return false;
        }

        const playerId = playerIdQuery.data.player_id;

        // Insert each move
        for (let i = 0; i < moves.length; i++) {
          const { error } = await supabase.from('game_blind_moves').insert({
            game_id: gameId,
            player_id: playerId,
            player_color: color,
            move_number: i + 1,
            move_from: moves[i].from,
            move_to: moves[i].to,
            move_san: moves[i].san,
            is_submitted: i === moves.length - 1,
          });

          if (error) console.error('Blind move insert error:', error);
        }

        return true;
      }

      // Original logic for normal player submission
      if (!gameState.blind.myColor) {
        return false;
      }

      // If player has 0 moves, still mark as submitted (time expired or chose not to move)
      if (gameState.blind.myMoves.length === 0) {
        setGameState((prev) => ({
          ...prev,
          blind: {
            ...prev.blind,
            mySubmitted: true,
          },
          timer: { ...prev.timer, isRunning: false },
        }));
        return true;
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
    },
    [gameId, gameState.blind.myColor, gameState.blind.myMoves.length]
  );

  // Updated proceedToReveal to work with new reward system
  // Updated proceedToReveal function in GameStateManager.tsx

  // Complete proceedToReveal function for GameStateManager.tsx

  const proceedToReveal = useCallback(async () => {
    if (!gameId) {
      console.error('❌ No gameId available for reveal');
      return;
    }

    console.log('🎬 PROCEED TO REVEAL: Starting transition for game:', gameId);

    try {
      const freshBlindState = await blindMovesService.getBlindGameState(gameId);
      if (!freshBlindState) {
        console.error('❌ Failed to get fresh blind state for reveal');
        return;
      }

      console.log('✅ Blind state loaded:', {
        whiteMovesCount: freshBlindState.whiteMoves.length,
        blackMovesCount: freshBlindState.blackMoves.length,
      });

      const { data: room } = await supabase
        .from('game_rooms')
        .select('entry_fee, game_mode')
        .eq('id', gameId)
        .single();

      const entryFee = room?.entry_fee || 100;

      console.log('🎮 Simulating blind moves with rewards...');
      // Use simulation with checkmate detection
      const {
        fen,
        log,
        whiteGold,
        blackGold,
        checkmateOccurred,
        checkmateWinner,
      } = simulateBlindMovesWithRewards(
        freshBlindState.whiteMoves,
        freshBlindState.blackMoves,
        entryFee,
        room?.game_mode
      );

      console.log('✅ Simulation complete:', {
        fen,
        moveLogLength: log.length,
        checkmateOccurred,
      });

      // Validate FEN before proceeding
      const validatedFen = validateAndFixFEN(fen);
      console.log('🔍 FEN validation:', { original: fen, validated: validatedFen });

      // Handle checkmate scenario
      if (checkmateOccurred && checkmateWinner) {
        console.log(`♔ Checkmate detected - ${checkmateWinner} wins in blind phase`);

        const totalPot = entryFee * 2;
        const commission = Math.floor(totalPot * 0.05);
        const availablePot = totalPot - commission;

        // Save checkmate rewards (winner gets full pot)
        await supabase.rpc('save_calculated_rewards', {
          p_game_id: gameId,
          p_white_player_id: freshBlindState.whitePlayerId,
          p_black_player_id: freshBlindState.blackPlayerId,
          p_white_gold: checkmateWinner === 'white' ? availablePot : 0,
          p_black_gold: checkmateWinner === 'black' ? availablePot : 0,
        });

        // Distribute final rewards immediately
        await supabase.rpc('distribute_final_rewards', {
          p_game_id: gameId,
          p_winner: checkmateWinner,
        });
      } else {
        console.log('💰 Saving calculated rewards...');
        // Normal case - save regular rewards
        await supabase.rpc('save_calculated_rewards', {
          p_game_id: gameId,
          p_white_player_id: freshBlindState.whitePlayerId,
          p_black_player_id: freshBlindState.blackPlayerId,
          p_white_gold: whiteGold,
          p_black_gold: blackGold,
        });

        // Wait for rewards to be processed
        await goldRewardsService.waitForRewardsToBeCalculated(gameId);
      }

      console.log('🎮 Initializing live game with FEN:', validatedFen);
      // ALWAYS initialize live game (even for checkmate)
      await liveMovesService.initializeLiveGame(
        gameId,
        freshBlindState.whitePlayerId,
        freshBlindState.blackPlayerId,
        validatedFen // ✅ Use validated FEN
      );

      console.log('✅ Live game initialized, setting REVEAL phase');
      // Set game state with checkmate info if applicable
      setGameState((prev) => ({
        ...prev,
        phase: 'REVEAL',
        reveal: { finalFen: validatedFen, moveLog: log, isComplete: false },
        live: {
          ...prev.live,
          game: new Chess(validatedFen),
          fen: validatedFen,
          gameEnded: checkmateOccurred, // Will be true for checkmate
          gameResult: checkmateOccurred
            ? {
                type: 'checkmate',
                winner: checkmateWinner,
                reason: 'blind_phase_checkmate',
              }
            : null,
        },
        timer: { ...prev.timer, isRunning: false },
      }));

      console.log('✅ PROCEED TO REVEAL: Complete!');
    } catch (error) {
      console.error('❌ Failed to proceed to reveal:', error);
      // Reset the trigger flag so user can retry
      revealTriggeredRef.current = false;
    }
  }, [gameId]);

  // Updated to work with cleanBlindMovesService structure - OPTIMIZED
  const handleBlindGameUpdate = useCallback(
    (blindGameState: BlindGameState) => {
      setGameState((prev) => {
        const { myColor } = prev.blind;
        if (!myColor) return prev;

        // Set blind phase start time from server if available
        if (
          blindGameState.blindPhaseStartedAt &&
          blindPhaseStartTimeRef.current === null
        ) {
          blindPhaseStartTimeRef.current = new Date(
            blindGameState.blindPhaseStartedAt
          ).getTime();
        }

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

        // Check if both submitted and trigger transition (only once)
        if (
          blindGameState.bothSubmitted &&
          prev.phase === 'BLIND' &&
          !revealTriggeredRef.current
        ) {
          revealTriggeredRef.current = true;
          console.log('⚡ Phase transition: BLIND -> REVEAL (triggering async)');
          // Trigger reveal transition asynchronously
          proceedToReveal().catch(err => {
            console.error('Failed to proceed to reveal:', err);
            revealTriggeredRef.current = false; // Reset on error
          });
        }

        return {
          ...prev,
          blind: {
            ...prev.blind,
            myMoves: latestMoves,
            opponentMoveCount,
            mySubmitted,
            opponentSubmitted,
            bothSubmitted: blindGameState.bothSubmitted,
          },
        };
      });
    },
    [proceedToReveal]
  );

  const handleLiveGameUpdate = useCallback((liveGameState: LiveGameState) => {
    console.log('🔄 Live game update received:', {
      fen: liveGameState.current_fen,
      turn: liveGameState.current_turn,
      moveCount: liveGameState.move_count,
    });

    // Only update if FEN actually changed (prevents unnecessary Chess instance recreation)
    setGameState((prev) => {
      // Skip update if FEN hasn't changed and game hasn't ended
      if (
        prev.live.fen === liveGameState.current_fen &&
        prev.live.gameEnded === liveGameState.game_ended &&
        prev.timer.whiteTime === liveGameState.white_time_ms &&
        prev.timer.blackTime === liveGameState.black_time_ms
      ) {
        console.log('⏭️ Skipping update - no changes detected');
        return prev;
      }

      console.log('✅ Applying live game update - state changed');
      const newChess = new Chess(liveGameState.current_fen);

      return {
        ...prev,
        live: {
          ...prev.live,
          game: newChess,
          fen: liveGameState.current_fen,
          gameEnded: liveGameState.game_ended,
          gameResult: liveGameState.game_result,
        },
        timer: {
          ...prev.timer,
          whiteTime: liveGameState.white_time_ms,
          blackTime: liveGameState.black_time_ms,
          isRunning: !liveGameState.game_ended,
        },
      };
    });
  }, []);

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

          // ✅ Use the FEN as-is from reveal phase (already has correct turn)
          return {
            ...next,
            live: {
              ...next.live,
              game: new Chess(correctedFen), // Changed from whiteTurnFen
              fen: correctedFen, // Changed from whiteTurnFen
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

  const completeAnimatedReveal = useCallback(async () => {
    setGameState((prev) => ({
      ...prev,
      reveal: { ...prev.reveal, isComplete: true },
    }));

    // Start the live game clock when animated reveal completes
    if (gameId) {
      console.log('⏰ Starting live game clock after animated reveal');
      await liveMovesService.startGameClock(gameId);
    }

    transitionToPhase('LIVE');
  }, [transitionToPhase, gameId]);

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

    subscriptionsRef.current.forEach((cleanup) => cleanup());
    subscriptionsRef.current = [];

    const blindCleanup = blindMovesService.subscribeToBlindMoves(
      gameId,
      handleBlindGameUpdate
    );
    subscriptionsRef.current.push(blindCleanup);

    // ❌ REMOVED: This subscription was interfering with GameSubscriptions component
    // The live game subscription is now ONLY handled in GameSubscriptions.tsx
    // which properly registers ALL callbacks (onGameStateUpdate, onNewMove, onDrawOfferUpdate)
    //
    // const liveCleanup = liveMovesService.subscribeToGameUpdates(gameId, {
    //   onGameStateUpdate: handleLiveGameUpdate,
    // });
    // subscriptionsRef.current.push(liveCleanup);

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
                // Set blind phase start time from server
                if (bs.blindPhaseStartedAt) {
                  blindPhaseStartTimeRef.current = new Date(
                    bs.blindPhaseStartedAt
                  ).getTime();
                } else {
                  // Fallback: use current time if not set
                  blindPhaseStartTimeRef.current = Date.now();
                  console.warn(
                    'No blind phase start time from server, using client time'
                  );
                }

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
              // Don't just transition - we need to run proceedToReveal!
              console.log('🔔 Room status changed to revealing - triggering proceedToReveal');
              if (!revealTriggeredRef.current) {
                revealTriggeredRef.current = true;
                proceedToReveal().catch(err => {
                  console.error('Failed to proceed to reveal from room status:', err);
                  revealTriggeredRef.current = false;
                });
              }
              return;
            }

            if (newStatus === 'live') {
              // Only transition if live game is already initialized
              console.log('🔔 Room status changed to live');
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

    // Reset reveal trigger flag on game init
    revealTriggeredRef.current = false;

    const initWithRecovery = async () => {
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

  // Client-side timer - OPTIMIZED to reduce re-renders
  useEffect(() => {
    if (!gameState.timer.isRunning || gameState.phase !== 'BLIND') return;

    timerRef.current = window.setInterval(() => {
      const now = Date.now();

      setGameState((prev) => {
        // Only update if still in BLIND phase and timer is running
        if (prev.phase !== 'BLIND' || !prev.timer.isRunning) {
          return prev;
        }

        // Use ABSOLUTE time calculation to prevent drift
        let remainingTime = BLIND_TIMER_DURATION;

        if (blindPhaseStartTimeRef.current !== null) {
          const elapsed = now - blindPhaseStartTimeRef.current;
          remainingTime = Math.max(0, BLIND_TIMER_DURATION - elapsed);
        }

        // Auto-submit when time expires
        if (remainingTime === 0 && !prev.blind.mySubmitted) {
          console.log('⏰ Timer expired - auto-submitting blind moves');
          setTimeout(() => submitBlindMoves(), 0);
          return {
            ...prev,
            timer: {
              ...prev.timer,
              whiteTime: 0,
              blackTime: 0,
              isRunning: false,
            },
          };
        }

        // Skip update if time hasn't changed significantly (reduce re-renders)
        if (Math.abs(prev.timer.whiteTime - remainingTime) < 50) {
          return prev;
        }

        return {
          ...prev,
          timer: {
            ...prev.timer,
            whiteTime: remainingTime,
            blackTime: remainingTime,
          },
        };
      });
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.timer.isRunning, gameState.phase, submitBlindMoves]);

  // Auto-transition from REVEAL to ANIMATED_REVEAL - IMMEDIATE for smooth UX
  useEffect(() => {
    if (gameState.phase === 'REVEAL') {
      console.log('🎬 Auto-transitioning to ANIMATED_REVEAL (immediate)');
      // Immediate transition for smooth UX - no artificial delay
      const timer = setTimeout(() => {
        startAnimatedReveal();
      }, 100); // Minimal delay to ensure UI is ready
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, startAnimatedReveal]);

  return {
    gameState,
    // Blind phase methods
    saveBlindMove,
    undoBlindMove,
    clearBlindMoves,
    updateBlindMoves,
    submitBlindMoves,
    // Phase transition methods
    proceedToReveal,
    startAnimatedReveal,
    completeAnimatedReveal,
    transitionToPhase,
    // Live phase methods
    makeLiveMove,
    endGame,
  };
};
