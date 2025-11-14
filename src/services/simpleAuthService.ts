// src/services/simpleAuthService.ts
// Simple username + password authentication (no email required!)

import { supabase } from '../lib/supabase';

export interface AuthResult {
  success: boolean;
  playerId?: string;
  username?: string;
  sessionToken?: string;
  error?: string;
}

export interface SessionData {
  playerId: string;
  username: string;
  email?: string;
}

// Hash password using SHA-256 (client-side)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Sign up with username + password (NO EMAIL!)
export async function signUpWithUsername(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase.rpc('signup_with_username', {
      p_username: username,
      p_password_hash: passwordHash,
    });

    if (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.message.includes('already taken')
          ? 'Username already taken'
          : 'Signup failed. Please try again.',
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Signup failed. Please try again.',
      };
    }

    const result = data[0];

    // Store session token in localStorage
    localStorage.setItem('session_token', result.session_token);
    localStorage.setItem('player_id', result.player_id);
    localStorage.setItem('username', result.username);

    return {
      success: true,
      playerId: result.player_id,
      username: result.username,
      sessionToken: result.session_token,
    };
  } catch (err) {
    console.error('Signup exception:', err);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}

// Sign in with username + password
export async function signInWithUsername(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase.rpc('signin_with_username', {
      p_username: username,
      p_password_hash: passwordHash,
    });

    if (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message.includes('Invalid')
          ? 'Invalid username or password'
          : 'Sign in failed. Please try again.',
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Sign in failed. Please try again.',
      };
    }

    const result = data[0];

    // Store session token in localStorage
    localStorage.setItem('session_token', result.session_token);
    localStorage.setItem('player_id', result.player_id);
    localStorage.setItem('username', result.username);

    return {
      success: true,
      playerId: result.player_id,
      username: result.username,
      sessionToken: result.session_token,
    };
  } catch (err) {
    console.error('Sign in exception:', err);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}

// Verify current session
export async function verifySession(): Promise<SessionData | null> {
  try {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      console.log('❌ No session token in localStorage');
      return null;
    }

    console.log('🔍 Calling verify_session with token:', sessionToken.substring(0, 10) + '...');

    const { data, error } = await supabase.rpc('verify_session', {
      p_session_token: sessionToken,
    });

    if (error) {
      console.error('❌ verify_session RPC error:', error);
      clearSession();
      return null;
    }

    if (!data || data.length === 0) {
      console.log('❌ No data returned from verify_session');
      clearSession();
      return null;
    }

    const result = data[0];
    console.log('✅ verify_session result:', result);

    if (!result.is_valid) {
      console.log('❌ Session is not valid');
      clearSession();
      return null;
    }

    return {
      playerId: result.player_id,
      username: result.username,
      email: result.email,
    };
  } catch (err) {
    console.error('❌ Session verification exception:', err);
    clearSession();
    return null;
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
      await supabase.rpc('signout_session', {
        p_session_token: sessionToken,
      });
    }
  } catch (err) {
    console.error('Sign out error:', err);
  } finally {
    clearSession();
  }
}

// Clear session from localStorage
function clearSession(): void {
  localStorage.removeItem('session_token');
  localStorage.removeItem('player_id');
  localStorage.removeItem('username');
}

// Get current session token
export function getSessionToken(): string | null {
  return localStorage.getItem('session_token');
}

// Check if user is signed in
export function isSignedIn(): boolean {
  return localStorage.getItem('session_token') !== null;
}

export const simpleAuthService = {
  signUpWithUsername,
  signInWithUsername,
  verifySession,
  signOut,
  getSessionToken,
  isSignedIn,
  clearSession,
};
