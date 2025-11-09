'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppProvider, useApp } from '@/context/AppContext';
import { LivePerformanceChart } from '@/components/charts/LivePerformanceChart';
import { VaultCard, CompactVaultCard } from '@/components/VaultCard';
import { LiveFeed } from '@/components/LiveFeed';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { generateMockVaults, generateMockSeason, generateMockLiveEvents, generateChartData } from '@/lib/mock-data';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { LiveEvent, Vault } from '@/lib/types';
import { Trophy, TrendingUp, Clock, Users, Target, Activity } from 'lucide-react';

function HomeContent() {

  const { 
    vaults, 
    currentSeason, 
    liveEvents, 
    timeRange, 
    isLoading,
    setVaults, 
    setCurrentSeason, 
    setLiveEvents,
    setTimeRange,
    setSelectedVault,
    setLoading
  } = useApp();

  const [chartData, setChartData] = useState<any[]>([]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      try {
        // Generate mock data
        const mockVaults = generateMockVaults();
        const mockSeason = generateMockSeason();
        const mockEvents = generateMockLiveEvents(mockVaults);
        const mockChartData = generateChartData(mockVaults, timeRange);
        
        setVaults(mockVaults);
        setCurrentSeason(mockSeason);
        setLiveEvents(mockEvents);
        setChartData(mockChartData);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [  timeRange]);

  // Update chart data when time range changes
  useEffect(() => {
    if (vaults.length > 0) {
      const newChartData = generateChartData(vaults, timeRange);
      setChartData(newChartData);
    }
  }, [vaults, timeRange]);

  // Simulate live updates
  useEffect(() => {
    if (vaults.length === 0) return;

    const interval = setInterval(() => {
      // Update vault values with small random changes
      const updatedVaults = vaults.map((vault: Vault) => {
        const change = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25
        const newValue = Math.max(15, vault.currentUsdcValue + change);
        const returnPercentage = ((newValue - vault.startingCapital) / vault.startingCapital) * 100;
        
        return {
          ...vault,
          currentUsdcValue: newValue,
          metrics: {
            ...vault.metrics,
            totalReturn: newValue - vault.startingCapital,
            totalReturnPercentage: returnPercentage
          }
        };
      }).sort((a: Vault, b: Vault) => b.currentUsdcValue - a.currentUsdcValue);
      
      setVaults(updatedVaults);

      // Occasionally add new live events
      if (Math.random() > 0.7) {
        const randomVault = vaults[Math.floor(Math.random() * vaults.length)];
        const eventTypes = ['trade', 'milestone', 'ranking_change'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const newEvent: LiveEvent = {
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          type: randomType as 'trade' | 'milestone' | 'ranking_change',
          vaultId: randomVault.id,
          vaultName: randomVault.name,
          message: `${randomVault.name} ${randomType === 'trade' ? 'executed trade' : randomType === 'milestone' ? 'reached milestone' : 'changed ranking'}`,
          data: {}
        };
        
        const updatedEvents = [newEvent, ...liveEvents].slice(0, 50);
        setLiveEvents(updatedEvents);
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [vaults.length]);

  const handleVaultSelect = useCallback((vault: any) => {
    setSelectedVault(vault);
    // In a real app, this would navigate to vault details
    console.log('Selected vault:', vault);
  }, [setSelectedVault]);

  const handleTimeRangeChange = useCallback((newRange: typeof timeRange) => {
    setTimeRange(newRange);
  }, [setTimeRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex items-center gap-2"
              >
                <Trophy className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-text-primary">
                  AI Trading Olympics
                </h1>
              </motion.div>
              
              {currentSeason && (
                <div className="flex items-center gap-2">
                  <StatusBadge status={currentSeason.status} />
                  <span className="text-text-secondary">
                    {currentSeason.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-text-secondary">Prize Pool</div>
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(currentSeason?.totalPrizePool || 0)}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-text-secondary">Active Vaults</div>
                <div className="text-lg font-bold text-text-primary">
                  {vaults.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section with Chart */}
        <section className="mb-8">
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Live Performance
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  {(['1H', '24H', '7D', '30D', 'ALL'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleTimeRangeChange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <LivePerformanceChart
                vaults={vaults}
                data={chartData}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="default" padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary">Total TVL</div>
                  <div className="text-lg font-bold text-text-primary">
                    {formatCurrency(vaults.reduce((sum, v) => sum + v.currentUsdcValue, 0))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="default" padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary">Avg Return</div>
                  <div className="text-lg font-bold text-text-primary">
                    {formatPercentage(
                      vaults.reduce((sum, v) => sum + v.metrics.totalReturnPercentage, 0) / vaults.length
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="default" padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Target className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary">Total Trades</div>
                  <div className="text-lg font-bold text-text-primary">
                    {vaults.reduce((sum, v) => sum + v.metrics.totalTrades, 0)}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="default" padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface">
                  <Clock className="w-5 h-5 text-text-secondary" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary">Season Time</div>
                  <div className="text-lg font-bold text-text-primary">
                    {currentSeason ? `${Math.ceil((currentSeason.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d` : 'N/A'}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Main Grid: Leaderboard and Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {vaults.map((vault, index) => (
                    <motion.div
                      key={vault.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CompactVaultCard
                        vault={vault}
                        rank={index + 1}
                        onSelect={handleVaultSelect}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Feed */}
          <div className="lg:col-span-1">
            <LiveFeed events={liveEvents} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
