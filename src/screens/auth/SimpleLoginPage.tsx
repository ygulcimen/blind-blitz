// src/screens/auth/SimpleLoginPage.tsx - SUPER SIMPLE login (username + password)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { simpleAuthService } from '../../services/simpleAuthService';
import AnimatedBackground from '../../components/AnimatedBackground';

const SimpleLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await simpleAuthService.signInWithUsername(username, password);
      if (result.success) {
        // Force page reload to refresh auth context
        window.location.href = '/games';
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative">
      <AnimatedBackground />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 mx-auto mb-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src="/logo.png"
              alt="BlindBlitz"
              className="w-10 h-10 rounded-lg shadow-lg"
            />
            <span className="text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text font-bold text-xl">
              BLINDBLITZ
            </span>
          </motion.button>
          <motion.h1 className="text-3xl font-black text-white mb-2">
            Welcome Back!
          </motion.h1>
          <motion.p className="text-gray-400">
            Sign in to continue playing
          </motion.p>
        </motion.div>

        {/* Simple Login Form */}
        <motion.div
          className="bg-gray-900/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <span>⚡</span>}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            New player?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-purple-300 hover:text-purple-200 font-medium"
            >
              Create account
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SimpleLoginPage;
