import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface PlayerData {
  id: string;
  username: string;
  email: string;
  gold_balance: number;
  rating: number;
  level: number;
  xp: number;
  games_played: number;
  wins: number;
  losses: number;
}

export const useCurrentUser = () => {
  const { user } = useAuth();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
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
  }, [user]);

  return { playerData, loading, user };
};
