import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import {
  GameState,
  GameAction,
  getCardById,
  ALL_CARDS,
  createRandomDeck,
} from "../../database/index.js";
import { YuGiOhGameEngine } from "../../game-engine/index.js";

const GAME_ACTION_FILE = path.join(process.cwd(), "yugioh_action.json");
const GAME_STATE_FILE = path.join(process.cwd(), "yugioh_state.json");
const GAME_LOG_FILE = path.join(process.cwd(), "yugioh_log.json");

// Global file watcher state
let actionFileWatcher: any = null;
let isWatchingActions = false;

export function registerYuGiOhTools(server: McpServer) {
  // Tool 1: Read player action from JSON
  server.tool(
    "readYuGiOhAction",
    "🎯 Read Yu-Gi-Oh action from yugioh_action.json file",
    {},
    async () => {
      try {
        const data = await fs.readFile(GAME_ACTION_FILE, "utf-8");
        const action = JSON.parse(data);

        if (!action.processed) {
          return {
            content: [
              {
                type: "text",
                text: `📥 Yu-Gi-Oh Action from game:\n${JSON.stringify(
                  action,
                  null,
                  2
                )}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: "📭 Action already processed.",
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: "📭 No action available from game.",
            },
          ],
        };
      }
    }
  );

  // Tool 2: Get Yu-Gi-Oh game rules
  server.tool(
    "getYuGiOhRules",
    "📖 Get comprehensive Yu-Gi-Oh game rules and mechanics",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `🃏 YU-GI-OH! DUEL MONSTERS RULES

🎯 OBJECTIVE: Reduce opponent's Life Points to 0

📊 GAME SETUP:
• Each player: 8000 Life Points
• Deck: 40-60 cards (minimum 40)
• Starting hand: 5 cards
• First player doesn't draw on first turn

🎮 TURN STRUCTURE:
1. DRAW PHASE: Draw 1 card (skip on first turn for first player)
2. STANDBY PHASE: Resolve standby effects
3. MAIN PHASE 1: Summon monsters, activate spells/traps
4. BATTLE PHASE: Attack with monsters
   - Start Step: Declare entering battle
   - Battle Step: Declare attacks
   - Damage Step: Calculate damage
   - End Step: End battle phase
5. MAIN PHASE 2: Additional summons/activations
6. END PHASE: End turn effects, discard to 6 cards

🃏 CARD TYPES:

MONSTER CARDS:
• Normal Monsters: No special effects
• Effect Monsters: Have special abilities
• Levels 1-4: Normal Summon without tribute
• Levels 5-6: Require 1 tribute
• Levels 7+: Require 2 tributes

SPELL CARDS:
• Normal: One-time effect
• Continuous: Stays on field
• Equip: Attach to monster
• Field: Affects entire field
• Quick-Play: Can activate during opponent's turn
• Ritual: Used for Ritual Summons

TRAP CARDS:
• Normal: One-time effect
• Continuous: Stays on field
• Counter: Can negate other cards

⚔️ BATTLE MECHANICS:
• Attack Position vs Attack Position:
  - Higher ATK destroys lower ATK
  - Difference = damage to controller of destroyed monster
  - Equal ATK = both destroyed, no damage

• Attack Position vs Defense Position:
  - ATK > DEF: Defending monster destroyed, no damage
  - ATK < DEF: Attacking player takes damage = difference
  - ATK = DEF: No destruction, no damage

• Direct Attack: When opponent has no monsters
  - Deal damage equal to attacking monster's ATK

🎲 SUMMONING RULES:
• Normal Summon: Once per turn, face-up Attack Position
• Set: Once per turn, face-down Defense Position
• Flip Summon: Change face-down to face-up Attack
• Special Summon: Through card effects (doesn't count as Normal Summon)

🏟️ FIELD ZONES:
• 5 Monster Zones per player
• 5 Spell/Trap Zones per player
• 1 Field Spell Zone (shared)
• 2 Extra Monster Zones (shared, for special summons)

💡 AI PROCESSING GUIDELINES:
• Read action to understand player's move
• Check game rules and restrictions
• Calculate battle damage and effects
• Update Life Points, field positions, zones
• Handle card movements (hand→field→graveyard)
• Process chain effects if multiple cards activate
• Check win conditions after each action
• Log all changes for game history
• Advance turn phases appropriately

🏆 WIN CONDITIONS:
• Reduce opponent's Life Points to 0
• Opponent cannot draw (deck out)
• Special win condition cards (rare)

⚡ PRIORITY AND TIMING:
• Turn player has priority to activate effects first
• Fast effects can be chained to other effects
• Spell Speed 1: Normal spells, monster effects
• Spell Speed 2: Quick-play spells, trap cards
• Spell Speed 3: Counter trap cards

🔄 CHAIN RESOLUTION:
• Last In, First Out (LIFO)
• Resolve effects in reverse order of activation
• Each player can respond to chain links`,
          },
        ],
      };
    }
  );

  // Tool 3: View current game state
  server.tool(
    "viewYuGiOhGameState",
    "📊 View current Yu-Gi-Oh game state from yugioh_state.json",
    {},
    async () => {
      try {
        const data = await fs.readFile(GAME_STATE_FILE, "utf-8");
        const gameState = JSON.parse(data);

        return {
          content: [
            {
              type: "text",
              text: `📊 YU-GI-OH GAME STATE:\n${JSON.stringify(
                gameState,
                null,
                2
              )}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: "📭 No game state found. Game not initialized.",
            },
          ],
        };
      }
    }
  );

  // Tool 4: Update game state
  server.tool(
    "updateYuGiOhGameState",
    "✏️ Update Yu-Gi-Oh game state to yugioh_state.json",
    {
      gameState: z
        .object({})
        .passthrough()
        .describe("Complete game state object to save"),
    },
    async ({ gameState }) => {
      try {
        await fs.writeFile(
          GAME_STATE_FILE,
          JSON.stringify(gameState, null, 2),
          "utf-8"
        );

        return {
          content: [
            {
              type: "text",
              text: `✅ Yu-Gi-Oh game state updated successfully!\n\n📊 New state summary:\nTurn: ${gameState.turnNumber}\nPhase: ${gameState.currentPhase}\nCurrent Player: ${gameState.currentPlayer}\nGame Status: ${gameState.gameStatus}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error updating game state: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Tool 5: Get card details by ID
  server.tool(
    "getYuGiOhCardDetails",
    "🃏 Get detailed information about a Yu-Gi-Oh card by ID",
    {
      cardId: z.string().describe("ID of the card to get details for"),
    },
    async ({ cardId }) => {
      const card = getCardById(cardId);

      if (!card) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Card not found: ${cardId}`,
            },
          ],
        };
      }

      let cardInfo = `🃏 CARD DETAILS\n\n`;
      cardInfo += `📛 Name: ${card.name}\n`;
      cardInfo += `🆔 ID: ${cardId}\n`;
      cardInfo += `🎭 Type: ${card.cardType.toUpperCase()}\n`;
      cardInfo += `🌟 Rarity: ${card.rarity}\n`;

      if (card.cardType === "monster") {
        const monster = card as any;
        cardInfo += `⚔️ ATK: ${monster.attack}\n`;
        cardInfo += `🛡️ DEF: ${monster.defense}\n`;
        cardInfo += `⭐ Level: ${monster.level}\n`;
        cardInfo += `🔮 Attribute: ${monster.attribute}\n`;
        cardInfo += `👹 Type: ${monster.monsterType}\n`;
        if (monster.effect) {
          cardInfo += `✨ Effect: ${monster.isEffectMonster ? "Yes" : "No"}\n`;
        }
      } else if (card.cardType === "spell") {
        const spell = card as any;
        cardInfo += `🔮 Spell Type: ${spell.spellType}\n`;
      } else if (card.cardType === "trap") {
        const trap = card as any;
        cardInfo += `🪤 Trap Type: ${trap.trapType}\n`;
      }

      cardInfo += `\n📝 DESCRIPTION:\n${card.description}`;

      if ("effect" in card && card.effect) {
        cardInfo += `\n\n✨ EFFECT:\n${card.effect}`;
      }

      return {
        content: [
          {
            type: "text",
            text: cardInfo,
          },
        ],
      };
    }
  );

  // Tool 6: Process game action with engine
  server.tool(
    "processYuGiOhAction",
    "⚙️ Process a Yu-Gi-Oh action using the game engine",
    {
      action: z
        .object({
          id: z.string(),
          playerId: z.enum(["player1", "player2"]),
          actionType: z.string(),
          timestamp: z.string(),
          description: z.string(),
          cardId: z.string().optional(),
          targetCardId: z.string().optional(),
          targetPlayerId: z.enum(["player1", "player2"]).optional(),
          processed: z.boolean().default(false),
          metadata: z.record(z.any()).default({}),
        })
        .describe("Game action to process"),
    },
    async ({ action }) => {
      try {
        // Load current game state
        let gameState: GameState;
        try {
          const data = await fs.readFile(GAME_STATE_FILE, "utf-8");
          gameState = JSON.parse(data);
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: "❌ No game state found. Initialize game first.",
              },
            ],
          };
        }

        // Create game engine with current state
        const gameEngine = new YuGiOhGameEngine(gameState);

        // Ensure metadata exists
        if (!action.metadata) {
          action.metadata = {};
        }

        // Process the action
        const result = gameEngine.processAction(action);

        if (result.success) {
          // Save updated game state
          const updatedState = gameEngine.getGameState();
          await fs.writeFile(
            GAME_STATE_FILE,
            JSON.stringify(updatedState, null, 2),
            "utf-8"
          );

          // Mark action as processed
          action.processed = true;
          await fs.writeFile(
            GAME_ACTION_FILE,
            JSON.stringify(action, null, 2),
            "utf-8"
          );

          return {
            content: [
              {
                type: "text",
                text: `✅ Action processed successfully!\n\n${
                  result.message
                }\n\nGame Status:\n- Turn: ${
                  updatedState.turnNumber
                }\n- Phase: ${updatedState.currentPhase}\n- Current Player: ${
                  updatedState.currentPlayer
                }\n- Game Status: ${updatedState.gameStatus}${
                  updatedState.winner
                    ? `\n- Winner: ${updatedState.winner}`
                    : ""
                }`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `❌ Action failed: ${result.message}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error processing action: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Tool 7: Search cards database
  server.tool(
    "searchYuGiOhCards",
    "🔍 Search Yu-Gi-Oh cards database by name or description",
    {
      query: z.string().describe("Search query for card name or description"),
      cardType: z
        .enum(["monster", "spell", "trap", "all"])
        .default("all")
        .describe("Filter by card type"),
      limit: z.number().default(10).describe("Maximum number of results"),
    },
    async ({ query, cardType, limit }) => {
      let cards = ALL_CARDS;

      // Filter by card type if specified
      if (cardType !== "all") {
        cards = cards.filter((card) => card.cardType === cardType);
      }

      // Search by name or description
      const searchTerm = query.toLowerCase();
      const results = cards
        .filter(
          (card) =>
            card.name.toLowerCase().includes(searchTerm) ||
            card.description.toLowerCase().includes(searchTerm)
        )
        .slice(0, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `🔍 No cards found matching "${query}"`,
            },
          ],
        };
      }

      let resultText = `🔍 SEARCH RESULTS for "${query}" (${results.length} found):\n\n`;

      results.forEach((card, index) => {
        resultText += `${index + 1}. 🃏 ${card.name} (${card.id})\n`;
        resultText += `   Type: ${card.cardType.toUpperCase()}`;

        if (card.cardType === "monster") {
          const monster = card as any;
          resultText += ` | ATK: ${monster.attack} DEF: ${monster.defense} LV: ${monster.level}`;
        }

        resultText += `\n   ${card.description.substring(0, 80)}${
          card.description.length > 80 ? "..." : ""
        }\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: resultText,
          },
        ],
      };
    }
  );

  // Tool 8: Read game log
  server.tool(
    "readYuGiOhGameLog",
    "📜 Read Yu-Gi-Oh game log from yugioh_log.json file",
    {
      limit: z
        .number()
        .optional()
        .describe("Number of recent entries to return (default: 20)"),
      playerId: z.string().optional().describe("Filter by specific player ID"),
      actionType: z
        .string()
        .optional()
        .describe("Filter by specific action type"),
    },
    async ({ limit = 20, playerId, actionType }) => {
      try {
        const data = await fs.readFile(GAME_LOG_FILE, "utf-8");
        const gameLog = JSON.parse(data);

        let entries = gameLog.entries || [];

        // Apply filters
        if (playerId) {
          entries = entries.filter((entry: any) => entry.playerId === playerId);
        }
        if (actionType) {
          entries = entries.filter(
            (entry: any) => entry.actionType === actionType
          );
        }

        // Get recent entries
        const recentEntries = entries.slice(-limit);

        return {
          content: [
            {
              type: "text",
              text: `📜 Yu-Gi-Oh Game Log (${
                recentEntries.length
              } entries):\n\n${recentEntries
                .map(
                  (entry: any) =>
                    `[${entry.timestamp}] ${entry.playerId}: ${entry.message}${
                      entry.actionType ? ` (${entry.actionType})` : ""
                    }`
                )
                .join("\n")}\n\nTotal entries in log: ${entries.length}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: "📭 No game log available or error reading log.",
            },
          ],
        };
      }
    }
  );

  // Tool 9: Add entry to game log
  server.tool(
    "addYuGiOhLogEntry",
    "📝 Add entry to Yu-Gi-Oh game log",
    {
      message: z.string().describe("Log message"),
      type: z
        .string()
        .describe(
          "Log entry type (e.g., 'ai_decision', 'game_event', 'spell_effect')"
        ),
      playerId: z.string().describe("Player ID (player1, player2, or system)"),
      details: z
        .object({})
        .passthrough()
        .optional()
        .describe("Additional details object"),
    },
    async ({ message, type, playerId, details = {} }) => {
      try {
        const data = await fs.readFile(GAME_LOG_FILE, "utf-8");
        const gameLog = JSON.parse(data);

        const logEntry = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type,
          message,
          playerId,
          details,
        };

        gameLog.entries.push(logEntry);

        await fs.writeFile(
          GAME_LOG_FILE,
          JSON.stringify(gameLog, null, 2),
          "utf-8"
        );

        return {
          content: [
            {
              type: "text",
              text: `✅ Log entry added successfully!\n\n📝 Entry: ${message}\n🏷️ Type: ${type}\n👤 Player: ${playerId}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error adding log entry: ${(error as Error).message}`,
            },
          ],
        };
      }
    }
  );

  // Tool 10: Wait for new actions (BLOCKING FOREVER - no timeout)
  server.tool(
    "waitForYuGiOhAction",
    "⏳ Wait for next Yu-Gi-Oh action (BLOCKS FOREVER until action arrives)",
    {},
    async () => {
      return new Promise((resolve) => {
        let lastModified = 0;

        // Get initial file state
        try {
          const stats = fsSync.statSync(GAME_ACTION_FILE);
          lastModified = stats.mtime.getTime();

          // Check if there's already an unprocessed action
          const data = fsSync.readFileSync(GAME_ACTION_FILE, "utf-8");
          const action = JSON.parse(data);
          if (!action.processed) {
            resolve({
              content: [
                {
                  type: "text",
                  text: `📥 EXISTING UNPROCESSED ACTION:\n\n${JSON.stringify(
                    action,
                    null,
                    2
                  )}\n\n⚡ Process this action immediately!`,
                },
              ],
            });
            return;
          }
        } catch (error) {
          // File doesn't exist yet, that's okay
        }

        // Watch for file changes FOREVER (no timeout)
        fsSync.watchFile(
          GAME_ACTION_FILE,
          { interval: 500 },
          async (curr, prev) => {
            if (curr.mtime.getTime() > lastModified) {
              try {
                const data = await fs.readFile(GAME_ACTION_FILE, "utf-8");
                const action = JSON.parse(data);

                if (!action.processed) {
                  // Stop watching and resolve
                  fsSync.unwatchFile(GAME_ACTION_FILE);

                  resolve({
                    content: [
                      {
                        type: "text",
                        text: `🚨 NEW ACTION RECEIVED!\n\n📥 Action Details:\n${JSON.stringify(
                          action,
                          null,
                          2
                        )}\n\n⚡ Process this action now with processYuGiOhAction!\n\n🔄 After processing, call waitForYuGiOhAction again to wait for next action.`,
                      },
                    ],
                  });
                }
              } catch (error) {
                // Error reading file, continue watching
              }
            }
          }
        );

        // NO TIMEOUT - AI will wait forever until action arrives!
      });
    }
  );

  // Tool 11: Check for pending actions (non-blocking)
  server.tool(
    "checkYuGiOhPendingActions",
    "🔍 Check if there are any pending Yu-Gi-Oh actions to process",
    {},
    async () => {
      try {
        const data = await fs.readFile(GAME_ACTION_FILE, "utf-8");
        const action = JSON.parse(data);

        if (!action.processed) {
          return {
            content: [
              {
                type: "text",
                text: `📋 PENDING ACTION FOUND:\n\n${JSON.stringify(
                  action,
                  null,
                  2
                )}\n\n⚡ Use processYuGiOhAction to handle this!`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: "✅ No pending actions. All actions have been processed.",
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: "📭 No action file found. Waiting for player actions...",
            },
          ],
        };
      }
    }
  );
}
