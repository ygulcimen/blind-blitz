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
      question: 'What is the blind phase in BlindChess?',
      answer:
        "The blind phase is the opening part of every game where both players make their first 5 moves without seeing their opponent's moves. This tests strategic planning and intuition rather than memorized opening theory. After 5 moves, the board is revealed and the game continues as normal chess.",
    },
    {
      id: 2,
      category: 'economy',
      question: 'How does the gold system work?',
      answer:
        "Every move in BlindChess costs gold from your balance. Different game modes have different move costs. You start with 1000 gold as a new player and earn more by winning games. Managing your gold effectively is crucial - if you run out, you can't make moves!",
    },
    {
      id: 3,
      category: 'gameplay',
      question: "What's the difference between Classical and RoboChaos modes?",
      answer:
        'Classical mode follows traditional chess rules after the blind phase. RoboChaos mode has our AI generate chaotic opening positions that destroy traditional opening theory, forcing players to adapt quickly to unexpected situations.',
    },
    {
      id: 4,
      category: 'economy',
      question: 'Can I lose all my gold?',
      answer:
        "Yes, it's possible to lose all your gold if you're not careful with your moves. However, we provide daily login bonuses, achievement rewards, and free practice modes to help players rebuild their gold reserves. You can also purchase gold if needed.",
    },
    {
      id: 5,
      category: 'tournaments',
      question: 'How do tournaments work?',
      answer:
        'Tournaments are competitive events with entry fees and prize pools. They can be Classical-only, RoboChaos-only, or mixed format. Players compete in multiple rounds, and winners share the prize pool based on their final ranking.',
    },
    {
      id: 6,
      category: 'gameplay',
      question: 'Do I need to be a chess expert to play BlindChess?',
      answer:
        'Not at all! While chess knowledge helps, BlindChess rewards strategic thinking and adaptation over memorization. Many traditional chess masters struggle with the blind phase and economy management. We have beginner-friendly modes and tutorials.',
    },
    {
      id: 7,
      category: 'economy',
      question: 'How much does each move cost?',
      answer:
        'Move costs vary by game mode: Classical mode typically costs 10-20 gold per move, while RoboChaos can cost 25-50 gold per move due to higher stakes. Tournament games may have different cost structures.',
    },
    {
      id: 8,
      category: 'technical',
      question: 'What devices can I play on?',
      answer:
        'BlindChess is a web-based game that works on any modern browser. You can play on desktop, laptop, tablet, or mobile phone. We also have dedicated mobile apps coming soon.',
    },
    {
      id: 9,
      category: 'tournaments',
      question: 'When are tournaments held?',
      answer:
        'We run tournaments continuously! There are daily tournaments, weekend specials, and monthly championships. Check the tournaments page for current and upcoming events.',
    },
    {
      id: 10,
      category: 'technical',
      question: 'Is my progress saved across devices?',
      answer:
        'Yes! Your account, gold balance, game history, and statistics are saved to our servers and sync across all your devices when you log in.',
    },
    {
      id: 11,
      category: 'economy',
      question: 'What happens if I disconnect during a game?',
      answer:
        "If you disconnect, the game will pause for up to 5 minutes. You can reconnect and continue. If you don't reconnect in time, it counts as a forfeit and you lose your entry fee, but no additional gold penalties apply.",
    },
    {
      id: 12,
      category: 'gameplay',
      question: 'Can I practice without spending gold?',
      answer:
        'Yes! We offer free practice modes against AI opponents where you can learn the rules, test strategies, and get comfortable with the interface without risking any gold.',
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
            Everything you need to know about BlindChess. Can't find what you're
            looking for? Contact our support team.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">❓</div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {faqs.length}
            </div>
            <div className="text-gray-400 text-sm">Total Questions</div>
          </div>

          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              &lt;5min
            </div>
            <div className="text-gray-400 text-sm">Average Response</div>
          </div>

          <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">📞</div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">24/7</div>
            <div className="text-gray-400 text-sm">Support Available</div>
          </div>
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
