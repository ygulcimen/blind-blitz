// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 BLIND CHESS RULE ENGINE - CLEAN VERSION
// ═══════════════════════════════════════════════════════════════════════════════

import { Chess } from 'chess.js';
import {
  EnhancedPieceTracker,
  type MovementSummary,
} from './EnhancedPieceTracker';

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 RULE INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface RuleViolation {
  type: 'PIECE_EXHAUSTED' | 'MOVE_LIMIT' | 'INVALID_MOVE' | 'TURN_VIOLATION';
  message: string;
  pieceId?: string;
  square?: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface RuleValidationResult {
  isValid: boolean;
  violations: RuleViolation[];
  canContinue: boolean;
}

export interface RuleEngineState {
  pieceTracker: EnhancedPieceTracker;
  summary: MovementSummary;
  canAddMoreMoves: boolean;
  remainingMoves: number;
  totalMoves: number;
}

export type RuleFunction = (
  game: Chess,
  move: { from: string; to: string; promotion?: string },
  tracker: EnhancedPieceTracker
) => RuleViolation[];

// ─────────────────────────────────────────────────────────────────────────────
// 🔥 RULE ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class BlindChessRuleEngine {
  private pieceTracker: EnhancedPieceTracker;
  private rules: Map<string, RuleFunction>;
  private isEnabled: boolean = true;

  constructor(maxMovesPerPiece: number = 2, maxTotalMoves: number = 5) {
    this.pieceTracker = new EnhancedPieceTracker(
      maxMovesPerPiece,
      maxTotalMoves
    );
    this.rules = new Map();
    this.initializeDefaultRules();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🏗️ RULE INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  private initializeDefaultRules(): void {
    // Rule 1: Piece Move Limit
    this.addRule('PIECE_MOVE_LIMIT', (game, move, tracker) => {
      const violations: RuleViolation[] = [];
      const piece = game.get(move.from as any);

      if (!piece) {
        violations.push({
          type: 'INVALID_MOVE',
          message: 'No piece found at source square',
          square: move.from,
          severity: 'ERROR',
        });
        return violations;
      }

      if (!tracker.canPieceMove(piece, move.from)) {
        const moveCount = tracker.getPieceMoveCount(piece, move.from);
        const config = tracker.getConfig();
        violations.push({
          type: 'PIECE_EXHAUSTED',
          message: `This ${piece.type} has already moved ${moveCount} times (limit: ${config.maxMovesPerPiece})`,
          square: move.from,
          severity: 'ERROR',
        });
      }

      return violations;
    });

    // Rule 2: Total Move Limit
    this.addRule('TOTAL_MOVE_LIMIT', (game, move, tracker) => {
      const violations: RuleViolation[] = [];
      const totalMoves = tracker.getTotalMoves();
      const config = tracker.getConfig();

      if (totalMoves >= config.maxTotalMoves) {
        violations.push({
          type: 'MOVE_LIMIT',
          message: `Maximum of ${config.maxTotalMoves} moves allowed in blind phase`,
          severity: 'ERROR',
        });
      }

      return violations;
    });

    // Rule 3: Chess Validity
    this.addRule('CHESS_VALIDITY', (game, move, tracker) => {
      const violations: RuleViolation[] = [];
      const testGame = new Chess(game.fen());

      try {
        const result = testGame.move(move);
        if (!result) {
          violations.push({
            type: 'INVALID_MOVE',
            message: 'This move is not legal in chess',
            square: move.from,
            severity: 'ERROR',
          });
        }
      } catch (error) {
        violations.push({
          type: 'INVALID_MOVE',
          message: 'Invalid move format or illegal move',
          square: move.from,
          severity: 'ERROR',
        });
      }

      return violations;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🔍 VALIDATION METHODS
  // ─────────────────────────────────────────────────────────────────────────

  validateMove(
    game: Chess,
    move: { from: string; to: string; promotion?: string }
  ): RuleValidationResult {
    if (!this.isEnabled) {
      return {
        isValid: true,
        violations: [],
        canContinue: true,
      };
    }

    const allViolations: RuleViolation[] = [];

    // Run all rules
    for (const [ruleName, ruleFunction] of this.rules) {
      try {
        const violations = ruleFunction(game, move, this.pieceTracker);
        allViolations.push(...violations);
      } catch (error) {
        allViolations.push({
          type: 'INVALID_MOVE',
          message: `Rule "${ruleName}" failed to execute`,
          severity: 'ERROR',
        });
      }
    }

    const errors = allViolations.filter((v) => v.severity === 'ERROR');
    const isValid = errors.length === 0;

    return {
      isValid,
      violations: allViolations,
      canContinue: isValid,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 📝 MOVE PROCESSING
  // ─────────────────────────────────────────────────────────────────────────

  processMove(
    game: Chess,
    move: { from: string; to: string; san: string },
    moveNumber: number
  ): void {
    this.pieceTracker.recordMove(
      game,
      move.from,
      move.to,
      move.san,
      moveNumber
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 📊 STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  getRuleState(): RuleEngineState {
    const summary = this.pieceTracker.getMovementSummary();

    return {
      pieceTracker: this.pieceTracker,
      summary,
      canAddMoreMoves: this.pieceTracker.canAddMoreMoves(),
      remainingMoves: this.pieceTracker.getRemainingMoves(),
      totalMoves: this.pieceTracker.getTotalMoves(),
    };
  }

  getPieceTracker(): EnhancedPieceTracker {
    return this.pieceTracker;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🛠️ RULE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  addRule(name: string, ruleFunction: RuleFunction): void {
    this.rules.set(name, ruleFunction);
  }

  removeRule(name: string): boolean {
    return this.rules.delete(name);
  }

  getRuleNames(): string[] {
    return Array.from(this.rules.keys());
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isRuleEngineEnabled(): boolean {
    return this.isEnabled;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🔄 LIFECYCLE METHODS
  // ─────────────────────────────────────────────────────────────────────────

  reset(): void {
    this.pieceTracker.reset();
  }

  clone(): BlindChessRuleEngine {
    const cloned = new BlindChessRuleEngine();
    cloned.pieceTracker = this.pieceTracker.clone();
    cloned.rules = new Map(this.rules);
    cloned.isEnabled = this.isEnabled;
    return cloned;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🛠️ DEBUGGING
  // ─────────────────────────────────────────────────────────────────────────

  debugState(): void {
    console.log('🔥 Rule Engine State:');
    console.log(`├── Enabled: ${this.isEnabled}`);
    console.log(`├── Rules: ${this.getRuleNames().join(', ')}`);
    console.log('└── Tracker:');
    this.pieceTracker.debugState();
  }
}
