import { GameState, GameLogEntry, PlayerId, WaifuInstance } from '../types/game.js';
import { getCardById } from '../data/cards.js';

// Deck creation and shuffling
export function createStarterDeck(): string[] {
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

export function shuffleDeck(deck: string[]): string[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Game log utilities
export function addGameLogEntry(
  gameState: GameState, 
  playerId: string, 
  action: string, 
  description: string, 
  details: any = {}
): void {
  gameState.gameLog.push({
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    playerId,
    action,
    description,
    details
  });
  gameState.lastAction = description;
}

// Game state utilities
export function getOpponentId(playerId: PlayerId): PlayerId {
  return playerId === 'player1' ? 'player2' : 'player1';
}

export function isGameFinished(gameState: GameState): boolean {
  return gameState.status === 'finished' || 
         gameState.players.player1.hp <= 0 || 
         gameState.players.player2.hp <= 0;
}

export function checkWinCondition(gameState: GameState): PlayerId | null {
  if (gameState.players.player1.hp <= 0) return 'player2';
  if (gameState.players.player2.hp <= 0) return 'player1';
  return null;
}

// Waifu instance utilities
export function createWaifuInstance(cardId: string): WaifuInstance {
  const card = getCardById(cardId);
  if (!card) {
    throw new Error(`Card not found: ${cardId}`);
  }

  return {
    instanceId: `waifu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cardId: card.id,
    currentAttack: card.attack,
    currentDefense: card.defense,
    currentCharm: card.charm,
    canAttack: false, // Summoning sickness
    buffs: []
  };
}

// Battle calculations
export interface BattleResult {
  type: 'attacker_wins' | 'defender_wins' | 'tie';
  damage: number;
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
}

export function calculateBattle(attackerAttack: number, defenderDefense: number): BattleResult {
  if (attackerAttack > defenderDefense) {
    return {
      type: 'attacker_wins',
      damage: attackerAttack - defenderDefense,
      attackerDestroyed: false,
      defenderDestroyed: true
    };
  } else if (attackerAttack < defenderDefense) {
    return {
      type: 'defender_wins',
      damage: defenderDefense - attackerAttack,
      attackerDestroyed: true,
      defenderDestroyed: false
    };
  } else {
    return {
      type: 'tie',
      damage: 0,
      attackerDestroyed: true,
      defenderDestroyed: true
    };
  }
}

// Validation utilities
export function validatePlayerTurn(gameState: GameState, playerId: PlayerId): boolean {
  return gameState.currentPlayer === playerId;
}

export function validatePhase(gameState: GameState, requiredPhase: GameState['phase']): boolean {
  return gameState.phase === requiredPhase;
}

export function validateCardInHand(gameState: GameState, playerId: PlayerId, cardId: string): boolean {
  return gameState.players[playerId].hand.includes(cardId);
}

export function validateManaForCard(gameState: GameState, playerId: PlayerId, cardCost: number): boolean {
  return gameState.players[playerId].mana >= cardCost;
}

export function validateFieldSpace(gameState: GameState, playerId: PlayerId): boolean {
  return gameState.players[playerId].field.length < 5; // Max 5 waifus on field
}

export function validateAttacker(gameState: GameState, playerId: PlayerId, attackerIndex: number): boolean {
  const player = gameState.players[playerId];
  return attackerIndex >= 0 && 
         attackerIndex < player.field.length && 
         player.field[attackerIndex].canAttack;
}

// Format utilities for display
export function formatGameState(gameState: GameState): string {
  return `🎴 Waifu Card Game State:\n\n` +
         `🆔 Game ID: ${gameState.gameId}\n` +
         `📊 Status: ${gameState.status}\n` +
         `👤 Current Player: ${gameState.currentPlayer}\n` +
         `🔄 Turn ${gameState.turnNumber}, Phase: ${gameState.phase}\n\n` +
         `🎮 Player 1 (${gameState.players.player1.name}):\n` +
         `  💖 HP: ${gameState.players.player1.hp}\n` +
         `  💎 Mana: ${gameState.players.player1.mana}/${gameState.players.player1.maxMana}\n` +
         `  🃏 Hand: ${gameState.players.player1.hand.length} cards\n` +
         `  ⚔️ Field: ${gameState.players.player1.field.length} waifus\n` +
         `  📚 Deck: ${gameState.players.player1.deck.length} cards\n\n` +
         `🎮 Player 2 (${gameState.players.player2.name}):\n` +
         `  💖 HP: ${gameState.players.player2.hp}\n` +
         `  💎 Mana: ${gameState.players.player2.mana}/${gameState.players.player2.maxMana}\n` +
         `  🃏 Hand: ${gameState.players.player2.hand.length} cards\n` +
         `  ⚔️ Field: ${gameState.players.player2.field.length} waifus\n` +
         `  📚 Deck: ${gameState.players.player2.deck.length} cards\n\n` +
         `📝 Last Action: ${gameState.lastAction}`;
}
