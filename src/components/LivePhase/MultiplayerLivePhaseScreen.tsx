// Enhanced LivePhaseScreen with REAL MULTIPLAYER
import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import { useViolations } from '../shared/ViolationSystem';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  liveMovesService,
  type LiveGameState,
  type LiveMove,
  type DrawOffer,
  type GameResult,
} from '../../services/liveMovesService';
import { WarriorCard } from './WarriorCard';
import { WarMoveHistory } from './WarMoveHistory';
import { WarActions } from './WarActions';
import { WarModal } from './WarModal';
import { EnhancedWarEndModal } from './EnhancedWarEndModal';
import { supabase } from '../../lib/supabase';
import { blindMovesService } from '../../services/blindMovesService';

interface MultiplayerLivePhaseScreenProps {
  gameState: any; // Your existing game state manager
  gameId?: string;
}

const MultiplayerLivePhaseScreen: React.FC<MultiplayerLivePhaseScreenProps> = ({
  gameState,
  gameId,
}) => {
  const { showViolations, createViolation, clearViolations } = useViolations();
  const { playerData: currentUser } = useCurrentUser();

  // ═══════════════════════════════════════════════════════════════
  // 🎮 MULTIPLAYER STATE
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
  const [isProcessingMove, setIsProcessingMove] = useState(false);

  // UI State
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showDrawOfferConfirm, setShowDrawOfferConfirm] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [gameEndStatus, setGameEndStatus] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 INITIALIZE MULTIPLAYER GAME
  // ═══════════════════════════════════════════════════════════════

  // Replace the initialization useEffect in MultiplayerLivePhaseScreen.tsx with this:

  useEffect(() => {
    const initializeMultiplayerGame = async () => {
      if (!gameId || !currentUser) return;

      console.log('🎯 Initializing multiplayer live game...');

      try {
        // Get existing game state first
        let gameStateData = await liveMovesService.getGameState(gameId);

        if (!gameStateData) {
          console.log('🔧 Live game not initialized yet, creating...');

          // Get blind game state to get player IDs
          const blindGameState = await blindMovesService.getBlindGameState(
            gameId
          );
          if (!blindGameState) {
            console.error('❌ No blind game state found');
            return;
          }

          // Get final FEN from reveal phase
          const finalFen =
            gameState.gameState.reveal.finalFen ||
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

          console.log('🎲 Initializing live game with:', {
            gameId,
            whitePlayer: blindGameState.whitePlayerId,
            blackPlayer: blindGameState.blackPlayerId,
            finalFen,
          });

          // Initialize live game
          gameStateData = await liveMovesService.initializeLiveGame(
            gameId,
            blindGameState.whitePlayerId,
            blindGameState.blackPlayerId,
            finalFen
          );

          if (!gameStateData) {
            console.error('❌ Failed to initialize live game');
            return;
          }

          console.log('✅ Live game created successfully');
        }

        console.log('🎮 Game state data:', gameStateData);
        setLiveGameState(gameStateData);

        // Determine my color
        const playerColor =
          gameStateData.white_player_id === currentUser.id ? 'white' : 'black';
        setMyColor(playerColor);

        console.log('🎨 My color:', playerColor, 'My ID:', currentUser.id);
        console.log(
          '👥 White player:',
          gameStateData.white_player_id,
          'Black player:',
          gameStateData.black_player_id
        );

        // Get real opponent data from room players
        try {
          const { data: roomPlayers, error: playersError } = await supabase
            .from('game_room_players')
            .select('player_id, player_username, player_rating')
            .eq('room_id', gameId);

          if (!playersError && roomPlayers) {
            console.log('👥 Room players:', roomPlayers);
            const opponent = roomPlayers.find(
              (p) => p.player_id !== currentUser.id
            );
            if (opponent) {
              const opponentColor = playerColor === 'white' ? 'black' : 'white';
              setOpponentData({
                name: `${opponent.player_username} (${
                  opponentColor === 'white' ? 'White' : 'Black'
                })`,
                rating: opponent.player_rating || 1500,
                isHost: false,
              });
              console.log(
                '✅ Real opponent data loaded:',
                opponent.player_username
              );
            } else {
              console.error('❌ Opponent not found in room players');
            }
          } else {
            console.error('❌ Error fetching room players:', playersError);
          }
        } catch (error) {
          console.error('❌ Failed to fetch opponent data:', error);
        }

        // Load existing moves
        const moves = await liveMovesService.getMoves(gameId);
        setLiveMoves(moves);
        console.log('📝 Loaded moves:', moves.length);

        // Initialize chess game
        const chess = new Chess(gameStateData.current_fen);
        setChessGame(chess);
        console.log(
          '♟️ Chess game initialized with FEN:',
          gameStateData.current_fen
        );

        // Get draw offer
        const activeDrawOffer = await liveMovesService.getActiveDrawOffer(
          gameId
        );
        setDrawOffer(activeDrawOffer);

        setLoading(false);
        console.log('✅ Multiplayer live game initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize multiplayer game:', error);
        setLoading(false);
      }
    };

    initializeMultiplayerGame();
  }, [gameId, currentUser, gameState.gameState.reveal.finalFen]); // Added finalFen dependency

  // ═══════════════════════════════════════════════════════════════
  // 📡 REAL-TIME SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!gameId || !myColor) return;

    console.log('📡 Setting up real-time subscriptions...');

    const unsubscribe = liveMovesService.subscribeToGameUpdates(gameId, {
      onGameStateUpdate: (newGameState) => {
        console.log('🔄 Game state updated:', newGameState);
        setLiveGameState(newGameState);

        // Update chess game
        const chess = new Chess(newGameState.current_fen);
        setChessGame(chess);

        // Check for game end
        if (newGameState.game_ended && newGameState.game_result) {
          handleGameEnd(newGameState.game_result);
        }
      },

      onNewMove: (move) => {
        console.log('🔄 New move received:', move.move_san);
        setLiveMoves((prev) => {
          const exists = prev.some((m) => m.id === move.id);
          if (exists) return prev;
          return [...prev, move].sort((a, b) => a.move_number - b.move_number);
        });

        // Update chess game
        const chess = new Chess(move.move_fen);
        setChessGame(chess);
        clearViolations();
      },

      onDrawOfferUpdate: (offer) => {
        console.log('🔄 Draw offer updated:', offer);
        setDrawOffer(offer);
      },
    });

    return unsubscribe;
  }, [gameId, myColor]);
  // Timer logic for counting down
  useEffect(() => {
    if (!liveGameState || liveGameState.game_ended) return;

    const interval = setInterval(() => {
      setLiveGameState((prev) => {
        if (!prev || prev.game_ended) return prev;

        const newState = { ...prev };

        if (prev.current_turn === 'white') {
          newState.white_time_ms = Math.max(0, prev.white_time_ms - 100);
          if (newState.white_time_ms <= 0) {
            // Handle timeout
            console.log('⏰ White player timeout!');
            liveMovesService.handleTimeout(gameId!, 'white');
          }
        } else {
          newState.black_time_ms = Math.max(0, prev.black_time_ms - 100);
          if (newState.black_time_ms <= 0) {
            // Handle timeout
            console.log('⏰ Black player timeout!');
            liveMovesService.handleTimeout(gameId!, 'black');
          }
        }

        return newState;
      });
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [liveGameState?.game_ended, liveGameState?.current_turn, gameId]);

  // ═══════════════════════════════════════════════════════════════
  // 🎮 GAME HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleDrop = (from: string, to: string, piece: string): boolean => {
    // ✅ ANTI-SPAM: Prevent rapid-fire moves
    if (isProcessingMove) {
      console.log('🚫 Move in progress, ignoring rapid click');
      return false;
    }

    if (!liveGameState || !chessGame || !myColor) return false;

    if (liveGameState.game_ended) {
      showViolations([createViolation.gameEnded()]);
      return false;
    }

    if (liveGameState.current_turn !== myColor) {
      showViolations([createViolation.wrongTurn(myColor)]);
      return false;
    }

    // Check if it's the right piece color
    if (
      (myColor === 'white' && piece[0] !== 'w') ||
      (myColor === 'black' && piece[0] !== 'b')
    ) {
      showViolations([createViolation.wrongTurn(myColor)]);
      return false;
    }

    // Test the move locally first
    const testChess = new Chess(chessGame.fen());
    const testMove = testChess.move({ from, to, promotion: 'q' });

    if (!testMove) {
      showViolations([createViolation.invalidMove()]);
      return false;
    }

    console.log(`🎯 Making optimistic move: ${from} to ${to}`);

    // ✅ SET PROCESSING FLAG
    setIsProcessingMove(true);

    // ✅ OPTIMISTIC UI: Update state immediately for instant feedback
    setLiveGameState((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        current_fen: testChess.fen(),
        current_turn: prev.current_turn === 'white' ? 'black' : 'white',
        move_count: prev.move_count + 1,
      };
    });

    // ✅ Update chess game immediately
    setChessGame(new Chess(testChess.fen()));

    // ✅ Add optimistic move to moves list
    const optimisticMove: LiveMove = {
      id: `optimistic-${Date.now()}`,
      created_at: new Date().toISOString(),
      game_id: gameId!,
      move_number: liveGameState.move_count + 1,
      player_color: myColor,
      player_id: currentUser!.id,
      move_from: from,
      move_to: to,
      move_san: testMove.san,
      move_fen: testChess.fen(),
      is_check: testChess.inCheck(),
      is_checkmate: testChess.isCheckmate(),
      is_draw: testChess.isDraw(),
      time_taken_ms: 2000,
      time_remaining_ms:
        myColor === 'white'
          ? liveGameState.white_time_ms
          : liveGameState.black_time_ms,
    };

    setLiveMoves((prev) => [...prev, optimisticMove]);

    // ✅ Send to server asynchronously (fire and forget)
    liveMovesService
      .makeMove(gameId!, from, to, 'q')
      .then((result) => {
        if (result.success) {
          console.log('✅ Server confirmed move:', result.move?.move_san);

          // Replace optimistic move with real move
          if (result.move) {
            setLiveMoves((prev) =>
              prev.map((move) =>
                move.id === optimisticMove.id ? result.move! : move
              )
            );
          }

          clearViolations();
        } else {
          console.error('❌ Server rejected move, reverting:', result.error);

          // ❌ REVERT: Server rejected the move
          setLiveGameState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              current_fen: chessGame.fen(), // Revert to original FEN
              current_turn: myColor, // Revert turn
              move_count: prev.move_count - 1, // Revert move count
            };
          });

          // Revert chess game
          setChessGame(new Chess(chessGame.fen()));

          // Remove optimistic move
          setLiveMoves((prev) =>
            prev.filter((move) => move.id !== optimisticMove.id)
          );

          showViolations([createViolation.invalidMove(result.error)]);
        }
      })
      .catch((error) => {
        console.error('❌ Network error, reverting move:', error);

        // Same revert logic for network errors
        setLiveGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            current_fen: chessGame.fen(),
            current_turn: myColor,
            move_count: prev.move_count - 1,
          };
        });

        setChessGame(new Chess(chessGame.fen()));
        setLiveMoves((prev) =>
          prev.filter((move) => move.id !== optimisticMove.id)
        );

        showViolations([createViolation.invalidMove('Network error')]);
      })
      .finally(() => {
        // ✅ RESET PROCESSING FLAG after server response
        setTimeout(() => {
          setIsProcessingMove(false);
        }, 200); // 200ms cooldown for live phase (slightly longer than blind phase)
      });

    // ✅ Return true immediately - the board will update instantly
    clearViolations();
    return true;
  };

  const handleResign = async () => {
    if (!gameId) return;

    console.log('🏳️ Resigning game...');
    const success = await liveMovesService.resignGame(gameId);

    if (success) {
      console.log('✅ Resignation successful');
    }

    setShowResignConfirm(false);
  };

  const handleOfferDraw = async () => {
    if (!gameId) return;

    console.log('🤝 Offering draw...');
    const success = await liveMovesService.offerDraw(gameId);

    if (success) {
      console.log('✅ Draw offer sent');
    }

    setShowDrawOfferConfirm(false);
  };

  const handleAcceptDraw = async () => {
    if (!gameId) return;

    console.log('✅ Accepting draw...');
    const success = await liveMovesService.respondToDrawOffer(gameId, true);

    if (success) {
      console.log('✅ Draw accepted');
    }
  };

  const handleDeclineDraw = async () => {
    if (!gameId) return;

    console.log('❌ Declining draw...');
    await liveMovesService.respondToDrawOffer(gameId, false);
  };

  const handleGameEnd = (result: GameResult) => {
    console.log('🏁 Game ended:', result);
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
    }, 2000);
  };

  const handleRematch = () => {
    // TODO: Implement rematch logic
    console.log('🔄 Rematch requested');
    setGameResult(null);
    setShowGameEndModal(false);
  };

  const handleLeaveTable = () => {
    if (
      window.confirm(
        '⚠️ SURRENDER WARNING ⚠️\n\nLeaving will count as RESIGNATION!\n\nAre you sure?'
      )
    ) {
      window.location.href = '/games';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎨 COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════

  const myPlayerData = useMemo(() => {
    if (!currentUser || !myColor)
      return { name: 'Loading...', rating: 1500, isHost: false };

    return {
      name: `${currentUser.username} (${
        myColor === 'white' ? 'White' : 'Black'
      })`,
      rating: currentUser.rating || 1500,
      isHost: true, // You can determine this from room data
    };
  }, [currentUser, myColor]);

  const players = useMemo(
    () => ({
      white:
        myColor === 'white'
          ? myPlayerData
          : opponentData || { name: 'Loading...', rating: 1500, isHost: false },
      black:
        myColor === 'black'
          ? myPlayerData
          : opponentData || { name: 'Loading...', rating: 1500, isHost: false },
    }),
    [myColor, myPlayerData, opponentData]
  );

  const isMyTurn = useMemo(() => {
    return liveGameState?.current_turn === myColor;
  }, [liveGameState?.current_turn, myColor]);

  const currentDrawOffer = useMemo(() => {
    if (!drawOffer || !drawOffer.is_active) return null;
    return drawOffer.offering_player;
  }, [drawOffer]);

  // Add this debug useEffect after your other useEffects
  useEffect(() => {
    console.log('🐛 DEBUG STATE:', {
      loading,
      liveGameState,
      myColor,
      chessGame: chessGame?.fen(),
      currentUser: currentUser?.username,
      isMyTurn,
      gameEnded: liveGameState?.game_ended,
      currentTurn: liveGameState?.current_turn,
    });
  }, [loading, liveGameState, myColor, chessGame, currentUser, isMyTurn]);

  // ═══════════════════════════════════════════════════════════════
  // 🎬 RENDER
  // ═══════════════════════════════════════════════════════════════

  if (loading || !liveGameState || !chessGame || !myColor) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚔️</div>
          <div className="text-2xl font-bold mb-2">
            Preparing Live Battle...
          </div>
          <div className="text-gray-400">Initializing multiplayer chess</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden relative">
      {/* WAR BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/[0.07] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/[0.05] rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-yellow-500/[0.04] rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* 🎯 COMPACT GAME END STATUS OVERLAY */}
      {gameEndStatus && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-xl blur-lg animate-pulse" />
            <div className="relative bg-gray-900/95 border border-red-500/50 rounded-xl px-6 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {gameResult?.type === 'checkmate'
                    ? '👑'
                    : gameResult?.type === 'timeout'
                    ? '⏰'
                    : gameResult?.type === 'resignation'
                    ? '🏳️'
                    : '⚖️'}
                </div>
                <h1 className="text-xl font-bold text-white">
                  {gameEndStatus}
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left: Warriors */}
      <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col justify-between relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex justify-end">
            <WarriorCard
              player="black"
              playerData={players.black}
              timeMs={liveGameState.black_time_ms}
              active={
                liveGameState.current_turn === 'black' &&
                !liveGameState.game_ended
              }
            />
          </div>
          <div className="flex justify-end">
            <WarriorCard
              player="white"
              playerData={players.white}
              timeMs={liveGameState.white_time_ms}
              active={
                liveGameState.current_turn === 'white' &&
                !liveGameState.game_ended
              }
            />
          </div>
        </div>
      </div>

      {/* Center: BATTLEFIELD */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl blur-xl animate-pulse" />
          <div className="relative z-10">
            <UnifiedChessBoard
              fen={liveGameState.current_fen}
              game={chessGame}
              onPieceDrop={handleDrop}
              isFlipped={myColor === 'black'} // Black player sees flipped board
              boardWidth={Math.min(
                700,
                window.innerWidth * 0.5,
                window.innerHeight * 0.85
              )}
              gameEnded={liveGameState.game_ended}
              currentTurn={liveGameState.current_turn === 'white' ? 'w' : 'b'}
              lastMove={
                liveMoves.length > 0
                  ? {
                      from: liveMoves[liveMoves.length - 1].move_from,
                      to: liveMoves[liveMoves.length - 1].move_to,
                    }
                  : null
              }
              phase="live"
            />
          </div>
        </div>
      </div>

      {/* Right: War Move History + Actions */}
      <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1 mb-6">
            <WarMoveHistory
              liveMoves={liveMoves.map((move) => move.move_san)}
              blindMoves={gameState.gameState.reveal.moveLog || []}
            />
          </div>
          <div className="flex-shrink-0">
            <WarActions
              gameEnded={liveGameState.game_ended}
              drawOffered={currentDrawOffer}
              currentTurn={liveGameState.current_turn === 'white' ? 'w' : 'b'}
              onResign={() => setShowResignConfirm(true)}
              onOfferDraw={() => setShowDrawOfferConfirm(true)}
              onAcceptDraw={handleAcceptDraw}
              onDeclineDraw={handleDeclineDraw}
              onRematch={handleRematch}
              onLeave={handleLeaveTable}
            />
          </div>
        </div>
      </div>

      {/* WAR MODALS */}
      <WarModal
        isOpen={showResignConfirm}
        title="SURRENDER BATTLE?"
        message="Are you sure you want to surrender this epic war? Your opponent will claim total victory!"
        confirmText="Surrender"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleResign}
        onCancel={() => setShowResignConfirm(false)}
        icon="🏳️"
      />

      <WarModal
        isOpen={showDrawOfferConfirm}
        title="OFFER PEACE TREATY?"
        message="Do you want to offer your opponent an honorable ceasefire? The war will end if they accept."
        confirmText="Offer Peace"
        confirmColor="bg-blue-600 hover:bg-blue-700"
        onConfirm={handleOfferDraw}
        onCancel={() => setShowDrawOfferConfirm(false)}
        icon="🤝"
      />

      {/* ENHANCED GAME END MODAL */}
      <EnhancedWarEndModal
        isOpen={showGameEndModal}
        gameResult={gameResult}
        onRematch={handleRematch}
        onLeave={() => setShowGameEndModal(false)}
      />
    </div>
  );
};

export default MultiplayerLivePhaseScreen;
