// Type declarations for stockfish.js
declare module 'stockfish.js' {
  interface StockfishEngine {
    postMessage(message: string): void;
    onmessage: (event: MessageEvent | string) => void;
  }

  const Stockfish: new () => StockfishEngine;
  export default Stockfish;
}
