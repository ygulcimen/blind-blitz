import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  liveMovesService,
  type LiveGameState,
  type LiveMove,
  type DrawOffer,
} from '../../services/liveMovesService';
import { blindMovesService } from '../../services/blindMovesService';
import type { GameResult } from '../../types/GameTypes';
import { getCapturedPieces } from '../../utils/capturedPieces';

// Custom hooks
import { useLiveTimer } from '../../hooks/useLiveTimer';
import { useViolations } from '../shared/ViolationSystem';

// Focused components
import { GameInitializer } from './GameInitializer';
import { GameSubscriptions } from './GameSubscriptions';
import { useMoveHandler } from './MoveHandler';

// UI Components
import { LiveGameBoard } from './GameBoard/LiveGameBoard';
import { PlayerBar } from './PlayerBar/PlayerBar';
import { RewardsBox } from './LeftPanel/RewardsBox';
import { PhaseTimeline } from './LeftPanel/PhaseTimeline';
import { GameStats } from './LeftPanel/GameStats';
import { MoveLog } from './RightPanel/MoveLog';
import { ActionButtons } from './RightPanel/ActionButtons';
import { GameEndModal } from '../shared/GameEndModal/GameEndModal';
import { DrawOfferModal } from '../shared/DrawOfferModal/DrawOfferModal';
import { ResignationModal } from '../shared/ResignationModal/ResignationModal';
import { DrawOfferNotification } from '../shared/DrawOfferNotification/DrawOfferNotification';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
  moveNumber?: number;
}

interface MultiplayerLivePhaseScreenProps {
  gameState: any;
  gameId?: string;
  gameMode?: 'classic' | 'robot_chaos';
}

const MultiplayerLivePhaseScreen: React.FC<MultiplayerLivePhaseScreenProps> = ({
  gameState,
  gameId,
  gameMode = 'classic',
}) => {
  const navigate = useNavigate();
  const { clearViolations } = useViolations();
  const { playerData: currentUser } = useCurrentUser();

  // Memoize gameState parts to prevent re-renders from timer updates
  const memoizedGameStateData = useMemo(
    () => ({
      reveal: gameState?.gameState?.reveal,
      phase: gameState?.gameState?.phase,
      live: gameState?.gameState?.live,
    }),
    [
      gameState?.gameState?.reveal?.finalFen,
      gameState?.gameState?.reveal?.moveLog,
      gameState?.gameState?.reveal?.isComplete,
      gameState?.gameState?.phase,
      gameState?.gameState?.live?.fen,
      gameState?.gameState?.live?.gameEnded,
      gameState?.gameState?.live?.gameResult,
    ]
  );

  // ═══════════════════════════════════════════════════════════════
  // 🎮 GAME STATE
  // ═══════════════════════════════════════════════════════════════

  const [liveGameState, setLiveGameState] = useState<LiveGameState | null>(
    null
  );
  const [liveMoves, setLiveMoves] = useState<LiveMove[]>([]);
  const [drawOffer, setDrawOffer] = useState<DrawOffer | null>(null);
  const [chessGame, setChessGame] = useState<Chess | null>(null);
  const [myColor, setMyColor] = useState<'white' | 'black' | null>(null);
  const [opponentData, setOpponentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blindMoves, setBlindMoves] = useState<MoveLogItem[]>([]);

  // UI State
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showDrawOfferConfirm, setShowDrawOfferConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [isProcessingMove, setIsProcessingMove] = useState(false);

  // Mobile panel state - MUST be declared before any early returns to avoid hook count mismatch
  const [activeMobilePanel, setActiveMobilePanel] = useState<'game' | 'stats' | 'moves'>('game');

  // Move processing refs
  const pendingOptimisticIdRef = useRef<string | null>(null);
  const prevFenRef = useRef<string | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 GAME INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  const handleGameStateLoaded = useCallback(
    (data: {
      liveGameState: LiveGameState;
      liveMoves: LiveMove[];
      drawOffer: DrawOffer | null;
      chessGame: Chess;
      myColor: 'white' | 'black';
      opponentData: any;
    }) => {
      setLiveGameState(data.liveGameState);
      setLiveMoves(data.liveMoves);
      setDrawOffer(data.drawOffer);
      setChessGame(data.chessGame);
      setMyColor(data.myColor);
      setOpponentData(data.opponentData);
    },
    []
  );

  // ═══════════════════════════════════════════════════════════════
  // ⏰ TIMER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  const handleTimeout = useCallback(
    async (timedOutPlayer: 'white' | 'black') => {
      if (gameId) {
        await liveMovesService.handleTimeout(gameId, timedOutPlayer);
      }
    },
    [gameId]
  );

  const displayTimes = useLiveTimer(liveGameState, handleTimeout);

  // Helper function to format time
  const formatTime = useCallback((timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 🎮 MOVE HANDLING
  // ═══════════════════════════════════════════════════════════════

  const moveHandlerProps = useMemo(
    () => ({
      gameId,
      currentUser,
      liveGameState,
      chessGame,
      myColor,
      isProcessingMove,
      setIsProcessingMove,
      setChessGame,
      setLiveGameState,
      setLiveMoves,
      pendingOptimisticIdRef,
      prevFenRef,
    }),
    [
      gameId,
      currentUser,
      liveGameState,
      chessGame,
      myColor,
      isProcessingMove,
      pendingOptimisticIdRef,
      prevFenRef,
    ]
  );

  const { handleDrop } = useMoveHandler(moveHandlerProps);

  // ═══════════════════════════════════════════════════════════════
  // 🎮 GAME END HANDLING
  // ═══════════════════════════════════════════════════════════════

  const handleGameEnd = useCallback((result: GameResult) => {
    console.log('🏁 HANDLE GAME END: Called with result:', result);
    console.log('🏁 HANDLE GAME END: Setting gameResult and showing modal');
    setGameResult(result);
    setShowGameEndModal(true);
    console.log('✅ HANDLE GAME END: Modal should now be visible');
  }, []);

  // Game end detection
  useEffect(() => {
    console.log('🎮 GAME END DETECTION: Checking conditions', {
      game_ended: liveGameState?.game_ended,
      game_result: liveGameState?.game_result,
      current_gameResult: gameResult,
      myColor,
      winner: liveGameState?.game_result?.winner,
      showGameEndModal,
      conditions: {
        hasGameEnded: !!liveGameState?.game_ended,
        hasGameResult: !!liveGameState?.game_result,
        noCurrentResult: !gameResult
      }
    });

    if (
      liveGameState?.game_ended &&
      liveGameState?.game_result &&
      !gameResult
    ) {
      console.log('🏁 GAME END DETECTION: All conditions met, triggering game end modal');
      console.log('🏁 GAME END DETECTION: Game result details:', liveGameState.game_result);
      handleGameEnd(liveGameState.game_result);
    } else {
      console.log('❌ GAME END DETECTION: Conditions not met');
      if (!liveGameState?.game_ended) console.log('   - Game not ended');
      if (!liveGameState?.game_result) console.log('   - No game result');
      if (gameResult) console.log('   - Already have game result:', gameResult);
    }
  }, [
    liveGameState?.game_ended,
    liveGameState?.game_result,
    gameResult,
    handleGameEnd,
    myColor,
    showGameEndModal,
  ]);

  // Fetch blind moves on component mount/gameId change
  useEffect(() => {
    const fetchBlindMoves = async () => {
      if (!gameId) return;

      try {
        console.log('🔍 Fetching blind moves for game:', gameId);
        const moves = await blindMovesService.getBlindMovesForMoveLog(gameId);
        setBlindMoves(moves);
        console.log('✅ Blind moves loaded:', moves.length);
      } catch (error) {
        console.error('❌ Failed to fetch blind moves:', error);
        setBlindMoves([]);
      }
    };

    fetchBlindMoves();
  }, [gameId]);

  // ═══════════════════════════════════════════════════════════════
  // 🎮 GAME ACTION HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleResign = useCallback(async () => {
    if (!gameId) return;
    const success = await liveMovesService.resignGame(gameId);
    if (success) {
      // Handle success
    }
    setShowResignConfirm(false);
  }, [gameId]);

  const handleOfferDraw = useCallback(async () => {
    if (!gameId) return;
    const success = await liveMovesService.offerDraw(gameId);
    if (success) {
      // Handle success
    }
    setShowDrawOfferConfirm(false);
  }, [gameId]);

  const handleAcceptDraw = useCallback(async () => {
    console.log('🤝 DRAW ACCEPTANCE: Starting handleAcceptDraw', { gameId });
    if (!gameId) {
      console.log('❌ DRAW ACCEPTANCE: No gameId provided');
      return;
    }

    console.log('🤝 DRAW ACCEPTANCE: Calling liveMovesService.respondToDrawOffer(gameId, true)');
    const success = await liveMovesService.respondToDrawOffer(gameId, true);
    console.log('🤝 DRAW ACCEPTANCE: Service response:', { success });

    if (success) {
      console.log('✅ DRAW ACCEPTANCE: Successfully accepted draw offer');

      // TEMPORARY WORKAROUND: Force game end after 1 second if real-time doesn't work
      console.log('⏰ DRAW ACCEPTANCE: Setting 1-second timeout for forced game end');
      setTimeout(() => {
        console.log('🔧 FORCED GAME END: Checking if game is still running...');
        if (!gameResult && !showGameEndModal) {
          console.log('🔧 FORCED GAME END: Game still running, forcing end with draw result');
          const forcedDrawResult: GameResult = {
            type: 'draw',
            winner: 'draw',
            reason: 'agreement',
          };
          console.log('🔧 FORCED GAME END: Using clean draw result:', forcedDrawResult);
          handleGameEnd(forcedDrawResult);
        } else {
          console.log('✅ FORCED GAME END: Game already ended via real-time update');
        }
      }, 1000);

      // The GameSubscriptions component should handle the game state update
      // and trigger the GameEndModal via the game end detection useEffect
    } else {
      console.log('❌ DRAW ACCEPTANCE: Failed to accept draw offer');
    }
  }, [gameId, gameResult, showGameEndModal, handleGameEnd]);

  const handleDeclineDraw = useCallback(async () => {
    if (!gameId) return;
    await liveMovesService.respondToDrawOffer(gameId, false);
  }, [gameId]);


  const handleLeaveTable = useCallback(() => {
    // If game hasn't ended, show confirmation modal
    if (!liveGameState?.game_ended) {
      setShowLeaveConfirm(true);
    } else {
      // Game already ended, just navigate
      navigate('/games');
    }
  }, [liveGameState?.game_ended, navigate]);

  const handleConfirmLeave = useCallback(async () => {
    if (!gameId) return;

    // Resign the game
    await liveMovesService.resignGame(gameId);

    // Navigate to lobby
    setShowLeaveConfirm(false);
    navigate('/games');
  }, [gameId, navigate]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveConfirm(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 🎨 COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════

  const defaultPlayerData = useMemo(
    () => ({ name: 'Loading...', rating: 1500, isHost: false }),
    []
  );

  const myPlayerData = useMemo(() => {
    if (!currentUser || !myColor) return defaultPlayerData;

    return {
      name: `${currentUser.username} (${
        myColor === 'white' ? 'White' : 'Black'
      })`,
      rating: currentUser.rating || 1500,
      isHost: true,
    };
  }, [currentUser, myColor, defaultPlayerData]);

  const players = useMemo(
    () => ({
      white:
        myColor === 'white' ? myPlayerData : opponentData || defaultPlayerData,
      black:
        myColor === 'black' ? myPlayerData : opponentData || defaultPlayerData,
    }),
    [myColor, myPlayerData, opponentData, defaultPlayerData]
  );

  // Calculate captured pieces from current FEN
  const capturedPiecesData = useMemo(() => {
    if (!liveGameState) return null;
    return getCapturedPieces(liveGameState.current_fen);
  }, [liveGameState?.current_fen]);

  // ═══════════════════════════════════════════════════════════════
  // 🎬 RENDER
  // ═══════════════════════════════════════════════════════════════

  const finalFen = useMemo(
    () => memoizedGameStateData?.reveal?.finalFen,
    [memoizedGameStateData?.reveal?.finalFen]
  );

  if (loading || !liveGameState || !chessGame || !myColor) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        {/* Always render GameInitializer even during loading */}
        <GameInitializer
          gameId={gameId}
          currentUser={currentUser}
          finalFen={finalFen}
          onGameStateLoaded={handleGameStateLoaded}
          onLoadingChange={setLoading}
        />

        <div className="text-center">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 animate-spin">⚔️</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
            Preparing Live Battle...
          </div>
          <div className="text-sm sm:text-base text-gray-400">
            {loading && 'Initializing multiplayer chess'}
            {!loading && !liveGameState && 'Loading game state...'}
            {!loading && !chessGame && 'Setting up chess board...'}
            {!loading && !myColor && 'Determining player color...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden relative">
      {/* Logic Components */}
      <GameSubscriptions
        gameId={gameId}
        myColor={myColor}
        currentUser={currentUser}
        liveGameState={liveGameState}
        loading={loading}
        pendingOptimisticIdRef={pendingOptimisticIdRef}
        setLiveGameState={setLiveGameState}
        setLiveMoves={setLiveMoves}
        setChessGame={setChessGame}
        setDrawOffer={setDrawOffer}
        clearViolations={clearViolations}
      />

      {/* Modern Background with Glassmorphism */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/8 to-teal-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-gradient-to-r from-amber-500/6 to-orange-500/6 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* RESPONSIVE LAYOUT - Desktop 3-column, Mobile single-column with tabs */}
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* LEFT PANEL: Rewards, Timeline, Stats - DESKTOP ONLY */}
        <div className="hidden lg:flex w-80 flex-shrink-0 bg-black/40 backdrop-blur-xl border-r border-white/10 p-4 flex-col gap-4 h-full overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-4 h-full">
            <RewardsBox gameId={gameId!} myColor={myColor} gameMode={gameMode} className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300" />
            <PhaseTimeline className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300" />
            <GameStats liveMoves={liveMoves} className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300 flex-1" />
          </div>
        </div>

        {/* CENTER PANEL: Chess Board with Player Bars */}
        <div className="flex-1 flex flex-col justify-center px-1 py-1 sm:px-2 sm:py-2 lg:p-6 pb-24 lg:pb-6 overflow-visible relative">
          {/* Opponent Player Bar - Right next to board */}
          <div className="px-1 sm:px-2 lg:px-0 mb-1 sm:mb-2 lg:mb-2">
            <PlayerBar
              player={{
                name: players[myColor === 'white' ? 'black' : 'white'].name,
                rating: players[myColor === 'white' ? 'black' : 'white'].rating,
              }}
              timeRemaining={formatTime(displayTimes[myColor === 'white' ? 'black' : 'white'])}
              isActive={liveGameState?.current_turn !== myColor}
              color={myColor === 'white' ? 'black' : 'white'}
              position="top"
              className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg"
              capturedPieces={capturedPiecesData?.[myColor === 'white' ? 'black' : 'white'] || []}
              materialAdvantage={
                capturedPiecesData?.materialAdvantage.color === (myColor === 'white' ? 'black' : 'white')
                  ? capturedPiecesData.materialAdvantage.value
                  : 0
              }
            />
          </div>

          {/* Chess Board - HERO ELEMENT - Minimal padding */}
          <div className="flex justify-center items-center relative z-10 shrink-0">
            <LiveGameBoard
              liveGameState={liveGameState}
              chessGame={chessGame}
              myColor={myColor}
              liveMoves={liveMoves}
              onPieceDrop={handleDrop}
              large={true}
            />
          </div>

          {/* My Player Bar - Right next to board */}
          <div className="px-1 sm:px-2 lg:px-0 mt-1 sm:mt-2 lg:mt-2">
            <PlayerBar
              player={{
                name: players[myColor].name,
                rating: players[myColor].rating,
              }}
              timeRemaining={formatTime(displayTimes[myColor])}
              isActive={liveGameState?.current_turn === myColor}
              color={myColor}
              position="bottom"
              className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg"
              capturedPieces={capturedPiecesData?.[myColor] || []}
              materialAdvantage={
                capturedPiecesData?.materialAdvantage.color === myColor
                  ? capturedPiecesData.materialAdvantage.value
                  : 0
              }
            />
          </div>
        </div>

        {/* RIGHT PANEL: Move Log, Action Buttons - DESKTOP ONLY */}
        <div className="hidden lg:flex w-80 flex-shrink-0 bg-black/40 backdrop-blur-xl border-l border-white/10 p-4 flex-col gap-4 h-full overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-4 h-full">
            <MoveLog
              liveMoves={liveMoves}
              blindMoves={blindMoves}
              className="flex-1 bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg"
            />
            <ActionButtons
              onResign={() => setShowResignConfirm(true)}
              onOfferDraw={() => setShowDrawOfferConfirm(true)}
              onLeaveGame={handleLeaveTable}
              onRematch={() => {
                setGameResult(null);
                setShowGameEndModal(false);
              }}
              gameEnded={liveGameState?.game_ended || false}
              disabled={isProcessingMove}
              className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION - Compact tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-50">
        {/* Mobile Tab Navigation - Smaller */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveMobilePanel('game')}
            className={`flex-1 py-2 px-2 text-xs font-medium transition-colors ${
              activeMobilePanel === 'game'
                ? 'text-white bg-white/10 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🎮 Game
          </button>
          <button
            onClick={() => setActiveMobilePanel('stats')}
            className={`flex-1 py-2 px-2 text-xs font-medium transition-colors ${
              activeMobilePanel === 'stats'
                ? 'text-white bg-white/10 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Stats
          </button>
          <button
            onClick={() => setActiveMobilePanel('moves')}
            className={`flex-1 py-2 px-2 text-xs font-medium transition-colors ${
              activeMobilePanel === 'moves'
                ? 'text-white bg-white/10 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📜 Moves
          </button>
        </div>

        {/* Mobile Panel Content - Smaller max height */}
        <div className="max-h-[30vh] overflow-y-auto p-3">
          {activeMobilePanel === 'game' && (
            <div className="space-y-2">
              <ActionButtons
                onResign={() => setShowResignConfirm(true)}
                onOfferDraw={() => setShowDrawOfferConfirm(true)}
                onLeaveGame={handleLeaveTable}
                onRematch={() => {
                  setGameResult(null);
                  setShowGameEndModal(false);
                }}
                gameEnded={liveGameState?.game_ended || false}
                disabled={isProcessingMove}
                className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg"
              />
            </div>
          )}

          {activeMobilePanel === 'stats' && (
            <div className="space-y-3">
              <RewardsBox gameId={gameId!} myColor={myColor} gameMode={gameMode} className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg" />
              <PhaseTimeline className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg" />
              <GameStats liveMoves={liveMoves} className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg" />
            </div>
          )}

          {activeMobilePanel === 'moves' && (
            <MoveLog
              liveMoves={liveMoves}
              blindMoves={blindMoves}
              className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg max-h-[35vh]"
            />
          )}
        </div>
      </div>

      {/* Modern Confirmation Modals */}
      <ResignationModal
        isOpen={showResignConfirm}
        onConfirm={handleResign}
        onCancel={() => setShowResignConfirm(false)}
      />

      <ResignationModal
        isOpen={showLeaveConfirm}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        title="Leave Game?"
        message="Leaving this game will count as a resignation and you will lose. Are you sure you want to leave?"
        confirmText="Leave & Resign"
        cancelText="Stay in Game"
      />

      <DrawOfferModal
        isOpen={showDrawOfferConfirm}
        onConfirm={handleOfferDraw}
        onCancel={() => setShowDrawOfferConfirm(false)}
      />

      {/* Draw Offer Notification */}
      <DrawOfferNotification
        isVisible={
          drawOffer !== null &&
          !drawOffer.responded_at &&
          drawOffer.offering_player !== myColor
        }
        onAccept={handleAcceptDraw}
        onDecline={handleDeclineDraw}
        onDismiss={handleDeclineDraw}
        timeoutSeconds={30}
      />

      {/* Game End Modal */}
      <GameEndModal
        isOpen={showGameEndModal}
        gameResult={gameResult}
        gameId={gameId!}
        myColor={myColor!}
        onRematch={() => {
          setGameResult(null);
          setShowGameEndModal(false);
        }}
        onReturnToLobby={handleLeaveTable}
        onClose={() => setShowGameEndModal(false)}
      />
    </div>
  );
};

export default MultiplayerLivePhaseScreen;