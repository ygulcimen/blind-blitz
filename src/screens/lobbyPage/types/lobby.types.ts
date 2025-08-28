// src/screens/LobbyPage/types/lobby.types.ts

export type GameMode = 'classic' | 'robochaos';
export type RoomStatus = 'waiting' | 'full' | 'in_progress';
export type RatingRange =
  | 'all'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'master';

export interface GameRoom {
  id: string;
  mode: GameMode;
  host: string;
  hostRating: number;
  hostAvatar?: string;
  entryFee: number;
  reward: number;
  players: number;
  maxPlayers: number;
  timeControl: string;
  ratingRange: string;
  status: RoomStatus;
  isPrivate: boolean;
  spectators?: number;
  game_started?: boolean;
  game_ended?: boolean;
  created_at?: string;
}

export interface FilterState {
  mode: 'all' | GameMode;
  search: string;
  ratingRange: RatingRange;
  showFull: boolean;
}

export interface RoomConfig {
  mode: GameMode;
  timeControl: string;
  entryFee: number;
  isPrivate: boolean;
  ratingRestriction?: string;
  password?: string;
}

export interface QuickMatchConfig {
  mode?: GameMode;
  ratingTolerance?: number;
  maxWaitTime?: number;
}
