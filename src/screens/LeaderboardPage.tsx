// src/screens/LeaderboardPage.tsx
import React from 'react';

const LeaderboardPage: React.FC = () => {
  const topPlayers = [
    { rank: 1, name: 'ChessMaster2024', gold: 125000, wins: 847 },
    { rank: 2, name: 'BlindKing', gold: 98500, wins: 723 },
    { rank: 3, name: 'StrategicMind', gold: 87200, wins: 651 },
    { rank: 4, name: 'GoldHunter', gold: 76800, wins: 592 },
    { rank: 5, name: 'ChaosAdept', gold: 65400, wins: 534 },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-gray-400">Top players in the BlindChess arena</p>
        </div>

        <div className="bg-gray-900/40 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-700 font-semibold text-gray-400">
            <div>Rank</div>
            <div>Player</div>
            <div>Gold</div>
            <div>Wins</div>
          </div>
          {topPlayers.map((player) => (
            <div
              key={player.rank}
              className="grid grid-cols-4 gap-4 p-6 border-b border-gray-700/50 hover:bg-gray-800/20"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {player.rank === 1
                    ? '🥇'
                    : player.rank === 2
                    ? '🥈'
                    : player.rank === 3
                    ? '🥉'
                    : `#${player.rank}`}
                </span>
              </div>
              <div className="text-white font-semibold">{player.name}</div>
              <div className="text-yellow-400">
                {player.gold.toLocaleString()} 🪙
              </div>
              <div className="text-green-400">{player.wins}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// src/screens/TournamentsPage.tsx
const TournamentsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Tournaments
          </h1>
          <p className="text-gray-400">Compete for massive gold prizes</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-green-400 font-semibold">LIVE</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Weekend Blitz</h3>
            <p className="text-gray-400 mb-4">
              Fast-paced tournament with 5-minute games
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Prize Pool</span>
                <span className="text-yellow-400">50,000 🪙</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entry Fee</span>
                <span className="text-white">500 🪙</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Players</span>
                <span className="text-white">124/200</span>
              </div>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg">
              Join Tournament
            </button>
          </div>

          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-400 font-semibold">
                STARTS IN 2H
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Chaos Masters</h3>
            <p className="text-gray-400 mb-4">
              RoboChaos-only tournament for experienced players
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Prize Pool</span>
                <span className="text-yellow-400">100,000 🪙</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entry Fee</span>
                <span className="text-white">1,000 🪙</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Players</span>
                <span className="text-white">67/100</span>
              </div>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// src/screens/AboutPage.tsx
const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            About BlindChess
          </h1>
          <p className="text-gray-400">
            Revolutionary chess with real economic stakes
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              BlindChess revolutionizes the ancient game of chess by introducing
              economic stakes and blind strategy phases. Every move costs gold,
              making each decision crucial and adding a new layer of strategic
              depth that goes beyond traditional chess.
            </p>
          </div>

          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
            <div className="space-y-4 text-gray-400">
              <p>
                Players start with a gold budget and must manage it carefully
                throughout the game.
              </p>
              <p>
                The blind phase requires strategic planning without seeing your
                opponent's moves.
              </p>
              <p>
                RoboChaos mode introduces AI-generated chaos to test adaptation
                skills.
              </p>
              <p>
                Winners earn gold based on performance, efficiency, and
                strategic execution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// src/screens/FAQPage.tsx
const FAQPage: React.FC = () => {
  const faqs = [
    {
      question: 'How does the gold system work?',
      answer:
        'Every move costs gold. Players start with a budget and must manage it strategically. Winning games earns gold based on performance.',
    },
    {
      question: 'What is the blind phase?',
      answer:
        "Both players make their first 5 moves without seeing their opponent's moves. This tests strategic planning and adaptation skills.",
    },
    {
      question: "What's RoboChaos mode?",
      answer:
        'An AI generates chaotic opening positions for both players, destroying traditional opening theory and demanding rapid adaptation.',
    },
    {
      question: 'Can I lose all my gold?',
      answer:
        'Yes, but we provide daily gold bonuses and free practice modes to help players rebuild their reserves.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            FAQ
          </h1>
          <p className="text-gray-400">Common questions about BlindChess</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export all components
export { LeaderboardPage, TournamentsPage, AboutPage, FAQPage };
