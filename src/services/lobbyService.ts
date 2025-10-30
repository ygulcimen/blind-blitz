// src/services/lobbyService.ts - Updated for 5+0 Signature
import { supabase } from '../lib/supabase';
import { guestAuthService } from './guestAuthService';
import type {
  GameRoom,
  GameMode,
  RoomStatus,
} from '../screens/lobbyPage/types/lobby.types';

// 🎯 BLINDCHESS SIGNATURE CONSTANTS
const BLINDCHESS_SIGNATURE = {
  TIME_CONTROL: '5+0',
  TIME_MINUTES: 5,
  TIME_INCREMENT: 0,
  DESCRIPTION: '5 Blind Moves • 5 Minutes Live • Pure Strategy',
} as const;

// Helper function to get current player ID (authenticated or guest)
async function getCurrentPlayerId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return user.id;
  }

  const guestPlayer = guestAuthService.getCurrentGuestPlayer();
  return guestPlayer?.id || null;
}

type CreateRoomConfig = Partial<GameRoom> & {
  host?: string;
  mode?: string;
  entryFee?: number;
  maxPlayers?: number;
  // 🎯 REMOVED: timeControl - always enforced as 5+0
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
    timeControl: '5+0', // 🎯 ALWAYS 5+0 - BlindChess Signature
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
      .eq('time_control', '5+0') // 🎯 ENFORCE 5+0 SIGNATURE
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

// Get rooms suitable for quick match - 5+0 only
async function getAvailableRoomsForQuickMatch(
  playerGold: number
): Promise<GameRoom[]> {
  try {
    console.log(
      '🎯 QuickMatch: Searching 5+0 rooms with playerGold:',
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
      .eq('time_control', '5+0') // 🎯 SIGNATURE TIME CONTROL ONLY
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

    console.log(
      '📊 Available 5+0 rooms after filtering:',
      availableRooms.length
    );

    return availableRooms.map(transformDatabaseRoom);
  } catch (error) {
    console.error('💥 Failed to get available rooms:', error);
    return [];
  }
}

// Create a new room - ALWAYS 5+0
async function createRoom(config: CreateRoomConfig): Promise<string> {
  try {
    // Get current player ID (authenticated or guest)
    const playerId = await getCurrentPlayerId();
    if (!playerId) {
      throw new Error('You must be logged in to create a room');
    }

    // Get player data
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('username, gold_balance, rating')
      .eq('id', playerId)
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

    // 🎯 ALWAYS ENFORCE 5+0 SIGNATURE TIME CONTROL
    const timeControl = BLINDCHESS_SIGNATURE.TIME_CONTROL;

    console.log('🎯 Creating BlindChess room with signature time control:', {
      mode: dbMode,
      timeControl,
      entryFee,
      description: BLINDCHESS_SIGNATURE.DESCRIPTION,
    });

    // Create the room with SIGNATURE branding
    const { data: roomData, error: roomError } = await supabase
      .from('game_rooms')
      .insert({
        name: config.host
          ? `${config.host}'s BlindChess Battle`
          : 'BlindChess Battle (5+0)',
        mode: dbMode,
        entry_fee: entryFee,
        max_players: config.maxPlayers ?? 2,
        time_control: timeControl, // 🎯 SIGNATURE 5+0
        status: 'waiting',
        current_players: 0, // Will be updated by trigger
        rated: true,
        private: false,
        password: null,
        host_id: playerId,
        host_username: playerData.username,
        region: 'global',
      })
      .select()
      .single();

    if (roomError) {
      console.error('Error creating BlindChess room:', roomError);
      throw roomError;
    }

    console.log('✅ BlindChess 5+0 room created successfully:', roomData.id);

    // Add creator as first player - this will trigger entry fee deduction
    const { error: joinError } = await supabase
      .from('game_room_players')
      .insert({
        room_id: roomData.id,
        player_id: playerId,
        player_username: playerData.username,
        player_rating: Number(playerData.rating) || 1200,
        ready: false,
        color: 'white', // Host gets white by default
      });

    if (joinError) {
      console.error('Error joining own BlindChess room:', joinError);
      // Clean up the room if join failed
      await supabase.from('game_rooms').delete().eq('id', roomData.id);
      throw new Error('Failed to join room after creation');
    }

    return roomData.id;
  } catch (error) {
    console.error('Failed to create BlindChess room:', error);
    throw error;
  }
}

// Join an existing room - verify 5+0
async function joinRoom(roomId: string): Promise<void> {
  try {
    // Get current player ID (authenticated or guest)
    const playerId = await getCurrentPlayerId();
    if (!playerId) {
      throw new Error('You must be logged in to join a room');
    }

    // Get player data
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('username, gold_balance, rating')
      .eq('id', playerId)
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

    // 🎯 VERIFY SIGNATURE TIME CONTROL
    if (roomData.time_control !== '5+0') {
      throw new Error(
        'This room does not use BlindChess signature time control (5+0)'
      );
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
      .eq('player_id', playerId)
      .single();

    if (existingPlayer) {
      throw new Error('You are already in this room');
    }

    console.log('🎯 Joining BlindChess 5+0 battle:', roomId);

    // Add player to room - trigger will handle entry fee deduction
    const { error: joinError } = await supabase
      .from('game_room_players')
      .insert({
        room_id: roomId,
        player_id: playerId,
        player_username: playerData.username,
        player_rating: Number(playerData.rating) || 1200,
        ready: false,
        color: 'black', // Second player gets black
      });

    if (joinError) {
      console.error('Error joining BlindChess room:', joinError);
      throw joinError;
    }

    console.log('✅ Successfully joined BlindChess 5+0 room:', roomId);
  } catch (error) {
    console.error('Failed to join BlindChess room:', error);
    throw error;
  }
}

// Leave a room
async function leaveRoom(roomId: string): Promise<void> {
  try {
    const playerId = await getCurrentPlayerId();
    if (!playerId) {
      throw new Error('You must be logged in');
    }

    // Get room data first to handle refunds
    const { data: roomData, error: roomError } = await supabase
      .from('game_rooms')
      .select('entry_fee, status, host_id, time_control')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found');
    }

    // 🎯 LOG SIGNATURE ROOM LEAVE
    console.log('🎯 Leaving BlindChess 5+0 room:', {
      roomId,
      timeControl: roomData.time_control,
      entryFee: roomData.entry_fee,
    });

    // Refund entry fee if game hasn't started
    if (roomData.status === 'waiting' && roomData.entry_fee > 0) {
      // Get current balance first
      const { data: currentPlayer } = await supabase
        .from('players')
        .select('gold_balance')
        .eq('id', playerId)
        .single();

      if (currentPlayer) {
        const newBalance = currentPlayer.gold_balance + roomData.entry_fee;

        // Update player balance
        const { error: refundError } = await supabase
          .from('players')
          .update({ gold_balance: newBalance })
          .eq('id', playerId);

        if (!refundError) {
          // Record refund transaction
          await supabase.from('gold_transactions').insert({
            player_id: playerId,
            amount: roomData.entry_fee,
            transaction_type: 'refund',
            description: 'Left BlindChess 5+0 room before game started',
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
      .eq('player_id', playerId);

    if (leaveError) {
      console.error('Error leaving BlindChess room:', leaveError);
      throw leaveError;
    }

    console.log('✅ Successfully left BlindChess 5+0 room:', roomId);
  } catch (error) {
    console.error('Failed to leave BlindChess room:', error);
    throw error;
  }
}

// Check if player is in a specific room
async function isPlayerInRoom(roomId: string): Promise<boolean> {
  try {
    const playerId = await getCurrentPlayerId();
    if (!playerId) {
      return false;
    }

    const { data, error } = await supabase
      .from('game_room_players')
      .select('id')
      .eq('room_id', roomId)
      .eq('player_id', playerId)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

// Get current user's active room - must be 5+0
async function getCurrentUserRoom(): Promise<GameRoom | null> {
  try {
    const playerId = await getCurrentPlayerId();
    if (!playerId) {
      return null;
    }

    const { data, error } = await supabase
      .from('game_room_players')
      .select(
        `
        room_id,
        game_rooms!inner (
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
      .eq('player_id', playerId)
      .eq('game_rooms.time_control', '5+0') // 🎯 FILTER BY SIGNATURE TIME CONTROL
      .not('game_rooms.status', 'eq', 'finished')
      .single();

    if (error || !data || !data.game_rooms) {
      return null;
    }

    console.log('🎯 Found current BlindChess 5+0 room for user');
    return transformDatabaseRoom(data.game_rooms);
  } catch (error) {
    console.error('Error getting current user room:', error);
    return null;
  }
}

// Get room details with players - verify 5+0
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
      .eq('time_control', '5+0') // 🎯 SIGNATURE VERIFICATION
      .single();

    if (roomError || !room) {
      return null;
    }

    console.log('🎯 Getting details for BlindChess 5+0 room:', roomId);

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
    console.error('Failed to get BlindChess room details:', error);
    return null;
  }
}

// Export the service interface with signature branding
export const lobbyService = {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  isPlayerInRoom,
  getCurrentUserRoom,
  getAvailableRoomsForQuickMatch,
  getRoomDetails,
  // 🎯 SIGNATURE CONSTANTS
  SIGNATURE: BLINDCHESS_SIGNATURE,
};
