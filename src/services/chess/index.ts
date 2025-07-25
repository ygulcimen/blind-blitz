// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 BLIND CHESS RULE ENGINE - MAIN EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Core Components
export { EnhancedPieceTracker } from './EnhancedPieceTracker';
export { BlindChessRuleEngine } from './BlindChessRuleEngine';
export { VisualFeedbackHelper } from './VisualFeedbackHelper';

// Types - Piece Tracker
export type { PieceMovement, MovementSummary } from './EnhancedPieceTracker';

// Types - Rule Engine
export type {
  RuleViolation,
  RuleValidationResult,
  RuleEngineState,
  RuleFunction,
} from './BlindChessRuleEngine';

// Types - Visual Feedback
export type {
  SquareIndicator,
  SquareStyle,
  ViolationDisplay,
} from './VisualFeedbackHelper';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════════

/*
// Basic usage example:

import { BlindChessRuleEngine, VisualFeedbackHelper } from './index';
import { Chess } from 'chess.js';

// Initialize
const game = new Chess();
const ruleEngine = new BlindChessRuleEngine(2, 5); // 2 moves per piece, 5 total

// Validate a move
const result = ruleEngine.validateMove(game, { from: 'e2', to: 'e4' });

if (result.isValid) {
  // Make the move
  const move = game.move({ from: 'e2', to: 'e4' });
  if (move) {
    // Record in rule engine
    ruleEngine.processMove(game, move, 1);
    
    // Get visual feedback
    const indicators = VisualFeedbackHelper.getPieceIndicators(game, ruleEngine, 'w');
    const styles = VisualFeedbackHelper.getSquareStyles(indicators);
  }
} else {
  // Handle violations
  const violations = VisualFeedbackHelper.formatMultipleViolations(result.violations);
  console.log('Move violations:', violations);
}

// Get current state
const state = ruleEngine.getRuleState();
console.log(`Moves: ${state.totalMoves}/${state.summary.totalMoves}`);
console.log(`Remaining: ${state.remainingMoves}`);
*/
