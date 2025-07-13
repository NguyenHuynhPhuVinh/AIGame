// MCP Tools for Card State Management
import { z } from "zod";
import { StateManager } from "../../../state/stateManager.js";
import { getCardById } from "../../../data/cards.js";
import { PlayerId, CardLocation } from "../../../types/game.js";

export function registerCardStateTools(server: any) {
  // Tool 1: Get Card State
  server.tool(
    "getCardState",
    "🃏 Get card states (hands, decks, graveyards)",
    {
      playerId: z.enum(["player1", "player2"]).optional().describe("Player ID (optional)"),
      location: z.enum(["hand", "deck", "graveyard", "all"]).optional().describe("Card location filter"),
    },
    async ({ playerId, location }: { playerId?: PlayerId; location?: CardLocation | "all" }) => {
      const cardState = await StateManager.loadCardState();
      
      if (!cardState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No card state found! Initialize a new game first.",
            },
          ],
        };
      }

      let result = "🃏 Card State:\n\n";

      // Filter by player if specified
      const players = playerId ? [playerId] : ["player1" as PlayerId, "player2" as PlayerId];
      
      for (const pid of players) {
        result += `🎮 ${pid.toUpperCase()}:\n`;
        
        // Show hand
        if (!location || location === "hand" || location === "all") {
          const hand = cardState[`${pid}Hand` as keyof typeof cardState] as any[];
          result += `  🃏 Hand (${hand.length} cards):\n`;
          hand.forEach((card, index) => {
            const cardData = getCardById(card.cardId);
            result += `    ${index + 1}. ${cardData?.name || "Unknown"} (${card.instanceId})\n`;
          });
        }

        // Show deck
        if (!location || location === "deck" || location === "all") {
          const deck = cardState[`${pid}Deck` as keyof typeof cardState] as any[];
          result += `  📚 Deck (${deck.length} cards)\n`;
        }

        // Show graveyard
        if (!location || location === "graveyard" || location === "all") {
          const graveyard = cardState[`${pid}Graveyard` as keyof typeof cardState] as any[];
          result += `  🪦 Graveyard (${graveyard.length} cards):\n`;
          graveyard.forEach((card, index) => {
            const cardData = getCardById(card.cardId);
            result += `    ${index + 1}. ${cardData?.name || "Unknown"} (${card.instanceId})\n`;
          });
        }
        
        result += "\n";
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

  // Tool 2: Move Card
  server.tool(
    "moveCard",
    "🔄 Move card between locations (hand, deck, field, graveyard)",
    {
      cardInstanceId: z.string().describe("Card instance ID"),
      fromLocation: z.enum(["hand", "deck", "field", "graveyard"]).describe("Source location"),
      toLocation: z.enum(["hand", "deck", "field", "graveyard"]).describe("Target location"),
      position: z.number().optional().describe("Position in target location"),
    },
    async ({ cardInstanceId, fromLocation, toLocation, position }: {
      cardInstanceId: string;
      fromLocation: CardLocation;
      toLocation: CardLocation;
      position?: number;
    }) => {
      const cardState = await StateManager.loadCardState();
      
      if (!cardState) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No card state found!",
            },
          ],
        };
      }

      // Find card in all locations
      let foundCard: any = null;
      let playerId: PlayerId | null = null;

      // Search in all player locations
      for (const pid of ["player1", "player2"] as PlayerId[]) {
        for (const loc of ["Hand", "Deck", "Graveyard"]) {
          const locationKey = `${pid}${loc}` as keyof typeof cardState;
          const cards = cardState[locationKey] as any[];
          const card = cards.find(c => c.instanceId === cardInstanceId);
          if (card) {
            foundCard = card;
            playerId = pid;
            break;
          }
        }
        if (foundCard) break;
      }

      if (!foundCard || !playerId) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Card with ID "${cardInstanceId}" not found!`,
            },
          ],
        };
      }

      // Move card
      await StateManager.moveCard(cardInstanceId, fromLocation, toLocation, playerId);

      const cardData = getCardById(foundCard.cardId);

      // Log the move
      const historyState = await StateManager.loadHistoryState();
      if (historyState) {
        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: playerId,
          action: 'move_card',
          description: `${cardData?.name || 'Unknown card'} moved from ${fromLocation} to ${toLocation}`,
          details: { cardInstanceId, fromLocation, toLocation, position }
        });
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Card moved successfully!\n\n` +
                  `🎴 Card: ${cardData?.name || 'Unknown'}\n` +
                  `🆔 Instance ID: ${cardInstanceId}\n` +
                  `📍 From: ${fromLocation} → To: ${toLocation}\n` +
                  `👤 Owner: ${playerId}`,
          },
        ],
      };
    }
  );

  // Tool 3: Draw Card
  server.tool(
    "drawCard",
    "🎯 Draw a card from deck to hand",
    {
      playerId: z.enum(["player1", "player2"]).describe("Player ID"),
      count: z.number().optional().default(1).describe("Number of cards to draw"),
    },
    async ({ playerId, count = 1 }: { playerId: PlayerId; count?: number }) => {
      const cardState = await StateManager.loadCardState();
      const players = await StateManager.loadPlayerStates();
      
      if (!cardState || !players) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No game state found!",
            },
          ],
        };
      }

      const deck = cardState[`${playerId}Deck` as keyof typeof cardState] as any[];
      const hand = cardState[`${playerId}Hand` as keyof typeof cardState] as any[];

      if (deck.length < count) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Not enough cards in deck! Deck has ${deck.length} cards, trying to draw ${count}.`,
            },
          ],
        };
      }

      const drawnCards = [];
      for (let i = 0; i < count; i++) {
        const card = deck.shift();
        if (card) {
          card.location = 'hand';
          card.position = hand.length;
          hand.push(card);
          drawnCards.push(card);
        }
      }

      await StateManager.saveCardState(cardState);

      // Update player stats
      await StateManager.updatePlayerState(playerId, {
        handSize: hand.length,
        deckSize: deck.length
      });

      // Log the draw
      const historyState = await StateManager.loadHistoryState();
      if (historyState) {
        const cardNames = drawnCards.map(c => {
          const cardData = getCardById(c.cardId);
          return cardData?.name || 'Unknown';
        }).join(', ');

        await StateManager.addGameLogEntry({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          playerId: playerId,
          action: 'draw_card',
          description: `${playerId} drew ${count} card(s): ${cardNames}`,
          details: { count, drawnCards: drawnCards.map(c => c.instanceId) }
        });
      }

      let result = `✅ Drew ${count} card(s)!\n\n`;
      drawnCards.forEach((card, index) => {
        const cardData = getCardById(card.cardId);
        result += `${index + 1}. ${cardData?.name || 'Unknown'} (${card.instanceId})\n`;
      });
      result += `\n🃏 Hand: ${hand.length} cards\n📚 Deck: ${deck.length} cards`;

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

  // Tool 4: Get Card Details
  server.tool(
    "getCardDetails",
    "🎴 Get detailed information about a waifu card",
    {
      cardId: z.string().describe("Card ID to get details for"),
    },
    async ({ cardId }: { cardId: string }) => {
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
}
