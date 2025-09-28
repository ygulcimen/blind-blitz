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
import type { GameResult } from '../../types/GameTypes';

// Custom hooks
import { useGameTimer } from '../../hooks/useGameTimer';
import { useViolations } from '../shared/ViolationSystem';

// Focused components
import { GameInitializer } from './GameInitializer';
import { GameSubscriptions } from './GameSubscriptions';
import { useMoveHandler } from './MoveHandler';

// UI Components
import { LiveGameBoard } from './GameBoard/LiveGameBoard';
import { GameStatusOverlay } from './GameStatus/GameStatusOverlay';
import { PlayerBar } from './PlayerBar/PlayerBar';
import { RewardsBox } from './LeftPanel/RewardsBox';
import { PhaseTimeline } from './LeftPanel/PhaseTimeline';
import { GameStats } from './LeftPanel/GameStats';
import { MoveLog } from './RightPanel/MoveLog';
import { ActionButtons } from './RightPanel/ActionButtons';

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
}

const MultiplayerLivePhaseScreen: React.FC<MultiplayerLivePhaseScreenProps> = ({
  gameState,
  gameId,
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

  // UI State
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showDrawOfferConfirm, setShowDrawOfferConfirm] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [gameEndStatus, setGameEndStatus] = useState<string | null>(null);
  const [isProcessingMove, setIsProcessingMove] = useState(false);

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

  const { displayTimes } = useGameTimer(liveGameState, handleTimeout);

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
    setGameResult(result);

    // Show status first, then modal
    let statusText = '';
    switch (result.type) {
      case 'checkmate':
        statusText = `👑 ${result.winner.toUpperCase()} WINS BY CHECKMATE!`;
        break;
      case 'timeout':
        statusText = `⏰ ${result.winner.toUpperCase()} WINS BY TIME!`;
        break;
      case 'resignation':
        statusText = `🏳️ ${result.winner.toUpperCase()} WINS BY RESIGNATION!`;
        break;
      case 'draw':
        statusText = '⚖️ DRAW!';
        break;
    }

    setGameEndStatus(statusText);

    setTimeout(() => {
      setShowGameEndModal(true);
      setGameEndStatus(null);
    }, 1000);
  }, []);

  // Game end detection
  useEffect(() => {
    if (
      liveGameState?.game_ended &&
      liveGameState?.game_result &&
      !gameResult
    ) {
      handleGameEnd(liveGameState.game_result);
    }
  }, [
    liveGameState?.game_ended,
    liveGameState?.game_result,
    gameResult,
    handleGameEnd,
  ]);

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
    if (!gameId) return;
    const success = await liveMovesService.respondToDrawOffer(gameId, true);
    if (success) {
      // Handle success
    }
  }, [gameId]);

  const handleDeclineDraw = useCallback(async () => {
    if (!gameId) return;
    await liveMovesService.respondToDrawOffer(gameId, false);
  }, [gameId]);


  const handleLeaveTable = useCallback(() => {
    navigate('/games');
  }, [navigate]);

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

  // ═══════════════════════════════════════════════════════════════
  // 🎬 RENDER
  // ═══════════════════════════════════════════════════════════════

  const finalFen = useMemo(
    () => memoizedGameStateData?.reveal?.finalFen,
    [memoizedGameStateData?.reveal?.finalFen]
  );

  if (loading || !liveGameState || !chessGame || !myColor) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        {/* Always render GameInitializer even during loading */}
        <GameInitializer
          gameId={gameId}
          currentUser={currentUser}
          finalFen={finalFen}
          onGameStateLoaded={handleGameStateLoaded}
          onLoadingChange={setLoading}
        />

        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚔️</div>
          <div className="text-2xl font-bold mb-2">
            Preparing Live Battle...
          </div>
          <div className="text-gray-400">
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

      {/* Game Status Overlay */}
      <GameStatusOverlay
        gameEndStatus={gameEndStatus}
        gameResult={gameResult}
      />

      {/* THREE-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* LEFT PANEL: Rewards, Timeline, Stats */}
        <div className="w-full lg:w-80 bg-black/40 backdrop-blur-xl border-r lg:border-r border-b lg:border-b-0 border-white/10 p-4 flex flex-col gap-4 lg:h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-4 h-full">
            <RewardsBox gameId={gameId!} myColor={myColor} className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300" />
            <PhaseTimeline className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300" />
            <GameStats liveMoves={liveMoves} className="bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg hover:shadow-xl transition-all duration-300 flex-1" />
          </div>
        </div>

        {/* CENTER PANEL: Chess Board with Player Bars */}
        <div className="flex-1 flex flex-col justify-center p-6 overflow-visible relative">
          {/* Opponent Player Bar */}
          <PlayerBar
            player={{
              name: players[myColor === 'white' ? 'black' : 'white'].name,
              rating: players[myColor === 'white' ? 'black' : 'white'].rating,
            }}
            timeRemaining={formatTime(displayTimes[myColor === 'white' ? 'black' : 'white'])}
            isActive={liveGameState?.current_turn !== myColor}
            color={myColor === 'white' ? 'black' : 'white'}
            position="top"
            className="mb-4 bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg"
          />

          {/* Chess Board - HERO ELEMENT */}
          <div className="flex justify-center relative z-[999]">
            <div className="bg-white/8 border border-white/15 rounded-lg p-4 shadow-xl relative z-[999]">
              <LiveGameBoard
                liveGameState={liveGameState}
                chessGame={chessGame}
                myColor={myColor}
                liveMoves={liveMoves}
                onPieceDrop={handleDrop}
                large={true}
              />
            </div>
          </div>

          {/* My Player Bar */}
          <PlayerBar
            player={{
              name: players[myColor].name,
              rating: players[myColor].rating,
            }}
            timeRemaining={formatTime(displayTimes[myColor])}
            isActive={liveGameState?.current_turn === myColor}
            color={myColor}
            position="bottom"
            className="mt-4 bg-white/8 backdrop-blur-xl border border-white/15 shadow-lg"
          />
        </div>

        {/* RIGHT PANEL: Move Log, Action Buttons */}
        <div className="w-full lg:w-80 bg-black/40 backdrop-blur-xl border-l lg:border-l border-t lg:border-t-0 border-white/10 p-4 flex flex-col gap-4 lg:h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-4 h-full">
            <MoveLog
              liveMoves={liveMoves}
              blindMoves={memoizedGameStateData.reveal?.moveLog || ([] as MoveLogItem[])}
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

      {/* Confirmation Modals */}
      {showResignConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Resign Game?</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to resign? This will end the game immediately.</p>
            <div className="flex gap-3">
              <button
                onClick={handleResign}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Resign
              </button>
              <button
                onClick={() => setShowResignConfirm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDrawOfferConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Offer Draw?</h3>
            <p className="text-gray-300 mb-6">Do you want to offer a draw to your opponent?</p>
            <div className="flex gap-3">
              <button
                onClick={handleOfferDraw}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              >
                Offer Draw
              </button>
              <button
                onClick={() => setShowDrawOfferConfirm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draw Offer Response */}
      {drawOffer && !drawOffer.responded_at && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Draw Offer</h3>
            <p className="text-gray-300 mb-6">Your opponent has offered a draw. Do you accept?</p>
            <div className="flex gap-3">
              <button
                onClick={handleAcceptDraw}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Accept
              </button>
              <button
                onClick={handleDeclineDraw}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game End Modal */}
      {showGameEndModal && gameResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Game Over</h3>
            <p className="text-gray-300 mb-6">
              {gameResult.type === 'checkmate' && `${gameResult.winner} wins by checkmate!`}
              {gameResult.type === 'timeout' && `${gameResult.winner} wins by time!`}
              {gameResult.type === 'resignation' && `${gameResult.winner} wins by resignation!`}
              {gameResult.type === 'draw' && 'Game is a draw!'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLeaveTable}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Return to Lobby
              </button>
              <button
                onClick={() => setShowGameEndModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerLivePhaseScreen;