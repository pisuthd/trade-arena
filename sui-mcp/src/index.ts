#!/usr/bin/env node

import { validateEnvironment } from './config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SuiMcpTools } from "./mcp"
import { Agent } from "./agent"

/**
 * Creates an MCP server
 */
function createMcpServer(
    agent: Agent
) {

    // Create MCP server instance
    const server = new McpServer({
        name: "trade-arena-mcp",
        version: "0.1.0"
    });

    for (const [_key, tool] of Object.entries(SuiMcpTools)) {

        server.tool(tool.name, tool.description, tool.schema, async (params: any): Promise<any> => {
            try {

                // Execute the handler with the params directly
                const result = await tool.handler(agent, params);

                // Format the result as MCP tool response
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error) {
                console.error("error", error);
                // Handle errors in MCP format
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text:
                                error instanceof Error
                                    ? error.message
                                    : "Unknown error occurred",
                        },
                    ],
                };
            }
        })

    }

    return server;
}

async function main() {
    try {

        // Validate environment before proceeding
        validateEnvironment();

        const myAgent = new Agent();

        const server = createMcpServer(myAgent);
        const transport = new StdioServerTransport();
        await server.connect(transport);

        console.error("Trade Arena MCP server is running...");
    } catch (error) {
        console.error('Error starting MCP server:', error);
        process.exit(1);
    }
}


main()
