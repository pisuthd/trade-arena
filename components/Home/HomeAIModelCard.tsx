import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HomeAIModelCardProps {
  model: {
    name: string;
    tvl: number;
    pnl: number;
    trades: number;
    color?: string;
    rank?: number;
  };
  onViewDetails?: () => void;
}

export default function HomeAIModelCard({ model, onViewDetails }: HomeAIModelCardProps) {
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

  const pnlPercentage = model.tvl > 0 ? (model.pnl / model.tvl) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all"
    >
      {/* Rank Badge */}
      {model.rank && (
        <div className="flex justify-between items-start mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${model.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              model.rank === 2 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                model.rank === 3 ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                  'bg-gray-600/20 text-gray-400 border border-gray-600/30'
            }`}>
            #{model.rank}
          </div>
          <div className="flex items-center space-x-1">
            {model.pnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-xs font-semibold ${model.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {model.pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Model Header with Large Icon */}
      <div className="flex flex-col items-center mb-4"> 
        <div className='w-16 h-16 rounded-full overflow-hidden mb-2'>
          <img src={getModelIcon(model.name)} className=" w-16 h-16 " /> 
        </div>

        <h3 className="font-bold text-base text-center">{model.name}</h3>
      </div>

      {/* Enhanced Metrics */}
      <div className="space-y-3 grid grid-cols-2 gap-3">

        <div className="flex justify-between ">
          <span className="text-xs text-gray-400">Strategy</span>
          <span className="text-sm font-semibold text-gray-300">
            BTC Cycle
          </span>
        </div>

        <div className="flex justify-between  ">
          <span className="text-xs text-gray-400">Current PnL</span>
          <span className={`text-sm font-semibold ${model.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {model.pnl >= 0 ? '+' : ''}{formatCurrency(model.pnl)}
          </span>
        </div>

         <div className="flex justify-between ">
          <span className="text-xs text-gray-400 ">Initial Deposit</span>
          <span className="text-sm font-semibold" style={{ color: model.color }}>
            3,000 USDC
          </span>
        </div>
        <div className="flex justify-between  ">
          <span className="text-xs text-gray-400 ">Current Value</span>
          <span className="text-sm font-semibold" style={{ color: model.color }}>
            {formatCurrency(model.tvl)}
          </span>
        </div>
 
        {/* <div className="flex justify-between ">
          <span className="text-xs text-gray-400">Total Trades</span>
          <span className="text-sm font-semibold text-gray-300">
            {model.trades}
          </span>
        </div> */}

        {/* <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Win Rate</span>
          <span className="text-sm font-semibold text-blue-400">
            {Math.max(0, Math.min(100, 50 + pnlPercentage)).toFixed(0)}%
          </span>
        </div> */}
      </div>
    </motion.div>
  );
}
