#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { YuGiOhGameEngine } from "./game-engine/index.js";
import { GameState, GameAction } from "./database/index.js";
import { YuGiOhUI } from "./ui/index.js";

const GAME_ACTION_FILE = path.join(process.cwd(), "yugioh_action.json");
const GAME_STATE_FILE = path.join(process.cwd(), "yugioh_state.json");

class YuGiOhGameApp {
  private gameEngine: YuGiOhGameEngine;
  private isWaitingForAI = false;
  private unmountUI?: () => void;

  constructor() {
    this.gameEngine = new YuGiOhGameEngine();
  }

  async start() {
    console.log("🚀 Starting Yu-Gi-Oh AI Game...");
    console.log("🃏 Initializing game state...");

    // Initialize game state
    await this.initializeGameState();

    // Start watching for AI responses
    this.watchGameStateFile();

    // Render the UI
    this.renderUI();

    console.log("✅ Game started! Use the UI to play.");
  }

  private async initializeGameState() {
    try {
      // Check if game state already exists
      await fs.access(GAME_STATE_FILE);
      console.log("✅ Existing game state found");

      // Load existing state
      const data = await fs.readFile(GAME_STATE_FILE, "utf-8");
      const gameState = JSON.parse(data);
      this.gameEngine.updateGameState(gameState);
    } catch (error) {
      // Create new game state
      console.log("🆕 Creating new game state...");
      const gameState = this.gameEngine.getGameState();

      await fs.writeFile(
        GAME_STATE_FILE,
        JSON.stringify(gameState, null, 2),
        "utf-8"
      );

      console.log("✅ New game state created");
    }
  }

  private watchGameStateFile() {
    fsSync.watchFile(GAME_STATE_FILE, { interval: 500 }, async (curr, prev) => {
      if (curr.mtime !== prev.mtime && this.isWaitingForAI) {
        console.log("\n🔄 AI has processed the action!");

        // Reload game state
        try {
          const data = await fs.readFile(GAME_STATE_FILE, "utf-8");
          const updatedState = JSON.parse(data);
          this.gameEngine.updateGameState(updatedState);

          this.isWaitingForAI = false;

          // Re-render UI with updated state
          this.renderUI();
        } catch (error) {
          console.error("❌ Error reloading game state:", error);
        }
      }
    });

    console.log("👁️ Watching for AI responses...");
  }

  private renderUI() {
    // Unmount previous UI if exists
    if (this.unmountUI) {
      this.unmountUI();
    }

    const gameState = this.gameEngine.getGameState();

    const { unmount } = render(
      React.createElement(YuGiOhUI, {
        initialGameState: gameState,
        onGameAction: this.handleGameAction.bind(this),
        onExit: this.handleExit.bind(this),
      })
    );

    this.unmountUI = unmount;
  }

  private async handleGameAction(action: GameAction) {
    try {
      // If it's player1's action, process locally first
      if (action.playerId === "player1") {
        const result = this.gameEngine.processAction(action);

        if (result.success) {
          // Save updated state
          const updatedState = this.gameEngine.getGameState();
          await fs.writeFile(
            GAME_STATE_FILE,
            JSON.stringify(updatedState, null, 2),
            "utf-8"
          );

          // If it's AI's turn now, write action for AI to process
          if (updatedState.currentPlayer === "player2") {
            await this.requestAIAction(updatedState);
          }
        } else {
          console.error("❌ Action failed:", result.message);
        }
      } else {
        // AI action - write to action file for MCP processing
        await fs.writeFile(
          GAME_ACTION_FILE,
          JSON.stringify(action, null, 2),
          "utf-8"
        );

        this.isWaitingForAI = true;
        console.log("⏳ Waiting for AI to process action...");
      }
    } catch (error) {
      console.error("❌ Error handling game action:", error);
    }
  }

  private async requestAIAction(gameState: GameState) {
    // Create an AI turn action
    const aiAction: GameAction = {
      id: `ai_turn_${Date.now()}`,
      playerId: "player2",
      actionType: "ai_turn",
      timestamp: new Date().toISOString(),
      description: "AI's turn - requesting AI to make a move",
      processed: false,
      metadata: {
        availableActions: this.gameEngine.getAvailableActions(),
        gamePhase: gameState.currentPhase,
        turnNumber: gameState.turnNumber,
      },
    };

    await fs.writeFile(
      GAME_ACTION_FILE,
      JSON.stringify(aiAction, null, 2),
      "utf-8"
    );

    this.isWaitingForAI = true;
    console.log("🤖 Requesting AI to make a move...");
    console.log("💡 Use MCP tools to let AI analyze and respond!");
  }

  private handleExit() {
    console.log("\n👋 Thanks for playing Yu-Gi-Oh AI Game!");

    if (this.unmountUI) {
      this.unmountUI();
    }

    process.exit(0);
  }
}

// Main execution
async function main() {
  const game = new YuGiOhGameApp();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down gracefully...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down gracefully...");
    process.exit(0);
  });

  try {
    await game.start();
  } catch (error) {
    console.error("💥 Fatal error starting game:", error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
