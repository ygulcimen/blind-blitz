// services/goldRewardsService.ts - FIXED to match actual Supabase functions
import { supabase } from '../lib/supabase';

export interface BlindPhaseReward {
  game_id: string;
  player_id: string;
  move_number: number;
  move_type:
    | 'valid'
    | 'invalid'
    | 'capture'
    | 'opponent_bonus'
    | 'calculated_total';
  gold_amount: number;
  entry_fee: number;
  move_from?: string;
  move_to?: string;
  move_san?: string;
  created_at: string;
}

export interface BlindPhaseResults {
  white_player_id: string;
  black_player_id: string;
  white_total_gold: number;
  black_total_gold: number;
  remaining_pot: number;
  rewards: BlindPhaseReward[];
  game_mode: string;
}

export const goldRewardsService = {
  // ✅ FIXED: Use the correct function name that exists in your Supabase
  async getBlindPhaseResults(
    gameId: string
  ): Promise<BlindPhaseResults | null> {
    try {
      console.log('🏆 Getting blind phase results...');

      // ✅ Use the actual function that exists: get_blind_rewards
      const { data: totals, error: totalsError } = await supabase.rpc(
        'get_blind_rewards',
        { p_game_id: gameId }
      );

      if (totalsError || !totals?.[0]) {
        console.error('❌ Failed to get blind phase totals:', totalsError);
        return null;
      }

      const result = totals[0];
      console.log('✅ Received reward totals:', result);

      // Get game mode from room
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('game_mode, entry_fee')
        .eq('id', gameId)
        .single();

      const gameMode = room?.game_mode || 'classic';

      // For RoboChaos mode, return simple result
      if (gameMode === 'robot_chaos') {
        return {
          white_player_id: result.white_player_id,
          black_player_id: result.black_player_id,
          white_total_gold: 0,
          black_total_gold: 0,
          remaining_pot: result.remaining_pot,
          rewards: [],
          game_mode: 'robot_chaos',
        };
      }

      // Get detailed rewards for classic mode
      const { data: rewards, error: rewardsError } = await supabase
        .from('blind_phase_rewards')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (rewardsError) {
        console.error('❌ Failed to get blind phase rewards:', rewardsError);
        // Don't return null here, just continue with empty rewards
      }

      return {
        white_player_id: result.white_player_id,
        black_player_id: result.black_player_id,
        white_total_gold: result.white_total_gold,
        black_total_gold: result.black_total_gold,
        remaining_pot: result.remaining_pot,
        rewards: rewards || [],
        game_mode: 'classic',
      };
    } catch (error) {
      console.error('💥 Error getting blind phase results:', error);
      return null;
    }
  },

  // ✅ This one is correct - uses get_blind_rewards which exists
  async getRemainingPot(gameId: string): Promise<number> {
    try {
      console.log('💰 Getting remaining pot...');

      const { data: results, error } = await supabase.rpc('get_blind_rewards', {
        p_game_id: gameId,
      });

      if (error || !results?.[0]) {
        console.error('❌ Failed to get remaining pot:', error);

        // Fallback: calculate from room data
        const { data: room } = await supabase
          .from('game_rooms')
          .select('entry_fee')
          .eq('id', gameId)
          .single();

        const fallbackPot = room ? Math.floor(room.entry_fee * 2 * 0.95) : 0;
        console.log('🔄 Using fallback pot calculation:', fallbackPot);
        return fallbackPot;
      }

      console.log('✅ Remaining pot:', results[0].remaining_pot);
      return results[0].remaining_pot || 0;
    } catch (error) {
      console.error('💥 Exception getting remaining pot:', error);
      return 0;
    }
  },

  // ✅ Wait for rewards to be saved before proceeding
  async waitForRewardsToBeCalculated(
    gameId: string,
    maxAttempts = 10
  ): Promise<BlindPhaseResults | null> {
    console.log('⏳ Waiting for rewards to be calculated...');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts} to get rewards...`);

      const results = await this.getBlindPhaseResults(gameId);

      if (
        results &&
        (results.white_total_gold !== 0 || results.black_total_gold !== 0)
      ) {
        console.log('✅ Rewards found!', results);
        return results;
      }

      // Wait 500ms before trying again
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.warn('⚠️ Timeout waiting for rewards, using fallback');
    return await this.getBlindPhaseResults(gameId);
  },

  // Subscribe to gold changes
  subscribeToGoldUpdates(
    gameId: string,
    callback: (results: BlindPhaseResults) => void
  ) {
    const channel = supabase
      .channel(`gold-updates-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blind_phase_rewards',
          filter: `game_id=eq.${gameId}`,
        },
        async () => {
          console.log('🔄 Blind phase rewards changed, refreshing...');
          const results = await this.getBlindPhaseResults(gameId);
          if (results) callback(results);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};
