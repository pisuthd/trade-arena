'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppContextType, Season, Vault, LiveEvent, MarketData } from '@/lib/types';

type AppAction =
  | { type: 'SET_CURRENT_SEASON'; payload: Season }
  | { type: 'SET_VAULTS'; payload: Vault[] }
  | { type: 'SET_SELECTED_VAULT'; payload: Vault | null }
  | { type: 'SET_TIME_RANGE'; payload: '1H' | '24H' | '7D' | '30D' | 'ALL' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_LIVE_EVENT'; payload: LiveEvent }
  | { type: 'SET_LIVE_EVENTS'; payload: LiveEvent[] }
  | { type: 'UPDATE_VAULT'; payload: { vaultId: string; updates: Partial<Vault> } }
  | { type: 'SET_MARKET_DATA'; payload: MarketData[] };

const initialState: AppState = {
  currentSeason: null,
  vaults: [],
  liveEvents: [],
  marketData: [],
  isLoading: false,
  selectedVault: null,
  timeRange: '24H',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_SEASON':
      return { ...state, currentSeason: action.payload };
    
    case 'SET_VAULTS':
      return { ...state, vaults: action.payload };
    
    case 'SET_SELECTED_VAULT':
      return { ...state, selectedVault: action.payload };
    
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'ADD_LIVE_EVENT':
      return { 
        ...state, 
        liveEvents: [action.payload, ...state.liveEvents].slice(0, 100) // Keep last 100 events
      };
    
    case 'SET_LIVE_EVENTS':
      return { ...state, liveEvents: action.payload };
    
    case 'UPDATE_VAULT':
      return {
        ...state,
        vaults: state.vaults.map(vault =>
          vault.id === action.payload.vaultId
            ? { ...vault, ...action.payload.updates }
            : vault
        ),
        selectedVault: state.selectedVault?.id === action.payload.vaultId
          ? { ...state.selectedVault, ...action.payload.updates }
          : state.selectedVault,
      };
    
    case 'SET_MARKET_DATA':
      return { ...state, marketData: action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const contextValue: AppContextType = {
    ...state,
    setCurrentSeason: (season: Season) => dispatch({ type: 'SET_CURRENT_SEASON', payload: season }),
    setVaults: (vaults: Vault[]) => dispatch({ type: 'SET_VAULTS', payload: vaults }),
    setSelectedVault: (vault: Vault | null) => dispatch({ type: 'SET_SELECTED_VAULT', payload: vault }),
    setTimeRange: (range: '1H' | '24H' | '7D' | '30D' | 'ALL') => 
      dispatch({ type: 'SET_TIME_RANGE', payload: range }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    addLiveEvent: (event: LiveEvent) => dispatch({ type: 'ADD_LIVE_EVENT', payload: event }),
    setLiveEvents: (events: LiveEvent[]) => dispatch({ type: 'SET_LIVE_EVENTS', payload: events }),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
