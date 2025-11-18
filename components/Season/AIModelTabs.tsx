import React from 'react';
import { StatusBadge } from '../UI';
import { DataAdapter } from '@/data/dataAdapter';

interface AIModelTabsProps {
  aiModels: any[];
  activeModel: string | null;
  onModelClick: (modelName: string) => void;
  getModelEmoji: (modelName: string) => string;
}

export default function AIModelTabs({ 
  aiModels, 
  activeModel, 
  onModelClick, 
  getModelEmoji 
}: AIModelTabsProps) {
  return (
    <div className="flex border-b border-gray-700">
      {aiModels.map((model: any) => {
        const isActive = activeModel === model.name;

        return (
          <button
            key={model.name}
            onClick={() => onModelClick(model.name)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              isActive
                ? 'text-[#00ff88] border-[#00ff88] bg-gray-700/50'
                : 'text-gray-400 hover:text-white border-transparent hover:bg-gray-700/30'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">{getModelEmoji(model.name)}</span>
              <span>{DataAdapter.getModelDisplayName(model.name)}</span>
              <StatusBadge
                type="ai"
                status={model.status}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
