import React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */} 
          <p className="text-center text-sm text-gray-400">
            © 2026 TradeArena. All rights reserved.
          </p>
          {/* Links and Info */}
          <div className="flex items-center space-x-6"> 
            <span className="text-sm text-gray-400">
              🥉 <span className="text-[#00ff88] font-semibold">3rd Place Winner</span> • <span className="text-white font-semibold">AI x Data Track</span> • <span>Walrus Haulout Hackathon</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}