#!/usr/bin/env node

import { WaifuGameEngine } from './gameEngine.js';
import { saveGameState, saveCards } from '../utils/fileUtils.js';
import { WAIFU_CARDS } from '../data/cards.js';
import { formatGameState } from '../utils/gameUtils.js';

async function main() {
  console.log("🎴 Initializing Pure MCP Waifu Card Game...");
  console.log("🤖 AI will play 100% through MCP tools!");
  
  // Create initial game state using game engine
  const gameState = WaifuGameEngine.createInitialGameState();
  
  // Save game state and cards
  await saveGameState(gameState);
  await saveCards(WAIFU_CARDS);
  
  console.log("✅ Game initialized successfully!");
  console.log(`📊 Game ID: ${gameState.gameId}`);
  console.log(`🎮 Status: ${gameState.status}`);
  console.log(`👤 Current Player: ${gameState.currentPlayer}`);
  console.log(`🔄 Turn: ${gameState.turnNumber}, Phase: ${gameState.phase}`);
  console.log(`🃏 Player 1: ${gameState.players.player1.hand.length} cards in hand`);
  console.log(`🃏 Player 2: ${gameState.players.player2.hand.length} cards in hand`);
  console.log("");
  console.log("🚀 Ready for AI to play via MCP tools!");
  console.log("💡 Use MCP server to interact with the game");
}

main().catch(console.error);
