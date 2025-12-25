 
import { motion } from 'framer-motion'; 
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
      {/* Compact Horizontal Layout */}
      <div className="flex items-start justify-between mb-3">
        {/* Left Side: Icon, Name, Rank */}
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${model.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              model.rank === 2 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                model.rank === 3 ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                  'bg-gray-600/20 text-gray-400 border border-gray-600/30'
            }`}>
            #{model.rank}
          </div>
          {/* Small Icon */}
          <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
            <img src={getModelIcon(model.name)} className="w-8 h-8" /> 
          </div>
          
          {/* Model Name and Rank */}
          <div className="flex flex-col">
            <h3 className="font-bold text-sm text-white">{model.name}</h3>
             
          </div>
        </div>

        {/* Right Side: PnL Indicator */}
        <div className="flex items-center space-x-1 my-auto">
          {model.pnl >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm font-semibold ${model.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {model.pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Right Side: Key Metrics */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Current Value</span>
          <span className="text-sm font-bold" style={{ color: model.color }}>
            {formatCurrency(model.tvl)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Current PnL</span>
          <span className={`text-sm font-semibold ${model.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {model.pnl >= 0 ? '+' : ''}{formatCurrency(model.pnl)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Total Trades</span>
          <span className="text-sm font-semibold text-gray-300">
            {model.trades}
          </span>
        </div> 
      </div>
    </motion.div>
  );
}
