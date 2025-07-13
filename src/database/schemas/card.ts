import { z } from 'zod';

// Card Types
export const CardTypeSchema = z.enum([
  'monster',
  'spell',
  'trap'
]);

// Monster Types
export const MonsterTypeSchema = z.enum([
  'warrior',
  'spellcaster',
  'dragon',
  'beast',
  'machine',
  'fiend',
  'fairy',
  'zombie',
  'aqua',
  'pyro',
  'thunder',
  'rock',
  'plant',
  'insect',
  'dinosaur',
  'sea_serpent',
  'reptile',
  'psychic',
  'divine_beast',
  'creator_god',
  'wyrm',
  'cyberse'
]);

// Attributes
export const AttributeSchema = z.enum([
  'light',
  'dark',
  'earth',
  'water',
  'fire',
  'wind',
  'divine'
]);

// Spell Types
export const SpellTypeSchema = z.enum([
  'normal',
  'continuous',
  'equip',
  'field',
  'quick_play',
  'ritual'
]);

// Trap Types
export const TrapTypeSchema = z.enum([
  'normal',
  'continuous',
  'counter'
]);

// Rarity
export const RaritySchema = z.enum([
  'common',
  'rare',
  'super_rare',
  'ultra_rare',
  'secret_rare',
  'ultimate_rare',
  'ghost_rare'
]);

// Base Card Schema
export const BaseCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  cardType: CardTypeSchema,
  description: z.string(),
  rarity: RaritySchema,
  setCode: z.string().optional(),
  cardNumber: z.string().optional()
});

// Monster Card Schema
export const MonsterCardSchema = BaseCardSchema.extend({
  cardType: z.literal('monster'),
  monsterType: MonsterTypeSchema,
  attribute: AttributeSchema,
  level: z.number().min(1).max(12),
  attack: z.number().min(0),
  defense: z.number().min(0),
  effect: z.string().optional(),
  isEffectMonster: z.boolean().default(false),
  isTuner: z.boolean().default(false),
  isSpirit: z.boolean().default(false),
  isUnion: z.boolean().default(false),
  isGemini: z.boolean().default(false),
  isFlip: z.boolean().default(false)
});

// Spell Card Schema
export const SpellCardSchema = BaseCardSchema.extend({
  cardType: z.literal('spell'),
  spellType: SpellTypeSchema,
  effect: z.string()
});

// Trap Card Schema
export const TrapCardSchema = BaseCardSchema.extend({
  cardType: z.literal('trap'),
  trapType: TrapTypeSchema,
  effect: z.string()
});

// Union Card Schema
export const CardSchema = z.discriminatedUnion('cardType', [
  MonsterCardSchema,
  SpellCardSchema,
  TrapCardSchema
]);

// Types
export type CardType = z.infer<typeof CardTypeSchema>;
export type MonsterType = z.infer<typeof MonsterTypeSchema>;
export type Attribute = z.infer<typeof AttributeSchema>;
export type SpellType = z.infer<typeof SpellTypeSchema>;
export type TrapType = z.infer<typeof TrapTypeSchema>;
export type Rarity = z.infer<typeof RaritySchema>;
export type BaseCard = z.infer<typeof BaseCardSchema>;
export type MonsterCard = z.infer<typeof MonsterCardSchema>;
export type SpellCard = z.infer<typeof SpellCardSchema>;
export type TrapCard = z.infer<typeof TrapCardSchema>;
export type Card = z.infer<typeof CardSchema>;
