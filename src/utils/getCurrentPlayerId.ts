// utils/getCurrentPlayerId.ts
// Helper function to get current player ID (authenticated or guest)
// NOTE: This is a legacy file. Prefer using getCurrentPlayerId from '../services/authHelpers'
// which supports SimpleAuth, Supabase Auth, and Guest sessions.

import { supabase } from '../lib/supabase';
import { guestAuthService } from '../services/guestAuthService';

/**
 * Get the current player ID, checking SimpleAuth, Supabase Auth, and guest sessions
 * @returns Player UUID or null if no session found
 * @deprecated Use getCurrentPlayerId from '../services/authHelpers' instead
 */
export async function getCurrentPlayerId(): Promise<string | null> {
  try {
    // 1. Check for new SimpleAuth session token
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
      const playerId = localStorage.getItem('player_id');
      if (playerId) {
        console.log('🔑 Using SimpleAuth player ID:', playerId);
        return playerId;
      }
    }

    // 2. Try old Supabase Auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      console.log('🔑 Using Supabase Auth player ID:', user.id);
      return user.id;
    }

    // 3. If no authenticated user, check for guest player
    const guestPlayer = guestAuthService.getCurrentGuestPlayer();
    if (guestPlayer) {
      console.log('🔑 Using guest player ID:', guestPlayer.id);
      return guestPlayer.id;
    }

    console.log('❌ No player ID found');
    return null;
  } catch (error) {
    console.error('Error getting current player ID:', error);
    return null;
  }
}
