#!/usr/bin/env node

// MCP Server - AI-Driven Architecture with Pure State Management
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool registrations
import { registerGameStateTools } from "./tools/state/gameStateTools.js";
import { registerPlayerStateTools } from "./tools/state/playerStateTools.js";
import { registerFieldStateTools } from "./tools/state/fieldStateTools.js";

// Create MCP Server
const server = new McpServer({
  name: "ai-driven-waifu-card-game",
  version: "2.0.0",
  description: "AI-Driven Waifu Card Game with Pure State Management - AI controls everything through MCP tools",
});

// Register all tool categories
function registerAllTools() {
  console.log("🔧 Registering Game State Tools...");
  registerGameStateTools(server);

  console.log("🔧 Registering Player State Tools...");
  registerPlayerStateTools(server);

  console.log("🔧 Registering Field State Tools...");
  registerFieldStateTools(server);

  console.log("✅ All MCP tools registered successfully!");
}
// Register all tools
registerAllTools();

// Start server
async function main() {
  console.log("🎴 Starting AI-Driven Waifu Card Game MCP Server...");
  console.log("🤖 Pure State Management Architecture");
  console.log("💡 AI controls all game logic through MCP tools");
  console.log("");
  console.log("🔧 Available Tool Categories:");
  console.log("  📊 Game State Tools (5 tools)");
  console.log("  👥 Player State Tools (5 tools)");
  console.log("  ⚔️ Field State Tools (4 tools)");
  console.log("  🃏 Card State Tools (coming soon)");
  console.log("  📜 History Tools (coming soon)");
  console.log("");
  console.log("🎯 Key Features:");
  console.log("  - Pure state management (no game logic in MCP)");
  console.log("  - AI-driven decision making");
  console.log("  - Separated state files for modularity");
  console.log("  - Comprehensive error handling");
  console.log("  - Detailed logging and history");
  console.log("");
  console.log("🚀 Server ready for AI interaction!");

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
