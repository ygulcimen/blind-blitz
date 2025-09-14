// src/screens/LobbyPage/types/lobby.types.ts
export type GameMode = 'classic' | 'robochaos';
export type RoomStatus =
  | 'waiting'
  | 'blind'
  | 'revealing'
  | 'live'
  | 'finished';

export interface GameRoom {
  id: string;
  host: string;
  mode: GameMode;
  hostRating: number;
  hostAvatar?: string;
  entryFee: number;
  reward: number; // Calculated as entryFee * 1.8 (90% return)
  players: number;
  maxPlayers: number;
  timeControl: '5+0'; // 🎯 SIGNATURE TIME CONTROL
  ratingRange: string;
  status: RoomStatus;
  isPrivate: boolean;
  created_at: string;
  spectators: number;
  game_started: boolean;
  game_ended: boolean;
}

export interface RoomConfig {
  mode: GameMode;
  timeControl: '5+0';
  entryFee: number;
  isPrivate: boolean;
  ratingRestriction: string;
  password?: string;
}

export interface FilterState {
  mode: 'all' | GameMode;
  search: string;
  ratingRange: string;
  showFull: boolean;
}

// 🎯 BLINDCHESS GAME CONSTANTS
export const BLINDCHESS_CONSTANTS = {
  TIME_CONTROL: '5+0' as const,
  TIME_CONTROL_MINUTES: 5,
  TIME_CONTROL_INCREMENT: 0,
  BLIND_MOVES_COUNT: 5,
  DESCRIPTION: '5 Blind Moves • 5 Minutes Live • Pure Strategy',
  SIGNATURE: 'The BlindChess Standard',
} as const;

// Quick match configuration
export interface QuickMatchConfig {
  timeControl: '5+0'; // 🎯 ALWAYS 5+0
  maxEntryFee: number; // Based on player's gold
  preferredMode?: GameMode;
}
