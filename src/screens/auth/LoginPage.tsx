// src/screens/auth/LoginPage.tsx - Improved responsive design
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    navigate('/games');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 mx-auto mb-6 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-lg">BC</span>
            </div>
            <span className="text-white font-bold text-xl">BLINDCHESS</span>
          </button>
          <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">
            Sign in to continue your chess journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-white bg-gray-800 border-gray-600 rounded focus:ring-white focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-900/40 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-800/40 transition-colors">
                <span className="text-lg">🌐</span>
                <span className="ml-2 text-sm text-gray-300">Google</span>
              </button>
              <button className="flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-800/40 transition-colors">
                <span className="text-lg">📱</span>
                <span className="ml-2 text-sm text-gray-300">Discord</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-white hover:underline font-medium transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// src/screens/auth/SignUpPage.tsx - Improved responsive design
const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Handle signup logic here
    navigate('/games');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 mx-auto mb-6 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-lg">BC</span>
            </div>
            <span className="text-white font-bold text-xl">BLINDCHESS</span>
          </button>
          <h1 className="text-3xl font-black text-white mb-2">
            Join BlindChess
          </h1>
          <p className="text-gray-400">
            Create your account and start earning gold
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="Choose a username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                placeholder="Confirm your password"
                required
              />
            </div>

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

            <button
              type="submit"
              className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>

          {/* Welcome Bonus */}
          <div className="mt-6 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <div className="text-yellow-400 text-2xl mb-2">🎁</div>
            <div className="text-white font-semibold mb-1">Welcome Bonus</div>
            <div className="text-gray-400 text-sm">
              Get 1000 Gold to start playing!
            </div>
          </div>

          {/* Social Signup */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-900/40 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-800/40 transition-colors">
                <span className="text-lg">🌐</span>
                <span className="ml-2 text-sm text-gray-300">Google</span>
              </button>
              <button className="flex justify-center items-center px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-800/40 transition-colors">
                <span className="text-lg">📱</span>
                <span className="ml-2 text-sm text-gray-300">Discord</span>
              </button>
            </div>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:underline font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Export components
export { LoginPage, SignUpPage };
