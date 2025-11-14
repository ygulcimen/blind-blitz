import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSimpleAuth } from '../context/SimpleAuthContext';
import { supabase } from '../lib/supabase';

interface PlayerData {
  id: string;
  username: string;
  email: string;
  gold_balance: number;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
}

export const useCurrentUser = () => {
  const { user, guestPlayer: oldGuestPlayer, isGuest: oldIsGuest } = useAuth();
  const { sessionData, guestPlayer: newGuestPlayer, isGuest: newIsGuest } = useSimpleAuth();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Use new auth data if available, otherwise fall back to old auth
  const currentGuestPlayer = newGuestPlayer || oldGuestPlayer;
  const isGuest = newIsGuest || oldIsGuest;

  useEffect(() => {
    const fetchPlayerData = async () => {
      console.log('🔍 useCurrentUser: Fetching player data...');
      console.log('  sessionData:', sessionData);
      console.log('  user:', user);
      console.log('  currentGuestPlayer:', currentGuestPlayer);
      console.log('  isGuest:', isGuest);

      // Handle guest players - fetch from database, not localStorage
      if (isGuest && currentGuestPlayer) {
        console.log('🎮 Loading guest player data from database:', currentGuestPlayer);
        try {
          const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', currentGuestPlayer.id)
            .single();

          if (error) {
            console.error('Error fetching guest player data:', error);
            // Fallback to cached data if database fetch fails
            setPlayerData({
              id: currentGuestPlayer.id,
              username: currentGuestPlayer.username,
              email: '',
              gold_balance: currentGuestPlayer.goldBalance,
              rating: 1200,
              games_played: 0,
              wins: 0,
              losses: 0,
            });
          } else {
            console.log('✅ Guest player data fetched from database:', data);
            setPlayerData(data);
          }
        } catch (error) {
          console.error('Error:', error);
          // Fallback to cached data
          setPlayerData({
            id: currentGuestPlayer.id,
            username: currentGuestPlayer.username,
            email: '',
            gold_balance: currentGuestPlayer.goldBalance,
            rating: 1200,
            games_played: 0,
            wins: 0,
            losses: 0,
          });
        } finally {
          setLoading(false);
        }
        return;
      }

      // Handle simple auth users (new auth system)
      if (sessionData && sessionData.playerId) {
        console.log('✅ Using SimpleAuth session data, fetching player:', sessionData.playerId);
        try {
          const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', sessionData.playerId)
            .single();

          if (error) {
            console.error('❌ Error fetching player data for simple auth:', error);
          } else {
            console.log('✅ Player data fetched successfully:', data);
            setPlayerData(data);
          }
        } catch (error) {
          console.error('❌ Error:', error);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Handle regular authenticated users (old Supabase auth)
      if (user) {
        console.log('✅ Using old Supabase auth, fetching player:', user.id);
        try {
          const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching player data:', error);
          } else {
            setPlayerData(data);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
        return;
      }

      // No auth at all
      console.log('❌ No auth found, setting null');
      setPlayerData(null);
      setLoading(false);
    };

    fetchPlayerData();

    // Set up real-time subscription for player data updates
    const currentPlayerId = sessionData?.playerId || (isGuest ? currentGuestPlayer?.id : user?.id);
    if (!currentPlayerId) {
      console.log('❌ No player ID for real-time subscription');
      return;
    }

    console.log('📡 Setting up real-time subscription for player:', currentPlayerId);

    const channel = supabase
      .channel(`player-updates-${currentPlayerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `id=eq.${currentPlayerId}`,
        },
        (payload) => {
          console.log('🔔 Player data updated in real-time:', payload.new);
          setPlayerData(payload.new as PlayerData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentGuestPlayer, isGuest, sessionData]);

  return { playerData, loading, user };
};
