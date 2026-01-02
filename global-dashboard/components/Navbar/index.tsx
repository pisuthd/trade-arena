"use client"
 
import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { Github } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/arena', label: 'Arena' }, 
  { href: '/benchmark', label: 'Benchmark' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 bg-black/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3"> 
            <div className="px-6 py-3 rounded-lg bg-black/40 backdrop-blur-sm">
              <span className="font-mono font-bold text-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent tracking-wider">TradeArena</span>
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
            
            <a
              href="https://github.com/pisuthd/trade-arena"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            > 
              Docs
            </a>
            
            {/* <WalletConnect /> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
