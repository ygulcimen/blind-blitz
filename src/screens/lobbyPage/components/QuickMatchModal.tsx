// src/screens/LobbyPage/components/QuickMatchModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Zap, Users, Clock, Trophy, Shield, TrendingUp } from 'lucide-react';
import { useModal } from '../../../context/ModalContext'; // ✅ NEW

interface QuickMatchModalProps {
  onClose: () => void;
  onMatchFound: (gameId: string) => void;
}

interface MatchData {
  opponent: string;
  opponentRating: number;
  gameMode: 'classic' | 'robochaos';
  timeControl: string;
  entryFee: number;
  gameId: string;
}

export const QuickMatchModal: React.FC<QuickMatchModalProps> = ({
  onClose,
  onMatchFound,
}) => {
  const { setModalOpen } = useModal();
  const [stage, setStage] = useState<'searching' | 'found' | 'error'>(
    'searching'
  );
  const [searchTime, setSearchTime] = useState(0);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [cancelRequested, setCancelRequested] = useState(false);
  useEffect(() => {
    // ✅ Lock scroll + hide nav on open
    setModalOpen(true);
    document.body.style.overflow = 'hidden';

    return () => {
      setModalOpen(false);
      document.body.style.overflow = '';
    };
  }, [setModalOpen]);

  useEffect(() => {
    // Simulate search timer
    const timer = setInterval(() => {
      setSearchTime((prev) => prev + 0.1);
    }, 100);

    // Simulate finding a match after 2-5 seconds
    const matchTimer = setTimeout(() => {
      if (!cancelRequested) {
        setStage('found');
        setMatchData({
          opponent: 'ChessKnight92',
          opponentRating: 1280,
          gameMode: Math.random() > 0.5 ? 'classic' : 'robochaos',
          timeControl: '10+5',
          entryFee: 100,
          gameId: Math.random().toString(36).substr(2, 9),
        });
      }
    }, 2000 + Math.random() * 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [cancelRequested]);

  const handleCancel = () => {
    setCancelRequested(true);
    onClose();
  };

  const handleAcceptMatch = () => {
    if (matchData) {
      onMatchFound(matchData.gameId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 p-6">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Quick Match</h3>
              <p className="text-white/80 text-sm">
                Finding your perfect opponent
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {stage === 'searching' && (
            <div className="text-center">
              {/* Animated Search Indicator */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-green-500/30 rounded-full animate-ping animation-delay-200" />
                <div className="absolute inset-4 bg-green-500/40 rounded-full animate-ping animation-delay-400" />
                <div className="absolute inset-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-pulse flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>

              <h4 className="text-xl font-semibold text-white mb-2">
                Searching for opponents...
              </h4>

              <p className="text-gray-400 mb-4">
                {searchTime.toFixed(1)}s elapsed
              </p>

              {/* Search Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">
                    Players Online
                  </div>
                  <div className="text-white font-bold">2,847</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">In Queue</div>
                  <div className="text-green-400 font-bold">342</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Avg Wait</div>
                  <div className="text-blue-400 font-bold">3.2s</div>
                </div>
              </div>

              {/* Loading Dots */}
              <div className="flex justify-center gap-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200" />
              </div>

              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cancel Search
              </button>
            </div>
          )}

          {stage === 'found' && matchData && (
            <div className="text-center">
              {/* Success Animation */}
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-14 h-14 bg-green-500/40 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <h4 className="text-2xl font-bold text-white mb-4">
                Match Found!
              </h4>

              {/* Match Details */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <div className="text-sm text-gray-400 mb-1">You</div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
                      <div>
                        <div className="text-white font-semibold">You</div>
                        <div className="text-gray-400 text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          1250
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-2xl text-gray-500">VS</div>

                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Opponent</div>
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-400" />
                      <div>
                        <div className="text-white font-semibold">
                          {matchData.opponent}
                        </div>
                        <div className="text-gray-400 text-xs flex items-center gap-1 justify-end">
                          <Shield className="w-3 h-3" />
                          {matchData.opponentRating}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Mode</span>
                    <span className="text-white font-medium capitalize">
                      {matchData.gameMode === 'robochaos'
                        ? '🤖 RoboChaos'
                        : '🕶️ Classic'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Time Control</span>
                    <span className="text-white font-medium">
                      {matchData.timeControl}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Entry Fee</span>
                    <span className="text-yellow-400 font-medium">
                      {matchData.entryFee}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptMatch}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 text-white font-semibold py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Accept Match
                </button>
              </div>

              <p className="text-gray-500 text-xs mt-4">
                Auto-accept in 10 seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
