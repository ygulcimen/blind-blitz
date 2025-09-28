import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { supabase } from '../lib/supabase';
import { blindMovesService } from '../services/blindMovesService';
import {
  liveMovesService,
  type LiveGameState,
  type LiveMove,
  type DrawOffer,
} from '../services/liveMovesService';

interface GameData {
  liveGameState: LiveGameState | null;
  liveMoves: LiveMove[];
  drawOffer: DrawOffer | null;
  chessGame: Chess | null;
  myColor: 'white' | 'black' | null;
  opponentData: any;
  loading: boolean;
}

interface UseLiveGameStateParams {
  gameId: string | undefined;
  currentUser: any;
  finalFen?: string;
}

export const useLiveGameState = ({
  gameId,
  currentUser,
  finalFen,
}: UseLiveGameStateParams): GameData => {
  const [liveGameState, setLiveGameState] = useState<LiveGameState | null>(
    null
  );
  const [liveMoves, setLiveMoves] = useState<LiveMove[]>([]);
  const [drawOffer, setDrawOffer] = useState<DrawOffer | null>(null);
  const [chessGame, setChessGame] = useState<Chess | null>(null);
  const [myColor, setMyColor] = useState<'white' | 'black' | null>(null);
  const [opponentData, setOpponentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const initializeGame = async () => {
    if (!gameId || !currentUser) return;

    console.log('🎯 Initializing multiplayer live game...');

    try {
      // Get existing game state first
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
          console.log('✅ Corrected LIVE start: forced White to move.');
        } catch (e) {
          console.error('❌ Failed to correct LIVE start turn:', e);
        }
      }

      // Create game if not exists
      if (!gameStateData) {
        console.log('🔧 Live game not initialized yet, creating...');

        const blindGameState = await blindMovesService.getBlindGameState(
          gameId
        );
        if (!blindGameState) {
          console.error('❌ No blind game state found');
          return;
        }

        // Prepare starting FEN
        const rawFen =
          finalFen ||
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        const parts = rawFen.split(' ');
        if (parts.length >= 2) parts[1] = 'w';
        const liveStartingFen = parts.join(' ');

        // Initialize live game
        gameStateData = await liveMovesService.initializeLiveGame(
          gameId,
          blindGameState.whitePlayerId,
          blindGameState.blackPlayerId,
          liveStartingFen
        );

        if (!gameStateData) {
          console.error('❌ Failed to initialize live game');
          return;
        }

        console.log('✅ Live game created successfully');
      }

      console.log('🎮 Game state data:', gameStateData);
      setLiveGameState(gameStateData);
      console.log('🔥 liveGameState set', gameStateData);

      // Determine player color
      const playerColor =
        gameStateData.white_player_id === currentUser.id ? 'white' : 'black';
      setMyColor(playerColor);
      console.log('🔥 myColor set', playerColor);

      console.log('🎨 My color:', playerColor, 'My ID:', currentUser.id);

      // Load opponent data
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
          }
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
      console.log('🔥 chessGame set', chess.fen());

      // Get draw offer
      const activeDrawOffer = await liveMovesService.getActiveDrawOffer(gameId);
      setDrawOffer(activeDrawOffer);

      setLoading(false);
      console.log('✅ Multiplayer live game initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize multiplayer game:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeGame();
  }, [gameId, currentUser, finalFen]);

  return {
    liveGameState,
    liveMoves,
    drawOffer,
    chessGame,
    myColor,
    opponentData,
    loading,
  };
};
