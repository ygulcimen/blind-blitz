// components/WaitingRoom/WaitingRoomArena.tsx
import React from 'react';
import { Users, CreditCard } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { VSDisplay } from './VSDisplay';
import { WaitingSlot } from './WaitingSlot';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { PaymentPhase } from '../../hooks/useWaitingRoomState';

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

  const getModeConfig = (mode: 'classic' | 'robochaos') => {
    switch (mode) {
      case 'classic':
        return {
          name: 'Classic Blind',
          subtitle: 'First 5 moves in darkness',
          icon: '👁️‍🗨️',
          gradient: 'from-purple-700 via-indigo-600 to-blue-700',
          bgGradient: 'from-purple-900/20 via-indigo-900/10 to-blue-900/20',
          accentColor: 'text-purple-400',
          borderColor: 'border-purple-500/50',
        };
      case 'robochaos':
        return {
          name: 'RoboChaos',
          subtitle: 'AI trolls make your opening',
          icon: '🤖',
          gradient: 'from-red-600 via-orange-500 to-yellow-500',
          bgGradient: 'from-red-900/20 via-orange-900/10 to-yellow-900/20',
          accentColor: 'text-orange-400',
          borderColor: 'border-orange-500/50',
        };
      default:
        return {
          name: 'Unknown Mode',
          subtitle: 'Unknown challenge awaits',
          icon: '❓',
          gradient: 'from-slate-500 to-slate-600',
          bgGradient: 'from-slate-900/20 to-slate-800/10',
          accentColor: 'text-slate-400',
          borderColor: 'border-slate-500/50',
        };
    }
  };

  const modeConfig = getModeConfig(roomData.mode);
  const prizePool = roomData.entry_fee * 2;

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="flex items-center justify-center gap-10 mb-6">
          {players.length === 0 ? (
            <div className="text-center">
              <div className="text-6xl mb-4">👤</div>
              <div className="text-xl font-bold mb-2">
                Waiting for players...
              </div>
              <div className="text-gray-400">
                Share this room to invite opponents!
              </div>
            </div>
          ) : players.length === 1 ? (
            <>
              <PlayerCard
                player={players[0]}
                mode={modeConfig}
                onReady={onReady}
                gameStarting={paymentPhase !== 'waiting'}
              />
              <VSDisplay prizePool={prizePool} mode={roomData.mode} />
              <WaitingSlot />
            </>
          ) : (
            <>
              <PlayerCard
                player={players[0]}
                mode={modeConfig}
                onReady={onReady}
                gameStarting={paymentPhase !== 'waiting'}
              />
              <VSDisplay prizePool={prizePool} mode={roomData.mode} />
              <PlayerCard
                player={players[1]}
                mode={modeConfig}
                onReady={onReady}
                gameStarting={paymentPhase !== 'waiting'}
              />
            </>
          )}
        </div>

        {/* Status */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-600/50 inline-flex items-center gap-3 shadow-xl">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold text-sm">
              Players: {players.length}/2 | Ready:{' '}
              {players.filter((p) => p.ready).length}/2
            </span>
            {allPlayersReady && paymentPhase === 'waiting' && (
              <div className="flex items-center gap-2 ml-3 px-3 py-1 bg-yellow-900/50 rounded-lg border border-yellow-500/50">
                <CreditCard className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-black text-xs animate-pulse">
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
