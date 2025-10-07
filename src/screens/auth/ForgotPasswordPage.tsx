// src/screens/auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, translateSupabaseError } from '../../utils/authValidation';
import AnimatedBackground from '../../components/AnimatedBackground';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const validateEmailField = (email: string) => {
    const result = validateEmail(email);
    setEmailError(result.isValid ? '' : result.message || '');
    return result.isValid;
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmailField(email);
    if (!isEmailValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(translateSupabaseError(error));
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative">
        {/* Enhanced Animated Background */}
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
              className="flex items-center gap-3 mx-auto mb-6 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg"
                whileHover={{
                  boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)"
                }}
              >
                <span className="text-black font-black text-lg">BB</span>
              </motion.div>
              <span className="text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text font-bold text-xl">
                BLINDBLITZ
              </span>
            </motion.button>
          </motion.div>

          {/* Success Message */}
          <motion.div
            className="bg-gray-900/40 border border-amber-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 191, 36, 0.1)"
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              📧
            </motion.div>
            <motion.h1
              className="text-2xl font-bold text-white mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Check Your Email
            </motion.h1>
            <motion.p
              className="text-gray-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              We've sent password reset instructions to{' '}
              <span className="text-amber-300 font-medium">{email}</span>
            </motion.p>
            <motion.p
              className="text-sm text-gray-500 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              If you don't see the email, check your spam folder or try again with a different email address.
            </motion.p>
            <motion.button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 25px rgba(251, 191, 36, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Return to Arena
              <span>⚔️</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
              className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{
                boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)"
              }}
            >
              <span className="text-black font-black text-lg">BC</span>
            </motion.div>
            <span className="text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text font-bold text-xl">
              BLINDCHESS
            </span>
          </motion.button>
          <motion.h1
            className="text-3xl font-black text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Recover Access
          </motion.h1>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Get back into the arena - we'll help you reset your password
          </motion.p>
        </motion.div>

        {/* Reset Password Form */}
        <motion.div
          className="bg-gray-900/40 border border-amber-500/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 191, 36, 0.1)"
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleResetPassword} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
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
                      : 'border-gray-600 focus:border-amber-400'
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
                      : "0 0 0 3px rgba(251, 191, 36, 0.3)"
                  }}
                  placeholder="Enter your email address"
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

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              whileHover={{
                scale: loading ? 1 : 1.02,
                boxShadow: loading ? "" : "0 0 25px rgba(251, 191, 36, 0.4)"
              }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {loading && (
                <motion.div
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
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
                {loading ? 'Sending Recovery...' : 'Send Recovery Link'}
              </motion.span>
              {!loading && (
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  🔑
                </motion.span>
              )}
            </motion.button>
          </form>

          {/* Back to Login Link */}
          <motion.p
            className="mt-6 text-center text-sm text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Remember your password?{' '}
            <motion.button
              onClick={() => navigate('/login')}
              className="text-amber-300 hover:text-amber-200 font-medium transition-colors relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="relative"
                whileHover={{
                  textShadow: "0 0 8px rgba(251, 191, 36, 0.6)"
                }}
              >
                Return to Arena
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-px bg-amber-300"
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

export default ForgotPasswordPage;