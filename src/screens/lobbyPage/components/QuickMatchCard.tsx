// src/screens/LobbyPage/components/QuickMatchCard.tsx
import React, { useState, useEffect } from 'react';
import { Zap, Clock, Users, Trophy, ChevronRight, Target } from 'lucide-react';

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
  const [queueCount, setQueueCount] = useState(147);
  const [successRate, setSuccessRate] = useState(94);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAvgWaitTime((prev) => {
        const newTime = prev + (Math.random() - 0.5) * 0.3;
        return Math.max(1.5, Math.min(4.8, newTime));
      });

      setQueueCount((prev) =>
        Math.max(50, prev + Math.floor(Math.random() * 21) - 10)
      );

      if (Math.random() < 0.2) {
        setSuccessRate((prev) =>
          Math.max(88, Math.min(98, prev + Math.floor(Math.random() * 3) - 1))
        );
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center mb-4">
      <div
        className="relative group w-full max-w-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Wider, Shorter Card */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-[1.01] transform">
          {/* Subtle Background Effects */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/15 rounded-full blur-lg animate-pulse delay-700" />
          </div>

          {/* Shine Effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ${
              isHovered ? 'translate-x-full' : '-translate-x-full'
            }`}
          />

          <div className="relative z-10">
            {/* Clean Single Row Layout */}
            <div className="flex items-center justify-between gap-6">
              {/* Left: Title and Icon */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-black text-xl tracking-tight">
                      QUICK MATCH
                    </h3>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                      <span className="text-white text-xs font-bold">
                        INSTANT
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
                    <span>⚔️ {onlineCount} warriors ready</span>
                  </div>
                </div>
              </div>

              {/* Center: Just Gold Entry Fee */}
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 text-center">
                <Target className="w-4 h-4 text-white/80 mx-auto mb-1" />
                <div className="text-white font-bold text-sm">50-200g</div>
                <div className="text-white/70 text-xs">entry fee</div>
              </div>

              {/* Right: Action Button - Inside Card */}
              <button
                onClick={onQuickMatch}
                className="group bg-white text-green-600 px-6 py-3 rounded-lg font-black hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-white/20 hover:scale-105 active:scale-95 transform flex items-center gap-2"
              >
                <span className="tracking-wide">BATTLE NOW</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Outer Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </div>
    </div>
  );
};
