// src/services/statsService.ts
import { supabase } from '../lib/supabase';

export interface GameStats {
  playersOnline: number;
  activeGames: number;
  waitingGames: number;
  totalPlayersToday: number;
}

/**
 * Get real-time game statistics from the database
 */
async function getGameStats(): Promise<GameStats> {
  try {
    // Get all active/waiting rooms first
    const { data: activeRooms, error: roomsError } = await supabase
      .from('game_rooms')
      .select('id')
      .in('status', ['waiting', 'playing']);

    if (roomsError) {
      console.error('Error fetching active rooms:', roomsError);
    }

    const roomIds = activeRooms?.map(r => r.id) || [];

    let playersInRooms = 0;
    let playersError = null;

    // If there are active rooms, get the players
    if (roomIds.length > 0) {
      const { data: roomPlayers, error: pError } = await supabase
        .from('game_room_players')
        .select('player_id')
        .in('room_id', roomIds);

      playersError = pError;
      // Get unique player IDs
      const uniquePlayerIds = new Set(roomPlayers?.map(p => p.player_id) || []);
      playersInRooms = uniquePlayerIds.size;
    }

    // Add 1 for the current session (since the user calling this API is online)
    const playersOnline = playersInRooms + 1;

    // Get count of active games (in progress)
    const { count: activeGames, error: activeError } = await supabase
      .from('game_rooms')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'playing');

    // Get count of waiting games
    const { count: waitingGames, error: waitingError } = await supabase
      .from('game_rooms')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'waiting');

    // Get count of unique players who played today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: totalPlayersToday, error: todayError } = await supabase
      .from('game_room_players')
      .select('player_id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    if (playersError || activeError || waitingError || todayError) {
      console.error('Error fetching stats:', {
        playersError,
        activeError,
        waitingError,
        todayError,
      });
      // Return fallback values on error
      return {
        playersOnline: 0,
        activeGames: 0,
        waitingGames: 0,
        totalPlayersToday: 0,
      };
    }

    return {
      playersOnline: playersOnline,
      activeGames: activeGames || 0,
      waitingGames: waitingGames || 0,
      totalPlayersToday: totalPlayersToday || 0,
    };
  } catch (error) {
    console.error('Failed to fetch game stats:', error);
    return {
      playersOnline: 0,
      activeGames: 0,
      waitingGames: 0,
      totalPlayersToday: 0,
    };
  }
}

/**
 * Get player count for a specific stake range
 */
async function getPlayerCountForStake(
  minStake: number,
  maxStake: number
): Promise<number> {
  try {
    // Get rooms in the stake range that are active/waiting
    const { data: rooms, error: roomsError } = await supabase
      .from('game_rooms')
      .select('id')
      .gte('entry_fee', minStake)
      .lte('entry_fee', maxStake)
      .in('status', ['waiting', 'playing']);

    if (roomsError) {
      console.error('Error fetching rooms for stake:', roomsError);
      return 0;
    }

    const roomIds = rooms?.map(r => r.id) || [];

    if (roomIds.length === 0) {
      return 0;
    }

    // Get players in those rooms
    const { data: players, error: playersError } = await supabase
      .from('game_room_players')
      .select('player_id')
      .in('room_id', roomIds);

    if (playersError) {
      console.error('Error fetching stake player count:', playersError);
      return 0;
    }

    // Count unique players
    const uniquePlayerIds = new Set(players?.map(p => p.player_id) || []);
    return uniquePlayerIds.size;
  } catch (error) {
    console.error('Failed to fetch stake player count:', error);
    return 0;
  }
}

export const statsService = {
  getGameStats,
  getPlayerCountForStake,
};
