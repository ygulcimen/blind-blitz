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

  // Reset initialization flag when key props change
  useEffect(() => {
    initializationAttempted.current = false;
  }, [gameId, currentUser?.id]);

  useEffect(() => {
    const initializeMultiplayerGame = async () => {
      if (!gameId || !currentUser) {
        if (gameId && !currentUser) {
          return; // wait for user to load
        }
        if (!gameId) {
          if (!initializationAttempted.current) {
            onLoadingChange(false);
            initializationAttempted.current = true;
          }
        }
        return;
      }

      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      onLoadingChange(true);

      try {
        // Get existing live game state
        let gameStateData = await liveMovesService.getGameState(gameId);

        // Fix initial turn if needed
        if (
          gameStateData &&
          gameStateData.move_count === 0 &&
          gameStateData.current_turn !== 'white'
        ) {
          const fixedFen = gameStateData.current_fen.replace(/\s[wb]\s/, ' w ');
          try {
            await supabase
              .from('game_live_state')
              .update({
                current_turn: 'white',
                current_fen: fixedFen,
                updated_at: new Date().toISOString(),
              })
              .eq('game_id', gameId);

            gameStateData = {
              ...gameStateData,
              current_turn: 'white',
              current_fen: fixedFen,
            };
          } catch (e) {
          }
        }

        // Create if not exists
        if (!gameStateData) {

          const blindGameState = await blindMovesService.getBlindGameState(
            gameId
          );
          if (!blindGameState) {
            throw new Error('No blind game state');
          }

          // Prepare starting FEN
          const rawFen =
            finalFen ||
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
          const parts = rawFen.split(' ');
          if (parts.length >= 2) parts[1] = 'w';
          const liveStartingFen = parts.join(' ');

          // Initialize live game (use upsert in liveMovesService to avoid 409s)
          gameStateData = await liveMovesService.initializeLiveGame(
            gameId,
            blindGameState.whitePlayerId,
            blindGameState.blackPlayerId,
            liveStartingFen
          );

          if (!gameStateData) {
            throw new Error('Failed to initialize live game');
          }

        }

        // Determine my color
        const playerColor =
          gameStateData.white_player_id === currentUser.id ? 'white' : 'black';

        // Load opponent data
        let opponentData = null;
        try {
          const { data: roomPlayers, error: playersError } = await supabase
            .from('game_room_players')
            .select('player_id, player_username, player_rating')
            .eq('room_id', gameId);

          if (!playersError && roomPlayers) {
            const opponent = roomPlayers.find(
              (p) => p.player_id !== currentUser.id
            );
            if (opponent) {
              const opponentColor = playerColor === 'white' ? 'black' : 'white';
              opponentData = {
                name: `${opponent.player_username} (${
                  opponentColor === 'white' ? 'White' : 'Black'
                })`,
                rating: opponent.player_rating || 1500,
                isHost: false,
              };
            }
          }
        } catch (error) {
        }

        // Load moves + draw offers
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
      } finally {
        // ✅ Always unset loading
        onLoadingChange(false);
      }
    };

    initializeMultiplayerGame();
  }, [gameId, currentUser, finalFen]);

  return null; // logic-only component
};
