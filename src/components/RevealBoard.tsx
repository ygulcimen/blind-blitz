import { Chessboard } from 'react-chessboard';

interface MoveLogItem {
  player: 'P1' | 'P2';
  san: string;
  isInvalid: boolean;
}

interface Props {
  fen: string;
  log: MoveLogItem[];
}

const RevealBoard = ({ fen, log }: Props) => {
  const whiteMoves: MoveLogItem[] = [];
  const blackMoves: MoveLogItem[] = [];

  // Separate into white/black
  log.forEach((entry) => {
    if (entry.player === 'P1') whiteMoves.push(entry);
    else if (entry.player === 'P2') blackMoves.push(entry);
  });

  const rows = Array.from({ length: 5 }).map((_, i) => ({
    white: whiteMoves[i],
    black: blackMoves[i],
  }));

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Chaos Revealed!</h2>

      <div className="flex gap-6">
        <Chessboard position={fen} boardWidth={480} />

        <div className="bg-gray-800 text-gray-100 rounded shadow-lg w-64 px-4 py-3 text-sm font-mono h-fit">
          <h3 className="text-center font-semibold mb-2">Moves</h3>

          <div className="grid grid-cols-3 text-gray-400 mb-1 px-1">
            <span>#</span>
            <span>White</span>
            <span>Black</span>
          </div>

          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 border-t border-gray-700 py-1 px-1"
            >
              <span className="text-gray-400">{i + 1}</span>
              <span className={row.white?.isInvalid ? 'text-red-400' : ''}>
                {row.white?.san ?? ''}
              </span>
              <span
                className={`text-right ${
                  row.black?.isInvalid ? 'text-red-400' : ''
                }`}
              >
                {row.black?.san ?? ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevealBoard;
