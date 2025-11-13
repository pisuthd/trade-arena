import { Agent } from '../../agent';

export interface SeasonInfoParams {
  seasonGlobalId: string;
  seasonNumber?: number;
  packageId: string;
}

export async function getSeasonInfo(
  agent: Agent,
  params: SeasonInfoParams
): Promise<any> {
  try {
    const result = await agent.client.getObject({
      id: params.seasonGlobalId,
      options: {
        showContent: true,
        showType: true,
      }
    });

    if (!result.data?.content) {
      throw new Error('Season object not found or has no content');
    }

    const content = result.data.content as any;
    const fields = content.fields || {};
    const seasons = fields.seasons || {};

    // If specific season number is requested
    if (params.seasonNumber !== undefined) {
      const seasonKey = params.seasonNumber.toString();
      const season = seasons[seasonKey];

      if (!season) {
        throw new Error(`Season ${params.seasonNumber} not found`);
      }

      return formatSeasonInfo(params.seasonNumber, season);
    }

    // Return all seasons
    const allSeasons = Object.keys(seasons).map(seasonKey => {
      const seasonNumber = parseInt(seasonKey);
      const season = seasons[seasonKey];
      return formatSeasonInfo(seasonNumber, season);
    });

    return {
      total_seasons: allSeasons.length,
      seasons: allSeasons
    };

  } catch (error) {
    console.error('Error getting season info:', error);
    throw error;
  }
}

export async function getCurrentSeason(
  agent: Agent,
  params: SeasonInfoParams
): Promise<any> {
  try {
    const result = await agent.client.getObject({
      id: params.seasonGlobalId,
      options: {
        showContent: true,
        showType: true,
      }
    });

    if (!result.data?.content) {
      throw new Error('Season object not found or has no content');
    }

    const content = result.data.content as any;
    const fields = content.fields || {};
    const currentSeason = fields.current_season || 0;

    return {
      current_season: currentSeason,
      season_info: await getSeasonInfo(agent, {
        ...params,
        seasonNumber: currentSeason
      })
    };

  } catch (error) {
    console.error('Error getting current season:', error);
    throw error;
  }
}

export async function getAIModels(
  agent: Agent,
  params: SeasonInfoParams
): Promise<any> {
  try {
    const seasonInfo = await getSeasonInfo(agent, params);

    if (params.seasonNumber !== undefined) {
      // Single season
      const aiModels = seasonInfo.ai_models || [];
      return {
        season_number: params.seasonNumber,
        ai_models: aiModels
      };
    } else {
      // All seasons
      const allModels = seasonInfo.seasons.flatMap((season: any) => 
        season.ai_models.map((model: any) => ({
          season_number: season.season_number,
          ...model
        }))
      );

      return {
        total_models: allModels.length,
        ai_models: allModels
      };
    }

  } catch (error) {
    console.error('Error getting AI models:', error);
    throw error;
  }
}

function formatSeasonInfo(seasonNumber: number, season: any): any {
  const fields = season.fields || {};
  
  return {
    season_number: seasonNumber,
    status: fields.status || 'unknown',
    start_time: fields.start_time || null,
    end_time: fields.end_time || null,
    total_prize_pool: fields.total_prize_pool || '0',
    ai_vault: fields.ai_vault || null,
    prize_vault: fields.prize_vault || null,
    ai_models: fields.ai_models || [],
    trade_count: fields.trade_count || 0,
    total_volume: fields.total_volume || '0',
    top_performer: fields.top_performer || null,
    // Additional fields from smart contract
    entry_fee: fields.entry_fee || '0',
    min_trades: fields.min_trades || 0,
    max_leverage: fields.max_leverage || 1,
    is_active: fields.status === 'active',
    participants_count: fields.participants_count || 0
  };
}
