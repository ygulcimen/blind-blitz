// src/screens/LobbyPage/components/QuickMatchCard.tsx
import React, { useState, useEffect } from 'react';
import { Zap, Clock, Users, Trophy, ChevronRight } from 'lucide-react';

interface QuickMatchCardProps {
  onQuickMatch: () => void;
  onlineCount: number;
}

export const QuickMatchCard: React.FC<QuickMatchCardProps> = ({
  onQuickMatch,
  onlineCount,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [avgWaitTime, setAvgWaitTime] = useState(3.2);

  // Simulate wait time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAvgWaitTime((prev) => {
        const newTime = prev + (Math.random() - 0.5) * 0.5;
        return Math.max(1, Math.min(5, newTime));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 mb-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ${
          isHovered ? 'translate-x-full' : '-translate-x-full'
        }`}
      />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-1">Quick Match</h3>
              <p className="text-white/80 text-sm mb-3">
                Find an opponent instantly - AI matches you with players of
                similar skill
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/60" />
                  <span className="text-white/90 text-sm">
                    {avgWaitTime.toFixed(1)}s avg wait
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-white/90 text-sm">
                    {onlineCount} in queue
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-white/60" />
                  <span className="text-white/90 text-sm">
                    Fair matchmaking
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Play Button */}
          <button
            onClick={onQuickMatch}
            className="group bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-95 flex items-center gap-2"
          >
            <span>Play Now</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/15 transition-colors">
            <div className="text-white/70 text-xs mb-1">Success Rate</div>
            <div className="text-white font-bold text-lg">94%</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/15 transition-colors">
            <div className="text-white/70 text-xs mb-1">Avg. Game Time</div>
            <div className="text-white font-bold text-lg">12 min</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/15 transition-colors">
            <div className="text-white/70 text-xs mb-1">Entry Fee</div>
            <div className="text-white font-bold text-lg">50-200g</div>
          </div>
        </div>
      </div>
    </div>
  );
};
