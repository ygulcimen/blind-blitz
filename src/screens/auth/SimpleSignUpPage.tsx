// src/screens/auth/SimpleSignUpPage.tsx - SUPER SIMPLE signup (username + password ONLY!)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validatePassword,
  getPasswordStrength,
  validateUsername,
  checkUsernameUniqueness,
} from '../../utils/authValidation';
import { simpleAuthService } from '../../services/simpleAuthService';
import AnimatedBackground from '../../components/AnimatedBackground';

const SimpleSignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Validate username
  const validateUsernameField = async (username: string, immediate = false) => {
    const basicValidation = validateUsername(username);
    if (!basicValidation.isValid) {
      setUsernameError(basicValidation.message || '');
      return false;
    }

    if (!immediate) {
      // Debounced username uniqueness check
      if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
      setUsernameChecking(true);

      const timeout = setTimeout(async () => {
        const uniquenessCheck = await checkUsernameUniqueness(username);
        setUsernameError(uniquenessCheck.isValid ? '' : uniquenessCheck.message || '');
        setUsernameChecking(false);
      }, 800);

      setUsernameCheckTimeout(timeout);
      return true;
    }

    return true;
  };

  const validatePasswordField = (password: string) => {
    const result = validatePassword(password);
    setPasswordError(result.isValid ? '' : result.message || '');
    return result.isValid;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (newUsername) {
      validateUsernameField(newUsername);
    } else {
      setUsernameError('');
      if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      validatePasswordField(newPassword);
    } else {
      setPasswordError('');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    const isUsernameValid = await validateUsernameField(username, true);
    const isPasswordValid = validatePasswordField(password);

    // Check username uniqueness
    if (isUsernameValid) {
      setUsernameChecking(true);
      const uniquenessCheck = await checkUsernameUniqueness(username);
      setUsernameChecking(false);
      if (!uniquenessCheck.isValid) {
        setUsernameError(uniquenessCheck.message || '');
        return;
      }
    }

    if (!isUsernameValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await simpleAuthService.signUpWithUsername(username, password);
      if (result.success) {
        // Force page reload to refresh auth context
        window.location.href = '/games';
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
    };
  }, [usernameCheckTimeout]);

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
            Start Playing in 30 Seconds
          </motion.h1>
          <motion.p className="text-gray-400">
            Just pick a username and password, that's it!
          </motion.p>
        </motion.div>

        {/* Simple Signup Form */}
        <motion.div
          className="bg-gray-900/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full px-4 py-3 pr-10 bg-gray-800/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all ${
                    usernameError
                      ? 'border-red-500'
                      : username && !usernameError && !usernameChecking
                      ? 'border-emerald-500'
                      : 'border-gray-600 focus:border-purple-400'
                  }`}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                />
                {usernameChecking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <span>⚠️</span> {usernameError}
                </p>
              )}
              {username && !usernameError && !usernameChecking && (
                <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                  <span>✅</span> Username available
                </p>
              )}
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
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-800/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all ${
                    passwordError
                      ? 'border-red-500'
                      : password && !passwordError
                      ? 'border-emerald-500'
                      : 'border-gray-600 focus:border-purple-400'
                  }`}
                  placeholder="At least 6 characters"
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

              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">Strength:</span>
                    <span
                      className={`text-xs font-bold ${
                        getPasswordStrength(password).strength === 'weak'
                          ? 'text-red-400'
                          : getPasswordStrength(password).strength === 'medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {getPasswordStrength(password).strength.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        getPasswordStrength(password).strength === 'weak'
                          ? 'bg-red-500'
                          : getPasswordStrength(password).strength === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${getPasswordStrength(password).score}%` }}
                    />
                  </div>
                </div>
              )}

              {passwordError && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <span>⚠️</span> {passwordError}
                </p>
              )}
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
              <span>{loading ? 'Creating Account...' : 'Start Playing'}</span>
              {!loading && <span>🚀</span>}
            </button>
          </form>

          {/* Welcome Bonus */}
          <div className="mt-6 bg-gradient-to-r from-purple-500/15 to-blue-500/10 border border-purple-400/40 rounded-lg p-4 text-center">
            <div className="text-purple-400 text-2xl mb-2">🎁</div>
            <div className="text-white font-bold mb-1">Welcome Bonus</div>
            <div className="text-purple-200 text-sm">
              Start with <span className="font-bold text-purple-300">1000 Gold</span> instantly! 🏆
            </div>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-300 hover:text-purple-200 font-medium"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SimpleSignUpPage;
