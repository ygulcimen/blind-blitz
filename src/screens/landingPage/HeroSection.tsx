// src/components/landingPage/HeroSection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [robotMessage, setRobotMessage] = useState("I'll ruin your opening...");
  const [liveCount, setLiveCount] = useState(1247);
  const [currentQuote, setCurrentQuote] = useState(0);
  const navigate = useNavigate();

  // Mock user data - in real app this would come from auth context
  const isLoggedIn = false; // Change this to test logged in state
  const userData = {
    gold: 15750,
    xp: 8420,
    level: 12,
    username: 'ChessMaster',
  };

  // Strategic quotes for rotating display
  const strategicQuotes = [
    'Blind moves reveal true masters ✨',
    'Every gold spent sharpens your mind 🧠',
    'Risk everything, gain everything ⚡',
    'Chess without sight, victory with insight 👁️',
    'Fortune favors the strategic 🎯',
    'Master the unseen, dominate the seen 🔮',
    'In darkness, strategy illuminates 💡',
    'Bold moves, bold rewards 💎',
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

  // Simulate live player count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => prev + Math.floor(Math.random() * 21) - 10); // ±10 variation
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleStartPlaying = () => {
    navigate('/games');
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Simplified Live Status Bar */}
      <div className="relative z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left - Live Status + Rotating Quotes + Live Games */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold text-sm tracking-wide">
                  LIVE
                </span>
                <span className="text-white font-bold text-lg">
                  {liveCount.toLocaleString()}
                </span>
                <span className="text-gray-400 text-sm font-medium">
                  players online
                </span>
              </div>

              <div className="w-px h-5 bg-white/20"></div>

              {/* Back to Original Rotating Quotes */}
              <div className="relative h-6 overflow-hidden">
                <div
                  className="flex flex-col transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateY(-${currentQuote * 24}px)` }}
                >
                  {strategicQuotes.map((quote, index) => (
                    <div key={index} className="h-6 flex items-center">
                      <span className="text-gray-300 text-sm font-medium tracking-wide italic">
                        {quote}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-px h-5 bg-white/20"></div>

              {/* Live Games Counter to Fill the Gap */}
              <div className="flex items-center gap-2">
                <span className="text-blue-400">🎮</span>
                <span className="text-white font-bold text-sm">
                  {Math.floor(liveCount * 0.12)}
                </span>
                <span className="text-gray-400 text-sm font-medium">
                  active games
                </span>
              </div>
            </div>

            {/* Right - Auth Buttons or User Stats */}
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">🪙</span>
                  <span className="text-white font-bold text-lg tracking-wide">
                    {userData.gold.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-sm">Gold</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">⚡</span>
                  <span className="text-white font-bold text-lg tracking-wide">
                    {userData.xp.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-sm">XP</span>
                  <span className="text-blue-400 font-bold text-sm">
                    Lv.{userData.level}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="group text-gray-400 hover:text-white text-sm font-bold transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20 hover:scale-105 transform flex items-center gap-2 tracking-wide"
                >
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
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
                  LOGIN
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-black hover:bg-gray-100 transition-all duration-300 hover:scale-105 transform tracking-wider uppercase"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Animated Background Elements */}

        {/* Giant King Silhouette - Left */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 opacity-5">
          <div
            className="text-white text-[14rem] animate-pulse"
            style={{ animationDuration: '8s' }}
          >
            ♔
          </div>
        </div>

        {/* Giant Queen Silhouette - Moved to Left for Better Balance */}
        <div className="absolute left-32 top-1/3 transform -translate-y-1/2 opacity-4">
          <div
            className="text-white text-[10rem] animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '2s' }}
          >
            ♕
          </div>
        </div>

        {/* Floating Chess Pieces */}
        <div className="absolute bottom-32 right-1/4 opacity-10">
          <div
            className="text-4xl text-white animate-bounce"
            style={{ animationDuration: '4s' }}
          >
            ♗
          </div>
        </div>

        <div className="absolute top-1/4 right-16 opacity-10">
          <div
            className="text-3xl text-white"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          >
            ♜
          </div>
        </div>

        {/* Prominent Trolling AI Robot - Top Right, More Visible */}
        <div className="absolute top-32 right-20 opacity-60 hover:opacity-80 transition-opacity duration-500 cursor-pointer z-20">
          <div className="relative">
            <div
              className="text-8xl animate-bounce"
              style={{ animationDuration: '2.5s' }}
            >
              🤖
            </div>
            <div className="absolute top-16 right-16 bg-gray-900/95 backdrop-blur-sm border border-red-500/40 text-white text-sm px-4 py-3 rounded-xl whitespace-nowrap max-w-xs shadow-2xl">
              <div className="font-bold text-red-400 mb-1 text-sm tracking-wide">
                RoboChaos AI:
              </div>
              <div className="text-gray-200 font-medium">{robotMessage}</div>
              <div className="absolute -bottom-2 right-4 w-4 h-4 bg-gray-900/95 border-r border-b border-red-500/40 transform rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Floating Gold Elements - Repositioned Away from Robot */}
        <div className="absolute top-60 left-1/3 opacity-12">
          <div
            className="text-3xl animate-spin"
            style={{ animationDuration: '8s' }}
          >
            🪙
          </div>
        </div>

        <div className="absolute bottom-48 left-24 opacity-10">
          <div
            className="text-2xl animate-spin"
            style={{ animationDuration: '6s', animationDelay: '2s' }}
          >
            💰
          </div>
        </div>

        {/* Magical Sparkles */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-15"
            style={{
              left: `${20 + i * 20}%`,
              top: `${25 + (i % 2) * 35}%`,
              animation: `twinkle ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 1.2}s`,
            }}
          >
            <div className="text-xl">✨</div>
          </div>
        ))}

        {/* Central Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
          {/* Gaming-Style Main Headline - Clean Without Badge */}
          {/* Typewriter Effect - Robot Typing */}
          <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
            <div
              className="inline-block font-black"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '900',
                letterSpacing: '-0.02em',
              }}
            >
              <TypewriterText
                text="PLAY, RISK, WIN."
                speed={150}
                className="text-white"
              />
            </div>
            <br />
            <div className="text-gray-400 font-light tracking-wide mt-2">
              <TypewriterText
                text="Repeat This"
                speed={100}
                delay={2000}
                className="text-gray-400"
              />
            </div>
          </h1>

          {/* Short Stylish Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 italic font-light leading-relaxed">
            Strategic blind chess meets real stakes
          </p>

          {/* Enhanced CTA Button - Smaller */}
          <button
            onClick={handleStartPlaying}
            className="group bg-white text-black font-black px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transition-all duration-300 mb-10 hover:scale-105 transform relative overflow-hidden tracking-wide uppercase"
          >
            <span className="relative z-10">Start Your Journey</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Gaming-Style Trust Indicators */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-sm flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">★</span>
                </div>
              ))}
            </div>
            <span className="text-white font-black text-lg tracking-wide">
              4.9
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400 font-medium">438 reviews on</span>
            <span className="text-white font-bold tracking-wide">
              ChessClub
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Partner Logos with Gaming Style */}
      <div className="relative z-10 py-6 border-t border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-16 opacity-40">
            <div className="text-gray-400 font-bold tracking-wider hover:text-white transition-colors cursor-pointer">
              CHESS.COM
            </div>
            <div className="text-gray-400 font-bold tracking-wider hover:text-white transition-colors cursor-pointer">
              LICHESS
            </div>
            <div className="text-gray-400 font-bold tracking-wider hover:text-white transition-colors cursor-pointer">
              FIDE
            </div>
            <div className="text-gray-400 font-bold tracking-wider hover:text-white transition-colors cursor-pointer">
              CHESSCLUB
            </div>
            <div className="text-gray-400 font-bold tracking-wider hover:text-white transition-colors cursor-pointer">
              CHESS24
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
