// hooks/useAnimatedReveal.ts - Core logic for animated reveal
import { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { supabase } from '../lib/supabase';
import { useCurrentUser } from './useCurrentUser';

export type GameMode = 'classic' | 'robot_chaos';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
  moveNumber?: number;
}

interface PlayerInfo {
  white: { name: string; rating: number };
  black: { name: string; rating: number };
}

interface MoveStats {
  p1Moves: number;
  p2Moves: number;
  validMoves: number;
  invalidMoves: number;
}

interface UseAnimatedRevealProps {
  initialFen: string;
  moveLog: MoveLogItem[];
  finalFen: string;
  gameMode: GameMode;
  gameId?: string;
  onRevealComplete: () => void;
}

export const useAnimatedReveal = ({
  initialFen,
  moveLog,
  finalFen,
  gameMode,
  gameId,
  onRevealComplete,
}: UseAnimatedRevealProps) => {
  const { playerData } = useCurrentUser();

  // Animation state
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [displayFen, setDisplayFen] = useState(initialFen);
  const [showMoveEffect, setShowMoveEffect] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [currentMove, setCurrentMove] = useState<MoveLogItem | null>(null);

  // Game data state
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);
  const [myColor, setMyColor] = useState<'white' | 'black' | null>(null);

  const totalMoves = moveLog.length;
  const progressPercentage =
    totalMoves > 0 ? ((currentMoveIndex + 1) / totalMoves) * 100 : 0;

  // Mode configuration
  const modeInfo = useMemo(() => {
    switch (gameMode) {
      case 'classic':
        return {
          name: 'CHAOS COLLISION',
          subtitle: 'Strategic Warfare Unfolds',
          icon: '⚔️',
          secondaryIcon: '🕶️',
          gradient: 'from-orange-400 via-red-500 to-yellow-500',
          bgGradient: 'from-orange-500/20 via-red-500/15 to-yellow-500/10',
          progressGradient: 'from-orange-500 via-red-500 to-yellow-400',
          borderColor: 'border-orange-500/50',
          description: 'Blind moves colliding in epic battle',
        };
      case 'robot_chaos':
        return {
          name: 'ROBOT MAYHEM',
          subtitle: 'AI Destruction Protocol Active',
          icon: '🤖',
          secondaryIcon: '💥',
          gradient: 'from-purple-400 via-blue-500 to-green-400',
          bgGradient: 'from-purple-500/20 via-blue-500/15 to-green-500/10',
          progressGradient: 'from-purple-500 via-blue-500 to-green-400',
          borderColor: 'border-purple-500/50',
          description: 'Chaotic robots wreaking digital havoc',
        };
      default:
        return {
          name: 'BATTLE REVEAL',
          subtitle: 'Unknown Protocol',
          icon: '⚔️',
          secondaryIcon: '❓',
          gradient: 'from-orange-400 to-red-400',
          bgGradient: 'from-orange-500/20 to-red-500/10',
          progressGradient: 'from-orange-500 to-red-500',
          borderColor: 'border-orange-500/50',
          description: 'Moves revealing',
        };
    }
  }, [gameMode]);

  // Fetch player data
  // In useAnimatedReveal.ts, update the fetchGameData function with debug logs:
  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId || !playerData) {
        console.log('❌ Missing gameId or playerData:', { gameId, playerData });
        return;
      }

      try {
        console.log('🔍 Fetching players for gameId:', gameId);
        console.log('👤 Current playerData:', playerData);

        const { data: players, error } = await supabase
          .from('game_room_players')
          .select('player_id, player_username, player_rating, created_at')
          .eq('room_id', gameId)
          .order('created_at', { ascending: true });

        console.log('📊 Query result:', { players, error });

        if (error) {
          console.error('❌ Database error:', error);
          return;
        }

        if (players && players.length >= 2) {
          console.log('✅ Found players:', players);
          setRoomPlayers(players);

          const playerColor =
            players[0].player_id === playerData.id ? 'white' : 'black';
          console.log(
            '🎨 Determined color:',
            playerColor,
            'for player:',
            playerData.id
          );
          console.log(
            '👥 Player IDs:',
            players.map((p) => ({ id: p.player_id, name: p.player_username }))
          );

          setMyColor(playerColor);
        } else {
          console.warn('⚠️ Not enough players found:', players?.length || 0);
        }
      } catch (error) {
        console.error('💥 Failed to fetch game data:', error);
      }
    };

    fetchGameData();
  }, [gameId, playerData]);

  // Player info
  // In useAnimatedReveal.ts, update the playerInfo useMemo:
  const playerInfo: PlayerInfo = useMemo(() => {
    if (!roomPlayers.length) {
      return {
        white: { name: 'Loading...', rating: 1500 },
        black: { name: 'Loading...', rating: 1500 },
      };
    }

    const whitePlayer = roomPlayers[0];
    const blackPlayer = roomPlayers[1];

    return {
      white: {
        name: `${whitePlayer.player_username} (White)`,
        rating: whitePlayer.player_rating || 1500,
      },
      black: {
        name:
          gameMode === 'robot_chaos'
            ? 'AI Chaos Bot (Black)'
            : `${blackPlayer.player_username} (Black)`,
        rating:
          gameMode === 'robot_chaos' ? 1800 : blackPlayer.player_rating || 1500,
      },
    };
  }, [roomPlayers, gameMode]); // Add gameMode to dependencies

  // Move statistics
  const moveStats: MoveStats = useMemo(() => {
    const p1Moves = moveLog.filter((m) => m.player === 'P1').length;
    const p2Moves = moveLog.filter((m) => m.player === 'P2').length;
    const validMoves = moveLog.filter((m) => !m.isInvalid).length;
    const invalidMoves = moveLog.filter((m) => m.isInvalid).length;
    return { p1Moves, p2Moves, validMoves, invalidMoves };
  }, [moveLog]);

  // Board states generation
  const boardStates = useMemo(() => {
    const p1Moves = moveLog.filter((m) => m.player === 'P1');
    const p2Moves = moveLog.filter((m) => m.player === 'P2');
    const sequenced = [];

    const maxMoves = Math.max(p1Moves.length, p2Moves.length);
    for (let i = 0; i < maxMoves; i++) {
      if (i < p1Moves.length) sequenced.push(p1Moves[i]);
      if (i < p2Moves.length) sequenced.push(p2Moves[i]);
    }

    const states = [initialFen];
    const game = new Chess(initialFen);

    sequenced.forEach((move, index) => {
      if (move.from && move.to && !move.isInvalid) {
        const currentTurn = game.turn();
        const isWhiteMove = move.player === 'P1';

        if (
          (isWhiteMove && currentTurn === 'w') ||
          (!isWhiteMove && currentTurn === 'b')
        ) {
          try {
            game.move({ from: move.from, to: move.to, promotion: 'q' });
          } catch (e) {
            console.warn(`Move ${index + 1} failed normally:`, move);
          }
        } else {
          const targetTurn = isWhiteMove ? 'w' : 'b';
          const hackedFen = game.fen().replace(/ [wb] /, ` ${targetTurn} `);
          const tempGame = new Chess(hackedFen);

          try {
            const result = tempGame.move({
              from: move.from,
              to: move.to,
              promotion: 'q',
            });
            if (result) {
              const flippedBackFen = tempGame
                .fen()
                .replace(/ [wb] /, ` ${currentTurn} `);
              game.load(flippedBackFen);
            }
          } catch (e) {
            console.warn(`Move ${index + 1} failed in forced mode:`, move);
          }
        }
      }
      states.push(game.fen());
    });

    return states;
  }, [initialFen, moveLog]);

  // Play next move animation
  const playNextMove = () => {
    const nextIndex = currentMoveIndex + 1;

    if (nextIndex >= totalMoves) {
      onRevealComplete();
      return;
    }

    setShowMoveEffect(true);
    setTimeout(() => setShowMoveEffect(false), 600);

    setCurrentMove(moveLog[nextIndex]);

    if (nextIndex + 1 < boardStates.length) {
      setDisplayFen(boardStates[nextIndex + 1]);
    } else {
      setDisplayFen(finalFen);
    }

    setCurrentMoveIndex(nextIndex);
  };

  // Animation timing effects
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarting(false);
      if (totalMoves > 0) {
        playNextMove();
      } else {
        setTimeout(() => onRevealComplete(), 1000);
      }
    }, 800);

    return () => clearTimeout(startTimer);
  }, [totalMoves, onRevealComplete]);

  useEffect(() => {
    if (
      !isStarting &&
      currentMoveIndex >= 0 &&
      currentMoveIndex < totalMoves - 1
    ) {
      const timer = setTimeout(
        () => {
          playNextMove();
        },
        gameMode === 'robot_chaos' ? 30000 : 40000
      );

      return () => clearTimeout(timer);
    } else if (
      currentMoveIndex >= totalMoves - 1 &&
      !isStarting &&
      totalMoves > 0
    ) {
      const endTimer = setTimeout(() => {
        onRevealComplete();
      }, 1500);

      return () => clearTimeout(endTimer);
    }
  }, [currentMoveIndex, isStarting, totalMoves, onRevealComplete, gameMode]);

  // Computed values
  const isComplete = progressPercentage >= 100;
  const isEmpty = totalMoves === 0;

  return {
    // Animation state
    currentMoveIndex,
    displayFen,
    showMoveEffect,
    isStarting,
    currentMove,
    progressPercentage,
    totalMoves,

    // Game data
    playerInfo,
    myColor,
    moveStats,
    boardStates,
    modeInfo,

    // Actions
    playNextMove,

    // Status
    isComplete,
    isEmpty,
  };
};
