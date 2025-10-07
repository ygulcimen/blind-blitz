// src/screens/auth/LoginPage.tsx - With Real Supabase Authentication
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, translateSupabaseError } from '../../utils/authValidation';
import AnimatedBackground from '../../components/AnimatedBackground';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const validateEmailField = (email: string) => {
    const result = validateEmail(email);
    setEmailError(result.isValid ? '' : result.message || '');
    return result.isValid;
  };

  const validatePasswordField = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
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
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(translateSupabaseError(error));
      } else {
        navigate('/games'); // Success! Go to games
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
              }}
            >
              <span className="text-white font-black text-lg">BB</span>
            </motion.div>
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
            Welcome Back, Champion
          </motion.h1>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Ready to dominate the chess arena?
          </motion.p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-gray-900/40 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1)"
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
              transition={{ duration: 0.5, delay: 0.5 }}
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
                  placeholder="Enter your password"
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
                  animate={{ rotate: showPassword ? 0 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </motion.button>
              </motion.div>
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
                {password && !passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <span className="text-emerald-400 text-xs">✅</span>
                    <p className="text-xs text-emerald-400">Password entered</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2"
                >
                  <span>⚠️</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-400 hover:text-purple-300 transition-colors relative"
                whileHover={{ scale: 1.02 }}
              >
                <motion.span
                  className="relative"
                  whileHover={{
                    textShadow: "0 0 8px rgba(139, 92, 246, 0.5)"
                  }}
                >
                  Forgot password?
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px bg-purple-300"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.span>
              </motion.button>
            </motion.div>

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
              transition={{ delay: 0.7 }}
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
                {loading ? 'Entering Arena...' : 'Enter Arena'}
              </motion.span>
              {!loading && (
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  ⚡
                </motion.span>
              )}
            </motion.button>
          </form>

          {/* More options coming soon */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xs text-gray-500">
              More login options coming soon ✨
            </p>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p
            className="mt-6 text-center text-sm text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            New to the arena?{' '}
            <motion.button
              onClick={() => navigate('/signup')}
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
                Join the Battle
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

export default LoginPage;
