import React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';

export default function OldFooter() {
  return (
    <footer className="border-t border-gray-800 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <p className="text-center text-sm text-gray-400">
            © 2025 TradeArena (Legacy). All rights reserved.
          </p>
          {/* Links and Info */}
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/pisuthd/trade-arena"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#00ff88] transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <span className="text-sm text-gray-400">
              Built for <span className="text-white font-semibold">Walrus Hackathon</span> • AI x DATA Track (Legacy Version)
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
