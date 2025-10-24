// src/screens/BugReportPage.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCurrentUser } from '../hooks/useCurrentUser';

const BugReportPage: React.FC = () => {
  const { user } = useCurrentUser();
  const [formData, setFormData] = useState({
    title: '',
    category: 'gameplay',
    severity: 'medium',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    browser: '',
    device: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'gameplay', label: '🎮 Gameplay', color: 'blue' },
    { value: 'ui', label: '🎨 UI/Visual', color: 'purple' },
    { value: 'performance', label: '⚡ Performance', color: 'yellow' },
    { value: 'account', label: '👤 Account', color: 'green' },
    { value: 'payment', label: '💰 Gold/Economy', color: 'amber' },
    { value: 'other', label: '📝 Other', color: 'gray' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', icon: '📌', description: 'Minor issue, workaround exists' },
    { value: 'medium', label: 'Medium', icon: '⚠️', description: 'Noticeable issue affecting experience' },
    { value: 'high', label: 'High', icon: '🔴', description: 'Major issue blocking core functionality' },
    { value: 'critical', label: 'Critical', icon: '💥', description: 'Game-breaking, needs immediate fix' },
  ];

  const commonBugs = [
    {
      title: 'Game Not Loading',
      category: 'technical',
      tips: ['Try refreshing the page', 'Clear browser cache', 'Check your internet connection', 'Try a different browser'],
    },
    {
      title: 'Moves Not Submitting',
      category: 'gameplay',
      tips: ['Ensure move is legal', 'Check if time expired', 'Try clicking Submit button again', 'Refresh if stuck'],
    },
    {
      title: 'Gold Not Updating',
      category: 'economy',
      tips: ['Refresh the page to sync', 'Check game results page', 'Wait a few moments for processing', 'Contact support if persists'],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Get technical details
      const userAgent = navigator.userAgent;
      const screenResolution = `${window.screen.width}x${window.screen.height}`;

      // Insert bug report into database
      const { error: insertError } = await supabase
        .from('bug_reports')
        .insert({
          user_id: user?.id || null,
          user_email: user?.email || null,
          title: formData.title,
          category: formData.category,
          severity: formData.severity,
          description: formData.description,
          steps_to_reproduce: formData.stepsToReproduce,
          expected_behavior: formData.expectedBehavior,
          actual_behavior: formData.actualBehavior,
          browser: formData.browser || userAgent.split(' ').slice(-2).join(' '),
          device: formData.device || navigator.platform,
          user_agent: userAgent,
          screen_resolution: screenResolution,
          status: 'new',
        });

      if (insertError) {
        throw insertError;
      }

      // Success!
      setSubmitted(true);
      console.log('✅ Bug report submitted successfully!');

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          title: '',
          category: 'gameplay',
          severity: 'medium',
          description: '',
          stepsToReproduce: '',
          expectedBehavior: '',
          actualBehavior: '',
          browser: '',
          device: '',
        });
      }, 3000);
    } catch (err: any) {
      console.error('❌ Failed to submit bug report:', err);
      setError(err.message || 'Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">Help us improve</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            🐛 Report a Bug
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Found something broken? Help us fix it! Your reports make BlindBlitz better for everyone.
          </p>
        </div>

        {/* Common Issues Quick Help */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Common Issues & Quick Fixes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {commonBugs.map((bug, index) => (
              <div
                key={index}
                className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-3">{bug.title}</h3>
                <ul className="space-y-2">
                  {bug.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 text-xs">✓</span>
                      <span className="text-sm text-gray-400">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bug Report Form */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Submit Bug Report</h2>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300 text-sm">❌ {error}</p>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                Report Submitted!
              </h3>
              <p className="text-gray-400">
                Thank you for helping us improve BlindBlitz. We'll investigate this issue.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bug Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Bug Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Brief description of the issue"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Category & Severity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Severity *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  >
                    {severityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.icon} {level.label} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What happened? *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the bug in detail..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Steps to Reproduce *
                </label>
                <textarea
                  name="stepsToReproduce"
                  value={formData.stepsToReproduce}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Expected vs Actual */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Expected Behavior *
                  </label>
                  <textarea
                    name="expectedBehavior"
                    value={formData.expectedBehavior}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="What should happen?"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Actual Behavior *
                  </label>
                  <textarea
                    name="actualBehavior"
                    value={formData.actualBehavior}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="What actually happened?"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Browser & Device */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Browser
                  </label>
                  <input
                    type="text"
                    name="browser"
                    value={formData.browser}
                    onChange={handleChange}
                    placeholder="e.g., Chrome 120, Safari 17"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Device
                  </label>
                  <input
                    type="text"
                    name="device"
                    value={formData.device}
                    onChange={handleChange}
                    placeholder="e.g., iPhone 15, Windows PC, MacBook"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Bug Report'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Additional Help */}
        <div className="text-center">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 inline-block">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Need Immediate Help?
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              For urgent issues or questions, reach out to our support team directly.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/faq'}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                View FAQ
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugReportPage;
