// components/WaitingRoom/PlayerCard.tsx
import React from 'react';
import { Crown, Star, Shield, Sword } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { motion } from 'framer-motion';

interface RealPlayer {
  id: string;
  username: string;
  rating: number;
  ready: boolean;
  isHost: boolean;
}

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

interface PlayerCardProps {
  player: RealPlayer;
  tierConfig: TierConfig;
  isRoboChaos: boolean;
  onReady: () => void;
  gameStarting: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  tierConfig,
  isRoboChaos,
  onReady,
  gameStarting,
}) => {
  const { playerData } = useCurrentUser();
  const isCurrentPlayer = player.id === playerData?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative group transition-all duration-500 ${
        player.ready ? 'scale-105' : ''
      }`}
    >
      <div
        className={`relative backdrop-blur-sm border-2 rounded-2xl p-5 sm:p-6 w-full sm:w-60 md:w-72 transition-all duration-300 shadow-2xl ${
          player.ready
            ? `${isRoboChaos ? 'border-pink-500/60' : tierConfig.borderClass} shadow-lg`
            : 'border-slate-600/30 hover:border-slate-500/50'
        } ${
          isRoboChaos
            ? 'bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-black/60'
            : 'bg-gradient-to-br from-slate-800/50 to-slate-900/70'
        }`}
      >
        {/* Ready Badge */}
        {player.ready && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-xl text-xs font-black shadow-lg ${
              isRoboChaos
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : `bg-gradient-to-r ${tierConfig.gradient} text-white`
            }`}
          >
            ⚡ READY ⚡
          </motion.div>
        )}

        <div className="text-center mb-5">
          {/* Avatar */}
          <div className="relative inline-block mb-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-xl ${
                isRoboChaos
                  ? 'bg-gradient-to-br from-purple-500/40 to-pink-500/40 border-2 border-pink-400/50'
                  : `bg-gradient-to-br ${tierConfig.gradient} opacity-90`
              }`}
            >
              <span className="text-white font-black text-2xl sm:text-3xl drop-shadow-lg">
                {player.username[0].toUpperCase()}
              </span>
            </motion.div>
            {/* Host Crown */}
            {player.isHost && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <Crown className="w-4 h-4 text-white fill-current" />
              </div>
            )}
          </div>

          {/* Username */}
          <h3 className="text-lg sm:text-xl font-black mb-2 tracking-wide truncate px-2">
            {player.username}
            {isCurrentPlayer && (
              <span className={`font-normal text-base ml-1 ${
                isRoboChaos ? 'text-pink-400' : tierConfig.textClass
              }`}> (You)</span>
            )}
          </h3>

          {/* Rating */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className={`w-4 h-4 fill-current ${
              isRoboChaos ? 'text-pink-400' : tierConfig.textClass
            }`} />
            <span className={`font-black text-base sm:text-lg ${
              isRoboChaos ? 'text-pink-300' : tierConfig.textClass
            }`}>
              {player.rating}
            </span>
          </div>

          {/* Role Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              player.isHost
                ? isRoboChaos
                  ? 'bg-pink-900/40 text-pink-300 border border-pink-500/30'
                  : `bg-purple-900/40 text-purple-300 border ${tierConfig.borderClass}`
                : isRoboChaos
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                : 'bg-blue-900/40 text-blue-300 border border-blue-500/30'
            }`}
          >
            {player.isHost ? (
              <>
                <Shield className="w-3 h-3" />
                <span>Host</span>
              </>
            ) : (
              <>
                <Sword className="w-3 h-3" />
                <span>Challenger</span>
              </>
            )}
          </div>
        </div>

        {/* Ready Button */}
        {isCurrentPlayer && (
          <motion.button
            whileHover={{ scale: gameStarting ? 1 : 1.02 }}
            whileTap={{ scale: gameStarting ? 1 : 0.98 }}
            onClick={onReady}
            disabled={gameStarting}
            className={`relative w-full py-3 rounded-xl font-black text-base transition-all duration-300 shadow-lg overflow-hidden ${
              gameStarting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : player.ready
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                : isRoboChaos
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : `bg-gradient-to-r ${tierConfig.gradient} text-white hover:shadow-xl`
            }`}
          >
            {!gameStarting && !player.ready && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {gameStarting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  PROCESSING...
                </>
              ) : player.ready ? (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    🔓
                  </motion.span>
                  CANCEL READY
                </>
              ) : (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⚔️
                  </motion.span>
                  I'M READY!
                </>
              )}
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
