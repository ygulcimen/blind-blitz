// src/services/botPlayerService.ts
import { supabase } from '../config/supabaseClient';
import { Chess } from 'chess.js';

interface BotPlayer {
  id: string;
  username: string;
  email: string;
  rating: number;
}

const BOT_NAMES = [
  'ChessBot_Alpha', 'RoboKnight', 'AI_Strategist', 'DeepBlue_Jr',
  'NeuralPawn', 'QuantumKing', 'BotMaster', 'CyberChess',
  'AlgoKnight', 'BinaryBishop', 'PixelPawn', 'DataRook'
];

class BotPlayerService {
  private activeBots: Set<string> = new Set();
  private botAccounts: BotPlayer[] = [];
  private roomSubscription: any = null;

  /**
   * Initialize bot service - creates bot accounts and starts monitoring
   */
  async initialize() {
    console.log('🤖 Initializing Bot Player Service...');

    // Create or get bot accounts
    await this.ensureBotAccounts();

    // Start monitoring for open rooms
    this.startRoomMonitoring();
  }

  /**
   * Create bot player accounts if they don't exist
   */
  private async ensureBotAccounts() {
    for (const botName of BOT_NAMES.slice(0, 3)) { // Create 3 bots for now
      try {
        // Check if bot already exists
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('*')
          .eq('username', botName)
          .single();

        if (existingPlayer) {
          this.botAccounts.push(existingPlayer);
          console.log(`✅ Bot ${botName} already exists`);
        } else {
          // Create bot account
          const email = `${botName.toLowerCase()}@blindchess.bot`;
          const password = `bot_${Math.random().toString(36).slice(2)}`;

          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            console.error(`❌ Failed to create bot ${botName}:`, signUpError);
            continue;
          }

          if (authData.user) {
            // Update player profile
            const { data: playerData } = await supabase
              .from('players')
              .update({
                username: botName,
                rating: Math.floor(1000 + Math.random() * 500), // 1000-1500 rating
                is_bot: true, // Mark as bot
              })
              .eq('id', authData.user.id)
              .select()
              .single();

            if (playerData) {
              this.botAccounts.push(playerData);
              console.log(`✅ Created bot ${botName}`);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error creating bot ${botName}:`, error);
      }
    }

    console.log(`🤖 ${this.botAccounts.length} bots ready`);
  }

  /**
   * Monitor for open rooms and join them
   */
  private startRoomMonitoring() {
    console.log('👀 Monitoring for open rooms...');

    // Subscribe to room changes
    this.roomSubscription = supabase
      .channel('bot-room-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_rooms',
        },
        (payload) => {
          this.handleNewRoom(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
        },
        (payload) => {
          this.handleRoomUpdate(payload.new);
        }
      )
      .subscribe();

    // Also check existing open rooms
    this.checkExistingRooms();
  }

  /**
   * Check for existing open rooms and join them
   */
  private async checkExistingRooms() {
    const { data: openRooms } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('status', 'waiting')
      .lt('current_players', 2);

    if (openRooms && openRooms.length > 0) {
      console.log(`🎮 Found ${openRooms.length} open rooms`);
      for (const room of openRooms) {
        await this.joinRoom(room);
      }
    }
  }

  /**
   * Handle new room creation
   */
  private async handleNewRoom(room: any) {
    if (room.status === 'waiting' && room.current_players < 2) {
      console.log(`🆕 New room detected: ${room.id}`);
      // Wait 2-5 seconds before joining (simulate human behavior)
      setTimeout(() => this.joinRoom(room), 2000 + Math.random() * 3000);
    }
  }

  /**
   * Handle room updates
   */
  private async handleRoomUpdate(room: any) {
    // If room needs players, join it
    if (room.status === 'waiting' && room.current_players < 2) {
      if (!this.activeBots.has(room.id)) {
        console.log(`🔄 Room needs players: ${room.id}`);
        setTimeout(() => this.joinRoom(room), 1000 + Math.random() * 2000);
      }
    }
  }

  /**
   * Join a room with a bot
   */
  private async joinRoom(room: any) {
    // Don't join if already have a bot in this room
    if (this.activeBots.has(room.id)) {
      return;
    }

    // Get available bot (not host)
    const availableBot = this.botAccounts.find(bot => bot.id !== room.host_id);
    if (!availableBot) {
      console.log('❌ No available bots');
      return;
    }

    try {
      console.log(`🤖 Bot ${availableBot.username} joining room ${room.id}`);

      // Join room
      const { error: joinError } = await supabase.rpc('join_game_room', {
        p_room_id: room.id,
        p_player_id: availableBot.id,
      });

      if (joinError) {
        console.error('❌ Bot failed to join room:', joinError);
        return;
      }

      this.activeBots.add(room.id);
      console.log(`✅ Bot ${availableBot.username} joined room ${room.id}`);

      // Auto-ready after 1-3 seconds
      setTimeout(() => this.markBotReady(room.id, availableBot.id), 1000 + Math.random() * 2000);

      // Start monitoring game state for this bot
      this.monitorGameForBot(room.id, availableBot.id);
    } catch (error) {
      console.error('❌ Error joining room:', error);
    }
  }

  /**
   * Mark bot as ready
   */
  private async markBotReady(roomId: string, botId: string) {
    try {
      const { error } = await supabase.rpc('toggle_player_ready', {
        p_room_id: roomId,
        p_player_id: botId,
      });

      if (!error) {
        console.log(`✅ Bot marked ready in room ${roomId}`);
      }
    } catch (error) {
      console.error('❌ Error marking bot ready:', error);
    }
  }

  /**
   * Monitor game state and make moves when needed
   */
  private async monitorGameForBot(roomId: string, botId: string) {
    // Subscribe to game state changes
    const gameSubscription = supabase
      .channel(`bot-game-${roomId}-${botId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          const room = payload.new;

          if (room.status === 'blind') {
            await this.handleBlindPhase(roomId, botId);
          } else if (room.status === 'live') {
            await this.handleLivePhase(roomId, botId);
          } else if (room.status === 'finished') {
            gameSubscription.unsubscribe();
            this.activeBots.delete(roomId);
          }
        }
      )
      .subscribe();
  }

  /**
   * Handle blind phase moves
   */
  private async handleBlindPhase(roomId: string, botId: string) {
    console.log(`🤖 Bot making blind moves in room ${roomId}`);

    // Check if already submitted
    const { data: existingMoves } = await supabase
      .from('game_blind_moves')
      .select('*')
      .eq('game_id', roomId)
      .eq('player_id', botId)
      .eq('is_submitted', true);

    if (existingMoves && existingMoves.length > 0) {
      console.log('✅ Bot already submitted blind moves');
      return;
    }

    // Get player color
    const { data: playerData } = await supabase
      .from('game_room_players')
      .select('player_color')
      .eq('room_id', roomId)
      .eq('player_id', botId)
      .single();

    if (!playerData) return;

    const color = playerData.player_color as 'white' | 'black';
    const chess = new Chess();
    const moves: string[] = [];

    // Generate 5 random but valid moves
    for (let i = 0; i < 5; i++) {
      const possibleMoves = chess.moves();
      if (possibleMoves.length === 0) break;

      // Choose random move
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      moves.push(randomMove);
      chess.move(randomMove);
    }

    // Submit moves
    try {
      const { error } = await supabase.rpc('submit_blind_moves', {
        p_game_id: roomId,
        p_player_id: botId,
        p_moves: moves,
      });

      if (!error) {
        console.log(`✅ Bot submitted ${moves.length} blind moves:`, moves);
      } else {
        console.error('❌ Failed to submit bot moves:', error);
      }
    } catch (error) {
      console.error('❌ Error submitting bot moves:', error);
    }
  }

  /**
   * Handle live phase moves
   */
  private async handleLivePhase(roomId: string, botId: string) {
    console.log(`🤖 Bot playing live phase in room ${roomId}`);

    // Subscribe to game state and make moves when it's bot's turn
    const liveSubscription = supabase
      .channel(`bot-live-${roomId}-${botId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_live_state',
          filter: `game_id=eq.${roomId}`,
        },
        async (payload) => {
          await this.makeLiveMove(roomId, botId, payload.new);
        }
      )
      .subscribe();

    // Make initial move if it's bot's turn
    setTimeout(() => this.checkAndMakeLiveMove(roomId, botId), 2000);
  }

  /**
   * Check if it's bot's turn and make a move
   */
  private async checkAndMakeLiveMove(roomId: string, botId: string) {
    const { data: gameState } = await supabase
      .from('game_live_state')
      .select('*')
      .eq('game_id', roomId)
      .single();

    if (gameState) {
      await this.makeLiveMove(roomId, botId, gameState);
    }
  }

  /**
   * Make a live move
   */
  private async makeLiveMove(roomId: string, botId: string, gameState: any) {
    // Get player color
    const { data: playerData } = await supabase
      .from('game_room_players')
      .select('player_color')
      .eq('room_id', roomId)
      .eq('player_id', botId)
      .single();

    if (!playerData) return;

    const botColor = playerData.player_color;
    const currentTurn = gameState.current_turn;

    // Check if it's bot's turn
    if (botColor !== currentTurn) {
      return;
    }

    // Get current position
    const chess = new Chess(gameState.current_fen || gameState.starting_fen);
    const possibleMoves = chess.moves({ verbose: true });

    if (possibleMoves.length === 0) {
      console.log('🏁 No legal moves available');
      return;
    }

    // Choose random move (weighted towards captures)
    const captureMoves = possibleMoves.filter(m => m.captured);
    const moveToMake = captureMoves.length > 0 && Math.random() > 0.3
      ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
      : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    // Wait 1-3 seconds before moving (simulate thinking)
    setTimeout(async () => {
      try {
        const { error } = await supabase.rpc('make_live_move', {
          p_game_id: roomId,
          p_player_id: botId,
          p_from: moveToMake.from,
          p_to: moveToMake.to,
          p_promotion: moveToMake.promotion || null,
        });

        if (!error) {
          console.log(`✅ Bot made move: ${moveToMake.san}`);
        }
      } catch (error) {
        console.error('❌ Error making bot move:', error);
      }
    }, 1000 + Math.random() * 2000);
  }

  /**
   * Stop the bot service
   */
  stop() {
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
    this.activeBots.clear();
    console.log('🛑 Bot service stopped');
  }
}

export const botPlayerService = new BotPlayerService();
