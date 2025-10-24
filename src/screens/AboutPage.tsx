// src/screens/AboutPage.tsx
import React from 'react';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: '🔮',
      title: 'Blind Strategy Phase',
      description:
        "Make your first 5 moves without seeing your opponent's strategy. This tests true chess intuition and planning skills.",
    },
    {
      icon: '🪙',
      title: '🪙 Economy System',
      description:
        'Every move has a cost. Manage your resources carefully while pursuing victory. Win games to earn rewards and climb the rankings.',
    },
    {
      icon: '🤖',
      title: 'RoboChaos Mode',
      description:
        'AI generates chaotic opening positions that destroy traditional theory. Adapt quickly or face inevitable defeat.',
    },
    {
      icon: '🏆',
      title: 'Competitive Tournaments',
      description:
        "Join tournaments with massive prize pools. Compete against the world's best BlindBlitz players for glory and gold.",
    },
  ];


  return (
    <div className="min-h-screen bg-black text-white pt-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-gray-400 text-sm">Our story</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6">
            About BlindBlitz
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing chess by adding economic stakes and blind
            strategy phases. Every move costs gold, every decision shapes your
            future, and every game is a strategic investment.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-12 mb-16 text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Chess has been the same for centuries. We believe it's time for
            evolution. BlindBlitz adds layers of strategy, economic thinking,
            and psychological warfare that traditional chess cannot provide.
            We're not replacing chess – we're advancing it for the modern world
            where every decision has economic consequences.
          </p>
        </div>

        {/* How It Started */}
        <div className="mb-16">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              How It Started
            </h2>
            <div className="space-y-6 text-gray-400 leading-relaxed max-w-3xl mx-auto">
              <p>
                BlindBlitz was born from a simple question: What if chess
                required true strategic thinking instead of memorized opening
                sequences? What if every move had real consequences?
              </p>
              <p>
                We combined the ancient game of chess with modern game theory,
                creating a unique experience where players commit to their first
                moves blind, manage an in-game economy, and face completely
                unpredictable scenarios in RoboChaos mode.
              </p>
              <p>
                The result is a game where intuition matters more than
                memorization, resource management is as crucial as tactics,
                and every match tells a unique story. BlindBlitz isn't just
                another chess variant – it's chess reimagined for the strategic
                minds of today.
              </p>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              What Makes Us Different
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              BlindBlitz isn't just another chess variant. It's a completely new
              way to think about strategy, risk, and competition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The principles that guide every decision we make at BlindBlitz
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Innovation First
              </h3>
              <p className="text-gray-400 leading-relaxed">
                We're not afraid to challenge thousand-year-old traditions.
                Every feature is designed to push chess into the modern era.
              </p>
            </div>

            <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Fair Competition
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Skill should determine victory, not pay-to-win mechanics.
                Everyone starts equal, everyone can succeed.
              </p>
            </div>

            <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Global Community
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Chess is universal, and so is BlindBlitz. We're building a
                platform where players worldwide compete and connect.
              </p>
            </div>
          </div>
        </div>

        {/* Credits & Development */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Built with Collaboration
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              BlindBlitz is a unique collaboration between human creativity and AI assistance
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 border border-gray-700 rounded-2xl p-8 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-5xl mb-3">👨‍💻</div>
                <h3 className="text-lg font-bold text-white mb-2">Creator</h3>
                <p className="text-blue-400 font-semibold mb-1">Yasin Gülçimen</p>
                <p className="text-sm text-gray-400">
                  Vision, Design & Development
                </p>
              </div>

              <div>
                <div className="text-5xl mb-3">💝</div>
                <h3 className="text-lg font-bold text-white mb-2">Biggest Supporter</h3>
                <p className="text-pink-400 font-semibold mb-1">Deniz Nuran</p>
                <p className="text-sm text-gray-400">
                  Unwavering Support & Motivation
                </p>
              </div>

              <div>
                <div className="text-5xl mb-3">🤖</div>
                <h3 className="text-lg font-bold text-white mb-2">AI Assistant</h3>
                <p className="text-purple-400 font-semibold mb-1">Claude (Anthropic)</p>
                <p className="text-sm text-gray-400">
                  Code Architecture & Implementation
                </p>
              </div>

              <div>
                <div className="text-5xl mb-3">💬</div>
                <h3 className="text-lg font-bold text-white mb-2">AI Advisor</h3>
                <p className="text-green-400 font-semibold mb-1">ChatGPT (OpenAI)</p>
                <p className="text-sm text-gray-400">
                  Features & Problem Solving
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-center text-gray-400 text-sm leading-relaxed">
                Every feature was developed through collaborative iteration between human intuition
                and AI capabilities. This project showcases what's possible when humans and AI work together,
                supported by unwavering belief and encouragement.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-12 inline-block">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Experience BlindBlitz?
            </h3>
            <p className="text-gray-400 mb-8 max-w-md">
              Every move matters, every game tells a story.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => (window.location.href = '/signup')}
                className="bg-white text-black font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Playing
              </button>
              <button
                onClick={() => (window.location.href = '/faq')}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
