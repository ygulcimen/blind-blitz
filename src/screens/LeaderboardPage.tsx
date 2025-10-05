import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  player_id: string;
  username: string;
  gold_balance: number;
  rating: number;
  games_played: number;
  wins: number;
}

interface PlayerRank {
  success: boolean;
  rank?: number;
  gold?: number;
  total_players?: number;
  percentile?: number;
}

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<PlayerRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchPlayerRank();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc('get_gold_leaderboard');

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Exception fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerRank = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_player_gold_rank', {
        p_player_id: user.id,
      });

      if (error) {
        console.error('Error fetching player rank:', error);
        return;
      }

      setPlayerRank(data);
    } catch (error) {
      console.error('Exception fetching player rank:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Gold Leaderboard</h1>
          </div>
          <div className="text-gray-400 text-sm">
            Top {leaderboard.length} players
          </div>
        </div>

        {/* Your Rank Card (Compact) */}
        {playerRank && playerRank.rank && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-white text-sm font-medium">
                    Your Rank: #{playerRank.rank?.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Top {playerRank.percentile}%
                  </div>
                </div>
              </div>
              <div className="text-yellow-400 font-bold">
                {playerRank.gold?.toLocaleString()} 🪙
              </div>
            </div>
          </div>
        )}

        {/* Compact Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-800">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-right">Rating</div>
          <div className="col-span-2 text-right">Games</div>
          <div className="col-span-2 text-right">Gold</div>
        </div>

        {/* Compact Leaderboard Rows */}
        <div className="space-y-1">
          {leaderboard.map((entry) => {
            const isCurrentPlayer = user?.id === entry.player_id;
            const isTopThree = entry.rank <= 3;

            return (
              <div
                key={entry.player_id}
                className={`grid grid-cols-12 gap-2 px-4 py-3 rounded-lg transition-all ${
                  isCurrentPlayer
                    ? 'bg-blue-900/30 border border-blue-700/50'
                    : isTopThree
                    ? 'bg-gray-900/70 hover:bg-gray-800/70'
                    : 'bg-gray-900/30 hover:bg-gray-900/50'
                }`}
              >
                {/* Rank */}
                <div
                  className={`col-span-1 flex items-center font-bold ${getRankColor(
                    entry.rank
                  )}`}
                >
                  {getRankIcon(entry.rank)}
                </div>

                {/* Username */}
                <div className="col-span-5 flex items-center gap-2">
                  <span className="text-white font-medium truncate">
                    {entry.username}
                  </span>
                  {isCurrentPlayer && (
                    <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                      YOU
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="col-span-2 flex items-center justify-end text-gray-300">
                  {entry.rating}
                </div>

                {/* Games */}
                <div className="col-span-2 flex items-center justify-end text-gray-400 text-sm">
                  {entry.games_played}
                </div>

                {/* Gold */}
                <div className="col-span-2 flex items-center justify-end text-yellow-400 font-bold">
                  {entry.gold_balance.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No players found
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
