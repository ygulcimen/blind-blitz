import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  const { user, guestPlayer, isGuest } = useAuth();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      // Handle guest players - fetch from database, not localStorage
      if (isGuest && guestPlayer) {
        console.log('🎮 Loading guest player data from database:', guestPlayer);
        try {
          const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', guestPlayer.id)
            .single();

          if (error) {
            console.error('Error fetching guest player data:', error);
            // Fallback to cached data if database fetch fails
            setPlayerData({
              id: guestPlayer.id,
              username: guestPlayer.username,
              email: '',
              gold_balance: guestPlayer.goldBalance,
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
            id: guestPlayer.id,
            username: guestPlayer.username,
            email: '',
            gold_balance: guestPlayer.goldBalance,
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

      // Handle regular authenticated users
      if (!user) {
        setPlayerData(null);
        setLoading(false);
        return;
      }

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
    };

    fetchPlayerData();

    // Set up real-time subscription for player data updates
    const currentPlayerId = isGuest ? guestPlayer?.id : user?.id;
    if (!currentPlayerId) return;

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
  }, [user, guestPlayer, isGuest]);

  return { playerData, loading, user };
};
