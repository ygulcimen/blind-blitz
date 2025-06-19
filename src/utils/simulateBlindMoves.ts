import { Chess } from 'chess.js';
import type { BlindSequence } from '../types/BlindTypes';

export interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
}

export interface SimulationResult {
  fen: string;
  log: MoveLogItem[];
}

export function simulateBlindMoves(
  p1: BlindSequence,
  p2: BlindSequence
): SimulationResult {
  const game = new Chess();
  const log: MoveLogItem[] = [];

  const flipTurn = (g: Chess) => {
    g.setTurn(g.turn() === 'w' ? 'b' : 'w');
  };

  for (let i = 0; i < 5; i++) {
    const w = p1[i];
    const b = p2[i];

    // White
    if (w) {
      let legal = true,
        san = '';
      try {
        const res = game.move({ from: w.from, to: w.to, promotion: 'q' });
        if (res) san = res.san;
        else legal = false;
      } catch {
        legal = false;
      }
      if (!legal) flipTurn(game);
      log.push({
        player: 'P1',
        san: legal ? san : `${w.from}-${w.to}`,
        isInvalid: !legal,
      });
    }

    // Black
    if (b) {
      let legal = true,
        san = '';
      try {
        const res = game.move({ from: b.from, to: b.to, promotion: 'q' });
        if (res) san = res.san;
        else legal = false;
      } catch {
        legal = false;
      }
      if (!legal) flipTurn(game);
      log.push({
        player: 'P2',
        san: legal ? san : `${b.from}-${b.to}`,
        isInvalid: !legal,
      });
    }
  }

  return { fen: game.fen(), log };
}
