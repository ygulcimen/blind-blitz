import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { analytics, setUserProperties } from '../lib/analytics';
import { guestAuthService, type GuestPlayer } from '../services/guestAuthService';

interface AuthContextType {
  user: User | null;
  guestPlayer: GuestPlayer | null;
  isGuest: boolean;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestPlayer, setGuestPlayer] = useState<GuestPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // IMPORTANT: Check for real auth session FIRST
    // Guest mode should only be used if no authenticated user exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Only check for guest session if no authenticated user
      if (!currentUser) {
        const currentGuestPlayer = guestAuthService.getCurrentGuestPlayer();
        if (currentGuestPlayer) {
          console.log('🎮 Guest player found in localStorage:', currentGuestPlayer);
          setGuestPlayer(currentGuestPlayer);
        }
      } else {
        // Clear guest session if authenticated user exists
        console.log('✅ Authenticated user found, clearing guest session');
        guestAuthService.clearGuestSession();
        setGuestPlayer(null);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      // Clear guest session if user logs in
      if (currentUser) {
        console.log('🔄 User logged in, clearing guest session');
        guestAuthService.clearGuestSession();
        setGuestPlayer(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    // Create player profile
    if (data.user) {
      await supabase.from('players').insert({
        id: data.user.id,
        username,
        email,
        gold_balance: 1000,
        rating: 1200,
        games_played: 0,
        wins: 0,
        losses: 0,
      });

      // Track signup
      analytics.userSignUp('email');
      setUserProperties(data.user.id, { username, signup_date: new Date().toISOString() });
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    // Clear any existing guest session before login
    guestAuthService.clearGuestSession();
    setGuestPlayer(null);

    const result = await supabase.auth.signInWithPassword({ email, password });

    // Explicitly set user state after successful login
    if (result.data.user) {
      console.log('✅ Login successful, setting user:', result.data.user.id);
      setUser(result.data.user);
      analytics.userLogin('email');
    } else if (result.error) {
      console.error('❌ Login failed:', result.error.message);
    }

    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();

    // Clear guest session if exists
    if (guestPlayer) {
      guestAuthService.clearGuestSession();
      setGuestPlayer(null);
    }

    analytics.userLogout(); // Track logout
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  const isGuest = guestPlayer !== null && user === null;

  return (
    <AuthContext.Provider value={{
      user,
      guestPlayer,
      isGuest,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
