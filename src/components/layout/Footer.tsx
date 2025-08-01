import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-20 bg-black/20 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">♟️</div>
              <div className="text-xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
                BlindChess
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Experience chess like never before! Make your moves blindly, then
              watch the chaos unfold. Strategic planning meets unpredictable
              excitement.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xl">🐦</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xl">📱</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xl">💬</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                How to Play
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Rules
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Strategy Guide
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                FAQ
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Contact Us
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Bug Reports
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Feature Requests
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Community
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 BlindChess. Made with ♟️ for chess lovers everywhere.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
