"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, ChartNoAxesColumn } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/models', label: 'Analytics' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 bg-black/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-lg flex items-center justify-center">
              <ChartNoAxesColumn className="w-6 h-6 text-black" />
            </div>
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                  TradeArena
                </h1>
              <p className="text-xs text-gray-400">Powered by Sui × Walrus</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-[#00ff88]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <button className="px-4 py-2 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
