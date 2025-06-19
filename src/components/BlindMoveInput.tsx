import { useState } from 'react';
import type { BlindSequence } from '../types/BlindTypes';

interface Props {
  player: 'P1' | 'P2';
  onSubmit: (moves: BlindSequence) => void;
}

const BlindMoveInput = ({ player, onSubmit }: Props) => {
  const [inputs, setInputs] = useState<string[]>(Array(5).fill(''));

  const handleChange = (i: number, v: string) => {
    const clone = [...inputs];
    clone[i] = v;
    setInputs(clone);
  };

  // src/components/BlindMoveInput.tsx  (update handleSubmit)
  // …imports unchanged…
  const handleSubmit = () => {
    const seq: BlindSequence = inputs.map((raw) => {
      const algebraic = raw.trim().toLowerCase(); // 1 ➜ trim & lowercase

      // ✅ validate the *sanitised* string, not the raw one
      if (!/^[a-h][1-8][a-h][1-8]$/.test(algebraic)) {
        alert(
          `Invalid entry: "${raw}" — please use exactly 4 chars, e.g. e2e4`
        );
        throw new Error('invalid move input'); // stop submission
      }

      return {
        from: algebraic.slice(0, 2),
        to: algebraic.slice(2, 4),
        san: algebraic,
      };
    });

    onSubmit(seq); // send only clean moves
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-800">
      <h3 className="font-semibold mb-2">{player}: enter 5 moves (e2e4…)</h3>
      {inputs.map((val, i) => (
        <input
          key={i}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          placeholder="e2e4"
          className="border px-2 py-1 mr-2 mb-2 w-20 text-center text-black"
        />
      ))}
      <button
        className="bg-indigo-600 text-white px-3 py-1 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default BlindMoveInput;
