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
      title: 'Gold Economy System',
      description:
        'Every move costs gold. Manage your resources carefully while pursuing victory. Win games to earn gold and climb the rankings.',
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
        "Join tournaments with massive prize pools. Compete against the world's best BlindChess players for glory and gold.",
    },
  ];

  const team = [
    {
      name: 'Alex Chen',
      role: 'Founder & Game Designer',
      description:
        'Former chess master turned game designer. Created the BlindChess concept after losing too many traditional games.',
      emoji: '👨‍💻',
    },
    {
      name: 'Sarah Williams',
      role: 'AI & Strategy Director',
      description:
        'PhD in AI from MIT. Designed the RoboChaos engine that makes experienced players question everything.',
      emoji: '🧠',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Economy Systems Lead',
      description:
        'Former financial analyst. Built the gold economy system that makes every move meaningful.',
      emoji: '💰',
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
            About BlindChess
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
            evolution. BlindChess adds layers of strategy, economic thinking,
            and psychological warfare that traditional chess cannot provide.
            We're not replacing chess – we're advancing it for the modern world
            where every decision has economic consequences.
          </p>
        </div>

        {/* How It Started */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              How It Started
            </h2>
            <div className="space-y-6 text-gray-400 leading-relaxed">
              <p>
                The idea for BlindChess came from a simple frustration:
                traditional chess felt too predictable. Opening theory dominated
                games, and the economic stakes were purely psychological.
              </p>
              <p>
                Our founder, Alex Chen, was a competitive chess player who grew
                tired of memorizing endless opening variations. "What if," he
                thought, "players had to commit to moves without seeing their
                opponent's strategy? What if every move had a real cost?"
              </p>
              <p>
                That simple question evolved into BlindChess – a game where
                intuition matters more than memorization, where resource
                management is as important as tactics, and where every game
                tells a unique story.
              </p>
            </div>
          </div>

          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-white">Growing Fast</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Players</span>
                <span className="text-white font-semibold">50,000+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Games Played</span>
                <span className="text-white font-semibold">2.5M+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Gold Earned</span>
                <span className="text-yellow-400 font-semibold">100M+ 🪙</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Countries</span>
                <span className="text-white font-semibold">150+</span>
              </div>
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
              BlindChess isn't just another chess variant. It's a completely new
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

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Meet the Team
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The minds behind BlindChess are passionate about innovation,
              strategy, and creating the future of competitive gaming.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 text-center"
              >
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <div className="text-blue-400 font-semibold mb-4">
                  {member.role}
                </div>
                <p className="text-gray-400 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-12 inline-block">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Experience BlindChess?
            </h3>
            <p className="text-gray-400 mb-8 max-w-md">
              Join thousands of players who have discovered the future of
              strategic gaming. Every move matters, every game tells a story.
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
