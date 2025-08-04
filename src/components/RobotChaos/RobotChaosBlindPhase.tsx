// components/RobotChaos/RobotChaosBlindPhase.tsx - DEBUG VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import type { BlindSequence } from '../../types/BlindTypes';
import RobotAnimator from './RobotAnimator';
import RobotMoveLog from './RobotMoveLog';
import RobotStatusPanel from './RobotStatusPanel';

interface RobotChaosBlindPhaseProps {
  player: 'P1' | 'P2';
  gameState: any;
}

const MAX_MOVES = 5;
const MAX_PER_PIECE = 2;
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const generateRobotMoves = (color: 'w' | 'b'): { moves: BlindSequence } => {
  console.log(`🤖 generateRobotMoves called for color: ${color}`);
  const game = new Chess(INITIAL_FEN);
  const moves: BlindSequence = [];
  const pieceMoves: Record<string, number> = {};

  if (color === 'b') {
    const parts = game.fen().split(' ');
    parts[1] = 'b';
    game.load(parts.join(' '));
  }

  while (moves.length < MAX_MOVES) {
    const allMoves = game.moves({ verbose: true });
    const validMoves = allMoves.filter((m) => {
      const piece = game.get(m.from);
      return (
        piece?.color === color && (pieceMoves[m.from] || 0) < MAX_PER_PIECE
      );
    });
    const candidates = validMoves.length ? validMoves : allMoves;
    if (!candidates.length) break;

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const result = game.move(chosen);
    if (!result) break;

    pieceMoves[chosen.from] = (pieceMoves[chosen.from] || 0) + 1;
    moves.push({ from: result.from, to: result.to, san: result.san });

    const parts = game.fen().split(' ');
    parts[1] = color;
    game.load(parts.join(' '));
  }

  console.log(`🤖 Generated ${moves.length} moves for ${color}:`, moves);
  return { moves };
};

const RobotChaosBlindPhase: React.FC<RobotChaosBlindPhaseProps> = ({
  player,
  gameState,
}) => {
  const isWhite = player === 'P1';
  const [moves, setMoves] = useState<BlindSequence>([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [status, setStatus] = useState<
    'preparing' | 'thinking' | 'moving' | 'finished'
  >('preparing');
  const [dialogue, setDialogue] = useState('');
  const displayGameRef = useRef(new Chess(INITIAL_FEN));
  const [displayFen, setDisplayFen] = useState(INITIAL_FEN);
  const startedRef = useRef(false);

  const getRandomDialogue = (category: keyof typeof ROBOT_DIALOGUES) => {
    const opts = ROBOT_DIALOGUES[category];
    return opts[Math.floor(Math.random() * opts.length)];
  };

  useEffect(() => {
    console.log(
      `🤖 RobotChaosBlindPhase mounted. Player: ${player}, isWhite: ${isWhite}`
    );

    if (startedRef.current) {
      console.log('🤖 Already started, returning');
      return;
    }
    startedRef.current = true;

    if (!isWhite) {
      console.log('🤖 Black player detected, generating black moves...');
      const { moves: blackMoves } = generateRobotMoves('b');
      console.log('🤖 Submitting black moves:', blackMoves);
      gameState.submitBlindMoves(blackMoves, 'P2');
      return;
    }

    console.log('🤖 White player detected, starting animation sequence...');
    const { moves: robotMoves } = generateRobotMoves('w');
    console.log('🤖 White moves to animate:', robotMoves);

    const internalGame = new Chess(INITIAL_FEN);

    let idx = 0;
    setStatus('preparing');
    setDialogue(getRandomDialogue('starting'));

    const runMoveStep = () => {
      console.log(
        `🤖 runMoveStep - idx: ${idx}, total moves: ${robotMoves.length}`
      );

      if (idx >= robotMoves.length) {
        console.log('🤖 All moves complete, finishing...');
        setStatus('finished');
        setDialogue('🤖 "Chaos complete! Proceeding to reveal..."');
        setTimeout(() => {
          console.log('🤖 Submitting white moves:', robotMoves);
          gameState.submitBlindMoves(robotMoves, 'P1');
          const { moves: blackMoves } = generateRobotMoves('b');
          console.log('🤖 Submitting black moves:', blackMoves);
          gameState.submitBlindMoves(blackMoves, 'P2');
        }, 2000);
        return;
      }

      const move = robotMoves[idx];
      console.log(`🤖 Processing move ${idx + 1}/${robotMoves.length}:`, move);

      setCurrentMove(idx + 1);
      setStatus('thinking');
      setDialogue(`🤖 Calculating move ${idx + 1}...`);

      setTimeout(() => {
        setStatus('moving');
        setDialogue(getRandomDialogue('moving'));

        setTimeout(() => {
          setMoves((prev) => {
            console.log(
              `🤖 Adding move to list. Previous count: ${prev.length}`
            );
            return [...prev, move];
          });

          try {
            console.log(
              '🤖 Before move - internalGame FEN:',
              internalGame.fen()
            );
            console.log('🤖 Attempting move:', move);

            const moveResult = internalGame.move(move);
            console.log('🤖 Move result:', moveResult);

            if (moveResult) {
              // Force turn back to white
              const fenBefore = internalGame.fen();
              console.log('🤖 FEN before turn manipulation:', fenBefore);

              const parts = internalGame.fen().split(' ');
              parts[1] = 'w';
              internalGame.load(parts.join(' '));

              console.log(
                '🤖 FEN after turn manipulation:',
                internalGame.fen()
              );

              // Update display
              displayGameRef.current = new Chess(internalGame.fen());
              setDisplayFen(displayGameRef.current.fen());
              console.log('🤖 Display updated successfully');
            }
          } catch (error) {
            console.error(`🤖 Display move failed: ${move.san}`, error);
          }

          setDialogue(`🤖 "Move ${idx + 1}: ${move.san}"`);
          idx++;
          console.log(`🤖 Incrementing idx to ${idx}, scheduling next move...`);
          runMoveStep();
        }, 900);
      }, 1000);
    };

    console.log('🤖 Starting runMoveStep...');
    runMoveStep();
  }, []);

  useEffect(() => {
    if (isWhite && moves.length) {
      console.log(`🤖 Updating blind moves. Count: ${moves.length}`);
      gameState.updateBlindMoves(moves);
    }
  }, [moves, gameState, isWhite]);

  if (!isWhite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🤖</div>
          <h2 className="text-2xl font-bold mb-2">Black Robot Thinking...</h2>
          <p className="text-gray-300">Generating chaotic moves</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      <div className="relative z-10 h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3 flex items-center justify-center">
            <RobotAnimator status={status} dialogue={dialogue} />
          </div>
          <div className="lg:col-span-6 flex justify-center items-center">
            <UnifiedChessBoard
              fen={displayFen}
              game={displayGameRef.current}
              isFlipped={false}
              onPieceDrop={() => false}
              customSquareStyles={{}}
              phase="blind"
              boardWidth={Math.min(450, window.innerWidth - 32)}
            />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-4 justify-center">
            <RobotMoveLog moves={moves} />
            <RobotStatusPanel status={status} moveCount={moves.length} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotChaosBlindPhase;

const ROBOT_DIALOGUES = {
  starting: [
    "🤖 'Time to show you how it's really done!'",
    "🤖 'Activating chaos protocols... standby human'",
    "🤖 'Prepare to witness artificial unintelligence!'",
  ],
  moving: [
    "🤖 'This move is 200 IQ, you wouldn't understand'",
    "🤖 'Trust the process, human. I'm helping... probably'",
    "🤖 'This is strategic chaos, not random chaos!'",
    "🤖 'Humans play chess, I play 4D interdimensional warfare'",
    "🤖 'Beep boop, chaos executed successfully!'",
  ],
  finishing: [
    "🤖 'Chaos complete! Proceeding to reveal...'",
    "🤖 'My masterpiece is complete. You're welcome!'",
    "🤖 'Five moves of pure artistic chaos complete!'",
  ],
};
