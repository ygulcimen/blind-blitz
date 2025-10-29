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
      // Handle guest players
      if (isGuest && guestPlayer) {
        console.log('🎮 Loading guest player data:', guestPlayer);
        setPlayerData({
          id: guestPlayer.id,
          username: guestPlayer.username,
          email: '', // Guests don't have email
          gold_balance: guestPlayer.goldBalance,
          rating: 1200, // Default guest rating
          games_played: 0,
          wins: 0,
          losses: 0,
        });
        setLoading(false);
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
  }, [user, guestPlayer, isGuest]);

  return { playerData, loading, user };
};
