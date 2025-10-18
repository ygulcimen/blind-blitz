import { useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { blindMovesService } from '../../services/blindMovesService';
import {
  liveMovesService,
  type LiveGameState,
  type LiveMove,
  type DrawOffer,
} from '../../services/liveMovesService';
import { Chess } from 'chess.js';

interface GameInitializerProps {
  gameId: string | undefined;
  currentUser: any;
  finalFen?: string;
  onGameStateLoaded: (data: {
    liveGameState: LiveGameState;
    liveMoves: LiveMove[];
    drawOffer: DrawOffer | null;
    chessGame: Chess;
    myColor: 'white' | 'black';
    opponentData: any;
  }) => void;
  onLoadingChange: (loading: boolean) => void;
}

export const GameInitializer: React.FC<GameInitializerProps> = ({
  gameId,
  currentUser,
  finalFen,
  onGameStateLoaded,
  onLoadingChange,
}) => {
  const initializationAttempted = useRef(false);

  // Reset init flag if props change
  useEffect(() => {
    initializationAttempted.current = false;
  }, [gameId, currentUser?.id]);

  useEffect(() => {
    const initializeMultiplayerGame = async () => {
      if (!gameId || !currentUser) {
        if (gameId && !currentUser) return; // wait for user
        if (!gameId && !initializationAttempted.current) {
          onLoadingChange(false);
          initializationAttempted.current = true;
        }
        return;
      }

      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      onLoadingChange(true);

      try {
        // 1. Try to load existing live game state
        let gameStateData = await liveMovesService.getGameState(gameId);

        // 2. If no state exists, create new one
        if (!gameStateData) {
          const blindGameState = await blindMovesService.getBlindGameState(
            gameId
          );
          if (!blindGameState) throw new Error('No blind game state');

          // ✅ Use simulation finalFen directly, fallback to startpos
          const liveStartingFen =
            typeof finalFen === 'string'
              ? finalFen
              : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

          gameStateData = await liveMovesService.initializeLiveGame(
            gameId,
            blindGameState.whitePlayerId,
            blindGameState.blackPlayerId,
            liveStartingFen
          );

          if (!gameStateData) throw new Error('Failed to initialize live game');
        }

        // 3. Determine my color
        const playerColor =
          gameStateData.white_player_id === currentUser.id ? 'white' : 'black';

        // 4. Load opponent data and check if opponent is a bot
        let opponentData = null;
        let isBotOpponent = false;
        try {
          const { data: roomPlayers } = await supabase
            .from('game_room_players')
            .select('player_id, player_username, player_rating')
            .eq('room_id', gameId);

          if (roomPlayers) {
            const opponent = roomPlayers.find(
              (p) => p.player_id !== currentUser.id
            );
            if (opponent) {
              // Check if opponent is a bot
              const { data: playerData } = await supabase
                .from('players')
                .select('is_bot')
                .eq('id', opponent.player_id)
                .single();

              isBotOpponent = playerData?.is_bot === true;

              const opponentColor = playerColor === 'white' ? 'black' : 'white';
              opponentData = {
                name: `${opponent.player_username} (${
                  opponentColor === 'white' ? 'White' : 'Black'
                })`,
                rating: opponent.player_rating || 1500,
                isHost: false,
                isBot: isBotOpponent,
                botId: isBotOpponent ? opponent.player_id : null,
              };
            }
          }
        } catch {
          // ignore opponent fetch errors
        }

        // 5. Start the game clock (if not already started)
        await liveMovesService.startGameClock(gameId);

        // 6. CRITICAL: Reload game state after starting clock to get updated last_move_time
        const freshGameState = await liveMovesService.getGameState(gameId);
        if (freshGameState) {
          gameStateData = freshGameState;
        }

        // 7. Load moves, draw offers, and set up chess
        const moves = await liveMovesService.getMoves(gameId);
        const chess = new Chess(gameStateData.current_fen);
        const activeDrawOffer = await liveMovesService.getActiveDrawOffer(
          gameId
        );

        // ✅ Deliver everything to parent
        onGameStateLoaded({
          liveGameState: gameStateData,
          liveMoves: moves,
          drawOffer: activeDrawOffer,
          chessGame: chess,
          myColor: playerColor,
          opponentData,
        });
      } catch (error) {
        console.error('❌ GameInitializer failed:', error);
      } finally {
        onLoadingChange(false);
      }
    };

    initializeMultiplayerGame();
  }, [gameId, currentUser, finalFen]);

  return null;
};
