// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 ENHANCED PIECE TRACKER - CLEAN VERSION
// ═══════════════════════════════════════════════════════════════════════════════

import { Chess } from 'chess.js';

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 CORE INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface PieceMovement {
  pieceId: string;
  moveCount: number;
  moves: Array<{
    from: string;
    to: string;
    san: string;
    moveNumber: number;
  }>;
  isExhausted: boolean;
}

export interface MovementSummary {
  totalPiecesMoved: number;
  exhaustedPieces: number;
  totalMoves: number;
  remainingMoves: number;
  movementDetails: PieceMovement[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎮 ENHANCED PIECE TRACKER
// ─────────────────────────────────────────────────────────────────────────────

export class EnhancedPieceTracker {
  private movements: Map<string, PieceMovement> = new Map();
  private readonly maxMovesPerPiece: number;
  private readonly maxTotalMoves: number;
  private pieceIdentityMap: Map<string, string> = new Map(); // key = currentSquare, value = originalSquare

  constructor(maxMovesPerPiece: number = 2, maxTotalMoves: number = 5) {
    this.maxMovesPerPiece = maxMovesPerPiece;
    this.maxTotalMoves = maxTotalMoves;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🔑 PIECE IDENTIFICATION
  // ─────────────────────────────────────────────────────────────────────────

  private resolvePieceId(piece: any, square: string): string {
    const origin = this.pieceIdentityMap.get(square) ?? square;
    return `${piece.color}${piece.type}_${origin}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 📊 MOVEMENT TRACKING
  // ─────────────────────────────────────────────────────────────────────────

  recordMove(
    game: Chess,
    from: string,
    to: string,
    san: string,
    moveNumber: number
  ): void {
    const piece = game.get(to as any);
    if (!piece) return;

    // If it's the first time we see this piece, register its identity
    const existingId = this.pieceIdentityMap.get(from);
    const originSquare = existingId ?? from;

    // Update the registry with new square (piece moved)
    this.pieceIdentityMap.set(to, originSquare);

    const pieceId = `${piece.color}${piece.type}_${originSquare}`;

    if (!this.movements.has(pieceId)) {
      this.movements.set(pieceId, {
        pieceId,
        moveCount: 0,
        moves: [],
        isExhausted: false,
      });
    }

    const movement = this.movements.get(pieceId)!;
    movement.moveCount++;
    movement.moves.push({ from, to, san, moveNumber });
    movement.isExhausted = movement.moveCount >= this.maxMovesPerPiece;

    this.movements.set(pieceId, movement);
  }

  canPieceMove(piece: any, square: string): boolean {
    const pieceId = this.resolvePieceId(piece, square);
    const movement = this.movements.get(pieceId);
    return !movement || movement.moveCount < this.maxMovesPerPiece;
  }

  getPieceMoveCount(piece: any, square: string): number {
    const pieceId = this.resolvePieceId(piece, square);
    const movement = this.movements.get(pieceId);
    return movement ? movement.moveCount : 0;
  }

  isPieceExhausted(piece: any, square: string): boolean {
    const pieceId = this.resolvePieceId(piece, square);
    const movement = this.movements.get(pieceId);
    return !!movement?.isExhausted;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 📈 ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────

  getTotalMoves(): number {
    return Array.from(this.movements.values()).reduce(
      (sum, m) => sum + m.moveCount,
      0
    );
  }

  canAddMoreMoves(): boolean {
    return this.getTotalMoves() < this.maxTotalMoves;
  }

  getRemainingMoves(): number {
    return Math.max(0, this.maxTotalMoves - this.getTotalMoves());
  }

  getMovementSummary(): MovementSummary {
    const movements = Array.from(this.movements.values());
    const totalMoves = this.getTotalMoves();

    return {
      totalPiecesMoved: movements.length,
      exhaustedPieces: movements.filter((m) => m.isExhausted).length,
      totalMoves,
      remainingMoves: this.getRemainingMoves(),
      movementDetails: movements,
    };
  }

  getConfig(): { maxMovesPerPiece: number; maxTotalMoves: number } {
    return {
      maxMovesPerPiece: this.maxMovesPerPiece,
      maxTotalMoves: this.maxTotalMoves,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🔄 STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  reset(): void {
    this.movements.clear();
  }

  clone(): EnhancedPieceTracker {
    const cloned = new EnhancedPieceTracker(
      this.maxMovesPerPiece,
      this.maxTotalMoves
    );
    for (const [key, value] of this.movements) {
      cloned.movements.set(key, {
        ...value,
        moves: [...value.moves],
      });
    }
    return cloned;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🛠️ DEBUGGING
  // ─────────────────────────────────────────────────────────────────────────

  debugState(): void {
    console.log('🎯 Piece Tracker State:');
    console.log(
      `├── Total Moves: ${this.getTotalMoves()}/${this.maxTotalMoves}`
    );
    console.log(`├── Remaining: ${this.getRemainingMoves()}`);
    console.log(`└── Pieces: ${this.movements.size}`);

    this.movements.forEach((movement, pieceId) => {
      console.log(
        `    ├── ${pieceId}: ${movement.moveCount}/${this.maxMovesPerPiece}`
      );
    });
  }
}
