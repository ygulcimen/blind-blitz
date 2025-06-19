import { useState } from 'react';
import PremoveBoard from '../components/PremoveBoard';
import RevealBoard from '../components/RevealBoard';
import { simulateBlindMoves } from '../utils/simulateBlindMoves';
import type { BlindSequence, MoveLogItem } from '../types/BlindTypes';

type Phase = 'P1_INPUT' | 'P2_INPUT' | 'REVEAL';

const GameScreen = () => {
  const [phase, setPhase] = useState<Phase>('P1_INPUT');
  const [p1Moves, setP1Moves] = useState<BlindSequence>([]);
  const [resultFen, setResultFen] = useState('');
  const [resultLog, setResultLog] = useState<MoveLogItem[]>([]);

  /* reset everything */
  const handleResetAll = () => {
    setPhase('P1_INPUT');
    setP1Moves([]);
    setResultFen('');
    setResultLog([]);
  };

  const handleP1Submit = (seq: BlindSequence) => {
    setP1Moves(seq);
    setPhase('P2_INPUT');
  };

  const handleP2Submit = (seq: BlindSequence) => {
    const { fen, log } = simulateBlindMoves(p1Moves, seq);
    setResultFen(fen);
    setResultLog(log);
    setPhase('REVEAL');
  };

  /* phase switch */
  if (phase === 'P1_INPUT')
    return (
      <PremoveBoard
        key="P1"
        player="P1"
        onSubmit={handleP1Submit}
        onReset={handleResetAll}
      />
    );

  if (phase === 'P2_INPUT')
    return (
      <PremoveBoard
        key="P2"
        player="P2"
        onSubmit={handleP2Submit}
        onReset={handleResetAll}
      />
    );

  /* reveal */
  return <RevealBoard fen={resultFen} log={resultLog} />;
};

export default GameScreen;
