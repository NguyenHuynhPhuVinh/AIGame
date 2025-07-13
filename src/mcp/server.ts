#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { loadGameState, saveGameState, loadCards } from '../utils/fileUtils.js';
import { getCardById } from '../data/cards.js';
import { formatGameState } from '../utils/gameUtils.js';
import { WaifuGameEngine } from '../game/gameEngine.js';
import { PlayerId } from '../types/game.js';

// Create MCP Server
const server = new McpServer({
  name: "mcp-waifu-card-game",
  version: "1.0.0",
  description: "Pure MCP Waifu Card Game - AI plays 100% through MCP tools",
});

// Register MCP Tools
function registerGameTools() {
  // Tool 1: Get current game state
  server.tool(
    "getGameState",
    "📊 Get current game state",
    {},
    async () => {
      const gameState = await loadGameState();
      
      if (!gameState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No game found! Run init-game first to create a new game.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: formatGameState(gameState),
          },
        ],
      };
    }
  );

  // Tool 2: Get player's hand
  server.tool(
    "getPlayerHand",
    "🃏 Get player's hand cards",
    {
      playerId: z.enum(['player1', 'player2']).describe("Player ID"),
    },
    async ({ playerId }) => {
      const gameState = await loadGameState();
      const cards = await loadCards();
      
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

      const player = gameState.players[playerId];
      const handCards = player.hand.map(cardId => {
        const card = getCardById(cardId);
        return card ? `🎴 ${card.name} (${card.attack}/${card.defense}/${card.charm}) - ${card.cost} mana - ${card.rarity}` : `❓ Unknown card: ${cardId}`;
      });

      return {
        content: [
          {
            type: "text",
            text: `🃏 ${player.name}'s Hand (${player.hand.length} cards):\n\n${handCards.join('\n')}\n\n💎 Available Mana: ${player.mana}/${player.maxMana}`,
          },
        ],
      };
    }
  );

  // Tool 3: Get field state
  server.tool(
    "getFieldState",
    "⚔️ Get current field state (all waifus on field)",
    {},
    async () => {
      const gameState = await loadGameState();
      const cards = await loadCards();
      
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

      let fieldInfo = "⚔️ Current Field State:\n\n";
      
      // Player 1 field
      fieldInfo += `🎮 ${gameState.players.player1.name}'s Field:\n`;
      if (gameState.players.player1.field.length === 0) {
        fieldInfo += "  (Empty)\n";
      } else {
        gameState.players.player1.field.forEach((waifu, index) => {
          const card = getCardById(waifu.cardId);
          fieldInfo += `  ${index + 1}. ${card?.name || 'Unknown'} (${waifu.currentAttack}/${waifu.currentDefense}/${waifu.currentCharm}) ${waifu.canAttack ? '⚡' : '😴'}\n`;
        });
      }
      
      fieldInfo += "\n";
      
      // Player 2 field
      fieldInfo += `🎮 ${gameState.players.player2.name}'s Field:\n`;
      if (gameState.players.player2.field.length === 0) {
        fieldInfo += "  (Empty)\n";
      } else {
        gameState.players.player2.field.forEach((waifu, index) => {
          const card = getCardById(waifu.cardId);
          fieldInfo += `  ${index + 1}. ${card?.name || 'Unknown'} (${waifu.currentAttack}/${waifu.currentDefense}/${waifu.currentCharm}) ${waifu.canAttack ? '⚡' : '😴'}\n`;
        });
      }

      return {
        content: [
          {
            type: "text",
            text: fieldInfo,
          },
        ],
      };
    }
  );

  // Tool 4: Get card details
  server.tool(
    "getCardDetails",
    "🎴 Get detailed information about a waifu card",
    {
      cardId: z.string().describe("Card ID to get details for"),
    },
    async ({ cardId }) => {
      const card = getCardById(cardId);
      
      if (!card) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Card with ID "${cardId}" not found!`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `🎴 ${card.name}\n\n` +
                  `⚔️ Attack: ${card.attack}\n` +
                  `🛡️ Defense: ${card.defense}\n` +
                  `💖 Charm: ${card.charm}\n` +
                  `💎 Cost: ${card.cost} mana\n` +
                  `⭐ Rarity: ${card.rarity}\n` +
                  `🎭 Type: ${card.waifuType}\n\n` +
                  `📝 ${card.description}\n\n` +
                  `💬 "${card.flavorText}"`,
          },
        ],
      };
    }
  );

  // Tool 5: List all available cards
  server.tool(
    "listAllCards",
    "📋 List all available waifu cards",
    {},
    async () => {
      const cards = await loadCards();
      
      const cardList = cards.map(card => 
        `🎴 ${card.name} (${card.id})\n` +
        `   ⚔️${card.attack}/🛡️${card.defense}/💖${card.charm} - 💎${card.cost} mana - ⭐${card.rarity} - 🎭${card.waifuType}\n` +
        `   "${card.flavorText}"`
      ).join('\n\n');

      return {
        content: [
          {
            type: "text",
            text: `📋 All Available Waifu Cards (${cards.length} total):\n\n${cardList}`,
          },
        ],
      };
    }
  );

  // Tool 6: Summon waifu
  server.tool(
    "summonWaifu",
    "🎭 Summon a waifu from hand to field",
    {
      playerId: z.enum(["player1", "player2"]).describe("Player ID"),
      cardId: z.string().describe("Card ID to summon"),
    },
    async ({ playerId, cardId }) => {
      const gameState = await loadGameState();
      
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

      const success = WaifuGameEngine.summonWaifu(gameState, playerId as PlayerId, cardId);
      
      if (!success) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Cannot summon waifu! Check turn, phase, mana, hand, and field space.",
            },
          ],
        };
      }

      await saveGameState(gameState);
      const card = getCardById(cardId);
      const player = gameState.players[playerId as PlayerId];

      return {
        content: [
          {
            type: "text",
            text: `✅ ${player.name} successfully summoned ${card?.name}!\n\n` +
                  `⚔️ Stats: ${card?.attack}/${card?.defense}/${card?.charm}\n` +
                  `💎 Mana remaining: ${player.mana}/${player.maxMana}\n` +
                  `🃏 Hand: ${player.hand.length} cards\n` +
                  `⚔️ Field: ${player.field.length} waifus`,
          },
        ],
      };
    }
  );

  // Tool 7: Advance phase
  server.tool(
    "advancePhase",
    "⏭️ Advance to next phase or end turn",
    {
      playerId: z.enum(["player1", "player2"]).describe("Player ID"),
    },
    async ({ playerId }) => {
      const gameState = await loadGameState();
      
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

      const success = WaifuGameEngine.advancePhase(gameState, playerId as PlayerId);
      
      if (!success) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Cannot advance phase! Not ${playerId}'s turn.`,
            },
          ],
        };
      }

      await saveGameState(gameState);

      return {
        content: [
          {
            type: "text",
            text: `✅ Phase advanced!\n\n` +
                  `🔄 Turn ${gameState.turnNumber}\n` +
                  `👤 Current Player: ${gameState.currentPlayer}\n` +
                  `📍 Phase: ${gameState.phase}\n\n` +
                  `📝 ${gameState.lastAction}`,
          },
        ],
      };
    }
  );

  // Tool 8: Attack with waifu
  server.tool(
    "attackWithWaifu",
    "⚔️ Attack opponent or their waifu",
    {
      playerId: z.enum(["player1", "player2"]).describe("Attacking player ID"),
      attackerIndex: z.number().describe("Index of attacking waifu on field (0-based)"),
      targetType: z.enum(["player", "waifu"]).describe("Attack target type"),
      targetIndex: z.number().optional().describe("Index of target waifu (if attacking waifu)"),
    },
    async ({ playerId, attackerIndex, targetType, targetIndex }) => {
      const gameState = await loadGameState();
      
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

      const success = WaifuGameEngine.executeAttack(
        gameState, 
        playerId as PlayerId, 
        attackerIndex, 
        targetType, 
        targetIndex
      );
      
      if (!success) {
        return {
          content: [
            {
              type: "text",
              text: "❌ Cannot execute attack! Check turn, phase, attacker, and target.",
            },
          ],
        };
      }

      await saveGameState(gameState);

      let result = `✅ Attack executed!\n\n📝 ${gameState.lastAction}`;
      
      if (gameState.status === 'finished') {
        result += `\n\n🎉 Game Over! ${gameState.players[gameState.winner!].name} wins!`;
      }

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }
  );
}

// Register tools
registerGameTools();

// Start server
async function main() {
  console.log("🎴 Starting Pure MCP Waifu Card Game Server...");
  console.log("🤖 AI can now play 100% through MCP tools!");
  console.log("💡 Game logic and rules are enforced, but AI makes all decisions");
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
