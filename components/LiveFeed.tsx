import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LiveEvent } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import { TrendingUp, TrendingDown, Trophy, ArrowUp, Activity } from 'lucide-react';

interface LiveFeedProps {
  events: LiveEvent[];
  className?: string;
}

export function LiveFeed({ events, className }: LiveFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getEventIcon = (type: LiveEvent['type']) => {
    switch (type) {
      case 'trade':
        return <Activity className="w-4 h-4" />;
      case 'milestone':
        return <Trophy className="w-4 h-4" />;
      case 'ranking_change':
        return <ArrowUp className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: LiveEvent['type']) => {
    switch (type) {
      case 'trade':
        return 'text-accent';
      case 'milestone':
        return 'text-warning';
      case 'ranking_change':
        return 'text-primary';
      default:
        return 'text-text-secondary';
    }
  };

  const getEventBadgeVariant = (type: LiveEvent['type']) => {
    switch (type) {
      case 'trade':
        return 'primary' as const;
      case 'milestone':
        return 'warning' as const;
      case 'ranking_change':
        return 'success' as const;
      default:
        return 'default' as const;
    }
  };

  const renderEventData = (event: LiveEvent) => {
    switch (event.type) {
      case 'trade':
        return (
          <div className="flex items-center gap-2 text-sm">
            {event.data.action && (
              <Badge 
                variant={event.data.action === 'buy' ? 'success' : 'danger'} 
                size="sm"
              >
                {event.data.action?.toUpperCase()}
              </Badge>
            )}
            {event.data.token && (
              <span className="text-text-primary">{event.data.token}</span>
            )}
            {event.data.amount && (
              <span className="font-mono text-text-secondary">
                {event.data.amount}
              </span>
            )}
            {event.data.usdcValue && (
              <span className="font-mono text-text-primary">
                (${event.data.usdcValue})
              </span>
            )}
            {event.data.profit && (
              <span className={`font-mono ${event.data.profit.startsWith('+') ? 'profit' : 'loss'}`}>
                {event.data.profit}
              </span>
            )}
          </div>
        );
      
      case 'milestone':
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-mono text-text-primary">{event.data.value}</span>
            <span className={`font-mono ${event.data.return?.startsWith('+') ? 'profit' : 'loss'}`}>
              {event.data.return}
            </span>
          </div>
        );
      
      case 'ranking_change':
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">
              Rank {event.data.previousRank} → {event.data.newRank}
            </span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Live Feed
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div 
          ref={containerRef}
          className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
        >
          <AnimatePresence>
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                className="flex gap-3 p-3 rounded-lg bg-surface border border-border hover:bg-surface-elevated transition-colors"
              >
                <div className={`mt-1 ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getEventBadgeVariant(event.type)} size="sm">
                          {event.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-text-secondary">
                          {formatTimeAgo(event.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-text-primary font-medium mb-1">
                        {event.message}
                      </div>
                      
                      {renderEventData(event)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {events.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No live events yet</p>
              <p className="text-sm">Trading activity will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompactLiveFeed({ events, className }: LiveFeedProps) {
  return (
    <Card variant="default" padding="sm" className={className}>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.slice(0, 10).map((event) => (
          <div 
            key={event.id}
            className="flex items-center gap-2 p-2 rounded bg-surface border border-border"
          >
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-text-primary truncate">
                {event.message}
              </div>
              <div className="text-xs text-text-secondary">
                {formatTimeAgo(event.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="text-center py-4 text-text-secondary text-sm">
            No recent activity
          </div>
        )}
      </div>
    </Card>
  );
}
