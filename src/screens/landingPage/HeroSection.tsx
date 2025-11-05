// src/components/landingPage/HeroSection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { statsService } from '../../services/statsService';
import { guestAuthService } from '../../services/guestAuthService';
import FloatingGoldAnimation from './FloatingGoldAnimation';
// Add this before your HeroSection component
const TypewriterText: React.FC<{
  text: string;
  speed: number;
  delay?: number;
  className?: string;
}> = ({ text, speed, delay = 0, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, index + 1));
        index++;
        if (index >= text.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 1000);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
};

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [robotMessage, setRobotMessage] = useState("I'll ruin your opening...");
  const [liveCount, setLiveCount] = useState(0);
  const [activeGamesCount, setActiveGamesCount] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);
  const navigate = useNavigate();

  // Mock user data - in real app this would come from auth context
  const { user, setGuestPlayer } = useAuth();
  const { playerData } = useCurrentUser();
  const isLoggedIn = !!user; // Change this to test logged in state
  const userData = playerData
    ? {
        gold: playerData.gold_balance,
        username: playerData.username,
      }
    : {
        gold: 0,
        username: 'Guest',
      };

  // Strategic quotes for rotating display
  const strategicQuotes = [
    t('landing.hero.quotes.quote1'),
    t('landing.hero.quotes.quote2'),
    t('landing.hero.quotes.quote3'),
    t('landing.hero.quotes.quote4'),
    t('landing.hero.quotes.quote5'),
    t('landing.hero.quotes.quote6'),
    t('landing.hero.quotes.quote7'),
    t('landing.hero.quotes.quote8'),
  ];

  useEffect(() => {
    const messages = [
      "I'll ruin your opening... 😈",
      'Random moves incoming! 🎯',
      'Chaos is my strategy! 🤖',
      'Good luck, human! 😏',
      'Preparing maximum trolling... 🎭',
      'Your moves = my entertainment! 🍿',
      'I live for the chaos! ⚡',
    ];

    const interval = setInterval(() => {
      setRobotMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Rotate strategic quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % strategicQuotes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      const stats = await statsService.getGameStats();
      setLiveCount(stats.playersOnline);
      setActiveGamesCount(stats.activeGames);
    };

    // Fetch immediately
    fetchStats();

    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleStartPlaying = () => {
    if (isLoggedIn) {
      // Authenticated users go straight to games
      navigate('/games');
    } else {
      // Unauthenticated users go to signup to create account
      navigate('/signup');
    }
  };

  const handleGuestMode = async () => {
    try {
      console.log('🎮 Starting guest mode...');
      const result = await guestAuthService.createGuestSession();

      if (result.success && result.player) {
        console.log('✅ Guest session created, updating context...');
        // Update AuthContext with guest player data
        setGuestPlayer(result.player);
        console.log('✅ Context updated, navigating to games...');
        // Navigate to games page - guest restrictions will be handled there
        navigate('/games');
      } else {
        console.error('❌ Failed to create guest session:', result.error);
        alert('Failed to start guest mode. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error starting guest mode:', error);
      alert('Something went wrong. Please try again.');
    }
  };
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black"></div>
      {/* Floating Gold Coins Animation */}
      <FloatingGoldAnimation />
      {/* Simplified Live Status Bar - Mobile Responsive */}
      <div className="relative z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left - Live Status + Rotating Quotes + Live Games */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-1 min-w-0">
              {/* Live Status - Show EARLY ACCESS when < 10 players */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                {liveCount >= 10 ? (
                  <>
                    <span className="text-green-400 font-bold text-xs sm:text-sm tracking-wide">
                      {t('landing.hero.liveLabel')}
                    </span>
                    <span className="text-white font-bold text-sm sm:text-lg">
                      {liveCount.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm font-medium hidden xs:inline">
                      {t('landing.hero.playersLabel')}
                    </span>
                  </>
                ) : (
                  <span className="text-green-400 font-bold text-xs sm:text-sm tracking-wide uppercase">
                    EARLY ACCESS
                  </span>
                )}
              </div>

              {/* Divider - Hidden on mobile */}
              <div className="w-px h-4 sm:h-5 bg-white/20 hidden sm:block"></div>

              {/* Rotating Quotes - Hidden on mobile */}
              <div className="relative h-6 overflow-hidden hidden md:block flex-1 min-w-0">
                <div
                  className="flex flex-col transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateY(-${currentQuote * 24}px)` }}
                >
                  {strategicQuotes.map((quote, index) => (
                    <div key={index} className="h-6 flex items-center">
                      <span className="text-gray-300 text-sm font-medium tracking-wide italic truncate">
                        {quote}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider - Only show if we have active games */}
              {activeGamesCount > 0 && (
                <div className="w-px h-5 bg-white/20 hidden md:block"></div>
              )}

              {/* Live Games Counter - Only show when there are active games */}
              {activeGamesCount > 0 && (
                <div className="hidden sm:flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <span className="text-blue-400 text-sm sm:text-base">🎮</span>
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {activeGamesCount}
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm font-medium hidden lg:inline">
                    {t('landing.hero.gamesLabel')}
                  </span>
                </div>
              )}
            </div>

            {/* Right - Auth Buttons or User Stats */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-yellow-400 text-sm sm:text-base">
                    🪙
                  </span>
                  <span className="text-white font-bold text-sm sm:text-lg tracking-wide">
                    {userData.gold.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate('/login')}
                  className="group text-gray-400 hover:text-white text-xs sm:text-sm font-bold transition-all duration-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20 hover:scale-105 transform flex items-center gap-1 sm:gap-2 tracking-wide"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:rotate-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden xs:inline">
                    {t('landing.hero.loginButton')}
                  </span>
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-white text-black px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-black hover:bg-gray-100 transition-all duration-300 hover:scale-105 transform tracking-wider uppercase"
                >
                  {t('landing.hero.signupButton')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative flex-1 flex items-center justify-center px-4">
        {/* Left: Classic Mode - Chess King - Hidden on mobile, smaller on tablet */}
        <div className="absolute left-4 sm:left-8 lg:left-12 top-1/2 transform -translate-y-1/2 opacity-20 sm:opacity-30 hidden xs:block">
          <div
            className="text-white text-[4rem] sm:text-[6rem] lg:text-[8rem] animate-pulse"
            style={{ animationDuration: '8s' }}
          >
            ♔
          </div>
        </div>

        {/* Right: RoboChaos Mode - Robot - Hidden on mobile, smaller on tablet */}
        <div className="absolute right-4 sm:right-8 lg:right-12 top-1/2 transform -translate-y-1/2 opacity-20 sm:opacity-30 hidden xs:block">
          <div
            className="text-[4rem] sm:text-[6rem] lg:text-[8rem] animate-bounce"
            style={{ animationDuration: '6s' }}
          >
            🤖
          </div>
        </div>

        {/* Central Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6">
          {/* Gaming-Style Main Headline - Responsive sizes */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight">
            <div
              className="inline-block font-black"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '900',
                letterSpacing: '-0.02em',
              }}
            >
              <TypewriterText
                text={t('landing.hero.headline')}
                speed={150}
                className="text-white"
              />
            </div>
          </h1>

          {/* Short Stylish Subtitle - Responsive */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 italic font-light leading-relaxed px-4">
            {t('landing.hero.description')}
          </p>

          {/* Primary CTA Button - Better mobile sizing */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            <button
              onClick={handleStartPlaying}
              className="group bg-white text-black font-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 transform relative overflow-hidden tracking-wide uppercase w-full sm:w-auto"
            >
              <span className="relative z-10">
                {isLoggedIn
                  ? t('landing.hero.ctaPrimaryLoggedIn')
                  : t('landing.hero.ctaPrimary')}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Guest Mode Button - Only show if not logged in */}
            {!isLoggedIn && (
              <button
                onClick={handleGuestMode}
                className="group relative bg-gradient-to-r from-purple-600/90 to-blue-600/90 border-2 border-purple-400/50 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform overflow-hidden w-full sm:w-auto"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ backgroundSize: '200% 100%' }}></div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000"></div>
                </div>

                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="font-black tracking-wide">TRY AS GUEST</span>
                </span>
              </button>
            )}

            {/* How to Play - Less prominent text link */}
            <button
              onClick={() => navigate('/how-to-play')}
              className="group text-gray-400 hover:text-white text-sm font-medium transition-colors duration-300 flex items-center gap-2"
            >
              <span>{t('landing.hero.ctaSecondary')}</span>
              <svg
                className="w-3 h-3 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Gaming-Style Trust Indicators - Responsive */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
            <div className="flex gap-0.5 sm:gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-sm flex items-center justify-center"
                >
                  <span className="text-white text-[10px] sm:text-xs font-bold">
                    ★
                  </span>
                </div>
              ))}
            </div>
            <span className="text-white font-black text-base sm:text-lg tracking-wide">
              {t('landing.hero.trustRating')}
            </span>
            <span className="text-gray-400 hidden xs:inline">•</span>
            <span className="text-gray-400 font-medium hidden sm:inline">
              438 {t('landing.hero.trustReviews')}
            </span>
            <span className="text-white font-bold tracking-wide">
              {t('landing.hero.trustPlatform')}
            </span>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
