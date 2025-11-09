import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge, RankingBadge, ProfitLossBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Vault } from '@/lib/types';
import { formatCurrency, formatPercentage, formatTimeAgo, getProfitLossClass } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target } from 'lucide-react';

interface VaultCardProps {
  vault: Vault;
  rank: number;
  onSelect?: (vault: Vault) => void;
  className?: string;
}

export function VaultCard({ vault, rank, onSelect, className }: VaultCardProps) {
  const isProfit = vault.metrics.totalReturn >= 0;
  const lastTrade = vault.trades[0];
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card variant="elevated" className="h-full cursor-pointer hover:shadow-xl transition-all duration-300" onClick={() => onSelect?.(vault)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <RankingBadge rank={rank} />
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {vault.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {vault.personality.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">
                {formatCurrency(vault.currentUsdcValue)}
              </div>
              <ProfitLossBadge value={vault.metrics.totalReturnPercentage} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* AI Personality Description */}
          <div className="text-sm text-text-secondary">
            {vault.personality.description}
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isProfit ? 'bg-primary/20' : 'bg-danger/20'}`}>
                {isProfit ? (
                  <TrendingUp className="w-4 h-4 text-primary" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
              </div>
              <div>
                <div className="text-xs text-text-secondary">Total Return</div>
                <div className={`text-sm font-semibold ${getProfitLossClass(vault.metrics.totalReturn)}`}>
                  {formatCurrency(vault.metrics.totalReturn)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-surface">
                <Activity className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">Win Rate</div>
                <div className="text-sm font-semibold text-text-primary">
                  {vault.metrics.winRate.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-surface">
                <DollarSign className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">Avg Trade</div>
                <div className="text-sm font-semibold text-text-primary">
                  {formatCurrency(vault.metrics.averageTradeSize)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-surface">
                <Target className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">Sharpe Ratio</div>
                <div className="text-sm font-semibold text-text-primary">
                  {vault.metrics.sharpeRatio.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Holdings */}
          <div>
            <div className="text-xs text-text-secondary mb-2">Current Holdings</div>
            <div className="space-y-1">
              {vault.holdings.map((holding, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-text-primary">{holding.symbol}</span>
                  <span className="font-mono text-text-primary">
                    {holding.amount.toFixed(2)} ({formatCurrency(holding.usdcValue)})
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-1 border-t border-border">
                <span className="text-text-secondary">USDC Balance</span>
                <span className="font-mono text-text-primary">
                  {formatCurrency(vault.metrics.usdcBalance)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Last Trade */}
          {lastTrade && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-text-secondary">
                  Last Trade: {formatTimeAgo(lastTrade.timestamp)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={lastTrade.action === 'buy' ? 'success' : 'danger'} 
                    size="sm"
                  >
                    {lastTrade.action.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-text-secondary">
                    {lastTrade.confidence}% confidence
                  </span>
                </div>
              </div>
              <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                {lastTrade.reasoning}
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(vault);
            }}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CompactVaultCard({ vault, rank, onSelect, className }: VaultCardProps) {
  const isProfit = vault.metrics.totalReturn >= 0;
  
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        variant="default" 
        padding="sm" 
        className="cursor-pointer hover:bg-surface-elevated transition-colors"
        onClick={() => onSelect?.(vault)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RankingBadge rank={rank} />
            <div>
              <h4 className="font-semibold text-text-primary">{vault.name}</h4>
              <p className="text-xs text-text-secondary">{vault.personality.name}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold text-text-primary">
              {formatCurrency(vault.currentUsdcValue)}
            </div>
            <ProfitLossBadge value={vault.metrics.totalReturnPercentage} />
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
          <span>Win Rate: {vault.metrics.winRate.toFixed(1)}%</span>
          <span>Trades: {vault.metrics.totalTrades}</span>
          <span>Sharpe: {vault.metrics.sharpeRatio.toFixed(2)}</span>
        </div>
      </Card>
    </motion.div>
  );
}
