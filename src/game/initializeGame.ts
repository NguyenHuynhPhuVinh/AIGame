#!/usr/bin/env node

// Game Initializer - AI-Driven Architecture
import { StateManager } from '../state/stateManager.js';
import { WAIFU_CARDS, getCardById } from '../data/cards.js';
import { 
  GameState, 
  PlayerState, 
  FieldState, 
  CardState, 
  HistoryState,
  CardInstance 
} from '../types/game.js';

function createStarterDeck(): string[] {
  return [
    'sakura_chan', 'sakura_chan', 'sakura_chan',
    'yuki_tsundere', 'yuki_tsundere', 'yuki_tsundere',
    'miku_maid', 'miku_maid', 'miku_maid',
    'rei_kuudere', 'rei_kuudere',
    'akane_genki', 'akane_genki',
    'yui_imouto', 'yui_imouto',
    'ayame_ojousama',
    'yandere_yuno',
    'megumi_oneesan',
    'goddess_ai'
  ];
}

function shuffleDeck(deck: string[]): string[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCardInstances(cardIds: string[], ownerId: string, location: 'hand' | 'deck'): CardInstance[] {
  return cardIds.map((cardId, index) => ({
    instanceId: `card_${Date.now()}_${ownerId}_${index}_${Math.random().toString(36).substr(2, 9)}`,
    cardId: cardId,
    ownerId: ownerId,
    location: location,
    position: index
  }));
}

async function initializeNewGame(): Promise<void> {
  console.log("🎴 Initializing New AI-Driven Waifu Card Game...");
  
  const now = new Date().toISOString();
  const gameId = `waifu_${Date.now()}`;

  // 1. Create Game State
  const gameState: GameState = {
    gameId: gameId,
    status: 'playing',
    currentPlayer: 'player1',
    turnNumber: 1,
    phase: 'draw',
    createdAt: now,
    lastUpdated: now
  };

  // 2. Create Player States
  const deck1 = shuffleDeck(createStarterDeck());
  const deck2 = shuffleDeck(createStarterDeck());

  const playerStates = {
    player1: {
      playerId: 'player1',
      name: 'AI Player 1',
      hp: 20,
      mana: 1,
      maxMana: 1,
      handSize: 5,
      deckSize: deck1.length - 5, // After drawing initial hand
      fieldSize: 0,
      graveyardSize: 0
    } as PlayerState,
    player2: {
      playerId: 'player2',
      name: 'AI Player 2',
      hp: 20,
      mana: 1,
      maxMana: 1,
      handSize: 5,
      deckSize: deck2.length - 5,
      fieldSize: 0,
      graveyardSize: 0
    } as PlayerState
  };

  // 3. Create Field State
  const fieldState: FieldState = {
    player1Field: [],
    player2Field: [],
    maxFieldSize: 5
  };

  // 4. Create Card State
  const player1Hand = createCardInstances(deck1.slice(0, 5), 'player1', 'hand');
  const player1Deck = createCardInstances(deck1.slice(5), 'player1', 'deck');
  const player2Hand = createCardInstances(deck2.slice(0, 5), 'player2', 'hand');
  const player2Deck = createCardInstances(deck2.slice(5), 'player2', 'deck');

  const cardState: CardState = {
    player1Hand: player1Hand,
    player2Hand: player2Hand,
    player1Deck: player1Deck,
    player2Deck: player2Deck,
    player1Graveyard: [],
    player2Graveyard: []
  };

  // 5. Create History State
  const historyState: HistoryState = {
    gameLog: [
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        playerId: 'system',
        action: 'game_start',
        description: '🎴 AI-Driven Waifu Card Game Started - Pure State Management',
        details: { 
          gameMode: 'AI_DRIVEN',
          architecture: 'PURE_STATE_MANAGEMENT',
          gameId: gameId
        }
      }
    ],
    lastAction: 'Game initialized with AI-driven architecture'
  };

  // Save all states
  await StateManager.saveGameState(gameState);
  await StateManager.savePlayerStates(playerStates);
  await StateManager.saveFieldState(fieldState);
  await StateManager.saveCardState(cardState);
  await StateManager.saveHistoryState(historyState);

  console.log("✅ Game initialized successfully!");
  console.log(`📊 Game ID: ${gameState.gameId}`);
  console.log(`🎮 Status: ${gameState.status}`);
  console.log(`👤 Current Player: ${gameState.currentPlayer}`);
  console.log(`🔄 Turn: ${gameState.turnNumber}, Phase: ${gameState.phase}`);
  console.log("");
  console.log("📁 State Files Created:");
  console.log("  - game_state/game.json (Core game state)");
  console.log("  - game_state/players.json (Player stats)");
  console.log("  - game_state/field.json (Field waifus)");
  console.log("  - game_state/cards.json (Card locations)");
  console.log("  - game_state/history.json (Game log)");
  console.log("");
  console.log("🎯 Player 1 Starting Hand:");
  player1Hand.forEach((card, index) => {
    const cardData = getCardById(card.cardId);
    console.log(`  ${index + 1}. ${cardData?.name || 'Unknown'} (${card.instanceId})`);
  });
  console.log("");
  console.log("🎯 Player 2 Starting Hand:");
  player2Hand.forEach((card, index) => {
    const cardData = getCardById(card.cardId);
    console.log(`  ${index + 1}. ${cardData?.name || 'Unknown'} (${card.instanceId})`);
  });
  console.log("");
  console.log("🚀 Ready for AI to play via MCP tools!");
  console.log("💡 Use MCP server to interact with pure state management");
  console.log("");
  console.log("🔧 Available MCP Tool Categories:");
  console.log("  - Game State Tools (getGameState, updateGamePhase, endGame)");
  console.log("  - Player State Tools (getPlayerStates, updatePlayerStats, damagePlayer)");
  console.log("  - Field State Tools (getFieldState, summonWaifuToField, updateWaifuStatus)");
  console.log("  - Card State Tools (getCardState, moveCard, drawCard)");
  console.log("  - History Tools (getGameHistory, addGameLogEntry)");
}

async function main() {
  try {
    // Clear any existing states
    await StateManager.clearAllStates();
    
    // Initialize new game
    await initializeNewGame();
    
  } catch (error) {
    console.error("❌ Failed to initialize game:", error);
    process.exit(1);
  }
}

main().catch(console.error);
