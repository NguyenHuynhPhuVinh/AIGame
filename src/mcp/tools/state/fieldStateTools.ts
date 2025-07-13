// MCP Tools for Field State Management
import { z } from "zod";
import { StateManager } from "../../../state/stateManager.js";
import { getCardById } from "../../../data/cards.js";
import {
  PlayerId,
  WaifuInstance,
  WaifuStatus,
  SummonWaifuParams,
  UpdateWaifuStatusParams,
  RemoveWaifuParams,
} from "../../../types/game.js";

export function registerFieldStateTools(server: any) {
  // Tool 1: Get Field State
  server.tool(
    "getFieldState",
    "⚔️ Get current field state (all waifus on field)",
    {},
    async () => {
      const fieldState = await StateManager.loadFieldState();

      if (!fieldState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No field state found! Initialize a new game first.",
            },
          ],
        };
      }

      let fieldInfo = `⚔️ Field State:\n\n`;

      // Player 1 field
      fieldInfo += `🎮 Player 1 Field (${fieldState.player1Field.length}/${fieldState.maxFieldSize}):\n`;
      if (fieldState.player1Field.length === 0) {
        fieldInfo += "  (Empty)\n";
      } else {
        fieldState.player1Field.forEach((waifu, index) => {
          const card = getCardById(waifu.cardId);
          const statusIcon =
            waifu.status === "ready"
              ? "⚡ Ready"
              : waifu.status === "summoning_sickness"
              ? "😴 Summoning Sickness"
              : waifu.status === "tapped"
              ? "💤 Tapped"
              : "😵 Stunned";
          fieldInfo += `  [${waifu.position}] ${card?.name || "Unknown"} (${
            card?.attack
          }/${card?.defense}/${card?.charm}) ${statusIcon}\n`;
          fieldInfo += `      🆔 ${waifu.instanceId}\n`;
          fieldInfo += `      👤 Owner: ${waifu.ownerId}\n`;
          fieldInfo += `      🔄 Summoned Turn: ${waifu.summonedTurn}\n`;
          if (waifu.modifiers.length > 0) {
            fieldInfo += `      ✨ Modifiers: ${waifu.modifiers.length}\n`;
          }
        });
      }

      fieldInfo += "\n";

      // Player 2 field
      fieldInfo += `🎮 Player 2 Field (${fieldState.player2Field.length}/${fieldState.maxFieldSize}):\n`;
      if (fieldState.player2Field.length === 0) {
        fieldInfo += "  (Empty)\n";
      } else {
        fieldState.player2Field.forEach((waifu, index) => {
          const card = getCardById(waifu.cardId);
          const statusIcon =
            waifu.status === "ready"
              ? "⚡ Ready"
              : waifu.status === "summoning_sickness"
              ? "😴 Summoning Sickness"
              : waifu.status === "tapped"
              ? "💤 Tapped"
              : "😵 Stunned";
          fieldInfo += `  [${waifu.position}] ${card?.name || "Unknown"} (${
            card?.attack
          }/${card?.defense}/${card?.charm}) ${statusIcon}\n`;
          fieldInfo += `      🆔 ${waifu.instanceId}\n`;
          fieldInfo += `      👤 Owner: ${waifu.ownerId}\n`;
          fieldInfo += `      🔄 Summoned Turn: ${waifu.summonedTurn}\n`;
          if (waifu.modifiers.length > 0) {
            fieldInfo += `      ✨ Modifiers: ${waifu.modifiers.length}\n`;
          }
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

  // Tool 2: Summon Waifu to Field
  server.tool(
    "summonWaifuToField",
    "🎭 Summon a waifu to the field",
    {
      cardId: z.string().describe("Card ID to summon"),
      playerId: z.enum(["player1", "player2"]).describe("Player ID"),
      position: z.number().describe("Field position (0-4)"),
      status: z
        .enum(["summoning_sickness", "ready", "tapped", "stunned"])
        .optional()
        .describe("Initial status"),
    },
    async ({
      cardId,
      playerId,
      position,
      status = "summoning_sickness",
    }: {
      cardId: string;
      playerId: PlayerId;
      position: number;
      status?: WaifuStatus;
    }) => {
      const fieldState = await StateManager.loadFieldState();
      const gameState = await StateManager.loadGameState();

      if (!fieldState || !gameState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No game state found!",
            },
          ],
        };
      }

      const card = getCardById(cardId);
      if (!card) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Card "${cardId}" not found!`,
            },
          ],
        };
      }

      // Check field space
      const playerField =
        playerId === "player1"
          ? fieldState.player1Field
          : fieldState.player2Field;
      if (playerField.length >= fieldState.maxFieldSize) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Field is full! Maximum ${fieldState.maxFieldSize} waifus allowed.`,
            },
          ],
        };
      }

      // Check position availability
      if (playerField.some((w) => w.position === position)) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Position ${position} is already occupied!`,
            },
          ],
        };
      }

      // Create waifu instance
      const waifuInstance: WaifuInstance = {
        instanceId: `waifu_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        cardId: card.id,
        ownerId: playerId,
        position: position,
        status: status as WaifuStatus,
        modifiers: [],
        summonedTurn: gameState.turnNumber,
      };

      // Add to field
      await StateManager.addWaifuToField(playerId, waifuInstance);

      // Update player field size
      const players = await StateManager.loadPlayerStates();
      if (players) {
        await StateManager.updatePlayerState(playerId, {
          fieldSize: players[playerId].fieldSize + 1,
        });
      }

      // Log the summon
      const historyState = await StateManager.loadHistoryState();
      if (historyState) {
        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: playerId!,
          action: "summon",
          description: `${playerId} summoned ${card.name} to position ${position}`,
          details: {
            cardId: card.id,
            cardName: card.name,
            position,
            status,
            instanceId: waifuInstance.instanceId,
          },
        });
      }

      return {
        content: [
          {
            type: "text",
            text:
              `✅ ${card.name} summoned successfully!\n\n` +
              `🎴 Card: ${card.name}\n` +
              `⚔️ Stats: ${card.attack}/${card.defense}/${card.charm}\n` +
              `📍 Position: ${position}\n` +
              `📊 Status: ${status}\n` +
              `🆔 Instance ID: ${waifuInstance.instanceId}\n` +
              `👤 Owner: ${playerId}\n` +
              `🔄 Summoned Turn: ${gameState.turnNumber}`,
          },
        ],
      };
    }
  );

  // Tool 3: Update Waifu Status
  server.tool(
    "updateWaifuStatus",
    "🔄 Update waifu status or modifiers",
    {
      waifuInstanceId: z.string().describe("Waifu instance ID"),
      status: z
        .enum(["summoning_sickness", "ready", "tapped", "stunned"])
        .optional()
        .describe("New status"),
      currentHP: z.number().optional().describe("New current HP"),
    },
    async ({
      waifuInstanceId,
      status,
      currentHP,
    }: {
      waifuInstanceId: string;
      status?: WaifuStatus;
      currentHP?: number;
    }) => {
      const fieldState = await StateManager.loadFieldState();

      if (!fieldState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No field state found!",
            },
          ],
        };
      }

      // Find waifu in either field
      let waifu: WaifuInstance | undefined;
      let playerField: WaifuInstance[];
      let playerId: PlayerId;

      if (
        fieldState.player1Field.some((w) => w.instanceId === waifuInstanceId)
      ) {
        waifu = fieldState.player1Field.find(
          (w) => w.instanceId === waifuInstanceId
        );
        playerField = fieldState.player1Field;
        playerId = "player1";
      } else if (
        fieldState.player2Field.some((w) => w.instanceId === waifuInstanceId)
      ) {
        waifu = fieldState.player2Field.find(
          (w) => w.instanceId === waifuInstanceId
        );
        playerField = fieldState.player2Field;
        playerId = "player2";
      }

      if (!waifu) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Waifu with ID "${waifuInstanceId}" not found on field!`,
            },
          ],
        };
      }

      const card = getCardById(waifu.cardId);
      const updates: string[] = [];

      // Update status
      if (status && status !== waifu.status) {
        waifu.status = status;
        updates.push(`status: ${status}`);
      }

      // Update HP
      if (currentHP !== undefined && currentHP !== waifu.currentHP) {
        waifu.currentHP = currentHP;
        updates.push(`HP: ${currentHP}`);
      }

      await StateManager.saveFieldState(fieldState);

      // Log the update
      const historyState = await StateManager.loadHistoryState();
      if (historyState && updates.length > 0) {
        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: playerId!,
          action: "update_waifu",
          description: `${
            card?.name || "Unknown waifu"
          } updated: ${updates.join(", ")}`,
          details: { waifuInstanceId, updates: { status, currentHP } },
        });
      }

      return {
        content: [
          {
            type: "text",
            text:
              `✅ ${card?.name || "Waifu"} updated!\n\n` +
              `🎴 Card: ${card?.name}\n` +
              `🆔 Instance ID: ${waifuInstanceId}\n` +
              `📊 Status: ${waifu.status}\n` +
              `💖 HP: ${waifu.currentHP || "Base"}\n` +
              `📍 Position: ${waifu.position}\n` +
              `👤 Owner: ${waifu.ownerId}\n` +
              `📝 Updates: ${updates.join(", ") || "None"}`,
          },
        ],
      };
    }
  );

  // Tool 4: Remove Waifu from Field
  server.tool(
    "removeWaifuFromField",
    "💀 Remove a waifu from the field",
    {
      waifuInstanceId: z.string().describe("Waifu instance ID"),
      reason: z
        .enum(["destroyed", "returned", "sacrificed"])
        .describe("Reason for removal"),
    },
    async ({
      waifuInstanceId,
      reason,
    }: {
      waifuInstanceId: string;
      reason: "destroyed" | "returned" | "sacrificed";
    }) => {
      const fieldState = await StateManager.loadFieldState();

      if (!fieldState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No field state found!",
            },
          ],
        };
      }

      // Find and remove waifu
      let removedWaifu: WaifuInstance | undefined;
      let playerId: PlayerId;

      const player1Index = fieldState.player1Field.findIndex(
        (w) => w.instanceId === waifuInstanceId
      );
      if (player1Index !== -1) {
        removedWaifu = fieldState.player1Field.splice(player1Index, 1)[0];
        playerId = "player1";
      } else {
        const player2Index = fieldState.player2Field.findIndex(
          (w) => w.instanceId === waifuInstanceId
        );
        if (player2Index !== -1) {
          removedWaifu = fieldState.player2Field.splice(player2Index, 1)[0];
          playerId = "player2";
        }
      }

      if (!removedWaifu) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Waifu with ID "${waifuInstanceId}" not found on field!`,
            },
          ],
        };
      }

      await StateManager.saveFieldState(fieldState);

      // Update player field size
      const players = await StateManager.loadPlayerStates();
      if (players) {
        await StateManager.updatePlayerState(playerId!, {
          fieldSize: players[playerId!].fieldSize - 1,
        });
      }

      const card = getCardById(removedWaifu.cardId);

      // Log the removal
      const historyState = await StateManager.loadHistoryState();
      if (historyState) {
        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: playerId!,
          action: "remove_waifu",
          description: `${card?.name || "Unknown waifu"} ${reason} from field`,
          details: {
            waifuInstanceId,
            cardId: removedWaifu.cardId,
            cardName: card?.name,
            reason,
            position: removedWaifu.position,
          },
        });
      }

      return {
        content: [
          {
            type: "text",
            text:
              `💀 ${card?.name || "Waifu"} removed from field!\n\n` +
              `🎴 Card: ${card?.name}\n` +
              `🆔 Instance ID: ${waifuInstanceId}\n` +
              `📍 Position: ${removedWaifu.position}\n` +
              `👤 Owner: ${removedWaifu.ownerId}\n` +
              `📝 Reason: ${reason}`,
          },
        ],
      };
    }
  );
}
