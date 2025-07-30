import React from 'react';
import { TimerPanel, BattleStats, ChronicleLog } from './index';
import GameBoard from './GameBoard';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
  from?: string;
  to?: string;
}

interface GameLayoutProps {
  // Board props
  fen: string;
  onPieceDrop: (source: string, target: string) => boolean;
  gameEnded: boolean;
  currentTurn: 'w' | 'b';

  // Timer props
  whiteTime: number;
  blackTime: number;

  // Stats props
  totalMoves: number;
  blindMoves: number;
  liveMoves: number;

  // Move history props
  whiteMoves: MoveLogItem[];
  blackMoves: MoveLogItem[];
  liveMoveHistory: string[];
}

const GameLayout: React.FC<GameLayoutProps> = ({
  fen,
  onPieceDrop,
  gameEnded,
  currentTurn,
  whiteTime,
  blackTime,
  totalMoves,
  blindMoves,
  liveMoves,
  whiteMoves,
  blackMoves,
  liveMoveHistory,
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Mobile/Tablet Layout - Stack everything vertically */}
      <div className="flex flex-col lg:hidden gap-6">
        {/* Top Row - Both Timers */}
        <div className="flex justify-between gap-4">
          <div className="flex-1">
            <TimerPanel
              label="BLACK"
              time={blackTime}
              active={currentTurn === 'b' && !gameEnded}
            />
          </div>
          <div className="flex-1">
            <TimerPanel
              label="WHITE"
              time={whiteTime}
              active={currentTurn === 'w' && !gameEnded}
            />
          </div>
        </div>

        {/* Chessboard - Full width on mobile */}
        <div className="flex justify-center">
          <GameBoard
            fen={fen}
            onPieceDrop={onPieceDrop}
            boardWidth={Math.min(
              400,
              typeof window !== 'undefined' ? window.innerWidth - 60 : 400
            )}
            gameEnded={gameEnded}
          />
        </div>

        {/* Bottom Row - Stats and Move History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BattleStats
            total={totalMoves}
            blind={blindMoves}
            live={liveMoves}
            compact={true}
          />
          <ChronicleLog
            whiteMoves={whiteMoves}
            blackMoves={blackMoves}
            liveMoveHistory={liveMoveHistory}
            compact={true}
          />
        </div>
      </div>

      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Side - Black Timer & Stats */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TimerPanel
            label="BLACK"
            time={blackTime}
            active={currentTurn === 'b' && !gameEnded}
          />
          <BattleStats total={totalMoves} blind={blindMoves} live={liveMoves} />
        </div>

        {/* Center - Chessboard */}
        <div className="lg:col-span-6 flex justify-center">
          <GameBoard
            fen={fen}
            onPieceDrop={onPieceDrop}
            boardWidth={420}
            gameEnded={gameEnded}
          />
        </div>

        {/* Right Side - White Timer & Move History */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TimerPanel
            label="WHITE"
            time={whiteTime}
            active={currentTurn === 'w' && !gameEnded}
          />
          <ChronicleLog
            whiteMoves={whiteMoves}
            blackMoves={blackMoves}
            liveMoveHistory={liveMoveHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
