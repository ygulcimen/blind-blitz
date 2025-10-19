// hooks/useBlindPhaseState.ts - Complete Implementation
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { supabase } from '../lib/supabase';
import { useCurrentUser } from './useCurrentUser';
import { useCelestialBot } from './useCelestialBot';
import { celestialBotAI } from '../services/celestialBotAI';
import { useViolations } from '../components/shared/ViolationSystem';

import {
  BlindChessRuleEngine,
  EnhancedPieceTracker,
  VisualFeedbackHelper,
} from '../services/chess';

// Constants
const MAX_MOVES = 5;
const MAX_PER_PIECE = 2;
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Types
export interface BlindPhasePlayer {
  name: string;
  rating: number;
  isHost: boolean;
}

export const useBlindPhaseState = (gameState: any, gameId?: string) => {
  const { playerData: currentUser } = useCurrentUser();
  const { showViolations, createViolation, clearViolations } = useViolations();
  const { isBotGame, bot, botColor } = useCelestialBot(gameId);

  // Refs
  const submissionAttemptRef = useRef<number>(0);
  const botSubmittedRef = useRef<boolean>(false);

  // Extract data from GameStateManager
  const myColor = gameState.gameState.blind.myColor;
  const myMoves = gameState.gameState.blind.myMoves;
  const opponentMoveCount = gameState.gameState.blind.opponentMoveCount;
  const opponentSubmitted = gameState.gameState.blind.opponentSubmitted;
  const mySubmitted = gameState.gameState.blind.mySubmitted;
  const bothSubmitted = gameState.gameState.blind.bothSubmitted;

  // Derived values
  const isWhite = myColor === 'white';
  const colourLetter = isWhite ? 'w' : 'b';

  // UI State
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLobbyConfirm, setShowLobbyConfirm] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);

  // Chess game engines
  const [game, setGame] = useState(() => {
    const g = new Chess(INITIAL_FEN);
    const fenParts = g.fen().split(' ');
    fenParts[1] = isWhite ? 'w' : 'b';
    g.load(fenParts.join(' '));
    return g;
  });

  const [pieceTracker] = useState(
    () => new EnhancedPieceTracker(MAX_PER_PIECE, MAX_MOVES)
  );
  const [ruleEngine] = useState(
    () => new BlindChessRuleEngine(MAX_PER_PIECE, MAX_MOVES)
  );
  const [pieceIndicators, setPieceIndicators] = useState<{
    [square: string]: any;
  }>({});

  // Fetch room players
  useEffect(() => {
    const fetchRoomPlayers = async () => {
      if (!gameId) return;

      try {
        const { data: players, error } = await supabase
          .from('game_room_players')
          .select('player_id, player_username, player_rating')
          .eq('room_id', gameId);

        if (error) {
          console.error('Error fetching room players:', error);
          return;
        }

        setRoomPlayers(players || []);
      } catch (error) {
        console.error('Failed to fetch room players:', error);
      }
    };

    fetchRoomPlayers();
  }, [gameId]);

  // Player data processing
  const myPlayerData = useMemo(() => {
    if (!currentUser || !myColor) {
      return {
        name: 'Loading...',
        rating: 1500,
        isHost: false,
      };
    }

    return {
      name: `${currentUser.username} (${isWhite ? 'White' : 'Black'})`,
      rating: currentUser.rating || 1500,
      isHost: false,
    };
  }, [currentUser, myColor, isWhite]);

  const opponentData = useMemo(() => {
    if (!currentUser || !roomPlayers.length || !myColor) {
      return {
        name: 'Loading...',
        rating: 1500,
        isHost: false,
      };
    }

    const opponent = roomPlayers.find((p) => p.player_id !== currentUser.id);
    return {
      name: `${opponent?.player_username || 'Opponent'} (${
        isWhite ? 'Black' : 'White'
      })`,
      rating: opponent?.player_rating || 1500,
      isHost: false,
    };
  }, [currentUser, roomPlayers, myColor, isWhite]);

  // Update piece indicators when game changes
  useEffect(() => {
    setPieceIndicators(
      VisualFeedbackHelper.getPieceIndicators(game, ruleEngine, colourLetter)
    );
  }, [game, ruleEngine, colourLetter]);

  // Reset game state when player color changes
  useEffect(() => {
    if (myColor) {
      const freshGame = new Chess(INITIAL_FEN);
      const fenParts = freshGame.fen().split(' ');
      fenParts[1] = isWhite ? 'w' : 'b';
      freshGame.load(fenParts.join(' '));

      setGame(freshGame);
      pieceTracker.reset();
      ruleEngine.reset();
      clearViolations();
    }
  }, [myColor, isWhite, pieceTracker, ruleEngine, clearViolations]);

  // Rebuild game state from saved moves
  useEffect(() => {
    if (myMoves.length === 0) return;

    const freshGame = new Chess(INITIAL_FEN);
    const fenParts = freshGame.fen().split(' ');
    fenParts[1] = isWhite ? 'w' : 'b';
    freshGame.load(fenParts.join(' '));

    pieceTracker.reset();
    ruleEngine.reset();

    // Replay all moves
    myMoves.forEach(
      (move: { from: string; to: string; san: string }, index: number) => {
        const tempMove = freshGame.move({
          from: move.from,
          to: move.to,
          promotion: 'q',
        });
        if (tempMove) {
          const fenParts = freshGame.fen().split(' ');
          fenParts[1] = colourLetter;
          freshGame.load(fenParts.join(' '));
          pieceTracker.recordMove(
            freshGame,
            move.from,
            move.to,
            move.san,
            index + 1
          );
          ruleEngine.processMove(freshGame, move, index + 1);
        }
      }
    );

    setGame(freshGame);
  }, [myMoves, isWhite, colourLetter, pieceTracker, ruleEngine]);

  // Computed values
  const moveSummary = pieceTracker.getMovementSummary();
  const remainingMoves = MAX_MOVES - moveSummary.totalMoves;
  const squareStyles = VisualFeedbackHelper.getEnhancedSquareStyles(
    game,
    pieceTracker,
    colourLetter
  );
  const isComplete = myMoves.length === MAX_MOVES;
  const isSubmitDisabled = useMemo(() => {
    return myMoves.length === 0 || mySubmitted || isSubmitting;
  }, [myMoves.length, mySubmitted, isSubmitting]);

  // Handle piece drop on board
  const handleDrop = useCallback(
    (from: string, to: string, piece: string): boolean => {
      if (isProcessingMove) {
        setTimeout(() => setIsProcessingMove(false), 1000);
        return false;
      }

      setIsProcessingMove(true);

      // Check basic constraints first
      if (myMoves.length >= MAX_MOVES) {
        showViolations([createViolation.moveLimit(myMoves.length, MAX_MOVES)]);
        setTimeout(() => setIsProcessingMove(false), 150);
        return false;
      }

      if (mySubmitted) {
        showViolations([
          createViolation.invalidMove('Moves already submitted!'),
        ]);
        setTimeout(() => setIsProcessingMove(false), 150);
        return false;
      }

      if ((isWhite && piece[0] !== 'w') || (!isWhite && piece[0] !== 'b')) {
        showViolations([
          createViolation.wrongTurn(isWhite ? 'white' : 'black'),
        ]);
        setTimeout(() => setIsProcessingMove(false), 150);
        return false;
      }

      const testMove = { from, to, promotion: 'q' as const };
      const validation = ruleEngine.validateMove(game, testMove);

      // If rule engine says invalid, don't save the move
      if (!validation.isValid) {
        const displayViolations = validation.violations.map((violation) => {
          switch (violation.type) {
            case 'PIECE_EXHAUSTED':
              return createViolation.pieceExhausted(
                piece.slice(1),
                violation.pieceId
                  ? pieceTracker.getPieceMoveCount(game.get(from as any), from)
                  : 0,
                MAX_PER_PIECE
              );
            case 'MOVE_LIMIT':
              return createViolation.moveLimit(myMoves.length, MAX_MOVES);
            case 'INVALID_MOVE':
              return createViolation.invalidMove(violation.message);
            default:
              return createViolation.invalidMove();
          }
        });
        showViolations(displayViolations);
        setTimeout(() => setIsProcessingMove(false), 150);
        return false;
      }

      const next = new Chess(game.fen());
      const mv = next.move(testMove);

      // If chess.js says invalid, don't save the move
      if (!mv) {
        showViolations([createViolation.invalidMove('Illegal chess move')]);
        setTimeout(() => setIsProcessingMove(false), 150);
        return false;
      }

      // VALID MOVE - Process normally
      const fenParts = next.fen().split(' ');
      fenParts[1] = colourLetter;
      next.load(fenParts.join(' '));

      // Update local state immediately (optimistic UI)
      pieceTracker.recordMove(next, from, to, mv.san, myMoves.length + 1);
      ruleEngine.processMove(
        next,
        { from, to, san: mv.san },
        myMoves.length + 1
      );
      setGame(next);
      clearViolations();

      // Save valid move to database
      gameState
        .saveBlindMove({ from, to, san: mv.san })
        .then((success: boolean) => {
          if (!success) {
            console.error('Failed to save valid move');
          }
        })
        .catch((error: any) => {
          console.error('Network error saving valid move:', error);
        });

      setTimeout(() => setIsProcessingMove(false), 150);
      return true;
    },
    [
      isProcessingMove,
      myMoves.length,
      mySubmitted,
      isWhite,
      ruleEngine,
      game,
      showViolations,
      createViolation,
      pieceTracker,
      colourLetter,
      clearViolations,
      gameState,
    ]
  );

  // Handle undo last move
  const handleUndo = useCallback(() => {
    if (myMoves.length === 0 || mySubmitted) return;

    gameState.undoBlindMove().catch((error: any) => {
      console.error('Failed to undo move:', error);
    });
    clearViolations();
  }, [myMoves.length, mySubmitted, gameState, clearViolations]);

  // Handle reset all moves
  const handleReset = useCallback(() => {
    if (mySubmitted) return;

    gameState.clearBlindMoves().catch((error: any) => {
      console.error('Failed to clear moves:', error);
    });
    clearViolations();
  }, [mySubmitted, gameState, clearViolations]);

  // Handle submit moves
  const handleSubmit = useCallback(async () => {
    // Prevent multiple rapid submissions
    if (myMoves.length === 0 || mySubmitted || isSubmitting) {
      return;
    }

    // Increment attempt counter to track rapid clicking
    submissionAttemptRef.current += 1;
    const currentAttempt = submissionAttemptRef.current;

    setIsSubmitting(true);

    try {
      const success = await gameState.submitBlindMoves();

      // Only process if this is still the latest attempt
      if (currentAttempt === submissionAttemptRef.current) {
        if (!success) {
          console.error('Failed to submit moves');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      // Add delay to prevent rapid re-submission
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000); // 2 second cooldown
    }
  }, [myMoves.length, mySubmitted, isSubmitting, gameState]);

  // Handle return to lobby - just trigger the modal
  const handleLobbyReturn = useCallback(() => {
    setShowLobbyConfirm(true);
  }, []);

  const handleConfirmLobbyReturn = useCallback(async () => {
    if (!gameId) {
      console.error('❌ No game ID available for resignation');
      window.location.href = '/games';
      return;
    }

    try {
      // Import blindMovesService
      const { blindMovesService } = await import('../services/blindMovesService');

      // Resign from the game
      const success = await blindMovesService.resignFromBlindPhase(gameId);

      if (!success) {
        console.error('❌ Failed to resign from game');
      }
    } catch (error) {
      console.error('❌ Error during resignation:', error);
    } finally {
      // Always return to lobby, even if resignation fails
      window.location.href = '/games';
    }
  }, [gameId]);

  const handleCancelLobbyReturn = useCallback(() => {
    setShowLobbyConfirm(false);
  }, []);

  // Bot auto-submission - When human submits, bot generates and submits moves
  useEffect(() => {
    const submitBotMoves = async () => {
      // Only proceed if:
      // 1. This is a bot game
      // 2. Human has submitted their moves
      // 3. Bot hasn't submitted yet
      // 4. We have the bot config
      if (!isBotGame || !mySubmitted || !bot || !botColor || botSubmittedRef.current || !gameId) {
        return;
      }

      // Check if bot has already submitted (double-check from DB)
      try {
        const { data: botMoves, error } = await supabase
          .from('game_blind_moves')
          .select('is_submitted')
          .eq('game_id', gameId)
          .eq('player_color', botColor)
          .limit(1);

        if (error) {
          console.error('Error checking bot submission status:', error);
          return;
        }

        if (botMoves && botMoves.length > 0 && botMoves[0].is_submitted) {
          console.log('✅ Bot already submitted moves');
          botSubmittedRef.current = true;
          return;
        }

        console.log(`🤖 ${bot.config.name} generating blind phase moves...`);
        botSubmittedRef.current = true; // Prevent double submission

        // Generate bot's 5 blind moves
        const botBlindMoves = await celestialBotAI.generateBlindPhaseMoves(
          bot.config,
          botColor
        );

        console.log(`✅ Bot generated moves: ${botBlindMoves.join(', ')}`);

        // Submit bot moves to database
        // NOTE: Moves are already in SAN format from the AI, so we need to parse them
        const botGame = new Chess(INITIAL_FEN);

        for (let i = 0; i < botBlindMoves.length; i++) {
          // Set the correct turn before making the move
          const currentFen = botGame.fen().split(' ');
          currentFen[1] = botColor === 'white' ? 'w' : 'b';
          botGame.load(currentFen.join(' '));

          const moveResult = botGame.move(botBlindMoves[i]);
          if (!moveResult) {
            console.error(`❌ Bot move ${i + 1} is invalid: ${botBlindMoves[i]}`);
            console.error(`Current FEN: ${botGame.fen()}`);
            console.error(`Attempted move: ${botBlindMoves[i]}`);
            continue;
          }

          // Save each bot move to database using RLS-bypassing function
          const { data: insertResult, error: saveError } = await supabase.rpc(
            'insert_bot_blind_move',
            {
              p_game_id: gameId,
              p_player_color: botColor,
              p_move_number: i + 1,
              p_move_from: moveResult.from,
              p_move_to: moveResult.to,
              p_move_san: moveResult.san,
              p_is_submitted: false,
            }
          );

          if (saveError || !insertResult?.success) {
            console.error(`❌ Error saving bot move ${i + 1}:`, {
              error: saveError,
              result: insertResult,
              moveData: {
                game_id: gameId,
                color: botColor,
                move_number: i + 1,
                move: botBlindMoves[i],
                from: moveResult.from,
                to: moveResult.to,
                san: moveResult.san
              }
            });
          }
        }

        // Mark bot moves as submitted using RLS-bypassing function
        const { data: submitResult, error: submitError } = await supabase.rpc(
          'mark_bot_moves_submitted',
          {
            p_game_id: gameId,
            p_player_color: botColor,
          }
        );

        if (submitError || !submitResult?.success) {
          console.error('Error marking bot moves as submitted:', submitError || submitResult);
        } else {
          console.log(`✅ ${bot.config.name} submitted all blind moves!`);
        }
      } catch (error) {
        console.error('Error in bot auto-submission:', error);
        botSubmittedRef.current = false; // Allow retry
      }
    };

    submitBotMoves();
  }, [isBotGame, mySubmitted, bot, botColor, gameId]);

  // Return state and actions
  return {
    // Game state
    game,
    pieceTracker,
    ruleEngine,
    pieceIndicators,
    squareStyles,

    // Player data
    myColor,
    myPlayerData,
    opponentData,

    // Move data
    myMoves,
    opponentMoveCount,
    mySubmitted,
    opponentSubmitted,
    bothSubmitted,

    // UI state
    isProcessingMove,
    isSubmitting,
    showLobbyConfirm,

    // Computed values
    isWhite,
    colourLetter,
    moveSummary,
    remainingMoves,
    isComplete,
    isSubmitDisabled,

    // Actions
    handleDrop,
    handleUndo,
    handleReset,
    handleSubmit,
    handleLobbyReturn,
    handleConfirmLobbyReturn,
    handleCancelLobbyReturn,

    // Constants
    MAX_MOVES,
    MAX_PER_PIECE,
  };
};
