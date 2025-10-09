// DevTools.tsx - Test Sentry & Analytics (DEV ONLY)
import React from 'react';
import * as Sentry from '@sentry/react';
import { analytics } from '../lib/analytics';

export const DevTools: React.FC = () => {
  // Only show in development
  if (import.meta.env.PROD) return null;

  const testSentry = () => {
    console.log('🐛 Testing Sentry...');
    try {
      // This will trigger a test error in Sentry
      throw new Error('TEST ERROR: Sentry is working! 🎉');
    } catch (error) {
      Sentry.captureException(error);
      console.log('✅ Test error sent to Sentry!');
      alert('Test error sent to Sentry! Check your Sentry dashboard.');
    }
  };

  const testAnalytics = () => {
    console.log('📊 Testing Analytics...');

    // Send test event using available analytics method
    analytics.featureUsed('DevTools Test Button');

    console.log('✅ Test event sent to Google Analytics!');
    alert('Test event sent to GA4! Check Real-Time reports in ~30 seconds.');
  };

  const checkConfig = () => {
    const hasSentry = !!import.meta.env.VITE_SENTRY_DSN;
    const hasGA = !!import.meta.env.VITE_GA_MEASUREMENT_ID;

    console.log('🔍 Configuration Check:');
    console.log('Sentry DSN:', hasSentry ? '✅ Configured' : '❌ Missing');
    console.log('GA Measurement ID:', hasGA ? '✅ Configured' : '❌ Missing');
    console.log('Environment:', import.meta.env.MODE);

    if (hasSentry) {
      console.log('Sentry DSN (first 20 chars):', import.meta.env.VITE_SENTRY_DSN?.substring(0, 20) + '...');
    }
    if (hasGA) {
      console.log('GA ID:', import.meta.env.VITE_GA_MEASUREMENT_ID);
    }

    alert(`Sentry: ${hasSentry ? '✅' : '❌'}\nGoogle Analytics: ${hasGA ? '✅' : '❌'}\n\nCheck console for details`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-gray-900 border-2 border-yellow-500 rounded-lg p-4 shadow-2xl">
      <div className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
        🛠️ Dev Tools (PRODUCTION ONLY)
      </div>
      <div className="text-xs text-gray-400 mb-3">
        Test Sentry & Analytics in production
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={checkConfig}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded transition-colors"
        >
          🔍 Check Config
        </button>
        <button
          onClick={testSentry}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded transition-colors"
        >
          🐛 Test Sentry
        </button>
        <button
          onClick={testAnalytics}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded transition-colors"
        >
          📊 Test Analytics
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-3">
        Note: Only works in PRODUCTION build
      </div>
    </div>
  );
};
