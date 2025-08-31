// src/services/lobbyService.ts - FIXED: Aligned with actual database schema
import { supabase } from '../lib/supabase';
import type {
  GameRoom,
  GameMode,
  RoomStatus,
} from '../screens/lobbyPage/types/lobby.types';

type CreateRoomConfig = Partial<GameRoom> & {
  host?: string;
  mode?: string;
  entryFee?: number;
  maxPlayers?: number;
  timeControl?: string;
};

// Transform database room to frontend GameRoom type
function transformDatabaseRoom(dbRoom: any): GameRoom {
  return {
    id: dbRoom.id,
    host: dbRoom.host_username,
    mode: dbRoom.mode as GameMode,
    hostRating: 1200, // Default - could be enhanced to fetch real host rating
    hostAvatar: undefined,
    entryFee: dbRoom.entry_fee,
    reward: dbRoom.entry_fee * 2,
    players: dbRoom.current_players || 0,
    maxPlayers: dbRoom.max_players || 2,
    timeControl: dbRoom.time_control || '10+5',
    ratingRange: 'all',
    status: dbRoom.status as RoomStatus,
    isPrivate: dbRoom.private || false,
    created_at: new Date(dbRoom.created_at).toISOString(),
    spectators: 0,
    // Add these fields that might be missing
    game_started: dbRoom.status !== 'waiting',
    game_ended: dbRoom.status === 'finished',
  };
}

// Get available rooms
async function getRooms(): Promise<GameRoom[]> {
  try {
    const { data, error } = await supabase
      .from('game_rooms')
      .select(
        `
        id,
        created_at,
        updated_at,
        name,
        mode,
        entry_fee,
        max_players,
        time_control,
        status,
        current_players,
        host_id,
        host_username,
        rated,
        private,
        password,
        region
      `
      )
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }

    return (data || []).map(transformDatabaseRoom);
  } catch (error) {
    console.error('Failed to get rooms:', error);
    return [];
  }
}

// Get rooms suitable for quick match
async function getAvailableRoomsForQuickMatch(
  playerGold: number
): Promise<GameRoom[]> {
  try {
    console.log('🔍 QuickMatch: Searching rooms with playerGold:', playerGold);

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
      .is('password', null) // No password required
      .order('current_players', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching quick match rooms:', error);
      return [];
    }

    // Filter out full rooms
    const availableRooms = (rooms || []).filter(
      (room) => room.current_players < room.max_players
    );

    console.log('📊 Available rooms after filtering:', availableRooms.length);

    return availableRooms.map(transformDatabaseRoom);
  } catch (error) {
    console.error('💥 Failed to get available rooms:', error);
    return [];
  }
}

// Create a new room
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
      .select('username, gold_balance, rating')
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
        time_control: timeControl,
        status: 'waiting',
        current_players: 0, // Will be updated by trigger
        rated: true,
        private: false,
        password: null,
        host_id: user.id,
        host_username: playerData.username,
        region: 'global', // Default region
      })
      .select()
      .single();

    if (roomError) {
      console.error('Error creating room:', roomError);
      throw roomError;
    }

    // Add creator as first player - this will trigger entry fee deduction
    const { error: joinError } = await supabase
      .from('game_room_players')
      .insert({
        room_id: roomData.id,
        player_id: user.id,
        player_username: playerData.username,
        player_rating: Number(playerData.rating) || 1200,
        ready: false,
        color: 'white', // Host gets white by default
      });

    if (joinError) {
      console.error('Error joining own room:', joinError);
      // Clean up the room if join failed
      await supabase.from('game_rooms').delete().eq('id', roomData.id);
      throw new Error('Failed to join room after creation');
    }

    return roomData.id;
  } catch (error) {
    console.error('Failed to create room:', error);
    throw error;
  }
}

// Join an existing room
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

    // Get room data and validate
    const { data: roomData, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found');
    }

    // Validation checks
    if (roomData.status !== 'waiting') {
      throw new Error('Room is no longer accepting players');
    }

    if (roomData.current_players >= roomData.max_players) {
      throw new Error('Room is full');
    }

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

    // Add player to room - trigger will handle entry fee deduction
    const { error: joinError } = await supabase
      .from('game_room_players')
      .insert({
        room_id: roomId,
        player_id: user.id,
        player_username: playerData.username,
        player_rating: Number(playerData.rating) || 1200,
        ready: false,
        color: 'black', // Second player gets black
      });

    if (joinError) {
      console.error('Error joining room:', joinError);
      throw joinError;
    }

    console.log('Successfully joined room:', roomId);
  } catch (error) {
    console.error('Failed to join room:', error);
    throw error;
  }
}

// Leave a room
async function leaveRoom(roomId: string): Promise<void> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be logged in');
    }

    // Get room data first to handle refunds
    const { data: roomData, error: roomError } = await supabase
      .from('game_rooms')
      .select('entry_fee, status, host_id')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found');
    }

    // Refund entry fee if game hasn't started
    if (roomData.status === 'waiting' && roomData.entry_fee > 0) {
      // Get current balance first
      const { data: currentPlayer } = await supabase
        .from('players')
        .select('gold_balance')
        .eq('id', user.id)
        .single();

      if (currentPlayer) {
        const newBalance = currentPlayer.gold_balance + roomData.entry_fee;

        // Update player balance
        const { error: refundError } = await supabase
          .from('players')
          .update({ gold_balance: newBalance })
          .eq('id', user.id);

        if (!refundError) {
          // Record refund transaction
          await supabase.from('gold_transactions').insert({
            player_id: user.id,
            amount: roomData.entry_fee,
            transaction_type: 'refund',
            description: 'Left room before game started',
            game_id: roomId,
            balance_after: newBalance,
          });
        }
      }
    }

    // Remove player from room - trigger will handle room cleanup
    const { error: leaveError } = await supabase
      .from('game_room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('player_id', user.id);

    if (leaveError) {
      console.error('Error leaving room:', leaveError);
      throw leaveError;
    }

    console.log('Successfully left room:', roomId);
  } catch (error) {
    console.error('Failed to leave room:', error);
    throw error;
  }
}

// Check if player is in a specific room
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

// Get current user's active room
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
      .not('game_rooms.status', 'eq', 'finished')
      .single();

    if (error || !data || !data.game_rooms) {
      return null;
    }

    return transformDatabaseRoom(data.game_rooms);
  } catch (error) {
    return null;
  }
}

// Get room details with players
async function getRoomDetails(roomId: string): Promise<{
  room: any;
  players: any[];
} | null> {
  try {
    // Get room data
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return null;
    }

    // Get players in room
    const { data: players, error: playersError } = await supabase
      .from('game_room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (playersError) {
      console.error('Error fetching room players:', playersError);
      return { room, players: [] };
    }

    return { room, players: players || [] };
  } catch (error) {
    console.error('Failed to get room details:', error);
    return null;
  }
}

// Export the service interface
export const lobbyService = {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  isPlayerInRoom,
  getCurrentUserRoom,
  getAvailableRoomsForQuickMatch,
  getRoomDetails,
};
