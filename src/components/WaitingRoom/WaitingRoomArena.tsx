// components/WaitingRoom/WaitingRoomArena.tsx
import React from 'react';
import { Users, CreditCard, Zap, Swords } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { VSDisplay } from './VSDisplay';
import { WaitingSlot } from './WaitingSlot';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { PaymentPhase } from '../../hooks/useWaitingRoomState';
import { getTierFromEntryFee, TIER_CONFIG } from './WaitingRoomHeader';
import { motion } from 'framer-motion';

interface RealPlayer {
  id: string;
  username: string;
  rating: number;
  ready: boolean;
  isHost: boolean;
}

interface RoomData {
  id: string;
  name: string;
  mode: 'classic' | 'robochaos';
  entry_fee: number;
  host_id: string;
  host_username: string;
  current_players: number;
  max_players: number;
  status: string;
}

interface WaitingRoomArenaProps {
  roomData: RoomData;
  players: RealPlayer[];
  onReady: () => void;
  allPlayersReady: boolean;
  paymentPhase: PaymentPhase;
}

export const WaitingRoomArena: React.FC<WaitingRoomArenaProps> = ({
  roomData,
  players,
  onReady,
  allPlayersReady,
  paymentPhase,
}) => {
  const { playerData } = useCurrentUser();
  const tier = getTierFromEntryFee(roomData.entry_fee);
  const tierConfig = TIER_CONFIG[tier];
  const isRoboChaos = roomData.mode === 'robochaos';
  const prizePool = roomData.entry_fee * 2;

  const TierIcon = tierConfig.Icon;

  return (
    <div className="relative flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Floating Tier Emblems - Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              rotate: Math.random() * 360,
              scale: 0.5 + Math.random() * 0.5,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              rotate: [0, 360],
              scale: [0.5 + Math.random() * 0.5, 0.8 + Math.random() * 0.5, 0.5 + Math.random() * 0.5],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
          >
            <TierIcon className={`w-24 h-24 sm:w-32 sm:h-32 ${
              isRoboChaos ? 'text-pink-500' : tierConfig.iconClass
            }`} />
          </motion.div>
        ))}
      </div>

      {/* Battle Lightning Effects */}
      {players.length === 2 && (
        <>
          <motion.div
            className="absolute left-1/4 top-1/4 pointer-events-none"
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <Zap className={`w-16 h-16 ${isRoboChaos ? 'text-pink-500' : tierConfig.iconClass}`} />
          </motion.div>
          <motion.div
            className="absolute right-1/4 bottom-1/4 pointer-events-none"
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              delay: 1,
            }}
          >
            <Swords className={`w-16 h-16 ${isRoboChaos ? 'text-pink-500' : tierConfig.iconClass}`} />
          </motion.div>
        </>
      )}

      <div className="relative z-10 max-w-5xl w-full">
        {/* Mobile: Vertical Stack, Desktop: Horizontal */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 mb-4 sm:mb-6">
          {players.length === 0 ? (
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">👤</div>
              <div className="text-lg sm:text-xl font-bold mb-2">
                Waiting for players...
              </div>
              <div className="text-sm sm:text-base text-gray-400">
                Share this room to invite opponents!
              </div>
            </div>
          ) : players.length === 1 ? (
            <>
              <PlayerCard
                player={players[0]}
                tierConfig={tierConfig}
                isRoboChaos={isRoboChaos}
                onReady={onReady}
                gameStarting={paymentPhase !== 'waiting'}
              />
              <VSDisplay prizePool={prizePool} tierConfig={tierConfig} isRoboChaos={isRoboChaos} />
              <WaitingSlot />
            </>
          ) : (
            <>
              <PlayerCard
                player={players[0]}
                tierConfig={tierConfig}
                isRoboChaos={isRoboChaos}
                onReady={onReady}
                gameStarting={paymentPhase !== 'waiting'}
              />
              <VSDisplay prizePool={prizePool} tierConfig={tierConfig} isRoboChaos={isRoboChaos} />
              <PlayerCard
                player={players[1]}
                tierConfig={tierConfig}
                isRoboChaos={isRoboChaos}
                onReady={onReady}
                gameStarting={paymentPhase !== 'waiting'}
              />
            </>
          )}
        </div>

        {/* Status - Mobile Responsive */}
        <div className="text-center px-2">
          <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl px-3 sm:px-6 py-2 sm:py-3 border border-slate-600/50 inline-flex items-center gap-2 sm:gap-3 shadow-xl flex-wrap justify-center">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold text-xs sm:text-sm">
              Players: {players.length}/2 | Ready:{' '}
              {players.filter((p) => p.ready).length}/2
            </span>
            {allPlayersReady && paymentPhase === 'waiting' && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-yellow-900/50 rounded-lg border border-yellow-500/50">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="text-yellow-400 font-black text-[10px] sm:text-xs animate-pulse">
                  💰 PROCESSING PAYMENTS...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
