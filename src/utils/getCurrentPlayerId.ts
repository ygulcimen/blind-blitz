// utils/getCurrentPlayerId.ts
// Helper function to get current player ID (authenticated or guest)
import { supabase } from '../lib/supabase';
import { guestAuthService } from '../services/guestAuthService';

/**
 * Get the current player ID, checking both authenticated and guest sessions
 * @returns Player UUID or null if no session found
 */
export async function getCurrentPlayerId(): Promise<string | null> {
  try {
    // Try authenticated user first
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      return user.id;
    }

    // If no authenticated user, check for guest player
    const guestPlayer = guestAuthService.getCurrentGuestPlayer();
    if (guestPlayer) {
      return guestPlayer.id;
    }

    return null;
  } catch (error) {
    console.error('Error getting current player ID:', error);
    return null;
  }
}
