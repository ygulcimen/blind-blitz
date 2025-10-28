import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Crown, Medal, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

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

const ITEMS_PER_PAGE = 50;

export const LeaderboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [allPlayers, setAllPlayers] = useState<LeaderboardEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<PlayerRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchPlayerRank();
    }
  }, [user]);

  useEffect(() => {
    // Update displayed leaderboard when page changes
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setLeaderboard(allPlayers.slice(startIndex, endIndex));
  }, [currentPage, allPlayers]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc('get_gold_leaderboard');

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      setAllPlayers(data || []);
      setLeaderboard((data || []).slice(0, ITEMS_PER_PAGE));
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
        <div className="text-white">{t('leaderboard.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('leaderboard.title')}</h1>
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">
            {allPlayers.length > 0 && (
              <>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, allPlayers.length)} of {allPlayers.length}
              </>
            )}
          </div>
        </div>

        {/* Your Rank Card - Mobile Responsive */}
        {playerRank && playerRank.rank && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                <div>
                  <div className="text-white text-xs sm:text-sm font-medium">
                    {t('leaderboard.yourRank')} #{playerRank.rank?.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-[10px] sm:text-xs">
                    {t('leaderboard.topPercentile')}{playerRank.percentile}%
                  </div>
                </div>
              </div>
              <div className="text-yellow-400 text-sm sm:text-base font-bold">
                {playerRank.gold?.toLocaleString()} 🪙
              </div>
            </div>
          </div>
        )}

        {/* Compact Table Header - Mobile: Hide Games column */}
        <div className="grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-xs text-gray-500 font-medium border-b border-gray-800">
          <div className="col-span-1">{t('leaderboard.rank')}</div>
          <div className="col-span-6 sm:col-span-5">{t('leaderboard.player')}</div>
          <div className="col-span-2 text-right hidden sm:block">{t('leaderboard.rating')}</div>
          <div className="col-span-2 text-right hidden md:block">{t('leaderboard.games')}</div>
          <div className="col-span-3 sm:col-span-2 text-right">{t('profile.stats.gold')}</div>
        </div>

        {/* Compact Leaderboard Rows - Mobile Responsive */}
        <div className="space-y-0.5 sm:space-y-1">
          {leaderboard.map((entry) => {
            const isCurrentPlayer = user?.id === entry.player_id;
            const isTopThree = entry.rank <= 3;

            return (
              <div
                key={entry.player_id}
                className={`grid grid-cols-12 gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all ${
                  isCurrentPlayer
                    ? 'bg-blue-900/30 border border-blue-700/50'
                    : isTopThree
                    ? 'bg-gray-900/70 hover:bg-gray-800/70'
                    : 'bg-gray-900/30 hover:bg-gray-900/50'
                }`}
              >
                {/* Rank */}
                <div
                  className={`col-span-1 flex items-center text-xs sm:text-base font-bold ${getRankColor(
                    entry.rank
                  )}`}
                >
                  {getRankIcon(entry.rank)}
                </div>

                {/* Username - Wider on mobile */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-1 sm:gap-2 min-w-0">
                  <span className="text-white text-xs sm:text-base font-medium truncate">
                    {entry.username}
                  </span>
                  {isCurrentPlayer && (
                    <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                      {t('leaderboard.you')}
                    </span>
                  )}
                </div>

                {/* Rating - Hidden on mobile */}
                <div className="col-span-2 items-center justify-end text-gray-300 text-xs sm:text-base hidden sm:flex">
                  {entry.rating}
                </div>

                {/* Games - Hidden on mobile & tablet */}
                <div className="col-span-2 items-center justify-end text-gray-400 text-xs sm:text-sm hidden md:flex">
                  {entry.games_played}
                </div>

                {/* Gold */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end text-yellow-400 text-xs sm:text-base font-bold">
                  {entry.gold_balance.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            {t('leaderboard.noPlayers')}
          </div>
        )}

        {/* Pagination Controls */}
        {allPlayers.length > ITEMS_PER_PAGE && (
          <div className="mt-6 flex items-center justify-between px-2 sm:px-4 py-3 bg-gray-900/30 border border-gray-800 rounded-lg">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentPage === 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-white bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <span className="text-white font-medium">
                Page {currentPage} of {Math.ceil(allPlayers.length / ITEMS_PER_PAGE)}
              </span>
              <span className="hidden sm:inline text-gray-500">
                ({allPlayers.length} total players)
              </span>
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(Math.ceil(allPlayers.length / ITEMS_PER_PAGE), p + 1)
                )
              }
              disabled={currentPage === Math.ceil(allPlayers.length / ITEMS_PER_PAGE)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentPage === Math.ceil(allPlayers.length / ITEMS_PER_PAGE)
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-white bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
