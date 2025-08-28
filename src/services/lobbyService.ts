// src/services/lobbyService.ts - UPGRADED FROM LOCALSTORAGE TO SUPABASE
import { supabase } from '../lib/supabase';
import type {
  GameRoom,
  GameMode,
  RoomStatus,
} from '../screens/lobbyPage/types/lobby.types';

// Keep your existing CreateRoomConfig type
type CreateRoomConfig = Partial<GameRoom> & {
  host?: string;
  mode?: string;
  entryFee?: number;
  maxPlayers?: number;
};

// Helper to transform database room to your existing GameRoom type
function transformDatabaseRoom(dbRoom: any): GameRoom {
  return {
    id: dbRoom.id,
    host: dbRoom.host_username,
    mode: dbRoom.mode as GameMode, // 'classic' or 'robochaos' - direct mapping
    hostRating: 1200, // Default rating for now
    hostAvatar: undefined, // Optional field
    entryFee: dbRoom.entry_fee,
    reward: dbRoom.entry_fee * 2, // Simple reward calculation
    players: dbRoom.current_players || 0,
    maxPlayers: dbRoom.max_players || 2,
    timeControl: dbRoom.time_control || '10+5',
    ratingRange: 'all', // Default rating range
    status: dbRoom.status as RoomStatus,
    isPrivate: dbRoom.private || false,
    created_at: new Date(dbRoom.created_at).toISOString(),
    // Keep as Date object
    spectators: 0, // Default spectators
  };
}

// Your existing getRooms function - now using database
async function getRooms(): Promise<GameRoom[]> {
  try {
    const { data, error } = await supabase
      .from('game_rooms')
      .select(
        `
        id,
        created_at,
        name,
        mode,
        entry_fee,
        max_players,
        time_control,
        status,
        current_players,
        host_username,
        rated,
        private,
        password
      `
      )
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rooms:', error);
      // Fallback to empty array instead of crashing
      return [];
    }

    // Transform database rooms to your existing GameRoom format
    return (data || []).map(transformDatabaseRoom);
  } catch (error) {
    console.error('Failed to get rooms:', error);
    return []; // Return empty array on error
  }
}
// Add this method to your existing lobbyService class:

// Replace your getAvailableRoomsForQuickMatch function with this corrected version:

async function getAvailableRoomsForQuickMatch(
  playerGold: number
): Promise<GameRoom[]> {
  try {
    console.log(
      '🔍 QuickMatch: Searching for rooms with playerGold:',
      playerGold
    );

    const { data: rooms, error } = await supabase
      .from('game_rooms')
      .select(
        `
        id,
        created_at,
        name,
        mode,
        entry_fee,
        max_players,
        time_control,
        status,
        current_players,
        host_username,
        rated,
        private,
        password
      `
      )
      .eq('status', 'waiting')
      .lte('entry_fee', playerGold)
      .eq('private', false)
      .order('current_players', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching quick match rooms:', error);
      return [];
    }

    // Filter out full rooms in JavaScript since we can't do column comparison in Supabase
    const availableRooms =
      rooms?.filter((room) => room.current_players < room.max_players) || [];

    console.log('📋 Raw rooms from database:', rooms);
    console.log('📊 Available rooms after filtering:', availableRooms.length);

    if (availableRooms.length > 0) {
      availableRooms.forEach((room) => {
        console.log(
          `🏠 Room ${room.id}: ${room.current_players}/${room.max_players} players, ${room.entry_fee}g entry, status: ${room.status}`
        );
      });
    }

    return availableRooms.map(transformDatabaseRoom);
  } catch (error) {
    console.error('💥 Failed to get available rooms:', error);
    return [];
  }
}

// Your existing createRoom function - now using database
async function createRoom(config: CreateRoomConfig): Promise<string> {
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be logged in to create a room');
    }

    // Get user's player data
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('username, gold_balance')
      .eq('id', user.id)
      .single();

    if (playerError || !playerData) {
      throw new Error('Failed to get player data');
    }

    const entryFee = config.entryFee ?? 0;

    // Check if user has enough gold
    if (playerData.gold_balance < entryFee) {
      throw new Error(
        `Insufficient gold! You need ${entryFee} but only have ${playerData.gold_balance}`
      );
    }

    // Use the mode directly - no mapping needed since types match
    const dbMode = config.mode || 'classic';
    const timeControl = config.timeControl || '10+5';
    // Create the room
    const { data: roomData, error: roomError } = await supabase
      .from('game_rooms')
      .insert({
        name: config.host ? `${config.host}'s Room` : 'BlindChess Battle',
        mode: dbMode,
        entry_fee: entryFee,
        max_players: config.maxPlayers ?? 2,
        time_control: timeControl, // Default time control
        rated: true,
        private: false,
        host_id: user.id,
        host_username: playerData.username,
      })
      .select()
      .single();

    if (roomError) {
      console.error('Error creating room:', roomError);
      throw roomError;
    }

    // Add creator as first player in the room
    const { error: joinError } = await supabase
      .from('game_room_players')
      .insert({
        room_id: roomData.id,
        player_id: user.id,
        player_username: playerData.username,
        player_rating: 1200, // Default rating
      });

    if (joinError) {
      console.error('Error joining own room:', joinError);
      // Don't throw here, room is created but user isn't in it
    }

    // Manually update player count since we don't have triggers
    await supabase
      .from('game_rooms')
      .update({
        current_players: 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomData.id);

    return roomData.id;
  } catch (error) {
    console.error('Failed to create room:', error);
    throw error;
  }
}

// Your existing joinRoom function - now using database
async function joinRoom(roomId: string): Promise<void> {
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be logged in to join a room');
    }

    // Get user's player data
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('username, gold_balance, rating')
      .eq('id', user.id)
      .single();

    if (playerError || !playerData) {
      throw new Error('Failed to get player data');
    }

    // Get room data
    const { data: roomData, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found');
    }

    // Check room capacity
    if (roomData.current_players >= roomData.max_players) {
      throw new Error('Room is full');
    }

    // Check if user has enough gold
    if (playerData.gold_balance < roomData.entry_fee) {
      throw new Error(
        `Insufficient gold! You need ${roomData.entry_fee} but only have ${playerData.gold_balance}`
      );
    }

    // Check if already in room
    const { data: existingPlayer } = await supabase
      .from('game_room_players')
      .select('id')
      .eq('room_id', roomId)
      .eq('player_id', user.id)
      .single();

    if (existingPlayer) {
      throw new Error('You are already in this room');
    }

    // Add player to room
    const { error: joinError } = await supabase
      .from('game_room_players')
      .insert({
        room_id: roomId,
        player_id: user.id,
        player_username: playerData.username,
        player_rating: playerData.rating,
      });

    if (joinError) {
      console.error('Error joining room:', joinError);
      throw joinError;
    }

    // Manually update player count
    const newPlayerCount = roomData.current_players + 1;
    await supabase
      .from('game_rooms')
      .update({
        current_players: newPlayerCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    // If room is now full, you could start the game here
    if (newPlayerCount >= roomData.max_players) {
      console.log('Room is full! Could start game here...');
      // TODO: Start game logic
    }
  } catch (error) {
    console.error('Failed to join room:', error);
    throw error;
  }
}

// NEW: Leave a game room
async function leaveRoom(roomId: string): Promise<void> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be logged in');
    }

    // Get room data first
    const { data: roomData, error: roomError } = await supabase
      .from('game_rooms')
      .select('host_id, current_players')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found');
    }

    // Remove player from room
    const { error: leaveError } = await supabase
      .from('game_room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('player_id', user.id);

    if (leaveError) {
      console.error('Error leaving room:', leaveError);
      throw leaveError;
    }

    // Update player count
    const newPlayerCount = Math.max(0, roomData.current_players - 1);

    // If host left and room is empty, delete the room
    if (roomData.host_id === user.id && newPlayerCount === 0) {
      await supabase.from('game_rooms').delete().eq('id', roomId);
      console.log('Host left empty room - room deleted');
    } else {
      // Just update the player count
      await supabase
        .from('game_rooms')
        .update({
          current_players: newPlayerCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId);
    }
  } catch (error) {
    console.error('Failed to leave room:', error);
    throw error;
  }
}

// NEW: Check if current user is in a specific room
async function isPlayerInRoom(roomId: string): Promise<boolean> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from('game_room_players')
      .select('id')
      .eq('room_id', roomId)
      .eq('player_id', user.id)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

// NEW: Get current user's active room (if any)
async function getCurrentUserRoom(): Promise<GameRoom | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('game_room_players')
      .select(
        `
        room_id,
        game_rooms (
          id,
          created_at,
          name,
          mode,
          entry_fee,
          max_players,
          time_control,
          status,
          current_players,
          host_username,
          rated,
          private,
          password
        )
      `
      )
      .eq('player_id', user.id)
      .single();

    if (error || !data || !data.game_rooms) {
      return null;
    }

    return transformDatabaseRoom(data.game_rooms);
  } catch (error) {
    return null;
  }
}

// Export the same interface your app expects
export const lobbyService = {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  isPlayerInRoom,
  getCurrentUserRoom,
  getAvailableRoomsForQuickMatch,
};
