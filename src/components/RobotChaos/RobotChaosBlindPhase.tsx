import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { UnifiedChessBoard } from '../shared/ChessBoard/UnifiedChessBoard';
import type { BlindSequence } from '../../types/BlindTypes';
import RobotAnimator from './RobotAnimator';
import RobotMoveLog from './RobotMoveLog';
import RobotStatusPanel from './RobotStatusPanel';
import { useCelestialBot } from '../../hooks/useCelestialBot';
import { celestialBotAI } from '../../services/celestialBotAI';
import { supabase } from '../../lib/supabase';

interface RobotChaosBlindPhaseProps {
  gameState: any;
  gameId?: string;
}

const MAX_MOVES = 5;
const MOVE_INTERVAL = 2000; // 2 seconds per move
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const ROBOT_MESSAGES = {
  starting: [
    "Time to show you how it's really done!",
    'Activating chaos protocols... standby human',
    'Prepare to witness artificial unintelligence!',
  ],
  moving: [
    "This move is 200 IQ, you wouldn't understand",
    "Trust the process, human. I'm helping... probably",
    'This is strategic chaos, not random chaos!',
    'Humans play chess, I play 4D interdimensional warfare',
    'Beep boop, chaos executed successfully!',
  ],
  finishing: [
    'Chaos complete! Proceeding to reveal...',
    "My masterpiece is complete. You're welcome!",
    'Five moves of pure artistic chaos complete!',
  ],
};

const getRandomMessage = (category: keyof typeof ROBOT_MESSAGES) => {
  const msgs = ROBOT_MESSAGES[category];
  return msgs[Math.floor(Math.random() * msgs.length)];
};

const generateRobotMoves = (color: 'w' | 'b'): BlindSequence => {
  const game = new Chess(INITIAL_FEN);
  const moves: BlindSequence = [];

  // Set starting turn
  if (color === 'b') {
    const parts = game.fen().split(' ');
    parts[1] = 'b';
    game.load(parts.join(' '));
  }

  // Generate 5 moves in sequence
  for (let i = 0; i < MAX_MOVES; i++) {
    const allMoves = game.moves({ verbose: true });
    if (!allMoves.length) break;

    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    const result = game.move({ from: randomMove.from, to: randomMove.to });

    if (result) {
      moves.push({ from: result.from, to: result.to, san: result.san });

      // Keep turn as same color for next move
      const parts = game.fen().split(' ');
      parts[1] = color;
      game.load(parts.join(' '));
    }
  }

  return moves;
};

const RobotChaosBlindPhase: React.FC<RobotChaosBlindPhaseProps> = ({
  gameState,
  gameId,
}) => {
  // Bot detection for bot games in robochaos mode
  const { isBotGame, bot, botColor } = useCelestialBot(gameId);
  const botSubmittedRef = useRef<boolean>(false);

  // Safety check for gameState structure
  if (!gameState?.gameState?.blind) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <div className="text-xl">Initializing robot chaos...</div>
        </div>
      </div>
    );
  }

  const [whiteMoves, setWhiteMoves] = useState<BlindSequence>([]);
  const [blackMoves, setBlackMoves] = useState<BlindSequence>([]);

  // Refs to store moves for setTimeout callbacks (fixes closure bug)
  const whiteMoveRef = useRef<BlindSequence>([]);
  const blackMoveRef = useRef<BlindSequence>([]);

  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [status, setStatus] = useState<
    'preparing' | 'thinking' | 'moving' | 'finished'
  >('preparing');
  const [dialogue, setDialogue] = useState('');
  const [displayFen, setDisplayFen] = useState(INITIAL_FEN);
  const hasStarted = useRef(false);
  const animationTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Determine player color and board orientation with safety checks
  const myColor = gameState.gameState?.blind?.myColor;
  if (!myColor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚡</div>
          <div className="text-xl">Waiting for player assignment...</div>
        </div>
      </div>
    );
  }

  const isBlackPlayer = myColor === 'black';
  const robotColor = isBlackPlayer ? 'b' : 'w';

  // Skip animation function
  const handleSkipAnimation = () => {
    console.log('🤖 Skipping animation...');

    // Clear all existing timeouts
    animationTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    animationTimeouts.current = [];

    // Force complete animation state
    setCurrentMoveIndex(5);
    setStatus('finished');
    setDialogue(getRandomMessage('finishing'));

    // Set final board state with all moves applied
    const finalGame = new Chess(INITIAL_FEN);
    if (isBlackPlayer) {
      const parts = finalGame.fen().split(' ');
      parts[1] = 'b';
      finalGame.load(parts.join(' '));
    }

    const playerMoves = isBlackPlayer
      ? blackMoveRef.current
      : whiteMoveRef.current;
    playerMoves.forEach((move) => {
      finalGame.move({ from: move.from, to: move.to });
      const parts = finalGame.fen().split(' ');
      parts[1] = robotColor;
      finalGame.load(parts.join(' '));
    });

    setDisplayFen(finalGame.fen());

    // Submit moves immediately
    setTimeout(async () => {
      console.log('🤖 Submitting moves after skip');
      if (gameState.submitBlindMoves) {
        console.log('🤖 White moves:', whiteMoveRef.current);
        console.log('🤖 Black moves:', blackMoveRef.current);

        try {
          await gameState.submitBlindMoves(whiteMoveRef.current, 'P1');
          await gameState.submitBlindMoves(blackMoveRef.current, 'P2');
          console.log('🤖 Both players moves submitted');

          // Manually trigger reveal transition for RobotChaos
          if (gameState.proceedToReveal) {
            console.log('🤖 Triggering reveal phase');
            setTimeout(() => {
              gameState.proceedToReveal();
            }, 1000);
          }
        } catch (error) {
          console.error('🤖 Error submitting moves:', error);
        }
      }
    }, 500);
  };

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Generate moves for both players immediately
    console.log('🤖 Generating robot moves...');
    const white = generateRobotMoves('w');
    const black = generateRobotMoves('b');

    console.log('🤖 Generated white moves:', white);
    console.log('🤖 Generated black moves:', black);

    // Store in both state (for UI) and refs (for setTimeout callbacks)
    whiteMoveRef.current = white;
    blackMoveRef.current = black;
    setWhiteMoves(white);
    setBlackMoves(black);

    console.log('🤖 Moves stored in state and refs');
    setStatus('preparing');
    setDialogue(getRandomMessage('starting'));

    // Start animation sequence after 1 second - use player's color moves
    setTimeout(() => {
      const playerMoves = isBlackPlayer ? black : white;
      animateMoves(playerMoves);
    }, 1000);
  }, [isBlackPlayer]);

  // Bot auto-submission for robochaos mode - Submit bot's random moves
  useEffect(() => {
    const submitBotRandomMoves = async () => {
      // Only proceed if:
      // 1. This is a bot game
      // 2. Bot hasn't submitted yet
      // 3. We have the bot config and gameId
      // 4. Human has submitted (check mySubmitted from gameState)
      if (!isBotGame || !bot || !botColor || botSubmittedRef.current || !gameId) {
        return;
      }

      const mySubmitted = gameState?.gameState?.blind?.mySubmitted;
      if (!mySubmitted) {
        return;
      }

      // Check if bot has already submitted (double-check from DB)
      try {
        const { data: botMoves, error } = await supabase
          .from('game_blind_moves')
          .select('is_submitted')
          .eq('game_id', gameId)
          .eq('player_color', botColor)
          .limit(1);

        if (error) {
          console.error('🤖 Error checking bot submission status:', error);
          return;
        }

        if (botMoves && botMoves.length > 0 && botMoves[0].is_submitted) {
          console.log('✅ Bot already submitted random moves');
          botSubmittedRef.current = true;
          return;
        }

        console.log(`🤖 RoboChaos: ${bot.config.name} generating blind phase moves...`);
        botSubmittedRef.current = true; // Prevent double submission

        // Use the same AI logic as classic mode (intelligent moves, not random)
        const botBlindMoves = await celestialBotAI.generateBlindPhaseMoves(
          bot.config,
          botColor
        );

        console.log(`✅ Bot generated moves: ${botBlindMoves.join(', ')}`);

        // Submit bot moves to database
        // NOTE: Moves are already in SAN format from the AI, so we need to parse them
        const botGame = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

        for (let i = 0; i < botBlindMoves.length; i++) {
          // Set the correct turn before making the move
          const currentFen = botGame.fen().split(' ');
          currentFen[1] = botColor === 'white' ? 'w' : 'b';
          botGame.load(currentFen.join(' '));

          const moveResult = botGame.move(botBlindMoves[i]);
          if (!moveResult) {
            console.error(`❌ Bot move ${i + 1} is invalid: ${botBlindMoves[i]}`);
            console.error(`Current FEN: ${botGame.fen()}`);
            console.error(`Attempted move: ${botBlindMoves[i]}`);
            continue;
          }

          const move = { from: moveResult.from, to: moveResult.to, san: moveResult.san };

          // Save each bot move to database using RLS-bypassing function
          const { data: insertResult, error: saveError } = await supabase.rpc(
            'insert_bot_blind_move',
            {
              p_game_id: gameId,
              p_player_color: botColor,
              p_move_number: i + 1,
              p_move_from: move.from,
              p_move_to: move.to,
              p_move_san: move.san,
              p_is_submitted: false,
            }
          );

          if (saveError || !insertResult?.success) {
            console.error(`❌ Error saving bot move ${i + 1}:`, {
              error: saveError,
              result: insertResult,
              moveData: {
                game_id: gameId,
                color: botColor,
                move_number: i + 1,
                move: botBlindMoves[i],
                from: moveResult.from,
                to: moveResult.to,
                san: moveResult.san
              }
            });
          }
        }

        // Mark bot moves as submitted using RLS-bypassing function
        const { data: submitResult, error: submitError } = await supabase.rpc(
          'mark_bot_moves_submitted',
          {
            p_game_id: gameId,
            p_player_color: botColor,
          }
        );

        if (submitError || !submitResult?.success) {
          console.error('❌ Error marking bot moves as submitted:', submitError || submitResult);
        } else {
          console.log(`✅ ${bot.config.name} submitted all blind moves in robochaos mode!`);
        }
      } catch (error) {
        console.error('❌ Error in bot random move auto-submission:', error);
        botSubmittedRef.current = false; // Allow retry
      }
    };

    submitBotRandomMoves();
  }, [isBotGame, bot, botColor, gameId, gameState?.gameState?.blind?.mySubmitted]);

  const animateMoves = (moves: BlindSequence) => {
    let index = 0;
    const game = new Chess(INITIAL_FEN); // Single instance that accumulates moves

    // Set correct starting turn
    if (isBlackPlayer) {
      const parts = game.fen().split(' ');
      parts[1] = 'b';
      game.load(parts.join(' '));
      setDisplayFen(game.fen());
    }

    const animateNextMove = () => {
      console.log(
        `🤖 animateNextMove called - index: ${index}, total moves: ${moves.length}, robot color: ${robotColor}`
      );

      if (index >= moves.length) {
        // All moves animated
        console.log('🤖 Animation complete, transitioning to finished state');
        setStatus('finished');
        setDialogue(getRandomMessage('finishing'));

        // Submit both players' moves after 2 seconds
        setTimeout(async () => {
          console.log('🤖 Submitting moves for both players');
          if (gameState.submitBlindMoves) {
            console.log('🤖 White moves:', whiteMoveRef.current);
            console.log('🤖 Black moves:', blackMoveRef.current);

            try {
              await gameState.submitBlindMoves(whiteMoveRef.current, 'P1');
              await gameState.submitBlindMoves(blackMoveRef.current, 'P2');
              console.log('🤖 Both players moves submitted');

              // Manually trigger reveal transition for RobotChaos
              if (gameState.proceedToReveal) {
                console.log('🤖 Triggering reveal phase');
                setTimeout(() => {
                  gameState.proceedToReveal();
                }, 1000);
              }
            } catch (error) {
              console.error('🤖 Error submitting moves:', error);
            }
          }
        }, 2000);
        return;
      }

      const move = moves[index];
      console.log(`🤖 Processing move ${index + 1}/${moves.length}:`, move);
      setCurrentMoveIndex(index + 1);
      setStatus('thinking');
      setDialogue(`Calculating move ${index + 1}...`);

      const moveTimeout = setTimeout(() => {
        setStatus('moving');
        setDialogue(getRandomMessage('moving'));

        // Make move on the SAME game instance (accumulating)
        const moveResult = game.move({ from: move.from, to: move.to });
        console.log('🤖 Move result:', moveResult);

        if (moveResult) {
          // Force turn back to robot color for next move
          const parts = game.fen().split(' ');
          parts[1] = robotColor;
          game.load(parts.join(' '));
          setDisplayFen(game.fen());
          console.log('🤖 Display FEN updated to:', game.fen());
        }

        index++;
        console.log(
          `🤖 Incrementing index to ${index}, scheduling next move in ${MOVE_INTERVAL}ms`
        );
        const nextMoveTimeout = setTimeout(() => {
          console.log('🤖 Timeout callback executing, calling animateNextMove');
          animateNextMove();
        }, MOVE_INTERVAL);
        animationTimeouts.current.push(nextMoveTimeout);
      }, 500);
      animationTimeouts.current.push(moveTimeout);
    };

    console.log(
      `🤖 Starting animation sequence for ${robotColor} robot with accumulating moves`
    );
    animateNextMove();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-violet-950 text-white overflow-hidden relative">
      {/* Cyberpunk animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-128 h-128 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Digital grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Animated scanlines */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 h-screen flex overflow-hidden">
        {/* Left: Robot Animator */}
        <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-purple-500/20 p-4 flex items-center justify-center relative">
          {/* Panel glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <RobotAnimator status={status} dialogue={dialogue} />
          </div>
        </div>

        {/* Center: Board */}
        <div className="flex-1 flex items-center justify-center">
          <UnifiedChessBoard
            fen={displayFen}
            game={new Chess(displayFen)}
            isFlipped={isBlackPlayer}
            onPieceDrop={() => false}
            customSquareStyles={{}}
            phase="blind"
            boardWidth={Math.min(500, window.innerWidth - 600)}
          />
        </div>

        {/* Right: Move Log & Controls */}
        <div className="w-72 bg-black/40 backdrop-blur-xl border-l border-purple-500/20 p-4 flex flex-col relative">
          {/* Panel glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex-1">
              <RobotMoveLog
                moves={(isBlackPlayer ? blackMoves : whiteMoves).slice(
                  0,
                  currentMoveIndex
                )}
                maxMoves={MAX_MOVES}
              />
            </div>

            <div className="mt-4">
              <RobotStatusPanel
                status={status}
                moveCount={currentMoveIndex}
                onSkip={status !== 'finished' ? handleSkipAnimation : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotChaosBlindPhase;
