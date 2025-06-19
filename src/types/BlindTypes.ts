// ────────────────────────────────────────────────────────────
// Core shared types
// ────────────────────────────────────────────────────────────

// src/types/BlindTypes.ts
export type BlindMove = {
  from: string;
  to: string;
  san: string; // Standard Algebraic Notation
  promotion?: string; // still optional for legacy code
};

export type BlindSequence = BlindMove[]; // exactly five moves per phase

export interface SimulationResult {
  fen: string;
  log: string[];
  invalidsP1: number;
  invalidsP2: number;
}
export interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string; // algebraic or placeholder
  isInvalid: boolean;
}
// Strict list of board squares (for customArrows typing)
