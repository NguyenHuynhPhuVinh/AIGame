// Export schemas
export * from './schemas/card.js';
export * from './schemas/gameState.js';

// Export card databases
export { MONSTER_CARDS } from './cards/monsters.js';
export { SPELL_CARDS } from './cards/spells.js';
export { TRAP_CARDS } from './cards/traps.js';

// Combined card database
import { MONSTER_CARDS } from './cards/monsters.js';
import { SPELL_CARDS } from './cards/spells.js';
import { TRAP_CARDS } from './cards/traps.js';
import { Card } from './schemas/card.js';

export const ALL_CARDS: Card[] = [
  ...MONSTER_CARDS,
  ...SPELL_CARDS,
  ...TRAP_CARDS
];

// Utility functions
export function getCardById(cardId: string): Card | undefined {
  return ALL_CARDS.find(card => card.id === cardId);
}

export function getCardsByType(cardType: 'monster' | 'spell' | 'trap'): Card[] {
  return ALL_CARDS.filter(card => card.cardType === cardType);
}

export function getMonstersByLevel(level: number): Card[] {
  return MONSTER_CARDS.filter(card => card.level === level);
}

export function getCardsByRarity(rarity: string): Card[] {
  return ALL_CARDS.filter(card => card.rarity === rarity);
}

export function searchCardsByName(name: string): Card[] {
  const searchTerm = name.toLowerCase();
  return ALL_CARDS.filter(card => 
    card.name.toLowerCase().includes(searchTerm) ||
    card.description.toLowerCase().includes(searchTerm)
  );
}

// Create a random deck
export function createRandomDeck(size: number = 40): string[] {
  const deck: string[] = [];
  
  // Ensure minimum monster count (at least 15 monsters)
  const monsterCount = Math.max(15, Math.floor(size * 0.4));
  const spellCount = Math.floor(size * 0.35);
  const trapCount = size - monsterCount - spellCount;
  
  // Add random monsters
  for (let i = 0; i < monsterCount; i++) {
    const randomMonster = MONSTER_CARDS[Math.floor(Math.random() * MONSTER_CARDS.length)];
    deck.push(randomMonster.id);
  }
  
  // Add random spells
  for (let i = 0; i < spellCount; i++) {
    const randomSpell = SPELL_CARDS[Math.floor(Math.random() * SPELL_CARDS.length)];
    deck.push(randomSpell.id);
  }
  
  // Add random traps
  for (let i = 0; i < trapCount; i++) {
    const randomTrap = TRAP_CARDS[Math.floor(Math.random() * TRAP_CARDS.length)];
    deck.push(randomTrap.id);
  }
  
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}
