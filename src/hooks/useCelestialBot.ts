// src/hooks/useCelestialBot.ts
// Hook to detect if current game involves a Celestial bot and get its config

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { celestialBotMatchmaking } from '../services/celestialBotMatchmaking';
import { guestAuthService } from '../services/guestAuthService';
import type { CelestialBot } from '../services/celestialBotMatchmaking';

export interface BotGameInfo {
  isBotGame: boolean;
  bot: CelestialBot | null;
  botColor: 'white' | 'black' | null;
  playerColor: 'white' | 'black' | null;
  loading: boolean;
}

/**
 * Hook to detect and fetch Celestial bot information for a game
 * Usage: const { isBotGame, bot, botColor, playerColor } = useCelestialBot(gameId);
 */
export function useCelestialBot(gameId?: string): BotGameInfo {
  const [botInfo, setBotInfo] = useState<BotGameInfo>({
    isBotGame: false,
    bot: null,
    botColor: null,
    playerColor: null,
    loading: true,
  });

  useEffect(() => {
    console.log('🎯 useCelestialBot useEffect running for gameId:', gameId);

    if (!gameId) {
      console.log('❌ No gameId provided');
      setBotInfo({
        isBotGame: false,
        bot: null,
        botColor: null,
        playerColor: null,
        loading: false,
      });
      return;
    }

    const detectBotGame = async () => {
      console.log('🔍 Starting bot detection for game:', gameId);
      try {
        // Get current user (authenticated or guest)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let playerId: string | null = null;

        if (user) {
          playerId = user.id;
        } else {
          const guestPlayer = guestAuthService.getCurrentGuestPlayer();
          if (guestPlayer) {
            playerId = guestPlayer.id;
          }
        }

        if (!playerId) {
          setBotInfo({
            isBotGame: false,
            bot: null,
            botColor: null,
            playerColor: null,
            loading: false,
          });
          return;
        }

        // Get players in this game room
        const { data: roomPlayers, error: roomError } = await supabase
          .from('game_room_players')
          .select('player_id, color')
          .eq('room_id', gameId);

        if (roomError) {
          console.error('❌ Error fetching room players:', roomError);
          setBotInfo({
            isBotGame: false,
            bot: null,
            botColor: null,
            playerColor: null,
            loading: false,
          });
          return;
        }

        // If less than 2 players, game hasn't fully started yet (waiting room)
        if (!roomPlayers || roomPlayers.length < 2) {
          // This is normal during waiting room phase, not an error
          setBotInfo({
            isBotGame: false,
            bot: null,
            botColor: null,
            playerColor: null,
            loading: false,
          });
          return;
        }

        // Find if any player is a bot
        let botPlayer = null;
        let humanPlayer = null;

        for (const player of roomPlayers) {
          const isBot = await celestialBotMatchmaking.isCelestialBot(player.player_id);
          if (isBot) {
            botPlayer = player;
          } else if (player.player_id === playerId) {
            humanPlayer = player;
          }
        }

        // Not a bot game
        if (!botPlayer) {
          setBotInfo({
            isBotGame: false,
            bot: null,
            botColor: null,
            playerColor: null,
            loading: false,
          });
          return;
        }

        // Fetch bot details
        const bot = await celestialBotMatchmaking.getBotPlayerDetails(botPlayer.player_id);

        if (!bot) {
          console.error('Bot player not found:', botPlayer.player_id);
          setBotInfo({
            isBotGame: true,
            bot: null,
            botColor: botPlayer.color as 'white' | 'black',
            playerColor: humanPlayer?.color as 'white' | 'black' || null,
            loading: false,
          });
          return;
        }

        console.log('🤖 Celestial bot detected in game:', {
          bot: bot.config.name,
          botColor: botPlayer.color,
          playerColor: humanPlayer?.color,
          difficulty: bot.config.difficulty,
        });

        setBotInfo({
          isBotGame: true,
          bot,
          botColor: botPlayer.color as 'white' | 'black',
          playerColor: humanPlayer?.color as 'white' | 'black' || null,
          loading: false,
        });
      } catch (error) {
        console.error('Error in useCelestialBot:', error);
        setBotInfo({
          isBotGame: false,
          bot: null,
          botColor: null,
          playerColor: null,
          loading: false,
        });
      }
    };

    detectBotGame();
  }, [gameId]);

  return botInfo;
}
