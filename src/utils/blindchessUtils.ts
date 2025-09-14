// src/utils/blindchessUtils.ts - 5+0 Signature Utilities
import { BLINDCHESS_CONSTANTS } from '../screens/lobbyPage/types/lobby.types';

/**
 * BlindChess 5+0 Signature Utilities
 * Centralized functions for handling the signature time control
 */

export const blindchessUtils = {
  /**
   * Validate if a time control matches BlindChess signature
   */
  isSignatureTimeControl(timeControl: string): boolean {
    return timeControl === BLINDCHESS_CONSTANTS.TIME_CONTROL;
  },

  /**
   * Get the signature time control (always returns '5+0')
   */
  getSignatureTimeControl(): '5+0' {
    return BLINDCHESS_CONSTANTS.TIME_CONTROL;
  },

  /**
   * Parse time control into minutes and increment
   */
  parseTimeControl(timeControl: '5+0'): { minutes: number; increment: number } {
    if (timeControl !== '5+0') {
      console.warn('⚠️ Non-signature time control detected, defaulting to 5+0');
    }

    return {
      minutes: BLINDCHESS_CONSTANTS.TIME_CONTROL_MINUTES,
      increment: BLINDCHESS_CONSTANTS.TIME_CONTROL_INCREMENT,
    };
  },

  /**
   * Convert time control to milliseconds for timers
   */
  timeControlToMs(timeControl: '5+0'): {
    initialTimeMs: number;
    incrementMs: number;
  } {
    const { minutes, increment } = this.parseTimeControl(timeControl);
    return {
      initialTimeMs: minutes * 60 * 1000,
      incrementMs: increment * 1000,
    };
  },

  /**
   * Format time control for display
   */
  formatTimeControl(timeControl: '5+0'): string {
    if (!this.isSignatureTimeControl(timeControl)) {
      return `${timeControl} (Non-signature)`;
    }
    return `${timeControl} - ${BLINDCHESS_CONSTANTS.SIGNATURE}`;
  },

  /**
   * Get signature branding info
   */
  getSignatureBranding() {
    return {
      timeControl: BLINDCHESS_CONSTANTS.TIME_CONTROL,
      description: BLINDCHESS_CONSTANTS.DESCRIPTION,
      signature: BLINDCHESS_CONSTANTS.SIGNATURE,
      blindMoves: BLINDCHESS_CONSTANTS.BLIND_MOVES_COUNT,
      theme: {
        primaryColor: 'emerald',
        secondaryColor: 'blue',
        accentColor: 'yellow',
      },
    };
  },

  /**
   * Calculate estimated game duration
   */
  getEstimatedGameDuration(): {
    minMinutes: number;
    maxMinutes: number;
    averageMinutes: number;
    description: string;
  } {
    const blindPhaseMinutes = 2; // Estimated blind phase time
    const livePhaseMinutes = BLINDCHESS_CONSTANTS.TIME_CONTROL_MINUTES * 2; // Both players

    return {
      minMinutes: blindPhaseMinutes + 2, // Quick games
      maxMinutes: blindPhaseMinutes + livePhaseMinutes, // Full time usage
      averageMinutes: blindPhaseMinutes + livePhaseMinutes * 0.6, // 60% time usage average
      description: `Perfect ${
        blindPhaseMinutes + livePhaseMinutes * 0.6
      }-minute battles`,
    };
  },

  /**
   * Validate room configuration for signature compliance
   */
  validateRoomConfig(config: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check time control
    if (!config.timeControl) {
      errors.push('Time control is required');
    } else if (!this.isSignatureTimeControl(config.timeControl)) {
      errors.push(
        `Time control must be ${BLINDCHESS_CONSTANTS.TIME_CONTROL} (BlindChess Signature)`
      );
    }

    // Check entry fee reasonableness
    if (config.entryFee < 0) {
      errors.push('Entry fee cannot be negative');
    } else if (config.entryFee > 1000) {
      warnings.push('High entry fee may limit players');
    }

    // Check mode
    if (!config.mode || !['classic', 'robochaos'].includes(config.mode)) {
      errors.push('Valid game mode is required (classic or robochaos)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Generate room name with signature branding
   */
  generateSignatureRoomName(hostName?: string, mode?: string): string {
    const modeText = mode === 'robochaos' ? 'RoboChaos' : 'Classic';
    if (hostName) {
      return `${hostName}'s BlindChess ${modeText} (5+0)`;
    }
    return `BlindChess ${modeText} Battle - 5+0 Signature`;
  },

  /**
   * Check if player can afford signature battles
   */
  getAffordableEntryFees(playerGold: number): number[] {
    const standardFees = [0, 25, 50, 100, 200, 500];
    return standardFees.filter((fee) => fee <= playerGold);
  },

  /**
   * Get signature achievement thresholds
   */
  getSignatureAchievements() {
    return {
      firstBlindChess: { games: 1, title: '5+0 Initiate' },
      regularPlayer: { games: 10, title: '5+0 Regular' },
      veteran: { games: 50, title: '5+0 Veteran' },
      master: { games: 200, title: '5+0 Master' },
      legend: { games: 1000, title: '5+0 Legend' },
    };
  },
};

/**
 * Type guard to ensure time control is signature compliant
 */
export function isSignatureTimeControl(timeControl: any): timeControl is '5+0' {
  return timeControl === '5+0';
}

/**
 * Convert any time control to signature (for migration/fallback)
 */
export function normalizeToSignature(timeControl: any): '5+0' {
  if (isSignatureTimeControl(timeControl)) {
    return timeControl;
  }

  console.warn('⚠️ Converting non-signature time control to 5+0:', timeControl);
  return '5+0';
}

export default blindchessUtils;
