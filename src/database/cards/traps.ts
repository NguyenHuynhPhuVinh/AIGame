import { TrapCard } from '../schemas/card.js';

export const TRAP_CARDS: TrapCard[] = [
  {
    id: 'mirror_force',
    name: 'Mirror Force',
    cardType: 'trap',
    trapType: 'normal',
    description: 'When an opponent\'s monster declares an attack: Destroy all Attack Position monsters your opponent controls.',
    effect: 'Activate only when an opponent\'s monster declares an attack. Destroy all Attack Position monsters your opponent controls.',
    rarity: 'ultra_rare'
  },
  {
    id: 'trap_hole',
    name: 'Trap Hole',
    cardType: 'trap',
    trapType: 'normal',
    description: 'When your opponent Normal or Flip Summons a monster with 1000 or more ATK: Destroy that monster.',
    effect: 'Activate when your opponent Normal or Flip Summons a monster with 1000 or more ATK. Destroy that monster.',
    rarity: 'common'
  },
  {
    id: 'magic_cylinder',
    name: 'Magic Cylinder',
    cardType: 'trap',
    trapType: 'normal',
    description: 'When an opponent\'s monster declares an attack: Target the attacking monster; negate the attack, and if you do, inflict damage to your opponent equal to its ATK.',
    effect: 'Activate when an opponent\'s monster declares an attack. Target the attacking monster; negate the attack, and inflict damage to your opponent equal to its ATK.',
    rarity: 'rare'
  },
  {
    id: 'sakuretsu_armor',
    name: 'Sakuretsu Armor',
    cardType: 'trap',
    trapType: 'normal',
    description: 'When an opponent\'s monster declares an attack: Target the attacking monster; destroy that target.',
    effect: 'Activate when an opponent\'s monster declares an attack. Target the attacking monster; destroy it.',
    rarity: 'common'
  },
  {
    id: 'bottomless_trap_hole',
    name: 'Bottomless Trap Hole',
    cardType: 'trap',
    trapType: 'normal',
    description: 'When your opponent Summons a monster(s) with 1500 or more ATK: Destroy that monster(s) with 1500 or more ATK, and if you do, banish it.',
    effect: 'Activate when your opponent Summons a monster with 1500 or more ATK. Destroy and banish that monster.',
    rarity: 'rare'
  },
  {
    id: 'torrential_tribute',
    name: 'Torrential Tribute',
    cardType: 'trap',
    trapType: 'normal',
    description: 'When a monster(s) is Summoned: Destroy all monsters on the field.',
    effect: 'Activate when a monster is Summoned. Destroy all monsters on the field.',
    rarity: 'super_rare'
  },
  {
    id: 'ring_of_destruction',
    name: 'Ring of Destruction',
    cardType: 'trap',
    trapType: 'normal',
    description: 'Target 1 face-up monster on the field; destroy that target, and if you do, inflict damage to both players equal to its ATK.',
    effect: 'Target 1 face-up monster on the field; destroy it, and inflict damage to both players equal to its ATK.',
    rarity: 'super_rare'
  },
  {
    id: 'call_of_the_haunted',
    name: 'Call of the Haunted',
    cardType: 'trap',
    trapType: 'continuous',
    description: 'Target 1 monster in your GY; Special Summon that target in Attack Position.',
    effect: 'Target 1 monster in your Graveyard; Special Summon it in Attack Position. When this card leaves the field, destroy that monster. When that monster is destroyed, destroy this card.',
    rarity: 'rare'
  },
  {
    id: 'solemn_judgment',
    name: 'Solemn Judgment',
    cardType: 'trap',
    trapType: 'counter',
    description: 'When a monster would be Summoned, OR a Spell/Trap Card is activated: Pay half your LP; negate the Summon or activation, and if you do, destroy that card.',
    effect: 'Pay half your Life Points; negate the Summon of a monster or the activation of a Spell/Trap card, and destroy it.',
    rarity: 'ultra_rare'
  },
  {
    id: 'dimensional_prison',
    name: 'Dimensional Prison',
    cardType: 'trap',
    trapType: 'normal',
    description: 'When an opponent\'s monster declares an attack: Target the attacking monster; banish that target.',
    effect: 'Activate when an opponent\'s monster declares an attack. Target the attacking monster; banish it.',
    rarity: 'rare'
  },
  {
    id: 'compulsory_evacuation_device',
    name: 'Compulsory Evacuation Device',
    cardType: 'trap',
    trapType: 'normal',
    description: 'Target 1 monster on the field; return that target to the hand.',
    effect: 'Target 1 monster on the field; return it to the hand.',
    rarity: 'common'
  },
  {
    id: 'widespread_ruin',
    name: 'Widespread Ruin',
    cardType: 'trap',
    trapType: 'normal',
    description: 'When an opponent\'s monster declares an attack: Destroy the face-up Attack Position monster your opponent controls that has the highest ATK.',
    effect: 'Activate when an opponent\'s monster declares an attack. Destroy the face-up Attack Position monster your opponent controls with the highest ATK.',
    rarity: 'rare'
  }
];
