#!/usr/bin/env node

/**
 * CMD Card Game - Magic Battle
 * Game thẻ bài phức tạp với AI-driven logic
 * CMD game làm tất cả, MCP chỉ 4 tools đơn giản
 */

import fs from "fs/promises";
import fsSync from "fs";
import readline from "readline";
import path from "path";

const CARD_ACTION_FILE = path.join(process.cwd(), "cardAction.json");
const CARD_GAME_STATE_FILE = path.join(process.cwd(), "cardGameState.json");

// Tạo interface để đọc input từ console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let isWaitingForAI = false;

/**
 * Database thẻ bài
 */
const ALL_CARDS = [
  // SPELL CARDS
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

  // CREATURE CARDS
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

  // ARTIFACT CARDS
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

/**
 * Watch game state file để cập nhật UI khi AI xử lý xong
 */
function watchGameStateFile() {
  fsSync.watchFile(
    CARD_GAME_STATE_FILE,
    { interval: 500 },
    async (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log("\n" + "=".repeat(60));
        console.log("🔄 AI ĐÃ XỬ LÝ XONG - KẾT QUẢ MỚI!");
        console.log("=".repeat(60));
        await displayGameState();

        if (isWaitingForAI) {
          isWaitingForAI = false;
          console.log("\n✅ AI đã xử lý xong!");
          console.log("📋 Kết quả đã được cập nhật ở trên.");
          console.log("👆 Xem kết quả và nhấn Enter để tiếp tục...");

          // Chờ người dùng nhấn Enter
          rl.question("", () => {
            showMenu();
            rl.question("Nhập lựa chọn của bạn: ", handleUserInput);
          });
        }
      }
    }
  );
  console.log("👁️ Đang theo dõi thay đổi card game state...");
}

/**
 * Hiển thị menu chính
 */
function showMenu() {
  console.clear();
  console.log("🃏 CARD GAME - MAGIC BATTLE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. 🎴 Chơi thẻ bài");
  console.log("2. 📊 Xem trạng thái game");
  console.log("3. 🃏 Xem hand cards");
  console.log("4. ⏭️ Kết thúc lượt");
  console.log("5. 🆕 Tạo game mới");
  console.log("6. 🔄 Reset game");
  console.log("0. ❌ Thoát");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

/**
 * Tìm thông tin chi tiết thẻ bài theo ID
 */
function getCardDetails(cardId) {
  const baseId = cardId.split("_")[0]; // Loại bỏ suffix như "_0", "_1"
  return ALL_CARDS.find((card) => card.id === baseId);
}

/**
 * Tạo deck ngẫu nhiên
 */
function createRandomDeck() {
  const deck = [];

  // Tạo 20 thẻ ngẫu nhiên
  for (let i = 0; i < 20; i++) {
    const randomCard = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
    deck.push({ ...randomCard, id: randomCard.id + "_" + i });
  }

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Khởi tạo card game state
 */
async function initializeCardGameState() {
  try {
    await fs.access(CARD_GAME_STATE_FILE);
    console.log("✅ Card game state đã tồn tại");
  } catch (error) {
    // Tạo game state mặc định
    const player1Deck = createRandomDeck();
    const player2Deck = createRandomDeck();

    const defaultGameState = {
      gameId: "cardgame-" + Date.now(),
      players: {
        player1: {
          id: "player1",
          name: "Player1",
          hp: 30,
          maxHp: 30,
          mana: 1,
          maxMana: 1,
          deckCount: 15, // Chỉ hiện số lượng, không hiện chi tiết deck
          hand: player1Deck
            .slice(0, 5)
            .map((card) => ({ id: card.id, name: card.name })), // Chỉ id + name
          playedCards: [], // Sẽ chứa { id, name } khi chơi
          isReady: false,
        },
        player2: {
          id: "player2",
          name: "AI",
          hp: 30,
          maxHp: 30,
          mana: 1,
          maxMana: 1,
          deckCount: 15,
          hand: player2Deck
            .slice(0, 5)
            .map((card) => ({ id: card.id, name: card.name })),
          playedCards: [],
          isReady: false,
        },
      },
      currentTurn: "player1",
      turnNumber: 1,
      gamePhase: "playing",
      gameLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      CARD_GAME_STATE_FILE,
      JSON.stringify(defaultGameState, null, 2),
      "utf-8"
    );
    console.log("🆕 Đã tạo card game state mặc định");
  }
}

/**
 * Chọn thẻ để chơi
 */
async function selectCardToPlay() {
  try {
    const data = await fs.readFile(CARD_GAME_STATE_FILE, "utf-8");
    const gameState = JSON.parse(data);
    const player = gameState.players.player1;

    if (gameState.currentTurn !== "player1") {
      console.log("❌ Không phải lượt của bạn!");
      return;
    }

    console.log("\n🃏 HAND CARDS:");
    player.hand.forEach((card, index) => {
      const cardDetails = getCardDetails(card.id);
      if (cardDetails) {
        const canPlay = player.mana >= cardDetails.manaCost ? "✅" : "❌";
        console.log(
          `${index + 1}. ${canPlay} ${card.name} (${cardDetails.manaCost} mana)`
        );
        console.log(`   Effect: ${cardDetails.effect}`);
      } else {
        console.log(`${index + 1}. ❌ ${card.name} (unknown card)`);
      }
    });

    rl.question("\nChọn thẻ (số thứ tự): ", async (choice) => {
      const cardIndex = parseInt(choice) - 1;
      if (cardIndex >= 0 && cardIndex < player.hand.length) {
        const selectedCard = player.hand[cardIndex];
        const cardDetails = getCardDetails(selectedCard.id);

        if (cardDetails && player.mana >= cardDetails.manaCost) {
          await playCard(selectedCard, cardDetails);
        } else {
          console.log("❌ Không đủ mana!");
          setTimeout(() => {
            showMenu();
            rl.question("Nhập lựa chọn của bạn: ", handleUserInput);
          }, 2000);
        }
      } else {
        console.log("❌ Lựa chọn không hợp lệ!");
        setTimeout(() => {
          showMenu();
          rl.question("Nhập lựa chọn của bạn: ", handleUserInput);
        }, 2000);
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi đọc game state:", error.message);
  }
}

/**
 * Chơi thẻ bài
 */
async function playCard(card, cardDetails) {
  try {
    const cardAction = {
      timestamp: new Date().toISOString(),
      playerId: "player1",
      actionType: "play_card",
      cardId: card.id,
      targetPlayerId: "player2", // Mặc định target là đối thủ
      description: `Player1 chơi thẻ ${card.name}: ${cardDetails.effect}`,
      processed: false,
    };

    await fs.writeFile(
      CARD_ACTION_FILE,
      JSON.stringify(cardAction, null, 2),
      "utf-8"
    );

    console.log("\n" + "=".repeat(60));
    console.log("🎴 THẺ BÀI ĐÃ ĐƯỢC CHƠI!");
    console.log("=".repeat(60));
    console.log(`📝 ${cardAction.description}`);
    console.log("⏳ Đang chờ AI xử lý effect...");
    console.log("💡 Hãy gọi MCP tools để AI xử lý logic!");
    console.log("🔄 Game sẽ tự động cập nhật khi AI xử lý xong...");
    console.log("=".repeat(60));

    isWaitingForAI = true;
  } catch (error) {
    console.error("❌ Lỗi khi chơi thẻ:", error.message);
  }
}

/**
 * Kết thúc lượt
 */
async function endTurn() {
  try {
    const endTurnAction = {
      timestamp: new Date().toISOString(),
      playerId: "player1",
      actionType: "end_turn",
      description: "Player1 kết thúc lượt",
      processed: false,
    };

    await fs.writeFile(
      CARD_ACTION_FILE,
      JSON.stringify(endTurnAction, null, 2),
      "utf-8"
    );

    console.log("\n⏭️ Đã kết thúc lượt!");
    console.log("⏳ Đang chờ AI xử lý...");

    isWaitingForAI = true;
  } catch (error) {
    console.error("❌ Lỗi khi kết thúc lượt:", error.message);
  }
}

/**
 * Hiển thị trạng thái game
 */
async function displayGameState() {
  try {
    const data = await fs.readFile(CARD_GAME_STATE_FILE, "utf-8");
    const gameState = JSON.parse(data);

    console.log("\n🃏 CARD GAME - TRẠNG THÁI HIỆN TẠI:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      `👤 ${gameState.players.player1.name}: ${gameState.players.player1.hp}/${gameState.players.player1.maxHp} HP | ${gameState.players.player1.mana}/${gameState.players.player1.maxMana} Mana`
    );
    console.log(
      `🤖 ${gameState.players.player2.name}: ${gameState.players.player2.hp}/${gameState.players.player2.maxHp} HP | ${gameState.players.player2.mana}/${gameState.players.player2.maxMana} Mana`
    );
    console.log(
      `🎯 Turn: ${gameState.turnNumber} | Current: ${
        gameState.currentTurn === "player1"
          ? gameState.players.player1.name
          : gameState.players.player2.name
      }`
    );
    console.log(`📊 Phase: ${gameState.gamePhase}`);

    // Hiển thị deck info
    console.log(`\n📚 Deck Info:`);
    console.log(
      `   ${gameState.players.player1.name}: ${gameState.players.player1.deckCount} cards left`
    );
    console.log(
      `   ${gameState.players.player2.name}: ${gameState.players.player2.deckCount} cards left`
    );

    // Hiển thị played cards
    if (gameState.players.player1.playedCards.length > 0) {
      console.log(`\n🎴 ${gameState.players.player1.name}'s Played Cards:`);
      gameState.players.player1.playedCards.forEach((card) => {
        console.log(`   • ${card.name} (${card.cardType})`);
      });
    }

    if (gameState.players.player2.playedCards.length > 0) {
      console.log(`\n🎴 ${gameState.players.player2.name}'s Played Cards:`);
      gameState.players.player2.playedCards.forEach((card) => {
        console.log(`   • ${card.name} (${card.cardType})`);
      });
    }

    // Hiển thị game log gần đây
    if (gameState.gameLog.length > 0) {
      console.log("\n📜 RECENT ACTIONS:");
      const recentLogs = gameState.gameLog.slice(-3);
      recentLogs.forEach((log) => {
        const playerName =
          log.playerId === "player1"
            ? gameState.players.player1.name
            : gameState.players.player2.name;
        console.log(`• ${playerName}: ${log.effect}`);
      });
    }

    if (gameState.gamePhase === "finished" && gameState.winner) {
      console.log(`\n🎉 WINNER: ${gameState.winner}! 🎉`);
    }
  } catch (error) {
    console.log("📭 Chưa có card game state. Hãy tạo game mới!");
  }
}

/**
 * Hiển thị hand cards
 */
async function displayHandCards() {
  try {
    const data = await fs.readFile(CARD_GAME_STATE_FILE, "utf-8");
    const gameState = JSON.parse(data);
    const player = gameState.players.player1;

    console.log("\n🃏 YOUR HAND CARDS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (player.hand.length === 0) {
      console.log("❌ Không có thẻ nào trong tay!");
    } else {
      player.hand.forEach((card, index) => {
        const cardDetails = getCardDetails(card.id);
        if (cardDetails) {
          const canPlay = player.mana >= cardDetails.manaCost ? "✅" : "❌";
          const typeIcon =
            cardDetails.cardType === "spell"
              ? "🔮"
              : cardDetails.cardType === "creature"
              ? "👹"
              : "⚔️";

          console.log(`${index + 1}. ${canPlay} ${typeIcon} ${card.name}`);
          console.log(
            `   💎 Cost: ${cardDetails.manaCost} mana | 🌟 ${cardDetails.rarity}`
          );
          console.log(`   📝 Effect: ${cardDetails.effect}`);

          if (cardDetails.attack !== undefined) {
            console.log(
              `   ⚔️ Attack: ${cardDetails.attack} | 🛡️ Defense: ${cardDetails.defense}`
            );
          }
          console.log("");
        } else {
          console.log(`${index + 1}. ❌ ${card.name} (unknown card)`);
        }
      });
    }
  } catch (error) {
    console.log("❌ Lỗi khi đọc hand cards:", error.message);
  }
}

/**
 * Xử lý input từ người dùng
 */
async function handleUserInput(input) {
  const choice = input.trim();

  if (isWaitingForAI) {
    console.log("⏳ Đang chờ AI xử lý, vui lòng đợi...");
    return;
  }

  switch (choice) {
    case "1":
      await selectCardToPlay();
      return; // Không hiển thị menu, chờ user chọn thẻ
    case "2":
      await displayGameState();
      break;
    case "3":
      await displayHandCards();
      break;
    case "4":
      isWaitingForAI = true;
      await endTurn();
      return; // Không hiển thị menu, chờ AI xử lý
    case "5":
      await initializeCardGameState();
      console.log("🆕 Đã tạo card game mới!");
      break;
    case "6":
      await initializeCardGameState();
      console.log("🔄 Đã reset card game!");
      break;
    case "0":
      console.log("👋 Tạm biệt!");
      rl.close();
      return;
    default:
      console.log("❌ Lựa chọn không hợp lệ!");
  }

  // Hiển thị menu lại
  setTimeout(() => {
    showMenu();
    rl.question("Nhập lựa chọn của bạn: ", handleUserInput);
  }, 2000);
}

/**
 * Khởi động card game
 */
async function startCardGame() {
  console.log("🚀 Khởi động Card Game...");
  console.log("🃏 Magic Battle - AI-driven card game!");
  console.log("📋 Hãy đảm bảo đã build và chạy MCP Server trước.");
  console.log("");

  // Khởi tạo game state
  await initializeCardGameState();

  // Bắt đầu watch file changes
  watchGameStateFile();

  showMenu();
  rl.question("Nhập lựa chọn của bạn: ", handleUserInput);
}

// Khởi động card game
startCardGame().catch(console.error);
