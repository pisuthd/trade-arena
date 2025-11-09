import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className, 
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200';
  
  const variants = {
    default: 'bg-surface-elevated text-text-primary border border-border',
    primary: 'bg-accent text-white',
    secondary: 'bg-surface text-text-secondary',
    success: 'bg-primary text-white',
    warning: 'bg-warning text-white',
    danger: 'bg-danger text-white',
    outline: 'border border-border text-text-primary bg-transparent'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.span>
  );
}

export function RankingBadge({ rank }: { rank: number }) {
  const getRankingVariant = (rank: number) => {
    switch (rank) {
      case 1: return 'success';
      case 2: return 'secondary';
      case 3: return 'warning';
      default: return 'default';
    }
  };

  const getRankingEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <Badge variant={getRankingVariant(rank)} size="sm">
      {getRankingEmoji(rank)}
    </Badge>
  );
}

export function ProfitLossBadge({ value }: { value: number }) {
  const isProfit = value >= 0;
  const displayValue = `${isProfit ? '+' : ''}${value.toFixed(2)}%`;
  
  return (
    <Badge 
      variant={isProfit ? 'success' : 'danger'} 
      size="sm"
      className="font-mono"
    >
      {displayValue}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: 'active' | 'completed' | 'upcoming' }) {
  const variants: Record<string, 'success' | 'secondary' | 'outline'> = {
    active: 'success',
    completed: 'secondary',
    upcoming: 'outline'
  };

  return (
    <Badge variant={variants[status]} size="sm">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
