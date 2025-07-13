// MCP Tools for Player State Management
import { z } from "zod";
import { StateManager } from "../../../state/stateManager.js";
import { PlayerId, UpdatePlayerStatsParams } from "../../../types/game.js";

export function registerPlayerStateTools(server: any) {
  // Tool 1: Get Player States
  server.tool(
    "getPlayerStates",
    "👥 Get both players' states",
    {},
    async () => {
      const players = await StateManager.loadPlayerStates();

      if (!players) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No player states found! Initialize a new game first.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text:
              `👥 Player States:\n\n` +
              `🎮 Player 1 (${players.player1.name}):\n` +
              `  💖 HP: ${players.player1.hp}\n` +
              `  💎 Mana: ${players.player1.mana}/${players.player1.maxMana}\n` +
              `  🃏 Hand: ${players.player1.handSize} cards\n` +
              `  📚 Deck: ${players.player1.deckSize} cards\n` +
              `  ⚔️ Field: ${players.player1.fieldSize} waifus\n` +
              `  🪦 Graveyard: ${players.player1.graveyardSize} cards\n\n` +
              `🎮 Player 2 (${players.player2.name}):\n` +
              `  💖 HP: ${players.player2.hp}\n` +
              `  💎 Mana: ${players.player2.mana}/${players.player2.maxMana}\n` +
              `  🃏 Hand: ${players.player2.handSize} cards\n` +
              `  📚 Deck: ${players.player2.deckSize} cards\n` +
              `  ⚔️ Field: ${players.player2.fieldSize} waifus\n` +
              `  🪦 Graveyard: ${players.player2.graveyardSize} cards`,
          },
        ],
      };
    }
  );

  // Tool 2: Get Specific Player State
  server.tool(
    "getPlayerState",
    "👤 Get specific player's state",
    {
      playerId: z.enum(["player1", "player2"]).describe("Player ID"),
    },
    async ({ playerId }: { playerId: PlayerId }) => {
      const players = await StateManager.loadPlayerStates();

      if (!players) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No player states found!",
            },
          ],
        };
      }

      const player = players[playerId];

      return {
        content: [
          {
            type: "text",
            text:
              `👤 ${player.name} (${playerId}):\n\n` +
              `💖 HP: ${player.hp}\n` +
              `💎 Mana: ${player.mana}/${player.maxMana}\n` +
              `🃏 Hand: ${player.handSize} cards\n` +
              `📚 Deck: ${player.deckSize} cards\n` +
              `⚔️ Field: ${player.fieldSize} waifus\n` +
              `🪦 Graveyard: ${player.graveyardSize} cards`,
          },
        ],
      };
    }
  );

  // Tool 3: Update Player Stats
  server.tool(
    "updatePlayerStats",
    "📊 Update player's HP, mana, or other stats",
    {
      playerId: z.enum(["player1", "player2"]).describe("Player ID"),
      hp: z.number().optional().describe("New HP value"),
      mana: z.number().optional().describe("New mana value"),
      maxMana: z.number().optional().describe("New max mana value"),
      handSize: z.number().optional().describe("New hand size"),
      deckSize: z.number().optional().describe("New deck size"),
      fieldSize: z.number().optional().describe("New field size"),
      graveyardSize: z.number().optional().describe("New graveyard size"),
    },
    async ({
      playerId,
      hp,
      mana,
      maxMana,
      handSize,
      deckSize,
      fieldSize,
      graveyardSize,
    }: {
      playerId: PlayerId;
      hp?: number;
      mana?: number;
      maxMana?: number;
      handSize?: number;
      deckSize?: number;
      fieldSize?: number;
      graveyardSize?: number;
    }) => {
      const players = await StateManager.loadPlayerStates();

      if (!players) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No player states found!",
            },
          ],
        };
      }

      const player = players[playerId];
      const updates: any = {};

      if (hp !== undefined) updates.hp = hp;
      if (mana !== undefined) updates.mana = mana;
      if (maxMana !== undefined) updates.maxMana = maxMana;
      if (handSize !== undefined) updates.handSize = handSize;
      if (deckSize !== undefined) updates.deckSize = deckSize;
      if (fieldSize !== undefined) updates.fieldSize = fieldSize;
      if (graveyardSize !== undefined) updates.graveyardSize = graveyardSize;

      await StateManager.updatePlayerState(playerId, updates);

      // Log the update
      const historyState = await StateManager.loadHistoryState();
      if (historyState) {
        const updatesList = Object.entries(updates)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: playerId,
          action: "update_stats",
          description: `${player.name} stats updated: ${updatesList}`,
          details: updates,
        });
      }

      return {
        content: [
          {
            type: "text",
            text:
              `✅ ${player.name} stats updated!\n\n` +
              `📊 Updates: ${Object.entries(updates)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}\n\n` +
              `👤 Current State:\n` +
              `💖 HP: ${updates.hp ?? player.hp}\n` +
              `💎 Mana: ${updates.mana ?? player.mana}/${
                updates.maxMana ?? player.maxMana
              }\n` +
              `🃏 Hand: ${updates.handSize ?? player.handSize} cards\n` +
              `📚 Deck: ${updates.deckSize ?? player.deckSize} cards\n` +
              `⚔️ Field: ${updates.fieldSize ?? player.fieldSize} waifus\n` +
              `🪦 Graveyard: ${
                updates.graveyardSize ?? player.graveyardSize
              } cards`,
          },
        ],
      };
    }
  );

  // Tool 4: Damage Player
  server.tool(
    "damagePlayer",
    "💥 Deal damage to a player",
    {
      playerId: z.enum(["player1", "player2"]).describe("Player ID"),
      damage: z.number().describe("Damage amount"),
      source: z.string().optional().describe("Damage source description"),
    },
    async ({
      playerId,
      damage,
      source,
    }: {
      playerId: PlayerId;
      damage: number;
      source?: string;
    }) => {
      const players = await StateManager.loadPlayerStates();

      if (!players) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No player states found!",
            },
          ],
        };
      }

      const player = players[playerId];
      const newHP = Math.max(0, player.hp - damage);

      await StateManager.updatePlayerState(playerId, { hp: newHP });

      // Log the damage
      const historyState = await StateManager.loadHistoryState();
      if (historyState) {
        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: playerId,
          action: "take_damage",
          description: `${player.name} takes ${damage} damage${
            source ? ` from ${source}` : ""
          }. HP: ${player.hp} → ${newHP}`,
          details: { damage, source, oldHP: player.hp, newHP },
        });
      }

      let result =
        `💥 ${player.name} takes ${damage} damage!\n\n` +
        `💖 HP: ${player.hp} → ${newHP}`;

      if (source) {
        result += `\n🎯 Source: ${source}`;
      }

      if (newHP <= 0) {
        result += `\n\n💀 ${player.name} has been defeated!`;
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

  // Tool 5: Heal Player
  server.tool(
    "healPlayer",
    "💚 Heal a player",
    {
      playerId: z.enum(["player1", "player2"]).describe("Player ID"),
      healing: z.number().describe("Healing amount"),
      source: z.string().optional().describe("Healing source description"),
    },
    async ({
      playerId,
      healing,
      source,
    }: {
      playerId: PlayerId;
      healing: number;
      source?: string;
    }) => {
      const players = await StateManager.loadPlayerStates();

      if (!players) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No player states found!",
            },
          ],
        };
      }

      const player = players[playerId];
      const newHP = player.hp + healing; // No max HP limit for now

      await StateManager.updatePlayerState(playerId, { hp: newHP });

      // Log the healing
      const historyState = await StateManager.loadHistoryState();
      if (historyState) {
        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: playerId,
          action: "heal",
          description: `${player.name} heals ${healing} HP${
            source ? ` from ${source}` : ""
          }. HP: ${player.hp} → ${newHP}`,
          details: { healing, source, oldHP: player.hp, newHP },
        });
      }

      let result =
        `💚 ${player.name} heals ${healing} HP!\n\n` +
        `💖 HP: ${player.hp} → ${newHP}`;

      if (source) {
        result += `\n🎯 Source: ${source}`;
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
