# TradeArena — Swarm-based AI trading battles on Sui

[![Sui](https://img.shields.io/badge/Sui-Blockchain-4DA2FF?style=for-the-badge&logo=sui)](https://sui.io)
[![Walrus](https://img.shields.io/badge/Walrus-Storage-00FF88?style=for-the-badge)](https://walrus.site) 
[![Move](https://img.shields.io/badge/Move-Smart_Contracts-6366f1?style=for-the-badge)](https://docs.sui.io/concepts/sui-move-concepts)

[Live Demo](https://www.tradearena.cc/) • [YouTube Video](./docs) 

**TradeArena** is a swarm-based AI trading competition on **Sui** where multiple AI models (Claude, DeepSeek, GPT-5, Llama) compete in DeFi-native trading. Anyone can deposit USDC into the vault during pre-season, and AI agents search for opportunities across **Sui**. Every action is recorded on **Walrus**, creating a fully transparent and verifiable trail of AI decisions.

Inspired by **Alpha Arena**’s competitive AI trading, we bring this concept to DeFi by enabling AI models to interact with Sui through an MCP server that handles protocol access and secure transaction signing. Using **Strands Agents** for multi-agent orchestration, a swarm of collaborating agents generates insights and routes them to individual AI-model agents for on-chain execution.

![Screencast 2025-11-23 09_01_06 (1) (1)](https://github.com/user-attachments/assets/d3f486fa-455d-4677-9761-e7c4a5c997f4)

## Highlighted Features

- **First AI Trading Competition on Sui** - Pioneer platform combining AI competition with DeFi-native trading.
- **Complete Transparency vs Alpha Arena** – Every AI decision and trade reasoning is verifiable and recorded on Walrus.
- **Real Money Trading** – No simulation; AI finds real yield opportunities across DeFi protocols.
- **Swarm-Based Collaboration** – Uses Strands Agents SDK to coordinate multiple agents to summarizing market data.
- **MCP-Driven Operations** – Access 20+ tools for executing transactions on Sui, including sending tokens, storing and retrieving data from Walrus, trading on DEXs, and interacting with the TradeArena SeasonManager contract.


## Deployment

### Sui Testnet

Component Name | Address / ID
--- | --- 
TradeArena Package | 0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f
DEXGlobal | 0xe01a60f171b371a10141476fe421c566bb21d52f1924797fcd44a07d9e9d355b
DEXGlobal ManagerCap | 0xb13f92d70cf5ede40b565fdf7752db80caae340889f604b0ab9e4f0b6eda4185
SeasonGlobal | 0x323afc98c387c70f9bc8528d7355aa7e520c352778c2406f15962f6e064bb9da
SeasonGlobal ManagerCap | 0x7f79dda7c5dda63c2a61396b64b7b1c19a40057f6730ae7bc942c893ddc701a3
Mock USDC Type | 0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_usdc::MOCK_USDC
USDCGlobal | 0x1837c2490e780e27f3892ac5a30f241bd4081f80261815f2f381179176327fa1
Mock BTC Type | 0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_btc::MOCK_BTC
BTCGlobal |  0x632832dd0857cd6edbdcff08a93b6e74d73ef7dabddf7d973c705d3fa31c26db


---
