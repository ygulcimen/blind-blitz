// src/services/guestAuthService.ts
// Guest authentication service - allows users to play without signing up

import { supabase } from '../lib/supabase';

const GUEST_TOKEN_KEY = 'blindblitz_guest_token';
const GUEST_PLAYER_KEY = 'blindblitz_guest_player';

export interface GuestPlayer {
  id: string;
  username: string;
  guestToken: string;
  goldBalance: number;
  isNew: boolean;
}

export interface ConversionResult {
  success: boolean;
  playerId?: string;
  message: string;
}

/**
 * Generate a unique guest token
 */
function generateGuestToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `guest_${timestamp}_${random}`;
}

/**
 * Get guest token from localStorage or create new one
 */
export function getOrCreateGuestToken(): string {
  let token = localStorage.getItem(GUEST_TOKEN_KEY);

  if (!token) {
    token = generateGuestToken();
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }

  return token;
}

/**
 * Create or retrieve guest player
 */
export async function createGuestSession(): Promise<{
  success: boolean;
  player?: GuestPlayer;
  error?: string;
}> {
  try {
    const guestToken = getOrCreateGuestToken();

    console.log('🎮 Creating guest session with token:', guestToken);

    // Call Supabase function to get or create guest player
    const { data, error } = await supabase.rpc('get_or_create_guest_player', {
      p_guest_token: guestToken,
    });

    if (error) {
      console.error('❌ Error creating guest session:', error);
      return {
        success: false,
        error: error.message || 'Failed to create guest session',
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No guest player data returned',
      };
    }

    const playerData = data[0];
    const guestPlayer: GuestPlayer = {
      id: playerData.player_id,
      username: playerData.username,
      guestToken: playerData.guest_token,
      goldBalance: playerData.gold_balance,
      isNew: playerData.is_new,
    };

    // Store guest player info in localStorage
    localStorage.setItem(GUEST_PLAYER_KEY, JSON.stringify(guestPlayer));

    console.log('✅ Guest session created:', guestPlayer);

    return {
      success: true,
      player: guestPlayer,
    };
  } catch (error: any) {
    console.error('💥 Exception creating guest session:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error',
    };
  }
}

/**
 * Get current guest player from localStorage
 */
export function getCurrentGuestPlayer(): GuestPlayer | null {
  try {
    const stored = localStorage.getItem(GUEST_PLAYER_KEY);
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing guest player data:', error);
    return null;
  }
}

/**
 * Check if user is currently a guest
 */
export function isGuestSession(): boolean {
  return localStorage.getItem(GUEST_TOKEN_KEY) !== null;
}

/**
 * Convert guest account to registered account
 */
export async function convertGuestToRegistered(
  authUserId: string,
  newUsername: string,
  email: string
): Promise<ConversionResult> {
  try {
    const guestToken = localStorage.getItem(GUEST_TOKEN_KEY);

    if (!guestToken) {
      return {
        success: false,
        message: 'No guest session found',
      };
    }

    console.log('🔄 Converting guest to registered user...');

    // Call Supabase function to convert guest
    const { data, error } = await supabase.rpc('convert_guest_to_registered', {
      p_guest_token: guestToken,
      p_auth_user_id: authUserId,
      p_new_username: newUsername,
      p_email: email,
    });

    if (error) {
      console.error('❌ Error converting guest:', error);
      return {
        success: false,
        message: error.message || 'Failed to convert guest account',
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'No conversion data returned',
      };
    }

    const result = data[0];

    if (result.success) {
      // Clear guest data from localStorage
      clearGuestSession();

      console.log('✅ Guest converted successfully:', result.message);
    }

    return {
      success: result.success,
      playerId: result.player_id,
      message: result.message,
    };
  } catch (error: any) {
    console.error('💥 Exception converting guest:', error);
    return {
      success: false,
      message: error.message || 'Unexpected error during conversion',
    };
  }
}

/**
 * Clear guest session data
 */
export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_TOKEN_KEY);
  localStorage.removeItem(GUEST_PLAYER_KEY);
  console.log('🧹 Guest session cleared');
}

/**
 * Get guest player stats for display
 */
export async function getGuestPlayerStats(playerId: string): Promise<{
  gamesPlayed: number;
  wins: number;
  goldEarned: number;
} | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('games_played, wins, gold_balance')
      .eq('id', playerId)
      .eq('is_guest', true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      gamesPlayed: data.games_played || 0,
      wins: data.wins || 0,
      goldEarned: (data.gold_balance || 500) - 500, // Subtract starting gold
    };
  } catch (error) {
    console.error('Error fetching guest stats:', error);
    return null;
  }
}

/**
 * Check if guest should see conversion prompt
 * (After 1-2 games or when they try to access restricted feature)
 */
export function shouldShowConversionPrompt(): boolean {
  const guestPlayer = getCurrentGuestPlayer();
  if (!guestPlayer) return false;

  // Check localStorage for last prompt time
  const lastPromptKey = 'blindblitz_last_conversion_prompt';
  const lastPrompt = localStorage.getItem(lastPromptKey);

  if (!lastPrompt) {
    // Never shown before
    return true;
  }

  // Show again after 24 hours
  const lastPromptTime = parseInt(lastPrompt);
  const hoursSinceLastPrompt = (Date.now() - lastPromptTime) / (1000 * 60 * 60);

  return hoursSinceLastPrompt >= 24;
}

/**
 * Mark conversion prompt as shown
 */
export function markConversionPromptShown(): void {
  localStorage.setItem('blindblitz_last_conversion_prompt', Date.now().toString());
}

export const guestAuthService = {
  getOrCreateGuestToken,
  createGuestSession,
  getCurrentGuestPlayer,
  isGuestSession,
  convertGuestToRegistered,
  clearGuestSession,
  getGuestPlayerStats,
  shouldShowConversionPrompt,
  markConversionPromptShown,
};
