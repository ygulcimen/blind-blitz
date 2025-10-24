// src/screens/auth/SignUpPage.tsx - With Real Supabase Authentication
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateUsername,
  checkUsernameUniqueness,
  translateSupabaseError,
  validatePasswordMatch
} from '../../utils/authValidation';
import AnimatedBackground from '../../components/AnimatedBackground';

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Validation functions
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

  const validateEmailField = (email: string) => {
    const result = validateEmail(email);
    setEmailError(result.isValid ? '' : result.message || '');
    return result.isValid;
  };

  const validatePasswordField = (password: string) => {
    const result = validatePassword(password);
    setPasswordError(result.isValid ? '' : result.message || '');
    return result.isValid;
  };

  const validateConfirmPasswordField = (confirmPassword: string) => {
    const result = validatePasswordMatch(password, confirmPassword);
    setConfirmPasswordError(result.isValid ? '' : result.message || '');
    return result.isValid;
  };

  // Input handlers
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      validateEmailField(newEmail);
    } else {
      setEmailError('');
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

    // Re-validate confirm password if it has been entered
    if (confirmPassword) {
      validateConfirmPasswordField(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (newConfirmPassword) {
      validateConfirmPasswordField(newConfirmPassword);
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isUsernameValid = await validateUsernameField(username, true);
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);
    const isConfirmPasswordValid = validateConfirmPasswordField(confirmPassword);

    // Check for immediate username uniqueness
    if (isUsernameValid) {
      setUsernameChecking(true);
      const uniquenessCheck = await checkUsernameUniqueness(username);
      setUsernameChecking(false);
      if (!uniquenessCheck.isValid) {
        setUsernameError(uniquenessCheck.message || '');
        return;
      }
    }

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signUp(email, password, username);
      if (error) {
        setError(translateSupabaseError(error));
      } else {
        navigate('/games'); // Success! Go to games with 1000 gold
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
    };
  }, [usernameCheckTimeout]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative">
      {/* Enhanced Animated Background */}
      <AnimatedBackground />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
            className="flex items-center gap-3 mx-auto mb-6 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src="/logo.png"
              alt="BlindBlitz"
              className="w-10 h-10 rounded-lg shadow-lg"
              whileHover={{
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
              }}
            />
            <span className="text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text font-bold text-xl">
              BLINDBLITZ
            </span>
          </motion.button>
          <motion.h1
            className="text-3xl font-black text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Join the Elite Arena
          </motion.h1>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Become a chess champion and claim your rewards
          </motion.p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          className="bg-gray-900/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1)"
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleSignUp} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <motion.div
                className="relative"
                animate={usernameError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <motion.input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full px-4 py-3 pr-10 bg-gray-800/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    usernameError
                      ? 'border-red-500'
                      : username && !usernameError && !usernameChecking
                      ? 'border-emerald-500'
                      : 'border-gray-600 focus:border-purple-400'
                  }`}
                  animate={{
                    boxShadow: usernameError
                      ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                      : username && !usernameError && !usernameChecking
                      ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                      : "0 0 0 3px rgba(0, 0, 0, 0)"
                  }}
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: usernameError
                      ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
                      : username && !usernameError && !usernameChecking
                      ? "0 0 0 3px rgba(16, 185, 129, 0.2)"
                      : "0 0 0 3px rgba(139, 92, 246, 0.3)"
                  }}
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                />
                <AnimatePresence>
                  {usernameChecking && (
                    <motion.div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <AnimatePresence>
                {usernameError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-xs text-red-400">{usernameError}</p>
                  </motion.div>
                )}
                {username && !usernameError && !usernameChecking && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <span className="text-emerald-400 text-xs">✅</span>
                    <p className="text-xs text-emerald-400">Username is available</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <motion.div
                animate={emailError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <motion.input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-3 bg-gray-800/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    emailError
                      ? 'border-red-500'
                      : email && !emailError
                      ? 'border-emerald-500'
                      : 'border-gray-600 focus:border-purple-400'
                  }`}
                  animate={{
                    boxShadow: emailError
                      ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                      : email && !emailError
                      ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                      : "0 0 0 3px rgba(0, 0, 0, 0)"
                  }}
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: emailError
                      ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
                      : email && !emailError
                      ? "0 0 0 3px rgba(16, 185, 129, 0.2)"
                      : "0 0 0 3px rgba(139, 92, 246, 0.3)"
                  }}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </motion.div>
              <AnimatePresence>
                {emailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-xs text-red-400">{emailError}</p>
                  </motion.div>
                )}
                {email && !emailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <span className="text-emerald-400 text-xs">✅</span>
                    <p className="text-xs text-emerald-400">Valid email</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <motion.div
                className="relative"
                animate={passwordError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <motion.input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-800/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    passwordError
                      ? 'border-red-500'
                      : password && !passwordError
                      ? 'border-emerald-500'
                      : 'border-gray-600 focus:border-purple-400'
                  }`}
                  animate={{
                    boxShadow: passwordError
                      ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                      : password && !passwordError
                      ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                      : "0 0 0 3px rgba(0, 0, 0, 0)"
                  }}
                  whileFocus={{
                    scale: 1.02,
                    boxShadow: passwordError
                      ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
                      : password && !passwordError
                      ? "0 0 0 3px rgba(16, 185, 129, 0.2)"
                      : "0 0 0 3px rgba(139, 92, 246, 0.3)"
                  }}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-300 transition-colors"
                  disabled={loading}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mt-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400">Password strength:</span>
                      <motion.span
                        className={`text-xs font-bold ${
                          getPasswordStrength(password).strength === 'weak' ? 'text-red-400' :
                          getPasswordStrength(password).strength === 'medium' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}
                        animate={{
                          scale: [1, 1.05, 1],
                          textShadow: getPasswordStrength(password).strength === 'strong'
                            ? "0 0 8px rgba(16, 185, 129, 0.6)"
                            : "none"
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {getPasswordStrength(password).strength.toUpperCase()}
                      </motion.span>
                      {getPasswordStrength(password).strength === 'strong' && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-emerald-400"
                        >
                          🛡️
                        </motion.span>
                      )}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          getPasswordStrength(password).strength === 'weak' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                          getPasswordStrength(password).strength === 'medium' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                          'bg-gradient-to-r from-emerald-500 to-green-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${getPasswordStrength(password).score}%`,
                          boxShadow: getPasswordStrength(password).strength === 'strong'
                            ? "0 0 10px rgba(16, 185, 129, 0.4)"
                            : "none"
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-xs text-red-400">{passwordError}</p>
                  </motion.div>
                )}
                {password && !passwordError && getPasswordStrength(password).strength === 'strong' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <span className="text-emerald-400 text-xs">✅</span>
                    <p className="text-xs text-emerald-400">Excellent password security!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full px-4 py-3 pr-12 bg-gray-800/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${
                    confirmPasswordError
                      ? 'border-red-500 focus:border-red-400 focus:ring-red-400'
                      : confirmPassword && !confirmPasswordError
                      ? 'border-green-500 focus:border-green-400 focus:ring-green-400'
                      : 'border-gray-600 focus:border-white focus:ring-white'
                  }`}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-1 text-xs text-red-400">{confirmPasswordError}</p>
              )}
              {confirmPassword && !confirmPasswordError && (
                <p className="mt-1 text-xs text-green-400">Passwords match</p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 text-white bg-gray-800 border-gray-600 rounded focus:ring-white focus:ring-2"
                required
              />
              <span className="ml-2 text-sm text-gray-400">
                I agree to the{' '}
                <button type="button" className="text-white hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-white hover:underline">
                  Privacy Policy
                </button>
              </span>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              whileHover={{
                scale: loading ? 1 : 1.02,
                boxShadow: loading ? "" : "0 0 25px rgba(139, 92, 246, 0.4)"
              }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {loading && (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              )}
              <motion.span
                animate={{
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Joining Arena...' : 'Join the Elite'}
              </motion.span>
              {!loading && (
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  👑
                </motion.span>
              )}
            </motion.button>
          </form>

          {/* Welcome Bonus */}
          <motion.div
            className="mt-6 bg-gradient-to-r from-purple-500/15 to-blue-500/10 border border-purple-400/40 rounded-lg p-4 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)"
            }}
            whileHover={{
              boxShadow: "0 0 25px rgba(139, 92, 246, 0.2)"
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-transparent"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="text-purple-400 text-3xl mb-2 relative z-10"
              animate={{
                y: [0, -2, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎁
            </motion.div>
            <motion.div
              className="text-white font-bold mb-1 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Champion's Welcome Bonus
            </motion.div>
            <motion.div
              className="text-purple-200 text-sm relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              Start with <span className="font-bold text-purple-300">1000 Gold</span> and claim victory! 🏆
            </motion.div>

            {/* Sparkle effects */}
            <motion.div
              className="absolute top-2 right-3 text-purple-300 text-xs"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5
              }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-2 left-4 text-blue-300 text-xs"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1.2
              }}
            >
              ⭐
            </motion.div>
          </motion.div>

          {/* More options coming soon */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <p className="text-xs text-gray-500">
              More registration options coming soon ✨
            </p>
          </motion.div>

          {/* Login Link */}
          <motion.p
            className="mt-6 text-center text-sm text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Already a champion?{' '}
            <motion.button
              onClick={() => navigate('/login')}
              className="text-purple-300 hover:text-purple-200 font-medium transition-colors relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="relative"
                whileHover={{
                  textShadow: "0 0 8px rgba(139, 92, 246, 0.6)"
                }}
              >
                Return to Arena
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-px bg-purple-300"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span>
            </motion.button>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
