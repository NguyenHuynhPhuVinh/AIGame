/**
 * Module đăng ký công cụ MCP cho game - SIMPLE VERSION (4 tools only)
 * MCP chỉ đọc/ghi JSON, không khởi tạo hay quản lý state
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const CARD_ACTION_FILE = path.join(process.cwd(), "cardAction.json");
const CARD_GAME_STATE_FILE = path.join(process.cwd(), "cardGameState.json");
const AI_COMMAND_FILE = path.join(process.cwd(), "aiCommand.json");

/**
 * Đăng ký 6 công cụ MCP cho card game
 * @param server Server MCP
 */
export function registerGameTools(server: McpServer) {
  // Tool 1: Đọc card action từ JSON (ưu tiên gọi đầu tiên)
  server.tool(
    "readCardAction",
    "🎯 Tool ưu tiên: Đọc card action từ file cardAction.json (từ CMD card game)",
    {},
    async () => {
      try {
        const data = await fs.readFile(CARD_ACTION_FILE, "utf-8");
        const cardAction = JSON.parse(data);

        if (!cardAction.processed) {
          return {
            content: [
              {
                type: "text",
                text: `📥 Card Action từ CMD game:\n${JSON.stringify(
                  cardAction,
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
                text: "📭 Card action đã được xử lý rồi.",
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: "📭 Không có card action nào từ CMD game.",
            },
          ],
        };
      }
    }
  );

  // Tool 2: Hiểu luật card game
  server.tool(
    "getCardGameRules",
    "📖 Tool để AI hiểu luật chơi Card Game - Magic Battle",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `🃏 CARD GAME - MAGIC BATTLE RULES

🎯 MỤC TIÊU: Giảm HP đối thủ xuống 0

📊 GAME SETUP:
• Mỗi player: 30 HP, 1 mana ban đầu
• Deck: 20 thẻ ngẫu nhiên
• Hand: 5 thẻ đầu tiên
• Turn đầu: player1

🃏 CARD TYPES & EFFECTS:
• SPELL: Hiệu ứng tức thì (damage, heal, shield)
  - Fireball: 4 damage
  - Healing Light: +3 HP
  - Lightning Bolt: 2 damage
  - Life Drain: 3 damage + 3 heal
  - Meteor Strike: 8 damage

• CREATURE: Tấn công liên tục mỗi turn
  - Goblin Warrior: 2 attack/1 defense
  - Orc Berserker: 3 attack/2 defense
  - Fire Dragon: 6 attack/6 defense + 2 damage khi summon

• ARTIFACT: Hiệu ứng thường trực
  - Magic Sword: +2 damage cho mọi attack
  - Steel Armor: -1 damage nhận vào
  - Health Potion: +2 HP tức thì

🎮 TURN FLOW:
1. Tăng maxMana +1 (max 10), mana = maxMana
2. Rút 1 thẻ từ deck vào hand
3. Player có thể chơi thẻ (trả mana cost)
4. Tất cả creature tấn công tự động
5. End turn → chuyển sang đối thủ

💡 AI PROCESSING LOGIC:
• Đọc cardAction.json để biết thẻ nào được chơi
• Parse effect description để hiểu tác dụng
• Áp dụng effect: damage, heal, summon creature
• Cập nhật HP, mana, hand, deck, playedCards
• Xử lý creature attacks từ playedCards
• Kiểm tra win condition (HP <= 0)
• Ghi log action vào gameLog
• Lưu state mới vào cardGameState.json`,
          },
        ],
      };
    }
  );

  // Tool 3: Xem trạng thái card game từ JSON
  server.tool(
    "viewCardGameState",
    "📊 Đọc và hiển thị trạng thái card game từ file cardGameState.json",
    {},
    async () => {
      try {
        const data = await fs.readFile(CARD_GAME_STATE_FILE, "utf-8");
        const gameState = JSON.parse(data);

        return {
          content: [
            {
              type: "text",
              text: `📊 CARD GAME STATE:\n${JSON.stringify(
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
              text: "📭 Chưa có card game state. CMD game chưa khởi tạo.",
            },
          ],
        };
      }
    }
  );

  // Tool 4: Cập nhật trạng thái card game
  server.tool(
    "updateCardGameState",
    "✏️ Cập nhật trạng thái card game vào file cardGameState.json",
    {
      gameState: z
        .object({})
        .passthrough()
        .describe("Object trạng thái game mới để ghi vào file"),
    },
    async ({ gameState }) => {
      try {
        await fs.writeFile(
          CARD_GAME_STATE_FILE,
          JSON.stringify(gameState, null, 2),
          "utf-8"
        );

        return {
          content: [
            {
              type: "text",
              text: `✅ Đã cập nhật card game state thành công!\n\n📊 Trạng thái mới:\n${JSON.stringify(
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
              text: `❌ Lỗi khi cập nhật card game state: ${
                (error as Error).message
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool 5: Xem chi tiết thẻ bài theo ID
  server.tool(
    "getCardDetails",
    "🃏 Xem chi tiết thẻ bài theo ID (để AI hiểu effect cụ thể)",
    {
      cardId: z.string().describe("ID của thẻ bài cần xem chi tiết"),
    },
    async ({ cardId }) => {
      // Database thẻ bài (giống trong cardGame.js)
      const ALL_CARDS = [
        {
          id: "fireball",
          name: "Fireball",
          manaCost: 3,
          cardType: "spell",
          effect: "Gây 4 damage cho đối thủ",
          rarity: "common",
        },
        {
          id: "heal",
          name: "Healing Light",
          manaCost: 2,
          cardType: "spell",
          effect: "Hồi 3 HP cho bản thân",
          rarity: "common",
        },
        {
          id: "lightning",
          name: "Lightning Bolt",
          manaCost: 1,
          cardType: "spell",
          effect: "Gây 2 damage cho đối thủ",
          rarity: "common",
        },
        {
          id: "shield",
          name: "Magic Shield",
          manaCost: 2,
          cardType: "spell",
          effect: "Giảm 50% damage nhận vào trong lượt này",
          rarity: "rare",
        },
        {
          id: "drain",
          name: "Life Drain",
          manaCost: 4,
          cardType: "spell",
          effect: "Gây 3 damage cho đối thủ và hồi 3 HP cho bản thân",
          rarity: "rare",
        },
        {
          id: "meteor",
          name: "Meteor Strike",
          manaCost: 6,
          cardType: "spell",
          effect: "Gây 8 damage cho đối thủ",
          rarity: "epic",
        },
        {
          id: "goblin",
          name: "Goblin Warrior",
          manaCost: 2,
          cardType: "creature",
          attack: 2,
          defense: 1,
          effect: "Tấn công đối thủ mỗi lượt với 2 damage",
          rarity: "common",
        },
        {
          id: "orc",
          name: "Orc Berserker",
          manaCost: 3,
          cardType: "creature",
          attack: 3,
          defense: 2,
          effect: "Tấn công đối thủ mỗi lượt với 3 damage",
          rarity: "common",
        },
        {
          id: "dragon",
          name: "Fire Dragon",
          manaCost: 7,
          cardType: "creature",
          attack: 6,
          defense: 6,
          effect:
            "Tấn công đối thủ mỗi lượt với 6 damage. Khi triệu hồi: gây thêm 2 damage",
          rarity: "legendary",
        },
        {
          id: "sword",
          name: "Magic Sword",
          manaCost: 3,
          cardType: "artifact",
          effect: "Tăng 2 damage cho tất cả tấn công của bạn",
          rarity: "rare",
        },
        {
          id: "armor",
          name: "Steel Armor",
          manaCost: 4,
          cardType: "artifact",
          effect: "Giảm 1 damage từ mọi tấn công nhận vào",
          rarity: "rare",
        },
        {
          id: "potion",
          name: "Health Potion",
          manaCost: 1,
          cardType: "artifact",
          effect: "Hồi 2 HP ngay lập tức",
          rarity: "common",
        },
      ];

      // Tìm thẻ bài (hỗ trợ cả ID gốc và ID có suffix)
      const baseId = cardId.split("_")[0]; // Loại bỏ suffix như "_0", "_1"
      const card = ALL_CARDS.find((c) => c.id === baseId);

      if (!card) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Không tìm thấy thẻ bài với ID: ${cardId}`,
            },
          ],
        };
      }

      let cardInfo = `🃏 CHI TIẾT THẺ BÀI\n\n`;
      cardInfo += `📛 Name: ${card.name}\n`;
      cardInfo += `🆔 ID: ${cardId}\n`;
      cardInfo += `💎 Mana Cost: ${card.manaCost}\n`;
      cardInfo += `🎭 Type: ${card.cardType}\n`;
      cardInfo += `🌟 Rarity: ${card.rarity}\n`;

      if (card.attack !== undefined) {
        cardInfo += `⚔️ Attack: ${card.attack}\n`;
        cardInfo += `🛡️ Defense: ${card.defense}\n`;
      }

      cardInfo += `\n📝 EFFECT:\n${card.effect}`;

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

  // Tool 6: Đợi CMD game thực hiện action
  server.tool(
    "waitForPlayerAction",
    "⏳ Tool để AI đợi CMD game thực hiện action vĩnh viễn (không timeout)",
    {},
    async () => {
      const startTime = Date.now();

      console.log("⏳ AI đang đợi CMD game thực hiện action vĩnh viễn...");

      // Đọc timestamp hiện tại của file (nếu có)
      let lastModified = 0;
      try {
        const stats = await fs.stat(CARD_ACTION_FILE);
        lastModified = stats.mtime.getTime();
      } catch (error) {
        // File chưa tồn tại
      }

      // Polling loop vĩnh viễn
      while (true) {
        try {
          // Kiểm tra file có thay đổi không
          const stats = await fs.stat(CARD_ACTION_FILE);
          const currentModified = stats.mtime.getTime();

          if (currentModified > lastModified) {
            // File đã thay đổi, đọc action mới
            const data = await fs.readFile(CARD_ACTION_FILE, "utf-8");
            const action = JSON.parse(data);

            if (!action.processed) {
              const waitTime = ((Date.now() - startTime) / 1000).toFixed(1);
              console.log(`✅ AI nhận được action sau ${waitTime}s chờ đợi`);

              return {
                content: [
                  {
                    type: "text",
                    text: `✅ CMD game đã thực hiện action!\n\n📥 Action nhận được:\n${JSON.stringify(
                      action,
                      null,
                      2
                    )}\n\n⏱️ Thời gian chờ: ${waitTime}s`,
                  },
                ],
              };
            }
          }

          // Chờ 500ms trước khi check lại
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          // File chưa tồn tại hoặc lỗi đọc, tiếp tục chờ
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      // Loop vĩnh viễn - không bao giờ đến đây trừ khi có action
    }
  );
}
