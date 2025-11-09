import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className, 
  ...props 
}: CardProps) {
  const baseClasses = 'rounded-lg border transition-all duration-200';
  
  const variants = {
    default: 'bg-surface border-border',
    elevated: 'bg-surface-elevated border-border shadow-lg',
    glass: 'glass border-border/50'
  };
  
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        baseClasses,
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-text-secondary mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border', className)}>
      {children}
    </div>
  );
}
