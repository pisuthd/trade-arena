import { Agent } from '../../agent';

export interface SeasonInfoParams {
  seasonGlobalId: string;
  seasonNumber?: number;
  packageId: string;
}

// Status constants from the contract
const STATUS_PRE_SEASON = 0;
const STATUS_ACTIVE = 1;
const STATUS_ENDED = 2;

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

    // seasons is a VecMap<u64, Season>, need to access it properly
    const seasonsVecMap = fields.seasons || {};
    const seasonsContents = seasonsVecMap.fields.contents || []; // Get the actual map data as array

    // Helper function to find season by key
    const findSeason = (seasonNumber: number) => {
      const seasonEntry = seasonsContents.find((entry: any) =>
        entry.fields.key === seasonNumber.toString()
      );
      return seasonEntry ? seasonEntry.fields.value : null;
    };

    // If specific season number is requested
    if (params.seasonNumber !== undefined) {
      const seasonData = findSeason(params.seasonNumber);

      if (!seasonData) {
        throw new Error(`Season ${params.seasonNumber} not found`);
      }

      return formatSeasonInfo(params.seasonNumber, seasonData);
    }

    // Return all seasons
    const allSeasons = seasonsContents.map((entry: any) => {
      const seasonNumber = parseInt(entry.fields.key);
      const seasonData = entry.fields.value;
      return formatSeasonInfo(seasonNumber, seasonData);
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

    // seasons is a VecMap<u64, Season>, need to access it properly
    const seasonsVecMap = fields.seasons || {};
    const seasonsContents = seasonsVecMap.fields.contents || []; // Get the actual map data as array


    if (!seasonsContents || seasonsContents.length === 0) {
      throw new Error('No seasons found');
    }

    const currentSeasonEntry = seasonsContents[seasonsContents.length - 1]

    const currentSeasonNumber = parseInt(currentSeasonEntry.fields.key);
    const currentSeasonData = currentSeasonEntry.fields.value;

    console.error("currentSeasonData:", currentSeasonData)

    // Determine season type based on status
    const seasonFields = currentSeasonData.fields || {};
    const statusCode = seasonFields.status || 0;
    let currentSeasonType = 'unknown';

    switch (statusCode) {
      case STATUS_PRE_SEASON:
        currentSeasonType = 'pre_season';
        break;
      case STATUS_ACTIVE:
        currentSeasonType = 'active';
        break;
      case STATUS_ENDED:
        currentSeasonType = 'ended';
        break;
    }

    return {
      current_season: currentSeasonNumber,
      season_type: currentSeasonType
    };

  } catch (error) {
    console.error('Error getting current season:', error);
    throw error;
  }
}
 

function formatSeasonInfo(seasonNumber: number, season: any): any {
  const fields = season.fields || {};
 

  // Map status number to readable string
  const status = fields.status || 0;
  let statusString = 'unknown';
  switch (status) {
    case STATUS_PRE_SEASON:
      statusString = 'pre_season';
      break;
    case STATUS_ACTIVE:
      statusString = 'active';
      break;
    case STATUS_ENDED:
      statusString = 'ended';
      break;
  }

  // Format AI models from vector
  const aiModels = fields.ai_models || [];
  const formattedAIModels = aiModels.map((model: any) => { 
    return {
      name: model.fields.name || '',
      // wallet_address: modelFields.wallet_address || ''
    };
  });
 

  // Format AI vaults from VecMap<String, AIVault<String>>
  const aiVaults = fields.ai_vaults || {};
  // Handle both possible structures: direct contents or nested fields.contents
  let vaultContents = [];
  if (aiVaults.contents) {
    vaultContents = aiVaults.contents;
  } else if (aiVaults.fields && aiVaults.fields.contents) {
    vaultContents = aiVaults.fields.contents;
  }
 
  const formattedVaults = vaultContents.map((entry: any) => {
    const aiName = entry.fields.key;
    const vaultData = entry.fields.value;
    const vaultFields = vaultData.fields || vaultData;
    return {
      ai_name: aiName,
      // authorized_wallet: vaultFields.authorized_wallet || '',
      trading_paused: vaultFields.trading_paused || false,
      usdc_balance: vaultFields.usdc_balance || '0',
      btc_balance: vaultFields.btc_balance || '0',
      lp_supply: vaultFields.lp_supply?.value || '0',
      trade_history_count: (vaultFields.trade_history || []).length
    };
  });
 

  return {
    season_number: seasonNumber,
    status: statusString,
    status_code: status,
    created_at: fields.created_at || null,
    started_at: fields.started_at || null,
    ended_at: fields.ended_at || null,
    total_trades: fields.total_trades || 0,
    total_volume: fields.total_volume || '0',
    ai_models: formattedAIModels,
    ai_vaults: formattedVaults,
    is_active: status === STATUS_ACTIVE,
    is_pre_season: status === STATUS_PRE_SEASON,
    is_ended: status === STATUS_ENDED
  };
}
