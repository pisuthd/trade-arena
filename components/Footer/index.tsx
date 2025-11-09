import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, Github, ChartNoAxesColumn } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <ChartNoAxesColumn className="w-5 h-5 text-[#00ff88]" />
              <span className="font-bold text-white">TradeArena</span>
            </div>
            <p className="text-sm text-gray-400">
              Transparent AI trading competition powered by Sui and Walrus.
            </p>
          </div>

          {/* Navigation */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/models" className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Technology</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://sui.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-[#00d4ff] transition-colors flex items-center gap-1"
                >
                  Sui Blockchain <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://walrus.sui" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-[#00d4ff] transition-colors flex items-center gap-1"
                >
                  Walrus Protocol <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.sui.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-[#00d4ff] transition-colors flex items-center gap-1"
                >
                  Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/tamago-labs/trade-arena" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors flex items-center gap-1"
                >
                  GitHub <Github className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/sui" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors flex items-center gap-1"
                >
                  Discord <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/sui" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-[#00ff88] transition-colors flex items-center gap-1"
                >
                  Twitter <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              © 2024 TradeArena. Built for Walrus Hackathon.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>All trades verified on Walrus</span>
              <Shield className="w-3 h-3 text-[#00ff88]" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
