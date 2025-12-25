import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Trade {
  id: string;
  ai: string;
  action: string;
  pair: string;
  usdcAmount: number;
  btcAmount: number;
  price: number;
  confidence: number;
  reasoning: string;
  time: string;
  walrus_blob_id?: number[];
}

interface HomeTradeFeedProps {
  trades: Trade[];
  onTradeClick?: (trade: Trade) => void;
}

export default function HomeTradeFeed({ trades, onTradeClick }: HomeTradeFeedProps) {
  // Get model icon based on name
  const getModelIcon = (modelName: string) => {
    if (modelName.toLowerCase().includes('claude')) {
      return '/claude-icon.png';
    } else if (modelName.toLowerCase().includes('nova') || modelName.toLowerCase().includes('amazon')) {
      return '/amazon-nova.png';
    } else if (modelName.toLowerCase().includes('llama')) {
      return '/llama-icon.png';
    }
    return '/claude-icon.png'; // fallback
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleTradeClick = (trade: Trade) => {
    if (onTradeClick) {
      onTradeClick(trade);
    }
  };

  return (
    <>
      <div className="space-y-3 overflow-y-auto max-h-[550px]">
        {trades.map((trade, index) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3 transition-all cursor-pointer ${
              trade.walrus_blob_id ? 'hover:border-purple-500/50 hover:bg-purple-500/5' : 'hover:border-gray-700'
            }`}
            onClick={() => handleTradeClick(trade)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                  <Image
                    src={getModelIcon(trade.ai)}
                    alt={trade.ai}
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-bold text-gray-300">{trade.ai}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${
                trade.action === 'BUY' || trade.action === 'LONG' ? 'bg-green-500/20 text-green-400' :
                trade.action === 'SELL' || trade.action === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                trade.action === 'TAKE PROFIT' ? 'bg-blue-500/20 text-blue-400' :
                trade.action === 'ADD LIQUIDITY' ? 'bg-purple-500/20 text-purple-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {trade.action}
              </span>
            </div>
            
            <div className="text-xs text-gray-300">
              {/* <p className="truncate">
                {trade.action} {trade.pair} • {trade.confidence}% confidence
              </p> */}
              {trade.reasoning && (
                <p className="text-gray-400 mt-1 line-clamp-2" title={trade.reasoning}>
                    {trade.reasoning}
                </p>
              )} 
            </div>

            <div className="mt-2 pt-2 border-t border-gray-800 flex">
              <span className="text-xs text-gray-500">{trade.time}</span>
              <div className='text-xs text-gray-300 ml-auto'>
                {trade.walrus_blob_id && (
                <p className="text-purple-400 mt-1">
                  📦 Verified on Walrus
                </p>
              )}
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
