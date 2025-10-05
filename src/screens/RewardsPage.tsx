import React, { useState, useEffect } from 'react';
import { dailyRewardService } from '../services/dailyRewardService';
import { useAuth } from '../context/AuthContext';
import { Gift, Clock, Play, Lock, CheckCircle, Sparkles, Trophy, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [dailyStatus, setDailyStatus] = useState<any>(null);
  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      checkDailyStatus();
    }
  }, [user]);

  const checkDailyStatus = async () => {
    if (!user) return;
    const status = await dailyRewardService.canClaimDaily(user.id);
    setDailyStatus(status);
  };

  const handleClaimDaily = async () => {
    if (!user || claiming) return;

    setClaiming(true);
    const result = await dailyRewardService.claimDailyReward(user.id);

    if (result?.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        checkDailyStatus();
        window.location.reload();
      }, 2500);
    }

    setClaiming(false);
  };

  const getTimeRemaining = () => {
    if (!dailyStatus?.time_remaining) return '';
    return dailyRewardService.formatTimeRemaining(dailyStatus.time_remaining);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with Animation */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Gift className="w-12 h-12 text-purple-400" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </div>
            <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
              Rewards Hub
            </h1>
          </motion.div>
          <p className="text-gray-400 text-lg">Claim your daily rewards and bonuses</p>
        </motion.div>

        {/* Main Rewards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Daily Login Reward - Featured */}
          <motion.div
            className="md:col-span-2 bg-gradient-to-br from-purple-900/40 via-gray-900/60 to-blue-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.5)' }}
          >
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{
                      boxShadow: dailyStatus?.can_claim
                        ? [
                            '0 0 20px rgba(234, 179, 8, 0.4)',
                            '0 0 40px rgba(234, 179, 8, 0.6)',
                            '0 0 20px rgba(234, 179, 8, 0.4)',
                          ]
                        : '0 0 0px rgba(0,0,0,0)',
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Gift className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Daily Login Reward</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Available every 24 hours</span>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="text-right"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="flex items-center gap-2 text-yellow-400 font-black text-4xl">
                    <span>🪙</span>
                    <span>100</span>
                  </div>
                  <div className="text-purple-300 text-sm font-medium mt-1">Daily Bonus</div>
                </motion.div>
              </div>

              {dailyStatus?.can_claim ? (
                <motion.button
                  onClick={handleClaimDaily}
                  disabled={claiming}
                  className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-black font-bold py-4 rounded-xl text-lg shadow-xl relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {claiming ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-3 border-black border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Claim Your Reward
                      </>
                    )}
                  </span>
                </motion.button>
              ) : (
                <div className="w-full bg-gray-800/50 border-2 border-gray-700 text-gray-300 font-semibold py-4 rounded-xl flex items-center justify-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-lg">
                    Next reward in: <span className="text-blue-400 font-bold">{getTimeRemaining() || 'Loading...'}</span>
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Watch Ad Reward */}
          <motion.div
            className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden opacity-60"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute top-3 right-3">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                COMING SOON
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Watch & Earn</h3>
                <p className="text-gray-400 text-sm">30 second video ad</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-blue-400 font-bold text-2xl mb-4">
              <span>🪙</span>
              <span>50</span>
            </div>

            <button
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 text-gray-500 font-semibold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Locked
            </button>
          </motion.div>

          {/* Achievements Reward */}
          <motion.div
            className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden opacity-60"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="absolute top-3 right-3">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                COMING SOON
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Achievements</h3>
                <p className="text-gray-400 text-sm">Complete challenges</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Target className="w-4 h-4" />
                  <span>Win 10 games</span>
                </div>
                <div className="flex items-center gap-1 text-green-400 font-bold">
                  <span>🪙</span>
                  <span>500</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Target className="w-4 h-4" />
                  <span>Play 50 games</span>
                </div>
                <div className="flex items-center gap-1 text-green-400 font-bold">
                  <span>🪙</span>
                  <span>1,000</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Target className="w-4 h-4" />
                  <span>Reach 1500 rating</span>
                </div>
                <div className="flex items-center gap-1 text-green-400 font-bold">
                  <span>🪙</span>
                  <span>2,000</span>
                </div>
              </div>
            </div>

            <button
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 text-gray-500 font-semibold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Locked
            </button>
          </motion.div>
        </div>

        {/* Info Footer */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-full px-6 py-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">More exciting rewards coming soon!</span>
          </div>
        </motion.div>
      </div>

      {/* Success Modal with Celebration */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 border-2 border-purple-500/50 rounded-3xl p-10 max-w-md mx-4 text-center relative overflow-hidden"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              {/* Confetti Effect */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: Math.cos((i / 12) * Math.PI * 2) * 150,
                    y: Math.sin((i / 12) * Math.PI * 2) * 150,
                    opacity: 0,
                  }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                >
                  {['✨', '🎉', '⭐', '💫'][i % 4]}
                </motion.div>
              ))}

              <motion.div
                className="inline-block bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full p-6 mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.6, repeat: 3 }}
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>

              <motion.h2
                className="text-white font-black text-4xl mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span>🪙</span>
                  <span>+100</span>
                </div>
              </motion.h2>

              <motion.p
                className="text-purple-300 text-lg font-semibold"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Reward Claimed Successfully!
              </motion.p>

              <motion.div
                className="mt-6 text-gray-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Come back tomorrow for more 🎁
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardsPage;
