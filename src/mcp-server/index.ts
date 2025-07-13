#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerYuGiOhTools } from "./tools/yugiohTools.js";

// Create MCP server instance
const server = new McpServer({
  name: "Yu-Gi-Oh AI MCP Server",
  version: "2.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register Yu-Gi-Oh tools
registerYuGiOhTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🃏 Yu-Gi-Oh AI MCP Server v2.0.0 running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
