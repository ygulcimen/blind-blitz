// src/components/BlindPhase/MultiplayerBlindPhaseScreen.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import { useViolations } from '../shared/ViolationSystem';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { supabase } from '../../lib/supabase';
import {
  BlindChessRuleEngine,
  EnhancedPieceTracker,
  VisualFeedbackHelper,
} from '../../services/chess';
import {
  ArrowLeft,
  EyeOff,
  Undo,
  RotateCcw,
  Send,
  Rocket,
  Zap,
  Target,
  Shield,
  Crown,
  Star,
  Users,
  Clock,
} from 'lucide-react';

interface MultiplayerBlindPhaseScreenProps {
  gameState: any;
  gameId?: string;
}

const MAX_MOVES = 5;
const MAX_PER_PIECE = 2;
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const MultiplayerBlindPhaseScreen: React.FC<
  MultiplayerBlindPhaseScreenProps
> = ({ gameState, gameId }) => {
  const { showViolations, createViolation, clearViolations } = useViolations();
  const { playerData: currentUser } = useCurrentUser();
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionAttemptRef = useRef<number>(0);

  // Get my color and moves from the game state
  const myColor = gameState.gameState.blind.myColor;
  // Add this debug logging right after the myColor declaration
  useEffect(() => {
    console.log('🎯 Debug - Game State:', {
      myColor,
      gameId,
      blindState: gameState.gameState.blind,
      currentUser: currentUser?.id,
    });
  }, [myColor, gameId, gameState.gameState.blind, currentUser]);
  const myMoves = gameState.gameState.blind.myMoves;
  const opponentMoveCount = gameState.gameState.blind.opponentMoveCount;
  const opponentSubmitted = gameState.gameState.blind.opponentSubmitted;
  const mySubmitted = gameState.gameState.blind.mySubmitted;
  const bothSubmitted = gameState.gameState.blind.bothSubmitted;

  const isWhite = myColor === 'white';
  const colourLetter = isWhite ? 'w' : 'b';

  // Real player data state
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);

  // Fetch room players
  useEffect(() => {
    const fetchRoomPlayers = async () => {
      if (!gameId) return;

      try {
        console.log('🔍 Fetching room players for gameId:', gameId);
        const { data: players, error } = await supabase
          .from('game_room_players')
          .select('player_id, player_username, player_rating')
          .eq('room_id', gameId);

        if (error) {
          console.error('❌ Error fetching room players:', error);
          return;
        }

        console.log('✅ Fetched room players:', players);
        setRoomPlayers(players || []);
      } catch (error) {
        console.error('❌ Failed to fetch room players:', error);
      }
    };

    fetchRoomPlayers();
  }, [gameId]);

  // Real player data
  const myPlayerData = useMemo(() => {
    if (!currentUser || !myColor) {
      console.log('⚠️ Missing currentUser or myColor:', {
        currentUser,
        myColor,
      });
      return {
        name: 'Loading...',
        rating: 1500,
        isHost: false,
      };
    }

    console.log('👤 Current user data:', currentUser);
    return {
      name: `${currentUser.username} (${isWhite ? 'White' : 'Black'})`,
      rating: currentUser.rating || 1500,
      isHost: false, // You can get this from room data if needed
    };
  }, [currentUser, myColor, isWhite]);

  const opponentData = useMemo(() => {
    if (!currentUser || !roomPlayers.length || !myColor) {
      console.log('⚠️ Missing data for opponent:', {
        currentUser,
        roomPlayers,
        myColor,
      });
      return {
        name: 'Loading...',
        rating: 1500,
        isHost: false,
      };
    }

    const opponent = roomPlayers.find((p) => p.player_id !== currentUser.id);
    console.log('👥 Found opponent:', opponent);

    return {
      name: `${opponent?.player_username || 'Opponent'} (${
        isWhite ? 'Black' : 'White'
      })`,
      rating: opponent?.player_rating || 1500,
      isHost: false,
    };
  }, [currentUser, roomPlayers, myColor, isWhite]);

  // Chess game state for UI
  const [game, setGame] = useState(() => {
    const g = new Chess(INITIAL_FEN);
    // Always start with the player's turn regardless of color
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

  const handleDrop = (from: string, to: string, piece: string): boolean => {
    if (isProcessingMove) {
      console.log('Move in progress, ignoring');
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
      showViolations([createViolation.invalidMove('Moves already submitted!')]);
      setTimeout(() => setIsProcessingMove(false), 150);
      return false;
    }

    if ((isWhite && piece[0] !== 'w') || (!isWhite && piece[0] !== 'b')) {
      showViolations([createViolation.wrongTurn(isWhite ? 'white' : 'black')]);
      setTimeout(() => setIsProcessingMove(false), 150);
      return false;
    }

    const testMove = { from, to, promotion: 'q' as const };
    const validation = ruleEngine.validateMove(game, testMove);

    // If rule engine says invalid, don't save the move at all
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

    // If chess.js says invalid, don't save the move at all
    if (!mv) {
      showViolations([createViolation.invalidMove('Illegal chess move')]);
      setTimeout(() => setIsProcessingMove(false), 150);
      return false;
    }

    // VALID MOVE - Process normally
    console.log(`🎯 Making valid blind move: ${from} to ${to} (${mv.san})`);

    const fenParts = next.fen().split(' ');
    fenParts[1] = colourLetter;
    next.load(fenParts.join(' '));

    // Update local state immediately (optimistic UI)
    pieceTracker.recordMove(next, from, to, mv.san, myMoves.length + 1);
    ruleEngine.processMove(next, { from, to, san: mv.san }, myMoves.length + 1);
    setGame(next);
    clearViolations();

    // Save valid move to database (always with isValid: true)
    gameState
      .saveBlindMove({ from, to, san: mv.san })
      .then((success: boolean) => {
        if (success) {
          console.log('✅ Valid move saved to database:', mv.san);
        } else {
          console.error('❌ Failed to save valid move - reverting');
          // Revert logic here if needed
        }
      })
      .catch((error: any) => {
        console.error('❌ Network error saving valid move:', error);
        // Revert logic here if needed
      });

    setTimeout(() => setIsProcessingMove(false), 150);
    return true;
  };
  const handleUndo = () => {
    if (myMoves.length === 0 || mySubmitted) return;

    gameState.undoBlindMove().catch((error: any) => {
      console.error('Failed to undo move:', error);
    });
    clearViolations();
  };

  const handleReset = () => {
    if (mySubmitted) return;

    gameState.clearBlindMoves().catch((error: any) => {
      console.error('Failed to clear moves:', error);
    });
    clearViolations();
  };

  const handleSubmit = useCallback(async () => {
    // Prevent multiple rapid submissions
    if (myMoves.length === 0 || mySubmitted || isSubmitting) {
      console.log('Submit blocked:', {
        movesLength: myMoves.length,
        mySubmitted,
        isSubmitting,
      });
      return;
    }

    // Increment attempt counter to track rapid clicking
    submissionAttemptRef.current += 1;
    const currentAttempt = submissionAttemptRef.current;

    setIsSubmitting(true);

    try {
      console.log(`🚀 Attempt ${currentAttempt}: Submitting moves...`);

      const success = await gameState.submitBlindMoves();

      // Only process if this is still the latest attempt
      if (currentAttempt === submissionAttemptRef.current) {
        if (success) {
          console.log('✅ Moves submitted successfully');

          // Note: Local state update will come via subscription
          // No need to manually update here since gameState is from props
        } else {
          console.error('❌ Failed to submit moves');
        }
      } else {
        console.log(
          `⏭️ Skipping result for outdated attempt ${currentAttempt}`
        );
      }
    } catch (error) {
      console.error('💥 Submit error:', error);
    } finally {
      // Add delay to prevent rapid re-submission
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000); // 2 second cooldown
    }
  }, [myMoves.length, mySubmitted, isSubmitting, gameState]);
  const isSubmitDisabled = useMemo(() => {
    return myMoves.length === 0 || mySubmitted || isSubmitting;
  }, [myMoves.length, mySubmitted, isSubmitting]);

  const handleLobbyReturn = () => {
    if (
      window.confirm(
        '⚠️ SURRENDER WARNING ⚠️\n\nReturning to lobby will count as a RESIGNATION!\n\nAre you sure?'
      )
    ) {
      window.location.href = '/games';
    }
  };

  // Timer component
  const EpicTimer: React.FC = () => {
    const { timer } = gameState.gameState;
    const timeLeftMs = timer.whiteTime; // Both players have same time in simultaneous mode
    const timeLeft = Math.ceil(timeLeftMs / 1000);
    const percentage = (timeLeftMs / timer.duration) * 100;
    const isCritical = timeLeft <= 10;
    const isWarning = timeLeft <= 30 && timeLeft > 10;

    return (
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-300 ${
            isCritical
              ? 'bg-red-500/40 animate-pulse'
              : isWarning
              ? 'bg-yellow-500/30'
              : 'bg-blue-500/20'
          }`}
        />

        <div
          className={`relative px-8 py-6 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ${
            isCritical
              ? 'bg-red-900/30 border-red-400/50'
              : isWarning
              ? 'bg-yellow-900/30 border-yellow-400/50'
              : 'bg-blue-900/30 border-blue-400/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`text-4xl ${isCritical ? 'animate-bounce' : ''}`}>
                ⏱️
              </div>
            </div>

            <div className="flex-1 text-center">
              <div className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">
                SIMULTANEOUS BLIND PHASE
              </div>
              <div className="text-3xl font-black text-white leading-none mb-2">
                {timeLeft}s
              </div>

              <div className="relative w-full h-2 bg-black/50 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear ${
                    isCritical
                      ? 'bg-gradient-to-r from-red-400 to-red-600'
                      : isWarning
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <EyeOff
              className={`w-6 h-6 text-white ${
                isCritical ? 'animate-pulse' : ''
              }`}
            />
          </div>

          {isCritical && (
            <div className="mt-3 text-center text-red-300 text-sm font-bold uppercase tracking-wider animate-pulse">
              ⚡ FINAL MOMENTS! ⚡
            </div>
          )}
        </div>
      </div>
    );
  };

  // Player card component
  const PlayerCard: React.FC<{
    player: any;
    isMe: boolean;
    moveCount: number;
    submitted: boolean;
  }> = ({ player, isMe, moveCount, submitted }) => (
    <div
      className={`bg-gradient-to-br backdrop-blur-sm border-2 rounded-xl p-4 shadow-2xl relative ${
        isMe
          ? 'from-blue-800/60 to-blue-900/80 border-blue-500/50 shadow-blue-500/20'
          : 'from-slate-800/60 to-slate-900/80 border-slate-500/50'
      }`}
    >
      {submitted && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-black px-2 py-1 rounded-lg text-xs font-black shadow-lg animate-bounce">
          ✅ SUBMITTED
        </div>
      )}

      <div className="text-center">
        <div className="relative inline-block mb-2">
          <div
            className={`w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-xl ${
              isMe
                ? 'from-blue-600 via-indigo-600 to-blue-700'
                : 'from-slate-600 via-gray-600 to-slate-700'
            }`}
          >
            <span className="text-white font-black text-lg drop-shadow-lg">
              {player.name[0]}
            </span>
          </div>
          {player.isHost && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
              <Crown className="w-3 h-3 text-white fill-current" />
            </div>
          )}
        </div>

        <h3 className="text-sm font-black mb-1 tracking-wide text-white">
          {player.name}
        </h3>

        <div className="flex items-center justify-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-yellow-400 font-bold text-sm">
            {player.rating}
          </span>
        </div>

        <div className="text-center mb-2">
          <div className="text-xs text-gray-400 mb-1">Moves Made</div>
          <div
            className={`text-lg font-black ${
              submitted ? 'text-green-400' : 'text-white'
            }`}
          >
            {moveCount}/{MAX_MOVES}
          </div>
        </div>

        {submitted ? (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-900/40 text-green-300 text-xs">
            <Shield className="w-3 h-3" />
            <span className="font-bold">READY</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-900/40 text-orange-300 text-xs">
            <Clock className="w-3 h-3" />
            <span className="font-bold">PLANNING</span>
          </div>
        )}
      </div>
    </div>
  );

  // Battle sequence component
  const BattleSequence: React.FC = () => (
    <div className="space-y-2">
      <div className="text-center mb-3">
        <h3 className="text-lg font-black text-white flex items-center justify-center gap-2 mb-1">
          <Target className="w-5 h-5 text-blue-400" />
          My Battle Plan
        </h3>
        <div className="text-xs text-gray-400">
          {myMoves.length}/{MAX_MOVES} strikes planned
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: MAX_MOVES }).map((_, i) => {
          const move = myMoves[i];
          const isActive = i < myMoves.length;
          const isCurrent = i === myMoves.length - 1;

          return (
            <div
              key={i}
              className={`relative p-2 rounded-lg border transition-all duration-300 ${
                isActive
                  ? isCurrent
                    ? 'bg-blue-900/40 border-blue-400/50 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800/60 border-gray-600/50'
                  : 'bg-gray-900/30 border-gray-700/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-white'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {move?.san ?? '—'}
                  </span>
                  {isActive && <Zap className="w-3 h-3 text-yellow-400" />}
                </div>
                {isCurrent && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!myColor) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚔️</div>
          <div className="text-2xl font-bold mb-2">Assigning Colors...</div>
          <div className="text-gray-400">Preparing multiplayer battle</div>
        </div>
      </div>
    );
  }

  const moveSummary = pieceTracker.getMovementSummary();
  const remainingMoves = MAX_MOVES - moveSummary.totalMoves;
  const squareStyles = VisualFeedbackHelper.getEnhancedSquareStyles(
    game,
    pieceTracker,
    colourLetter
  );
  const isComplete = myMoves.length === MAX_MOVES;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden relative">
      {/* Epic animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/[0.07] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/[0.05] rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Left: Battle Sequence */}
      <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col relative">
        {/* Panel glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Player Card - Use same style as BlindPhaseScreen */}
          <div className="mb-4">
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl shadow-purple-500/20 relative">
              <div className="text-center">
                <div className="relative inline-block mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-xl">
                    <span className="text-white font-black text-lg drop-shadow-lg">
                      {myPlayerData.name[0]}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-black mb-1 tracking-wide text-white">
                  {myPlayerData.name}
                </h3>

                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">
                    {myPlayerData.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Battle Sequence - Same style as BlindPhaseScreen */}
          <div className="flex-1">
            <BattleSequence />
          </div>

          {/* Bottom Stats */}
          <div className="mt-4 p-3 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-300 font-medium mb-1">
                ⚔️ Battle Rules ⚔️
              </div>
              <div className="text-xs text-gray-500">
                Max 2 strikes per piece • {remainingMoves} remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Epic Chess Board */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Board glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
        </div>

        <div className="relative z-10">
          <UnifiedChessBoard
            fen={game.fen()}
            game={game}
            isFlipped={!isWhite}
            onPieceDrop={handleDrop}
            pieceIndicators={pieceIndicators}
            customSquareStyles={squareStyles}
            phase="blind"
            boardWidth={Math.min(
              700,
              window.innerWidth * 0.5,
              window.innerHeight * 0.85
            )}
          />
        </div>
      </div>

      {/* Right: Controls - Same style as BlindPhaseScreen */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-blue-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Epic Timer */}
          <div className="p-6">
            <EpicTimer />
          </div>

          {/* Progress Section */}
          <div className="px-6 pb-6">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Mission Progress
                </span>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-lg ${
                    isComplete
                      ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                      : 'text-gray-400'
                  }`}
                >
                  {moveSummary.totalMoves}/{MAX_MOVES}
                </span>
              </div>

              <div className="flex gap-1">
                {Array.from({ length: MAX_MOVES }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                      i < myMoves.length
                        ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 shadow-lg shadow-blue-500/50'
                        : 'bg-gray-700/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons - Same style as BlindPhaseScreen */}
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleUndo}
                disabled={myMoves.length === 0 || mySubmitted}
                title="Undo Last Strike"
                className={`relative overflow-hidden p-4 rounded-xl transition-all duration-300 ${
                  myMoves.length > 0 && !mySubmitted
                    ? 'bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:scale-105'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
                }`}
              >
                <Undo className="w-6 h-6 mx-auto" />
              </button>

              <button
                onClick={handleReset}
                disabled={mySubmitted}
                title="Reset All Strikes"
                className={`relative overflow-hidden p-4 rounded-xl transition-all duration-300 ${
                  !mySubmitted
                    ? 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/25 hover:scale-105'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
                }`}
              >
                <RotateCcw className="w-6 h-6 mx-auto" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={`w-full relative overflow-hidden py-6 px-6 rounded-xl transition-all duration-300 ${
                mySubmitted
                  ? 'bg-green-900/50 text-green-400 border border-green-500/30 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed animate-pulse'
                  : isComplete
                  ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-400 hover:via-emerald-400 hover:to-green-500 text-white animate-pulse shadow-xl shadow-green-500/40 hover:scale-105'
                  : myMoves.length > 0
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
                  : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {mySubmitted ? (
                  <>
                    <Shield className="w-8 h-8" />
                    <span className="text-sm font-bold">SUBMITTED</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-bold">SUBMITTING...</span>
                  </>
                ) : isComplete ? (
                  <Rocket className="w-8 h-8" />
                ) : myMoves.length > 0 ? (
                  <Send className="w-7 h-7" />
                ) : (
                  <EyeOff className="w-7 h-7" />
                )}
              </div>
            </button>
          </div>

          {/* Return to Lobby Button */}
          <div className="px-6 pb-6 mt-auto">
            <button
              onClick={handleLobbyReturn}
              className="group flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/60 hover:bg-red-600/60 border border-slate-600/50 hover:border-red-500/50 rounded-xl transition-all duration-300 backdrop-blur-sm w-full"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm">Return to Lobby</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerBlindPhaseScreen;
