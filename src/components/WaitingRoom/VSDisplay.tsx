// components/WaitingRoom/VSDisplay.tsx
import React from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface TierConfig {
  label: string;
  Icon: any;
  gradient: string;
  headerBg: string;
  bgGradient: string;
  orb1: string;
  orb2: string;
  iconClass: string;
  textClass: string;
  borderClass: string;
}

interface VSDisplayProps {
  prizePool: number;
  tierConfig: TierConfig;
  isRoboChaos: boolean;
}

export const VSDisplay: React.FC<VSDisplayProps> = ({ prizePool, tierConfig, isRoboChaos }) => {
  return (
    <div className="flex flex-col items-center z-20">
      {/* VS Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-2xl border-2 ${
            isRoboChaos
              ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-pink-500/50'
              : `bg-gradient-to-br ${tierConfig.gradient} ${tierConfig.borderClass}`
          }`}
        >
          <span className="text-white font-black text-2xl sm:text-3xl drop-shadow-lg">
            VS
          </span>
        </motion.div>
      </motion.div>

      {/* Prize Pool */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`mt-4 sm:mt-5 backdrop-blur-sm rounded-xl px-5 py-3 sm:px-6 sm:py-4 border-2 shadow-2xl ${
          isRoboChaos
            ? 'bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-pink-500/40'
            : 'bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-slate-600/40'
        }`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className={`w-4 h-4 ${
              isRoboChaos ? 'text-pink-400' : tierConfig.iconClass
            }`} />
            <span className="text-gray-200 text-xs uppercase tracking-wider font-bold">
              Prize Pool
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className={`font-black text-2xl sm:text-3xl ${
              isRoboChaos ? 'text-pink-300' : tierConfig.textClass
            }`}>
              {prizePool}
            </span>
            <span className="text-lg sm:text-xl">💰</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
