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
const GAME_LOG_FILE = path.join(process.cwd(), "yugioh_log.json");

class YuGiOhGameApp {
  private gameEngine: YuGiOhGameEngine;
  private isWaitingForAI = false;
  private unmountUI?: () => void;
  private uiUpdateCallback?: (gameState: GameState) => void;
  private updateTimeout?: NodeJS.Timeout;

  constructor() {
    this.gameEngine = new YuGiOhGameEngine();
  }

  async start() {
    console.log("🚀 Starting Yu-Gi-Oh AI Game...");
    console.log("🃏 Initializing game state...");

    // Initialize game state
    await this.initializeGameState();

    // Initialize game log
    await this.initializeGameLog();

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
      if (curr.mtime !== prev.mtime) {
        console.log("\n🔄 Game state file changed, updating UI...");

        // Reload game state
        try {
          const data = await fs.readFile(GAME_STATE_FILE, "utf-8");
          const updatedState = JSON.parse(data);

          // Update game engine
          this.gameEngine.updateGameState(updatedState);

          // If we were waiting for AI and this is a processed action, clear the flag
          if (this.isWaitingForAI) {
            // Check if the action was processed by looking at the action file
            try {
              const actionData = await fs.readFile(GAME_ACTION_FILE, "utf-8");
              const action = JSON.parse(actionData);
              if (action.processed) {
                this.isWaitingForAI = false;
                console.log("✅ AI action processed successfully!");
              }
            } catch (actionError) {
              // Action file might not exist, that's okay
            }
          }

          // Update UI with new state
          this.updateUI(updatedState);
        } catch (error) {
          console.error("❌ Error reloading game state:", error);
        }
      }
    });

    console.log("👁️ Watching for game state changes...");
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
        onStateUpdate: this.registerUIUpdateCallback.bind(this),
      })
    );

    this.unmountUI = unmount;
  }

  private registerUIUpdateCallback(callback: (gameState: GameState) => void) {
    this.uiUpdateCallback = callback;
  }

  private updateUI(gameState: GameState) {
    // Debounce UI updates to avoid excessive re-renders
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      if (this.uiUpdateCallback) {
        // Use callback to update existing UI instead of re-rendering
        this.uiUpdateCallback(gameState);
      } else {
        // Fallback to full re-render if callback not available
        this.renderUI();
      }
    }, 100); // 100ms debounce
  }

  private async handleGameAction(action: GameAction) {
    try {
      console.log(
        `🎯 Received ${action.actionType} action from ${action.playerId}`
      );

      // Log action to separate log file
      await this.logGameAction(action);

      // TẤT CẢ ACTIONS (cả player và AI) đều được gửi cho AI xử lý
      // UI chỉ là presentation layer, không có game logic
      await fs.writeFile(
        GAME_ACTION_FILE,
        JSON.stringify(action, null, 2),
        "utf-8"
      );

      this.isWaitingForAI = true;
      console.log("🤖 Action sent to AI for processing...");
      console.log("💡 AI will handle all game logic through MCP tools");
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

    // Cleanup
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    if (this.unmountUI) {
      this.unmountUI();
    }

    // Stop watching files
    fsSync.unwatchFile(GAME_STATE_FILE);

    process.exit(0);
  }

  private async initializeGameLog() {
    try {
      // Check if game log already exists
      await fs.access(GAME_LOG_FILE);
      console.log("✅ Existing game log found");
    } catch (error) {
      // Create new game log
      console.log("📝 Creating new game log...");
      const initialLog = {
        gameId: `yugioh_${Date.now()}`,
        createdAt: new Date().toISOString(),
        entries: [
          {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "game_start",
            message: "🎮 Yu-Gi-Oh AI Game Started",
            playerId: "system",
            details: {
              gameMode: "AI vs Player",
              version: "2.0.0",
            },
          },
        ],
      };

      await fs.writeFile(
        GAME_LOG_FILE,
        JSON.stringify(initialLog, null, 2),
        "utf-8"
      );

      console.log("✅ New game log created");
    }
  }

  private async logGameAction(action: GameAction, result?: any) {
    try {
      const logData = await fs.readFile(GAME_LOG_FILE, "utf-8");
      const gameLog = JSON.parse(logData);

      const logEntry = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "player_action",
        message: action.description,
        playerId: action.playerId,
        actionType: action.actionType,
        cardId: action.cardId,
        details: {
          actionId: action.id,
          result: result,
          metadata: action.metadata,
        },
      };

      gameLog.entries.push(logEntry);

      await fs.writeFile(
        GAME_LOG_FILE,
        JSON.stringify(gameLog, null, 2),
        "utf-8"
      );

      console.log(
        `📝 Logged action: ${action.actionType} by ${action.playerId}`
      );
    } catch (error) {
      console.error("❌ Error logging action:", error);
    }
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
// Run if this is the main module - Windows compatible check
const isMainModule = () => {
  // Convert paths to use forward slashes for comparison
  const scriptPath = import.meta.url.replace(/\\/g, "/");
  const argPath = `file:///${process.argv[1].replace(/\\/g, "/")}`;

  console.log("🔍 Debug: Script path:", scriptPath);
  console.log("🔍 Debug: Arg path:", argPath);

  return (
    scriptPath === argPath ||
    scriptPath.endsWith(process.argv[1].replace(/\\/g, "/")) ||
    process.argv[1].endsWith("game.js")
  );
};

if (isMainModule()) {
  console.log("🔍 Debug: Main module detected, starting game...");
  main().catch(console.error);
} else {
  console.log("🔍 Debug: Not main module, skipping auto-start");
}
