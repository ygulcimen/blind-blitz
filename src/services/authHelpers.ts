// src/services/authHelpers.ts
// Helper functions to support both old Supabase Auth and new SimpleAuth

import { supabase } from '../lib/supabase';
import { guestAuthService } from './guestAuthService';

/**
 * Get current player ID from either:
 * 1. New SimpleAuth session (session_token in localStorage)
 * 2. Old Supabase Auth (supabase.auth.getUser())
 * 3. Guest player (localStorage guest data)
 *
 * Returns null if no auth found
 */
export async function getCurrentPlayerId(): Promise<string | null> {
  // 1. Check for new SimpleAuth session token
  const sessionToken = localStorage.getItem('session_token');
  if (sessionToken) {
    const playerId = localStorage.getItem('player_id');
    if (playerId) {
      console.log('🔑 Using SimpleAuth player ID:', playerId);
      return playerId;
    }
  }

  // 2. Check for old Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log('🔑 Using Supabase Auth player ID:', user.id);
    return user.id;
  }

  // 3. Check for guest player
  const guestPlayer = guestAuthService.getCurrentGuestPlayer();
  if (guestPlayer?.id) {
    console.log('🔑 Using guest player ID:', guestPlayer.id);
    return guestPlayer.id;
  }

  console.log('❌ No player ID found');
  return null;
}

/**
 * Get current username from either auth system
 */
export async function getCurrentUsername(): Promise<string | null> {
  // 1. Check for new SimpleAuth
  const sessionToken = localStorage.getItem('session_token');
  if (sessionToken) {
    const username = localStorage.getItem('username');
    if (username) {
      return username;
    }
  }

  // 2. Check for old Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return user.user_metadata?.username || user.email || null;
  }

  // 3. Check for guest player
  const guestPlayer = guestAuthService.getCurrentGuestPlayer();
  return guestPlayer?.username || null;
}

/**
 * Check if user is authenticated (any auth system)
 */
export async function isAuthenticated(): Promise<boolean> {
  const playerId = await getCurrentPlayerId();
  return playerId !== null;
}
