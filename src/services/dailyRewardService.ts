import { supabase } from '../lib/supabase';

export interface DailyRewardResult {
  success: boolean;
  reward?: number;
  new_balance?: number;
  next_claim_at?: string;
  reason?: string;
  time_remaining?: string;
}

export interface DailyRewardStatus {
  can_claim: boolean;
  next_claim_at?: string;
  time_remaining?: string;
  reason?: string;
}

export const dailyRewardService = {
  // Check if player can claim without claiming
  async canClaimDaily(playerId: string): Promise<DailyRewardStatus | null> {
    try {
      const { data, error } = await supabase.rpc('can_claim_daily_reward', {
        p_player_id: playerId,
      });

      if (error) {
        console.error('Error checking daily reward status:', error);
        return null;
      }

      return data as DailyRewardStatus;
    } catch (error) {
      console.error('Exception checking daily reward:', error);
      return null;
    }
  },

  // Claim the daily reward
  async claimDailyReward(playerId: string): Promise<DailyRewardResult | null> {
    try {
      const { data, error } = await supabase.rpc('claim_daily_reward', {
        p_player_id: playerId,
      });

      if (error) {
        console.error('Error claiming daily reward:', error);
        return null;
      }

      return data as DailyRewardResult;
    } catch (error) {
      console.error('Exception claiming daily reward:', error);
      return null;
    }
  },

  // Format time remaining into human-readable format
  formatTimeRemaining(timeRemaining: string): string {
    const match = timeRemaining.match(/(\d+):(\d+):(\d+)/);
    if (!match) return timeRemaining;

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },
};
