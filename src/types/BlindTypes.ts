// types/BlindTypes.ts

export interface BlindMove {
  from: string;
  to: string;
  san: string;
}

export type BlindSequence = BlindMove[];

export interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string; // Added for AnimatedReveal
  to?: string; // Added for AnimatedReveal
}

// Additional types for the enhanced game system
export interface GameState {
  phase: 'P1_INPUT' | 'P2_INPUT' | 'REVEAL' | 'ANIMATED_REVEAL' | 'PLAY';
  p1Moves: BlindSequence;
  p2Moves: BlindSequence;
  currentFen: string;
  moveLog: MoveLogItem[];
}

export interface PlayerStats {
  validMoves: number;
  invalidMoves: number;
  totalMoves: number;
  accuracy: number;
}
