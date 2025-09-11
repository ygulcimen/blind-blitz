// src/types/GameTypes.ts
export interface GameResult {
  type:
    | 'checkmate'
    | 'draw'
    | 'resignation'
    | 'timeout'
    | 'stalemate'
    | 'abandonment';
  winner: 'white' | 'black' | 'draw';
  reason: string;
}
