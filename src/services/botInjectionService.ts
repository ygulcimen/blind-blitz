// src/services/botInjectionService.ts
// Service to inject Celestial bots into waiting matchmaking rooms

import { supabase } from '../lib/supabase';
import { BotConfig } from './celestialBotAI';

export interface BotInjectionResult {
  success: boolean;
  botId?: string;
  botUsername?: string;
  botRating?: number;
  botColor?: 'white' | 'black';
  botConfig?: BotConfig;
  reason?: string;
  message?: string;
}

/**
 * Check if a specific bot is currently available (not in another game)
 */
export async function isBotAvailable(botId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_bot_available', {
      bot_player_id: botId,
    });

    if (error) {
      console.error('Error checking bot availability:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Failed to check bot availability:', error);
    return false;
  }
}

/**
 * Get an available Celestial bot within rating range
 */
export async function getAvailableCelestialBot(
  minRating: number = 800,
  maxRating: number = 2500
): Promise<BotInjectionResult> {
  try {
    const { data, error } = await supabase.rpc('get_available_celestial_bot', {
      min_rating: minRating,
      max_rating: maxRating,
    });

    if (error) {
      console.error('Error getting available bot:', error);
      return { success: false, reason: 'database_error', message: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, reason: 'no_bot_available', message: 'All bots are currently in games' };
    }

    const bot = data[0];
    return {
      success: true,
      botId: bot.bot_id,
      botUsername: bot.bot_username,
      botRating: bot.bot_rating,
      botConfig: bot.bot_config,
    };
  } catch (error) {
    console.error('Failed to get available bot:', error);
    return { success: false, reason: 'exception', message: String(error) };
  }
}

/**
 * Inject a bot into an existing waiting room
 * This is the main function to call when a room has been waiting 8-10 seconds
 */
export async function injectBotIntoRoom(
  roomId: string,
  playerRating: number
): Promise<BotInjectionResult> {
  try {
    console.log(`🤖 Attempting to inject bot into room ${roomId} (player rating: ${playerRating})`);

    // Calculate rating range (±300 from player rating)
    const minRating = Math.max(800, playerRating - 300);
    const maxRating = playerRating + 300;

    const { data, error } = await supabase.rpc('inject_bot_into_room', {
      p_room_id: roomId,
      p_min_rating: minRating,
      p_max_rating: maxRating,
    });

    if (error) {
      console.error('❌ Error injecting bot:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, reason: 'database_error', message: error.message || 'Database error' };
    }

    if (!data || !data.success) {
      console.log('⚠️ Bot injection failed:', {
        reason: data?.reason,
        message: data?.message,
        fullData: data
      });
      return {
        success: false,
        reason: data?.reason || 'unknown',
        message: data?.message || 'Failed to inject bot',
      };
    }

    console.log(`✅ Bot injected successfully: ${data.bot_username} (${data.bot_color})`);

    return {
      success: true,
      botId: data.bot_id,
      botUsername: data.bot_username,
      botRating: data.bot_rating,
      botColor: data.bot_color,
      botConfig: data.bot_config,
    };
  } catch (error) {
    console.error('💥 Exception injecting bot:', error);
    return { success: false, reason: 'exception', message: String(error) };
  }
}

/**
 * Get how long a room has been waiting (in seconds)
 */
export async function getRoomWaitTime(roomId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_room_wait_time', {
      p_room_id: roomId,
    });

    if (error) {
      console.error('Error getting room wait time:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Failed to get room wait time:', error);
    return 0;
  }
}

/**
 * Auto-mark bot as ready after 1 second delay
 * Called after bot is injected into room
 */
export async function markBotReady(roomId: string, botId: string): Promise<boolean> {
  try {
    console.log(`🤖 Marking bot ready in room ${roomId}...`);

    // Wait 1 second to simulate human behavior
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { error } = await supabase
      .from('game_room_players')
      .update({ ready: true })
      .eq('room_id', roomId)
      .eq('player_id', botId);

    if (error) {
      console.error('Error marking bot ready:', error);
      return false;
    }

    console.log('✅ Bot marked ready');
    return true;
  } catch (error) {
    console.error('Failed to mark bot ready:', error);
    return false;
  }
}

/**
 * Start bot injection timer for a room
 * Returns a cleanup function to stop the timer
 */
export function startBotInjectionTimer(
  roomId: string,
  playerRating: number,
  onBotInjected: (result: BotInjectionResult) => void,
  delaySeconds: number = 8
): () => void {
  console.log(`⏱️ Starting bot injection timer for room ${roomId} (${delaySeconds}s delay)`);

  const timer = setTimeout(async () => {
    console.log(`⏰ Timer expired! Attempting bot injection for room ${roomId}`);

    const result = await injectBotIntoRoom(roomId, playerRating);

    if (result.success && result.botId) {
      // Auto-mark bot as ready after 1 second
      await markBotReady(roomId, result.botId);
    }

    onBotInjected(result);
  }, delaySeconds * 1000);

  // Return cleanup function
  return () => {
    console.log(`🛑 Clearing bot injection timer for room ${roomId}`);
    clearTimeout(timer);
  };
}

export const botInjectionService = {
  isBotAvailable,
  getAvailableCelestialBot,
  injectBotIntoRoom,
  getRoomWaitTime,
  markBotReady,
  startBotInjectionTimer,
};
