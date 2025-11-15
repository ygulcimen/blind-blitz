// Simple Stockfish bot service for stronger bot moves
import { Chess } from 'chess.js';

interface StockfishMove {
  from: string;
  to: string;
  promotion?: string;
}

class StockfishBot {
  private engine: any = null;
  private isReady = false;
  private moveCallback: ((move: StockfishMove | null) => void) | null = null;

  async initialize(): Promise<void> {
    if (this.engine) {
      console.log('🤖 Stockfish already initialized');
      return;
    }

    try {
      console.log('🤖 Initializing Stockfish engine...');

      // Use dynamic import to avoid bundling issues
      const StockfishModule = await import('stockfish.js');
      const Stockfish = StockfishModule.default || StockfishModule;

      this.engine = new Stockfish();

      // Set up message handler
      this.engine.onmessage = (event: MessageEvent) => {
        const message = event.data || event;
        this.handleEngineMessage(message);
      };

      // Initialize engine
      this.engine.postMessage('uci');

      // Wait for engine to be ready
      await this.waitForReady();

      console.log('✅ Stockfish initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Stockfish:', error);
      throw error;
    }
  }

  private waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if (!this.isReady) {
          console.warn('⚠️ Stockfish ready timeout, proceeding anyway');
          this.isReady = true;
        }
        resolve();
      }, 5000);
    });
  }

  private handleEngineMessage(message: string): void {
    console.log('🤖 Stockfish:', message);

    if (message.includes('uciok')) {
      this.isReady = true;
    }

    if (message.startsWith('bestmove')) {
      const parts = message.split(' ');
      const moveStr = parts[1];

      if (moveStr && moveStr !== '(none)') {
        const move: StockfishMove = {
          from: moveStr.substring(0, 2),
          to: moveStr.substring(2, 4),
          promotion: moveStr.length > 4 ? moveStr.substring(4) : undefined,
        };

        if (this.moveCallback) {
          this.moveCallback(move);
          this.moveCallback = null;
        }
      } else {
        if (this.moveCallback) {
          this.moveCallback(null);
          this.moveCallback = null;
        }
      }
    }
  }

  async getBestMove(
    fen: string,
    skillLevel: number = 10,
    thinkTime: number = 1000
  ): Promise<StockfishMove | null> {
    if (!this.engine || !this.isReady) {
      console.error('❌ Stockfish not initialized');
      return null;
    }

    return new Promise((resolve) => {
      this.moveCallback = resolve;

      // Set skill level (0-20, where 20 is strongest)
      this.engine.postMessage(`setoption name Skill Level value ${skillLevel}`);

      // Set position
      this.engine.postMessage(`position fen ${fen}`);

      // Calculate best move
      this.engine.postMessage(`go movetime ${thinkTime}`);

      // Timeout fallback
      setTimeout(() => {
        if (this.moveCallback) {
          console.warn('⚠️ Stockfish move timeout');
          this.moveCallback(null);
          this.moveCallback = null;
        }
      }, thinkTime + 2000);
    });
  }

  async getRandomMove(fen: string): Promise<StockfishMove | null> {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });

    if (moves.length === 0) return null;

    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return {
      from: randomMove.from,
      to: randomMove.to,
      promotion: randomMove.promotion,
    };
  }

  destroy(): void {
    if (this.engine) {
      this.engine.postMessage('quit');
      this.engine = null;
      this.isReady = false;
    }
  }
}

// Singleton instance
let stockfishInstance: StockfishBot | null = null;

export function getStockfishBot(): StockfishBot {
  if (!stockfishInstance) {
    stockfishInstance = new StockfishBot();
  }
  return stockfishInstance;
}

export function destroyStockfishBot(): void {
  if (stockfishInstance) {
    stockfishInstance.destroy();
    stockfishInstance = null;
  }
}
