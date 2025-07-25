// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 VISUAL FEEDBACK HELPER - CLEAN VERSION
// ═══════════════════════════════════════════════════════════════════════════════

import { Chess } from 'chess.js';
import {
  BlindChessRuleEngine,
  type RuleViolation,
} from './BlindChessRuleEngine';

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 VISUAL INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface SquareIndicator {
  moveCount: string; // e.g., "1/2", "2/2"
  status: 'available' | 'exhausted' | 'warning';
  color: 'green' | 'red' | 'yellow';
}

export interface SquareStyle {
  backgroundColor: string;
  border: string;
  opacity?: number;
}

export interface ViolationDisplay {
  icon: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  color: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎨 VISUAL FEEDBACK HELPER
// ─────────────────────────────────────────────────────────────────────────────

export class VisualFeedbackHelper {
  // ─────────────────────────────────────────────────────────────────────────
  // 🎯 PIECE INDICATORS
  // ─────────────────────────────────────────────────────────────────────────

  static getPieceIndicators(
    game: Chess,
    ruleEngine: BlindChessRuleEngine,
    playerColor: string
  ): { [square: string]: SquareIndicator } {
    const indicators: { [square: string]: SquareIndicator } = {};
    const position = game.board();
    const { pieceTracker } = ruleEngine.getRuleState();

    position.forEach((row, rowIndex) => {
      row.forEach((piece, colIndex) => {
        if (piece && piece.color === playerColor) {
          const square = String.fromCharCode(97 + colIndex) + (8 - rowIndex);
          const moveCount = pieceTracker.getPieceMoveCount(piece, square);
          const canMove = pieceTracker.canPieceMove(piece, square);
          const config = pieceTracker.getConfig();

          if (moveCount > 0 || !canMove) {
            const status = !canMove
              ? 'exhausted'
              : moveCount === config.maxMovesPerPiece - 1
              ? 'warning'
              : 'available';

            indicators[square] = {
              moveCount: `${moveCount}/${config.maxMovesPerPiece}`,
              status,
              color:
                status === 'exhausted'
                  ? 'red'
                  : status === 'warning'
                  ? 'yellow'
                  : 'green',
            };
          }
        }
      });
    });

    return indicators;
  }

  // Backward compatibility
  static getSimplePieceIndicators(
    game: Chess,
    ruleEngine: BlindChessRuleEngine,
    playerColor: string
  ): { [square: string]: string } {
    const indicators = this.getPieceIndicators(game, ruleEngine, playerColor);
    const simple: { [square: string]: string } = {};

    Object.entries(indicators).forEach(([square, indicator]) => {
      simple[square] = indicator.moveCount;
    });

    return simple;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🎨 SQUARE STYLING
  // ─────────────────────────────────────────────────────────────────────────

  static getSquareStyles(indicators: { [square: string]: SquareIndicator }): {
    [square: string]: SquareStyle;
  } {
    const styles: { [square: string]: SquareStyle } = {};

    Object.entries(indicators).forEach(([square, indicator]) => {
      switch (indicator.status) {
        case 'exhausted':
          styles[square] = {
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            border: '2px solid #ef4444',
            opacity: 0.8,
          };
          break;
        case 'warning':
          styles[square] = {
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            border: '2px solid #f59e0b',
            opacity: 0.9,
          };
          break;
        case 'available':
        default:
          styles[square] = {
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            border: '2px solid #22c55e',
            opacity: 0.9,
          };
          break;
      }
    });

    return styles;
  }

  static getEnhancedSquareStyles(
    game: Chess,
    pieceTracker: any,
    playerColor: string
  ): { [square: string]: SquareStyle } {
    const indicators = this.getPieceIndicators(
      game,
      {
        getRuleState: () => ({ pieceTracker }), // Trick to match the ruleEngine interface
      } as BlindChessRuleEngine,
      playerColor
    );

    return this.getSquareStyles(indicators);
  }

  // Backward compatibility
  static getSimpleSquareStyles(indicators: { [square: string]: string }): {
    [square: string]: SquareStyle;
  } {
    const styles: { [square: string]: SquareStyle } = {};

    Object.entries(indicators).forEach(([square, count]) => {
      const isExhausted = count === '2/2';
      styles[square] = {
        backgroundColor: isExhausted
          ? 'rgba(239, 68, 68, 0.3)'
          : 'rgba(34, 197, 94, 0.3)',
        border: isExhausted ? '2px solid #ef4444' : '2px solid #22c55e',
      };
    });

    return styles;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🚨 VIOLATION DISPLAY
  // ─────────────────────────────────────────────────────────────────────────

  static formatRuleViolation(violation: RuleViolation): ViolationDisplay {
    const iconMap = {
      PIECE_EXHAUSTED: '🚫',
      MOVE_LIMIT: '⚠️',
      INVALID_MOVE: '❌',
      TURN_VIOLATION: '🔄',
    };

    const colorMap = {
      ERROR: '#ef4444',
      WARNING: '#f59e0b',
      INFO: '#3b82f6',
    };

    return {
      icon: iconMap[violation.type] || '⚠️',
      message: violation.message,
      severity: violation.severity.toLowerCase() as
        | 'error'
        | 'warning'
        | 'info',
      color: colorMap[violation.severity] || '#6b7280',
    };
  }

  static formatMultipleViolations(
    violations: RuleViolation[]
  ): ViolationDisplay[] {
    return violations.map((v) => this.formatRuleViolation(v));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 📊 MOVE SUMMARY DISPLAY
  // ─────────────────────────────────────────────────────────────────────────

  static formatMoveSummary(ruleEngine: BlindChessRuleEngine): {
    totalMoves: string;
    remainingMoves: string;
    status: 'good' | 'warning' | 'danger';
    color: string;
  } {
    const state = ruleEngine.getRuleState();
    const { totalMoves, remainingMoves } = state;
    const config = state.pieceTracker.getConfig();

    let status: 'good' | 'warning' | 'danger' = 'good';
    let color = '#22c55e';

    if (remainingMoves === 0) {
      status = 'danger';
      color = '#ef4444';
    } else if (remainingMoves <= 1) {
      status = 'warning';
      color = '#f59e0b';
    }

    return {
      totalMoves: `${totalMoves}/${config.maxTotalMoves}`,
      remainingMoves: `${remainingMoves} remaining`,
      status,
      color,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 🎯 UTILITY METHODS
  // ─────────────────────────────────────────────────────────────────────────

  static canHighlightSquare(
    square: string,
    indicators: { [square: string]: SquareIndicator }
  ): boolean {
    const indicator = indicators[square];
    return indicator ? indicator.status !== 'exhausted' : true;
  }

  static getSquareOpacity(
    square: string,
    indicators: { [square: string]: SquareIndicator }
  ): number {
    const indicator = indicators[square];
    if (!indicator) return 1;

    switch (indicator.status) {
      case 'exhausted':
        return 0.5;
      case 'warning':
        return 0.8;
      default:
        return 1;
    }
  }
}
