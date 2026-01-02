import React from 'react';
import { Clock, Play, Square } from 'lucide-react';

type SeasonStatus = 'pre-season' | 'active' | 'ended';
type AIStatus = 'active' | 'paused' | 'registered' | 'pending' | 'completed';

interface StatusBadgeProps {
  type: 'season' | 'ai';
  status: SeasonStatus | AIStatus;
  className?: string;
}

const seasonStatusConfig = {
  'pre-season': {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    icon: Clock,
    label: 'Pre-Season',
  },
  'active': {
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    icon: Play,
    label: 'Active',
  },
  'ended': {
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    icon: Square,
    label: 'Ended',
  }
};

const aiStatusConfig = {
  'active': { color: 'text-green-400', label: 'Active' },
  'paused': { color: 'text-yellow-400', label: 'Paused' },
  'registered': { color: 'text-blue-400', label: 'Registered' },
  'pending': { color: 'text-gray-400', label: 'Pending' },
  'completed': { color: 'text-gray-400', label: 'Completed' },
};

export default function StatusBadge({ type, status, className = '' }: StatusBadgeProps) {
  if (type === 'season') {
    const config = seasonStatusConfig[status as SeasonStatus];
    const StatusIcon = config.icon;
    
    return (
      <div className={`px-3 py-1 rounded-full border ${config.bgColor} ${config.borderColor} ${config.color} flex items-center space-x-2 ${className}`}>
        <StatusIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  }

  if (type === 'ai') {
    const config = aiStatusConfig[status as AIStatus];
    
    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} bg-gray-600 border ${config.color}/20 ${className}`}>
        {config.label}
      </div>
    );
  }

  return null;
}
