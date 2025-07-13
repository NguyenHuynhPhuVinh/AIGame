import { SpellCard } from '../schemas/card.js';

export const SPELL_CARDS: SpellCard[] = [
  {
    id: 'pot_of_greed',
    name: 'Pot of Greed',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Draw 2 cards.',
    effect: 'Draw 2 cards from your deck.',
    rarity: 'rare'
  },
  {
    id: 'mystical_space_typhoon',
    name: 'Mystical Space Typhoon',
    cardType: 'spell',
    spellType: 'quick_play',
    description: 'Target 1 Spell/Trap on the field; destroy it.',
    effect: 'Target 1 Spell/Trap card on the field; destroy it.',
    rarity: 'common'
  },
  {
    id: 'dark_hole',
    name: 'Dark Hole',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Destroy all monsters on the field.',
    effect: 'Destroy all monsters on the field.',
    rarity: 'rare'
  },
  {
    id: 'raigeki',
    name: 'Raigeki',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Destroy all monsters your opponent controls.',
    effect: 'Destroy all monsters your opponent controls.',
    rarity: 'super_rare'
  },
  {
    id: 'monster_reborn',
    name: 'Monster Reborn',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Target 1 monster in either GY; Special Summon it.',
    effect: 'Target 1 monster in either player\'s Graveyard; Special Summon it to your field.',
    rarity: 'ultra_rare'
  },
  {
    id: 'swords_of_revealing_light',
    name: 'Swords of Revealing Light',
    cardType: 'spell',
    spellType: 'continuous',
    description: 'Your opponent cannot declare an attack for 3 turns.',
    effect: 'After this card\'s activation, your opponent cannot declare an attack for 3 turns. Flip all face-down monsters your opponent controls face-up.',
    rarity: 'rare'
  },
  {
    id: 'change_of_heart',
    name: 'Change of Heart',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Target 1 monster your opponent controls; take control of it until the End Phase.',
    effect: 'Target 1 monster your opponent controls; take control of it until the End Phase.',
    rarity: 'super_rare'
  },
  {
    id: 'heavy_storm',
    name: 'Heavy Storm',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Destroy all Spell and Trap cards on the field.',
    effect: 'Destroy all Spell and Trap cards on the field.',
    rarity: 'rare'
  },
  {
    id: 'fissure',
    name: 'Fissure',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Destroy the 1 face-up monster with the lowest ATK your opponent controls.',
    effect: 'Destroy the 1 face-up monster with the lowest ATK your opponent controls.',
    rarity: 'common'
  },
  {
    id: 'polymerization',
    name: 'Polymerization',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Fusion Summon 1 Fusion Monster from your Extra Deck.',
    effect: 'Fusion Summon 1 Fusion Monster from your Extra Deck, using monsters from your hand or field as Fusion Material.',
    rarity: 'common'
  },
  {
    id: 'book_of_moon',
    name: 'Book of Moon',
    cardType: 'spell',
    spellType: 'quick_play',
    description: 'Target 1 face-up monster on the field; change it to face-down Defense Position.',
    effect: 'Target 1 face-up monster on the field; change it to face-down Defense Position.',
    rarity: 'common'
  },
  {
    id: 'graceful_charity',
    name: 'Graceful Charity',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Draw 3 cards, then discard 2 cards.',
    effect: 'Draw 3 cards from your deck, then discard 2 cards from your hand.',
    rarity: 'rare'
  },
  {
    id: 'lightning_vortex',
    name: 'Lightning Vortex',
    cardType: 'spell',
    spellType: 'normal',
    description: 'Discard 1 card; destroy all face-up monsters your opponent controls.',
    effect: 'Discard 1 card from your hand; destroy all face-up monsters your opponent controls.',
    rarity: 'rare'
  },
  {
    id: 'premature_burial',
    name: 'Premature Burial',
    cardType: 'spell',
    spellType: 'equip',
    description: 'Pay 800 LP; target 1 monster in your GY; Special Summon it and equip it with this card.',
    effect: 'Pay 800 Life Points; target 1 monster in your Graveyard; Special Summon it in Attack Position and equip it with this card. When this card is destroyed, destroy the equipped monster.',
    rarity: 'super_rare'
  },
  {
    id: 'united_we_stand',
    name: 'United We Stand',
    cardType: 'spell',
    spellType: 'equip',
    description: 'The equipped monster gains 800 ATK and DEF for each face-up monster you control.',
    effect: 'The equipped monster gains 800 ATK and DEF for each face-up monster you control.',
    rarity: 'rare'
  }
];
