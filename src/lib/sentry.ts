// lib/sentry.ts - Error tracking configuration
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  // Only initialize in production
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN, // You'll add this to .env
      environment: import.meta.env.MODE,

      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

      // Session Replay (optional - records user sessions when errors occur)
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      // Filter out known spam errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
      ],

      // Add user context automatically
      beforeSend(event, hint) {
        // Don't send events in development
        if (import.meta.env.DEV) {
          console.log('Sentry event (dev):', event);
          return null;
        }
        return event;
      },
    });
  }
};

// Helper to track custom events
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(eventName, {
      level: 'info',
      extra: data,
    });
  }
};

// Helper to set user context
export const setUserContext = (userId: string, email?: string, username?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

// Helper to clear user context (on logout)
export const clearUserContext = () => {
  Sentry.setUser(null);
};

// Helper to track game events
export const trackGameEvent = (
  gameId: string,
  event: string,
  metadata?: Record<string, any>
) => {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'game',
      message: event,
      level: 'info',
      data: {
        gameId,
        ...metadata,
      },
    });
  }
};
