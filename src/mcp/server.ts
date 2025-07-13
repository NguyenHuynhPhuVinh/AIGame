#!/usr/bin/env node

// Simple MCP Server - AI-Driven Game Development Simulator (No Zod)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool registrations
import { registerStudioTools } from './tools/simpleStudioTools.js';
import { registerEmployeeTools } from './tools/simpleEmployeeTools.js';

// Create MCP Server
const server = new McpServer({
  name: "ai-game-dev-simulator",
  version: "1.0.0",
  description: "AI-Driven Game Development Simulator - AI manages all business logic, game only reads/writes files",
});

// Register all tool categories
function registerAllTools() {
  console.log("🔧 Registering Studio Management Tools...");
  registerStudioTools(server);
  
  console.log("🔧 Registering Employee Management Tools...");
  registerEmployeeTools(server);
  
  console.log("✅ All MCP tools registered successfully!");
}

// Register all tools
registerAllTools();

// Start server
async function main() {
  console.log("🎮 Starting AI-Driven Game Development Simulator MCP Server...");
  console.log("🤖 Pure State Management Architecture");
  console.log("💡 AI controls all business logic through MCP tools");
  console.log("");
  console.log("🔧 Available Tools:");
  console.log("  🏢 Studio Management:");
  console.log("    - getStudioOverview: Complete studio status");
  console.log("    - updateStudioFinances: Manage budget");
  console.log("    - updateStudioReputation: Manage reputation");
  console.log("    - getFinancialSummary: Detailed finances");
  console.log("    - initializeStudio: Create new studio");
  console.log("");
  console.log("  👥 Employee Management:");
  console.log("    - getAllEmployees: View all team members");
  console.log("    - hireEmployee: Recruit new talent");
  console.log("    - fireEmployee: Remove employees");
  console.log("    - getEmployeeDetails: Detailed employee info");
  console.log("");
  console.log("🎯 Key Features:");
  console.log("  - Pure state management (no game logic in MCP)");
  console.log("  - AI-driven business decisions");
  console.log("  - Realistic game development simulation");
  console.log("  - Employee management and team building");
  console.log("  - Financial management and budgeting");
  console.log("  - Comprehensive logging and history");
  console.log("");
  console.log("🚀 Server ready for AI interaction!");
  console.log("💡 Use 'initializeStudio' tool to create a new game studio");
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
