// components/LiveBoard/GameLayout.tsx - Fully Responsive
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
  lastMove?: { from: string; to: string } | null;

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
  lastMove = null,
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
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      {/* Mobile/Tablet Layout (sm and below) - Optimized for small screens */}
      <div className="flex flex-col xl:hidden gap-3 sm:gap-4">
        {/* Top Row - Both Timers side by side */}
        <div className="flex justify-between gap-2 sm:gap-3">
          <div className="flex-1 max-w-[180px] sm:max-w-[220px]">
            <TimerPanel
              label="BLACK"
              time={blackTime}
              active={currentTurn === 'b' && !gameEnded}
            />
          </div>
          <div className="flex-1 max-w-[180px] sm:max-w-[220px]">
            <TimerPanel
              label="WHITE"
              time={whiteTime}
              active={currentTurn === 'w' && !gameEnded}
            />
          </div>
        </div>

        {/* Main Content - Board takes priority */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start">
          {/* Chess Board - Larger and centered */}
          <div className="flex-1 flex justify-center w-full lg:w-auto">
            <GameBoard
              fen={fen}
              onPieceDrop={onPieceDrop}
              boardWidth={Math.min(
                500, // Increased max size
                typeof window !== 'undefined'
                  ? Math.min(window.innerWidth - 40, window.innerHeight - 300)
                  : 400
              )}
              gameEnded={gameEnded}
              currentTurn={currentTurn}
              lastMove={lastMove}
            />
          </div>

          {/* Side Panel - Stats and Move History */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-3 sm:gap-4">
            {/* Battle Stats - Compact */}
            <div className="lg:hidden">
              <BattleStats
                total={totalMoves}
                blind={blindMoves}
                live={liveMoves}
                compact={true}
              />
            </div>
            <div className="hidden lg:block">
              <BattleStats
                total={totalMoves}
                blind={blindMoves}
                live={liveMoves}
                compact={false}
              />
            </div>

            {/* Move History - Responsive height */}
            <div className="flex-1">
              <ChronicleLog
                whiteMoves={whiteMoves}
                blackMoves={blackMoves}
                liveMoveHistory={liveMoveHistory}
                compact={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (xl and above) - 3 column layout */}
      <div className="hidden xl:grid xl:grid-cols-12 gap-6 items-start">
        {/* Left Column - Black Timer & Stats */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          <TimerPanel
            label="BLACK"
            time={blackTime}
            active={currentTurn === 'b' && !gameEnded}
          />
          <BattleStats total={totalMoves} blind={blindMoves} live={liveMoves} />
        </div>

        {/* Center Column - Chess Board (larger on desktop) */}
        <div className="xl:col-span-6 flex justify-center">
          <GameBoard
            fen={fen}
            onPieceDrop={onPieceDrop}
            boardWidth={Math.min(
              550,
              typeof window !== 'undefined' ? window.innerHeight - 200 : 500
            )} // Responsive to screen height
            gameEnded={gameEnded}
            currentTurn={currentTurn}
            lastMove={lastMove}
          />
        </div>

        {/* Right Column - White Timer & Move History */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          <TimerPanel
            label="WHITE"
            time={whiteTime}
            active={currentTurn === 'w' && !gameEnded}
          />
          <div className="flex-1">
            <ChronicleLog
              whiteMoves={whiteMoves}
              blackMoves={blackMoves}
              liveMoveHistory={liveMoveHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
