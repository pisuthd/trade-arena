
import { GetAllTokenBalancesTool } from "./sui/get_all_balances_tool";
import { GetWalletAddressTool } from "./sui/get_wallet_address_tool";
import { TransferTokenTool } from "./sui/transfer_token_tool";
import { TransactionTools } from "./transaction";
import { PriceApiTools } from "./price-api";

export const SuiMcpTools = {
    "GetAllTokenBalancesTool": GetAllTokenBalancesTool,
    "GetWalletAddressTool": GetWalletAddressTool,
    "TransferTokenTool": TransferTokenTool,
    ...TransactionTools,
    ...PriceApiTools,
}
