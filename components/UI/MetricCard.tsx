import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    color: string;
  };
  className?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  className = '' 
}: MetricCardProps) {
  return (
    <div className={`bg-gray-800/50 p-4 rounded-lg ${className}`}>
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
      {trend && (
        <p className={`text-xs mt-1 ${trend.color}`}>{trend.value}</p>
      )}
    </div>
  );
}
