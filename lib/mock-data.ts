import { Vault, Season, AIPersonality, Trade, TokenHolding, VaultMetrics, LiveEvent, MarketData, SeasonResult } from '@/lib/types';

// AI Personalities
export const aiPersonalities: Record<string, AIPersonality> = {
  'GLM-4.6': {
    name: 'The Balanced Trader',
    description: 'Moderate risk tolerance with consistent performance',
    riskTolerance: 'moderate',
    typicalTradeSize: 8,
    tradeFrequency: 'medium',
    confidenceRange: [70, 85],
    reasoningStyle: 'Technical analysis with balanced risk management'
  },
  'Claude Sonnet 4': {
    name: 'The Patient Hunter',
    description: 'Conservative approach with high conviction trades',
    riskTolerance: 'conservative',
    typicalTradeSize: 5,
    tradeFrequency: 'low',
    confidenceRange: [85, 95],
    reasoningStyle: 'Fundamental analysis with confirmation signals'
  },
  'GPT-5': {
    name: 'The Active Trader',
    description: 'Aggressive strategy with frequent trading',
    riskTolerance: 'aggressive',
    typicalTradeSize: 12,
    tradeFrequency: 'high',
    confidenceRange: [60, 75],
    reasoningStyle: 'Momentum-based with quick decision making'
  },
  'DeepSeek R1': {
    name: 'The Speed Trader',
    description: 'High-frequency scalping with small profits',
    riskTolerance: 'scalper',
    typicalTradeSize: 3,
    tradeFrequency: 'very-high',
    confidenceRange: [65, 80],
    reasoningStyle: 'Micro-trend detection and rapid execution'
  }
};

// Generate mock trades
function generateMockTrades(vaultId: string, personality: AIPersonality): Trade[] {
  const trades: Trade[] = [];
  const now = new Date();
  const tradeCount = personality.tradeFrequency === 'very-high' ? 50 : 
                    personality.tradeFrequency === 'high' ? 30 :
                    personality.tradeFrequency === 'medium' ? 20 : 15;
  
  for (let i = 0; i < tradeCount; i++) {
    const timestamp = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)); // Every 2 hours
    const isBuy = Math.random() > 0.5;
    const confidence = Math.random() * (personality.confidenceRange[1] - personality.confidenceRange[0]) + personality.confidenceRange[0];
    
    const reasoningTemplates = {
      'GLM-4.6': [
        'Technical indicators suggest moderate upside potential',
        'Risk-reward ratio favorable for position size',
        'Market conditions support balanced approach',
        'Support level confirmed with volume'
      ],
      'Claude Sonnet 4': [
        'Strong fundamental metrics confirm long-term value',
        'Waiting for confirmation signals before entry',
        'Conservative approach with high conviction',
        'Market alignment with investment thesis'
      ],
      'GPT-5': [
        'Strong momentum detected on multiple timeframes',
        'Breakout pattern confirmed with volume surge',
        'Aggressive positioning for maximum upside',
        'Quick reaction to market catalyst'
      ],
      'DeepSeek R1': [
        'Micro-trend detected on 5-minute chart',
        'Quick scalp opportunity identified',
        'Rapid profit target set for efficiency',
        'High-frequency signal triggered'
      ]
    };
    
    const reasonings = reasoningTemplates[personality.riskTolerance === 'scalper' ? 'DeepSeek R1' : 
                                          personality.riskTolerance === 'aggressive' ? 'GPT-5' :
                                          personality.riskTolerance === 'conservative' ? 'Claude Sonnet 4' : 'GLM-4.6'];
    
    trades.push({
      id: `${vaultId}-trade-${i}`,
      timestamp,
      action: isBuy ? 'buy' : 'sell',
      token: 'SUI',
      amount: Math.random() * personality.typicalTradeSize + 2,
      usdcValue: Math.random() * personality.typicalTradeSize + 2,
      reasoning: reasonings[Math.floor(Math.random() * reasonings.length)],
      confidence: Math.round(confidence),
      profit: isBuy ? undefined : Math.random() * 2 - 0.5,
      profitPercentage: isBuy ? undefined : Math.random() * 20 - 5
    });
  }
  
  return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate mock vaults
export function generateMockVaults(): Vault[] {
  const vaults: Vault[] = [];
  
  Object.entries(aiPersonalities).forEach(([aiModel, personality], index) => {
    const trades = generateMockTrades(`vault-${index + 1}`, personality);
    const currentUsdcValue = 20 + (Math.random() - 0.3) * 8; // Between 17.6 and 24.8
    
    const holdings: TokenHolding[] = [
      {
        symbol: 'SUI',
        amount: Math.random() * 10 + 2,
        usdcValue: Math.random() * 10 + 5,
        pricePerToken: 1.2 + Math.random() * 0.8
      }
    ];
    
    const metrics: VaultMetrics = {
      totalReturn: currentUsdcValue - 20,
      totalReturnPercentage: ((currentUsdcValue - 20) / 20) * 100,
      winRate: Math.random() * 20 + 55, // 55-75%
      totalTrades: trades.length,
      averageTradeSize: personality.typicalTradeSize,
      maxDrawdown: Math.random() * 5 + 2, // 2-7%
      sharpeRatio: Math.random() * 1.5 + 0.5, // 0.5-2.0
      currentHoldingsValue: holdings.reduce((sum, h) => sum + h.usdcValue, 0),
      usdcBalance: currentUsdcValue - holdings.reduce((sum, h) => sum + h.usdcValue, 0)
    };
    
    const seasonHistory: SeasonResult[] = [
      {
        seasonId: 'season-1',
        seasonName: 'Alpha Games',
        rank: Math.floor(Math.random() * 4) + 1,
        finalValue: 18 + Math.random() * 6,
        return: Math.random() * 6 - 2,
        returnPercentage: Math.random() * 30 - 10,
        prize: Math.random() * 1000
      }
    ];
    
    vaults.push({
      id: `vault-${index + 1}`,
      name: `${aiModel} Vault`,
      aiModel: aiModel as any,
      startingCapital: 20,
      currentUsdcValue,
      holdings,
      trades,
      metrics,
      personality,
      seasonRanking: index + 1,
      seasonHistory
    });
  });
  
  return vaults.sort((a, b) => b.currentUsdcValue - a.currentUsdcValue);
}

// Generate mock season
export function generateMockSeason(): Season {
  const now = new Date();
  const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  return {
    id: 'season-2',
    name: 'Beta Championship',
    startDate,
    endDate,
    status: 'active',
    duration: 14,
    vaults: [
      { vaultId: 'vault-1', startingCapital: 20 },
      { vaultId: 'vault-2', startingCapital: 20 },
      { vaultId: 'vault-3', startingCapital: 20 },
      { vaultId: 'vault-4', startingCapital: 20 }
    ],
    totalPrizePool: 5000
  };
}

// Generate mock live events
export function generateMockLiveEvents(vaults: Vault[]): LiveEvent[] {
  const events: LiveEvent[] = [];
  const eventTemplates = [
    (vault: Vault) => ({
      type: 'trade' as const,
      message: `${vault.name} opened position on SUI`,
      data: { action: 'buy', token: 'SUI', amount: '5.2', usdcValue: '6.24' }
    }),
    (vault: Vault) => ({
      type: 'trade' as const,
      message: `${vault.name} closed position with profit`,
      data: { profit: '+$1.23', profitPercentage: '+8.5%' }
    }),
    (vault: Vault) => ({
      type: 'milestone' as const,
      message: `${vault.name} reached new high!`,
      data: { value: '$24.50', return: '+22.5%' }
    }),
    (vault: Vault) => ({
      type: 'ranking_change' as const,
      message: `${vault.name} moved up in rankings!`,
      data: { newRank: 2, previousRank: 3 }
    })
  ];
  
  vaults.forEach((vault, index) => {
    for (let i = 0; i < 5; i++) {
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const event = template(vault);
      
      events.push({
        id: `event-${index}-${i}`,
        timestamp: new Date(Date.now() - (i * 15 * 60 * 1000) - (index * 5 * 60 * 1000)),
        type: event.type,
        vaultId: vault.id,
        vaultName: vault.name,
        message: event.message,
        data: event.data
      });
    }
  });
  
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate mock market data
export function generateMockMarketData(): MarketData[] {
  return [
    {
      symbol: 'SUI',
      price: 1.45,
      change24h: 0.08,
      change24hPercentage: 5.84,
      volume24h: 125000000,
      timestamp: new Date()
    },
    {
      symbol: 'USDC',
      price: 1.00,
      change24h: 0.00,
      change24hPercentage: 0.00,
      volume24h: 45000000,
      timestamp: new Date()
    }
  ];
}

// Generate chart data for performance visualization
export function generateChartData(vaults: Vault[], timeRange: string) {
  const now = new Date();
  const dataPoints = [];
  let pointsCount = 24; // Default to 24 hours
  
  switch (timeRange) {
    case '1H': pointsCount = 12; break;
    case '24H': pointsCount = 24; break;
    case '7D': pointsCount = 7 * 24; break;
    case '30D': pointsCount = 30 * 24; break;
    case 'ALL': pointsCount = 30 * 24; break;
  }
  
  for (let i = pointsCount; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
    const point: any = { timestamp };
    
    vaults.forEach(vault => {
      const baseValue = 20;
      const variance = (Math.random() - 0.5) * 2;
      const trend = (pointsCount - i) * 0.01 * (Math.random() * 2 - 1);
      point[vault.id] = baseValue + variance + trend + (vault.currentUsdcValue - 20) * ((pointsCount - i) / pointsCount);
    });
    
    dataPoints.push(point);
  }
  
  return dataPoints;
}
