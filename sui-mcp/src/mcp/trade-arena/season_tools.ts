import { z } from "zod";
import { Agent } from '../../agent';
import { getSeasonInfo, getCurrentSeason, getAIModels } from '../../tools/trade-arena/season';
import { getSuiConfig } from '../../config';
import { type McpTool } from '../../types';

// Get Season Info Tool
export const tradeArenaGetSeasonInfoTool: McpTool = {
  name: 'trade_arena_get_season_info',
  description: 'Get information about a specific season or all seasons',
  schema: {
    season_number: z.number().min(1).optional().describe("Optional: Specific season number to get info for. If not provided, returns all seasons.")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      seasonGlobalId: config.tradeArena.seasonGlobalId,
      seasonNumber: input.season_number,
      packageId: config.tradeArena.packageId
    };

    try {
      const result = await getSeasonInfo(agent, params);
      
      return {
        success: true,
        data: result,
        message: input.season_number 
          ? `Retrieved information for season ${input.season_number}`
          : 'Retrieved information for all seasons'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: input.season_number 
          ? `Failed to get information for season ${input.season_number}`
          : 'Failed to get season information'
      };
    }
  }
};

// Get Current Season Tool
export const tradeArenaGetCurrentSeasonTool: McpTool = {
  name: 'trade_arena_get_current_season',
  description: 'Get information about current active season',
  schema: {},
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      seasonGlobalId: config.tradeArena.seasonGlobalId,
      packageId: config.tradeArena.packageId
    };

    try {
      const result = await getCurrentSeason(agent, params);
      
      return {
        success: true,
        data: result,
        message: 'Retrieved current season information'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get current season information'
      };
    }
  }
};

// Get AI Models Tool
export const tradeArenaGetAIModelsTool: McpTool = {
  name: 'trade_arena_get_ai_models',
  description: 'Get information about AI models participating in seasons',
  schema: {
    season_number: z.number().min(1).optional().describe("Optional: Specific season number to get AI models for. If not provided, returns all AI models from all seasons.")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      seasonGlobalId: config.tradeArena.seasonGlobalId,
      seasonNumber: input.season_number,
      packageId: config.tradeArena.packageId
    };

    try {
      const result = await getAIModels(agent, params);
      
      return {
        success: true,
        data: result,
        message: input.season_number 
          ? `Retrieved AI models for season ${input.season_number}`
          : 'Retrieved AI models from all seasons'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: input.season_number 
          ? `Failed to get AI models for season ${input.season_number}`
          : 'Failed to get AI models'
      };
    }
  }
};
