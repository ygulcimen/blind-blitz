import React, { useState, useEffect } from 'react';
import { dailyRewardService } from '../services/dailyRewardService';
import { useAuth } from '../context/AuthContext';
import { Gift, X } from 'lucide-react';

export const DailyRewardNotification: React.FC = () => {
  const { user } = useAuth();
  const [canClaim, setCanClaim] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const checkDailyReward = async () => {
      const status = await dailyRewardService.canClaimDaily(user.id);
      if (status?.can_claim) {
        setCanClaim(true);
        setShowNotification(true);
      }
    };

    checkDailyReward();
  }, [user]);

  const handleClaim = async () => {
    if (!user || claiming) return;

    setClaiming(true);
    const result = await dailyRewardService.claimDailyReward(user.id);

    if (result?.success) {
      setRewardAmount(result.reward || 100);
      setShowSuccess(true);
      setCanClaim(false);
      setShowNotification(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      // Refresh page to update gold balance
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      console.error('Failed to claim reward:', result?.reason);
    }

    setClaiming(false);
  };

  if (!canClaim && !showSuccess) return null;

  return (
    <>
      {/* Daily Reward Available Notification */}
      {showNotification && canClaim && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-2xl p-4 max-w-sm border-2 border-yellow-300">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full p-2 animate-pulse">
                <Gift className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">
                  Daily Reward Available!
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  Claim your free 100 gold bonus
                </p>

                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="mt-3 w-full bg-white text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-yellow-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claiming ? 'Claiming...' : 'Claim Now 🎁'}
                </button>
              </div>

              <button
                onClick={() => setShowNotification(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl shadow-2xl p-8 max-w-md mx-4 border-4 border-yellow-300 transform animate-scale-in">
            <div className="text-center">
              <div className="inline-block bg-white/20 rounded-full p-4 mb-4 animate-bounce">
                <Gift className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-white font-bold text-3xl mb-2">
                Daily Reward Claimed!
              </h2>

              <div className="bg-white/20 rounded-xl p-4 mb-4">
                <div className="text-white text-5xl font-bold mb-1">
                  +{rewardAmount} 🪙
                </div>
                <div className="text-white/90 text-lg">
                  Gold Added to Your Balance
                </div>
              </div>

              <p className="text-white/90 text-sm">
                Come back in 24 hours for your next reward!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
