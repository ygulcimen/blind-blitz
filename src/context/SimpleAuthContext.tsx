// src/context/SimpleAuthContext.tsx - New auth context using simple auth service
import React, { createContext, useContext, useEffect, useState } from 'react';
import { simpleAuthService, type SessionData } from '../services/simpleAuthService';
import { guestAuthService, type GuestPlayer } from '../services/guestAuthService';

interface SimpleAuthContextType {
  sessionData: SessionData | null;
  guestPlayer: GuestPlayer | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  setGuestPlayer: (player: GuestPlayer | null) => void;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [guestPlayer, setGuestPlayer] = useState<GuestPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for authenticated session first
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    try {
      console.log('🔍 SimpleAuthContext: Checking session...');
      const sessionToken = localStorage.getItem('session_token');
      console.log('🔍 SimpleAuthContext: Session token in localStorage:', sessionToken ? 'EXISTS' : 'NULL');

      const session = await simpleAuthService.verifySession();

      if (session) {
        // Valid session found
        console.log('✅ SimpleAuthContext: Valid session found:', session.username);
        setSessionData(session);
        setGuestPlayer(null); // Clear guest if auth user exists
      } else {
        console.log('❌ SimpleAuthContext: No valid session');
        // No valid session, check for guest
        const currentGuestPlayer = guestAuthService.getCurrentGuestPlayer();
        if (currentGuestPlayer) {
          console.log('🎮 Guest player found:', currentGuestPlayer.username);
          setGuestPlayer(currentGuestPlayer);
        } else {
          console.log('❌ No guest player either');
        }
      }
    } catch (error) {
      console.error('❌ Error checking auth session:', error);
    } finally {
      console.log('🏁 SimpleAuthContext: Loading complete. isAuthenticated:', sessionData !== null || guestPlayer !== null);
      setLoading(false);
    }
  };

  const signOut = async () => {
    await simpleAuthService.signOut();

    // Clear guest session if exists
    if (guestPlayer) {
      guestAuthService.clearGuestSession();
      setGuestPlayer(null);
    }

    setSessionData(null);
  };

  const isGuest = guestPlayer !== null && sessionData === null;
  const isAuthenticated = sessionData !== null || guestPlayer !== null;

  return (
    <SimpleAuthContext.Provider
      value={{
        sessionData,
        guestPlayer,
        isGuest,
        isAuthenticated,
        loading,
        setGuestPlayer,
        signOut,
      }}
    >
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within SimpleAuthProvider');
  }
  return context;
};
