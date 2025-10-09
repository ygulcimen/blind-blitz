// lib/analytics.ts - User behavior tracking
import ReactGA from 'react-ga4';

export const initAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (measurementId && import.meta.env.PROD) {
    ReactGA.initialize(measurementId);
    console.log('Analytics initialized');
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (import.meta.env.PROD) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (import.meta.env.PROD) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// Game-specific tracking helpers
export const analytics = {
  // User actions
  userSignUp: (method: string) => {
    trackEvent('User', 'Sign Up', method);
  },

  userLogin: (method: string) => {
    trackEvent('User', 'Login', method);
  },

  userLogout: () => {
    trackEvent('User', 'Logout');
  },

  // Matchmaking
  startMatchmaking: (mode: string, entryFee: number) => {
    trackEvent('Matchmaking', 'Start', mode, entryFee);
  },

  matchFound: (waitTime: number) => {
    trackEvent('Matchmaking', 'Match Found', undefined, waitTime);
  },

  matchCancelled: () => {
    trackEvent('Matchmaking', 'Cancelled');
  },

  // Game events
  gameStarted: (gameMode: string, entryFee: number) => {
    trackEvent('Game', 'Started', gameMode, entryFee);
  },

  blindPhaseCompleted: (movesCount: number) => {
    trackEvent('Game', 'Blind Phase Complete', undefined, movesCount);
  },

  livePhaseStarted: () => {
    trackEvent('Game', 'Live Phase Started');
  },

  gameCompleted: (result: 'win' | 'loss' | 'draw', gameMode: string) => {
    trackEvent('Game', 'Completed', `${result}-${gameMode}`);
  },

  gameAbandoned: (phase: string) => {
    trackEvent('Game', 'Abandoned', phase);
  },

  // Economy
  goldEarned: (amount: number, source: string) => {
    trackEvent('Economy', 'Gold Earned', source, amount);
  },

  goldSpent: (amount: number, reason: string) => {
    trackEvent('Economy', 'Gold Spent', reason, amount);
  },

  dailyRewardClaimed: (amount: number) => {
    trackEvent('Economy', 'Daily Reward', undefined, amount);
  },

  // Engagement
  pageVisit: (pageName: string) => {
    trackEvent('Navigation', 'Page Visit', pageName);
  },

  featureUsed: (featureName: string) => {
    trackEvent('Feature', 'Used', featureName);
  },

  buttonClicked: (buttonName: string) => {
    trackEvent('Interaction', 'Button Click', buttonName);
  },

  // Errors (non-critical)
  userError: (errorType: string, errorMessage: string) => {
    trackEvent('Error', errorType, errorMessage);
  },

  // Performance
  performanceMetric: (metricName: string, value: number) => {
    trackEvent('Performance', metricName, undefined, value);
  },
};

// Set user properties
export const setUserProperties = (userId: string, properties: Record<string, any>) => {
  if (import.meta.env.PROD) {
    ReactGA.set({
      userId,
      ...properties,
    });
  }
};

// Track timing events (useful for game duration, etc)
export const trackTiming = (
  category: string,
  variable: string,
  value: number,
  label?: string
) => {
  if (import.meta.env.PROD) {
    ReactGA.event({
      category: 'timing_complete',
      action: category,
      label: label || variable,
      value: Math.round(value),
    });
  }
};
