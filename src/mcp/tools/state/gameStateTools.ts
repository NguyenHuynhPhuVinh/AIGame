// MCP Tools for Game State Management
import { z } from "zod";
import { StateManager } from "../../../state/stateManager.js";
import {
  GameState,
  PlayerId,
  GamePhase,
  UpdateGamePhaseParams,
} from "../../../types/game.js";

export function registerGameStateTools(server: any) {
  // Tool 1: Get Game State
  server.tool(
    "getGameState",
    "📊 Get current game state (core game info)",
    {},
    async () => {
      const gameState = await StateManager.loadGameState();

      if (!gameState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No game found! Initialize a new game first.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text:
              `🎴 Game State:\n\n` +
              `🆔 Game ID: ${gameState.gameId}\n` +
              `📊 Status: ${gameState.status}\n` +
              `👤 Current Player: ${gameState.currentPlayer}\n` +
              `🔄 Turn: ${gameState.turnNumber}\n` +
              `📍 Phase: ${gameState.phase}\n` +
              `🏆 Winner: ${gameState.winner || "None"}\n` +
              `📅 Created: ${gameState.createdAt}\n` +
              `🕒 Last Updated: ${gameState.lastUpdated}`,
          },
        ],
      };
    }
  );

  // Tool 2: Update Game Phase
  server.tool(
    "updateGamePhase",
    "⏭️ Update game phase and turn information",
    {
      phase: z
        .enum(["draw", "main", "battle", "end"])
        .describe("New game phase"),
      currentPlayer: z
        .enum(["player1", "player2"])
        .optional()
        .describe("New current player"),
      turnNumber: z.number().optional().describe("New turn number"),
    },
    async ({
      phase,
      currentPlayer,
      turnNumber,
    }: {
      phase: GamePhase;
      currentPlayer?: PlayerId;
      turnNumber?: number;
    }) => {
      const gameState = await StateManager.loadGameState();

      if (!gameState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No game found! Initialize a new game first.",
            },
          ],
        };
      }

      // Update game state
      gameState.phase = phase;
      if (currentPlayer) gameState.currentPlayer = currentPlayer;
      if (turnNumber) gameState.turnNumber = turnNumber;

      await StateManager.saveGameState(gameState);

      return {
        content: [
          {
            type: "text",
            text:
              `✅ Game phase updated!\n\n` +
              `📍 Phase: ${gameState.phase}\n` +
              `👤 Current Player: ${gameState.currentPlayer}\n` +
              `🔄 Turn: ${gameState.turnNumber}`,
          },
        ],
      };
    }
  );

  // Tool 3: End Game
  server.tool(
    "endGame",
    "🏁 End the game with a winner",
    {
      winner: z.enum(["player1", "player2", "draw"]).describe("Game winner"),
      reason: z.string().optional().describe("Reason for game end"),
    },
    async ({
      winner,
      reason,
    }: {
      winner: "player1" | "player2" | "draw";
      reason?: string;
    }) => {
      const gameState = await StateManager.loadGameState();

      if (!gameState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No game found!",
            },
          ],
        };
      }

      gameState.status = "finished";
      gameState.winner = winner;

      await StateManager.saveGameState(gameState);

      // Add to history
      const historyState = await StateManager.loadHistoryState();
      if (historyState) {
        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: "system",
          action: "game_end",
          description: `Game ended. Winner: ${winner}${
            reason ? ` (${reason})` : ""
          }`,
          details: { winner, reason },
        });
      }

      return {
        content: [
          {
            type: "text",
            text:
              `🏁 Game Ended!\n\n` +
              `🏆 Winner: ${winner}\n` +
              `📝 Reason: ${reason || "Not specified"}\n` +
              `📊 Status: ${gameState.status}`,
          },
        ],
      };
    }
  );

  // Tool 4: Get All States Summary
  server.tool(
    "getAllStates",
    "📋 Get summary of all game states",
    {},
    async () => {
      const states = await StateManager.getAllStates();

      if (!states.game) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No game states found! Initialize a new game first.",
            },
          ],
        };
      }

      let summary = `📋 All Game States Summary:\n\n`;

      // Game State
      summary += `🎮 Game State:\n`;
      summary += `  Status: ${states.game.status}\n`;
      summary += `  Turn: ${states.game.turnNumber}, Phase: ${states.game.phase}\n`;
      summary += `  Current Player: ${states.game.currentPlayer}\n\n`;

      // Player States
      if (states.players) {
        summary += `👥 Player States:\n`;
        summary += `  Player 1: ${states.players.player1.hp} HP, ${states.players.player1.mana}/${states.players.player1.maxMana} mana\n`;
        summary += `  Player 2: ${states.players.player2.hp} HP, ${states.players.player2.mana}/${states.players.player2.maxMana} mana\n\n`;
      }

      // Field State
      if (states.field) {
        summary += `⚔️ Field State:\n`;
        summary += `  Player 1 Field: ${states.field.player1Field.length}/${states.field.maxFieldSize} waifus\n`;
        summary += `  Player 2 Field: ${states.field.player2Field.length}/${states.field.maxFieldSize} waifus\n\n`;
      }

      // Card State
      if (states.cards) {
        summary += `🃏 Card State:\n`;
        summary += `  Player 1: ${states.cards.player1Hand.length} hand, ${states.cards.player1Deck.length} deck, ${states.cards.player1Graveyard.length} graveyard\n`;
        summary += `  Player 2: ${states.cards.player2Hand.length} hand, ${states.cards.player2Deck.length} deck, ${states.cards.player2Graveyard.length} graveyard\n\n`;
      }

      // History State
      if (states.history) {
        summary += `📜 History State:\n`;
        summary += `  Total Log Entries: ${states.history.gameLog.length}\n`;
        summary += `  Last Action: ${states.history.lastAction}\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: summary,
          },
        ],
      };
    }
  );

  // Tool 5: Backup States
  server.tool(
    "backupGameStates",
    "💾 Create backup of all game states",
    {},
    async () => {
      try {
        const backupDir = await StateManager.backupStates();

        return {
          content: [
            {
              type: "text",
              text: `✅ Game states backed up successfully!\n\n📁 Backup Location: ${backupDir}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to backup states: ${error}`,
            },
          ],
        };
      }
    }
  );
}
