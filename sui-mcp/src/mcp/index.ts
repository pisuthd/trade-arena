
import { GetAllTokenBalancesTool } from "./sui/get_all_balances_tool";
import { GetWalletAddressTool } from "./sui/get_wallet_address_tool";
import { TransferTokenTool } from "./sui/transfer_token_tool";
import { TransactionTools } from "./transaction";
import { PriceApiTools } from "./price-api";
import { 
    tradeArenaAiExecuteLongTool,
    tradeArenaAiExecuteShortTool,
    tradeArenaGetVaultBalanceTool,
    tradeArenaGetTradeHistoryTool
} from "./trade-arena/trading_tools";
import {
    tradeArenaGetPoolInfoTool,
    tradeArenaGetSwapQuoteTool
} from "./trade-arena/dex_tools";
import {
    tradeArenaGetSeasonInfoTool,
    tradeArenaGetCurrentSeasonTool,
    tradeArenaGetAIModelsTool
} from "./trade-arena/season_tools";
import {
    tradeArenaWalrusStoreTool,
    tradeArenaWalrusRetrieveTool
} from "./trade-arena/walrus_tools";
import {
    tradeArenaMintMockUsdcTool,
    tradeArenaMintMockBtcTool,
    tradeArenaGetTokenBalanceTool
} from "./trade-arena/faucet_tools";

export const SuiMcpTools = {
    "GetAllTokenBalancesTool": GetAllTokenBalancesTool,
    "GetWalletAddressTool": GetWalletAddressTool,
    "TransferTokenTool": TransferTokenTool,
    ...TransactionTools,
    ...PriceApiTools,
    // Trade Arena Trading Tools
    "tradeArenaAiExecuteLongTool": tradeArenaAiExecuteLongTool,
    "tradeArenaAiExecuteShortTool": tradeArenaAiExecuteShortTool,
    "tradeArenaGetVaultBalanceTool": tradeArenaGetVaultBalanceTool,
    "tradeArenaGetTradeHistoryTool": tradeArenaGetTradeHistoryTool,
    // Trade Arena DEX Tools
    "tradeArenaGetPoolInfoTool": tradeArenaGetPoolInfoTool,
    "tradeArenaGetSwapQuoteTool": tradeArenaGetSwapQuoteTool,
    // Trade Arena Season Tools
    "tradeArenaGetSeasonInfoTool": tradeArenaGetSeasonInfoTool,
    "tradeArenaGetCurrentSeasonTool": tradeArenaGetCurrentSeasonTool,
    "tradeArenaGetAIModelsTool": tradeArenaGetAIModelsTool,
    // Trade Arena Walrus Tools
    "tradeArenaWalrusStoreTool": tradeArenaWalrusStoreTool,
    "tradeArenaWalrusRetrieveTool": tradeArenaWalrusRetrieveTool,
    // Trade Arena Faucet Tools
    "tradeArenaMintMockUsdcTool": tradeArenaMintMockUsdcTool,
    "tradeArenaMintMockBtcTool": tradeArenaMintMockBtcTool,
    "tradeArenaGetTokenBalanceTool": tradeArenaGetTokenBalanceTool,
}
