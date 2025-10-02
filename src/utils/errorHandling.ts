// Error handling utilities

export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  GAME_STATE_ERROR: 'GAME_STATE_ERROR',
  INVALID_MOVE: 'INVALID_MOVE',
  TIMEOUT: 'TIMEOUT',
} as const;

export const handleServiceError = (error: unknown, context: string): GameError => {
  console.error(`[${context}] Error:`, error);

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new GameError(
      'Network request failed',
      ErrorCodes.NETWORK_ERROR,
      'Network connection lost. Please check your internet connection.'
    );
  }

  // Supabase errors
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;

    if (message.includes('JWT') || message.includes('auth')) {
      return new GameError(
        message,
        ErrorCodes.AUTH_ERROR,
        'Session expired. Please log in again.'
      );
    }

    if (message.includes('timeout')) {
      return new GameError(
        message,
        ErrorCodes.TIMEOUT,
        'Request timed out. Please try again.'
      );
    }

    return new GameError(
      message,
      ErrorCodes.DATABASE_ERROR,
      'Database error. Please try again.'
    );
  }

  // Unknown errors
  return new GameError(
    String(error),
    'UNKNOWN_ERROR',
    'An unexpected error occurred. Please try again.'
  );
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const gameError = handleServiceError(error, context);
    if (fallback !== undefined) {
      return fallback;
    }
    throw gameError;
  }
};
