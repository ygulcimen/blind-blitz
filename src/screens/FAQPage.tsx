// src/screens/FAQPage.tsx
import React, { useState } from 'react';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const FAQPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = ['all', 'gameplay', 'economy', 'tournaments', 'technical'];

  const faqs: FAQ[] = [
    {
      id: 1,
      category: 'gameplay',
      question: 'What is the blind phase in BlindBlitz?',
      answer:
        "The blind phase is the opening part of every game where both players commit their first 5 moves without seeing their opponent's moves. This tests strategic planning and intuition rather than memorized opening theory. After 5 moves, the board reveals all moves simultaneously and the game continues as standard chess.",
    },
    {
      id: 2,
      category: 'economy',
      question: 'How does the gold system work?',
      answer:
        "You earn and spend gold (🪙) to play games. Each game has an entry fee that goes into the prize pool. Winners take the pot! You start with 1000 gold as a new player. Earn more by winning matches, daily login bonuses, and achievements. Different stake levels (Pawn to King arenas) have different entry fees and rewards.",
    },
    {
      id: 3,
      category: 'gameplay',
      question: "What's the difference between Classical and RoboChaos modes?",
      answer:
        'Classical mode: Both players start from the standard chess position and play through the blind phase, then continue normally. RoboChaos mode: An AI bot makes the first 5 moves for BOTH players randomly during the blind phase, creating completely chaotic positions. You take over after the chaos and must adapt to whatever situation you inherit. It destroys opening theory!',
    },
    {
      id: 4,
      category: 'economy',
      question: 'What happens if I run out of gold?',
      answer:
        "Don't worry! We never leave players stranded. If your balance runs low, you can claim daily bonuses, complete achievements for rewards, or start fresh with our welcome-back bonus. Your account never gets locked - you always have a path back to playing.",
    },
    {
      id: 5,
      category: 'tournaments',
      question: 'How do tournaments work?',
      answer:
        'Tournaments are special competitive events (coming soon!) with larger prize pools. Entry requires a tournament ticket or higher entry fee. Players compete in multiple rounds, and winners share massive gold rewards. Watch for Weekend Blitz and Chaos Masters tournaments!',
    },
    {
      id: 6,
      category: 'gameplay',
      question: 'Do I need to be a chess expert to play BlindBlitz?',
      answer:
        'Not at all! While chess knowledge helps, BlindBlitz rewards strategic thinking and adaptation over memorization. The blind phase levels the playing field - even grandmasters can\'t rely on their opening repertoire. If you know how pieces move and basic tactics, you can compete!',
    },
    {
      id: 7,
      category: 'economy',
      question: 'How do stake levels work?',
      answer:
        'We have 6 stake levels (arenas): Pawn (10-24🪙), Knight (25-49🪙), Bishop (50-99🪙), Rook (100-249🪙), Queen (250-499🪙), and King (500+🪙). Higher stakes = higher risks and rewards. Winners in each arena earn rewards based on the entry fee. Choose your comfort level!',
    },
    {
      id: 8,
      category: 'technical',
      question: 'What devices can I play on?',
      answer:
        'BlindBlitz is a web-based game that works on any modern browser (Chrome, Firefox, Safari, Edge). Play on desktop, laptop, tablet, or mobile phone - your account syncs everywhere. No downloads required!',
    },
    {
      id: 9,
      category: 'gameplay',
      question: 'How long does a typical game take?',
      answer:
        'Games are fast-paced! The blind phase (5 moves each) takes 2-5 minutes depending on your thinking time. The live phase varies based on the position but typically 5-15 minutes. Total game time: 10-20 minutes on average. Perfect for quick strategic battles!',
    },
    {
      id: 10,
      category: 'technical',
      question: 'Is my progress saved across devices?',
      answer:
        'Absolutely! Your account, gold balance, game history, rating, and all statistics are stored securely on our servers. Log in from any device and pick up right where you left off. Your data is always backed up and synced in real-time.',
    },
    {
      id: 11,
      category: 'technical',
      question: 'What happens if I disconnect during a game?',
      answer:
        "If you disconnect, you have a grace period to reconnect. During the blind phase, you'll have time to rejoin. In the live phase, your clock keeps running. If you're gone too long, the game may be forfeited. Always play on a stable connection!",
    },
    {
      id: 12,
      category: 'gameplay',
      question: 'Can I watch other players\' games?',
      answer:
        'Spectator mode is coming soon! You\'ll be able to watch high-stakes games in real-time, learn from top players, and follow tournament action. For now, focus on your own battles and climb the leaderboard!',
    },
  ];

  const filteredFaqs =
    selectedCategory === 'all'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-gray-400 text-sm">Got questions?</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Frequently Asked Questions
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about BlindBlitz. Can't find what you're
            looking for? Contact our support team.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-1 backdrop-blur-sm overflow-x-auto">
            <div className="flex gap-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 capitalize whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {category === 'all' ? 'All Topics' : category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-900/40 border border-gray-700 rounded-2xl overflow-hidden transition-colors hover:border-gray-600"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-800/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      faq.category === 'gameplay'
                        ? 'bg-blue-500/20 text-blue-400'
                        : faq.category === 'economy'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : faq.category === 'tournaments'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {faq.category}
                  </div>
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`transform transition-transform ${
                    openFaq === faq.id ? 'rotate-45' : ''
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </button>

              {openFaq === faq.id && (
                <div className="px-6 pb-6">
                  <div className="pl-20">
                    <p className="text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-8 inline-block">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Still Need Help?
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Can't find the answer you're looking for? Our support team is
              ready to help you 24/7.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Contact Support
              </button>
              <button
                onClick={() => (window.location.href = '/about')}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
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

export default FAQPage;
