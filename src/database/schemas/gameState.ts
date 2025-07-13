import { z } from 'zod';
import { CardSchema } from './card.js';

// Game Phases
export const GamePhaseSchema = z.enum([
  'draw',
  'standby',
  'main1',
  'battle',
  'main2',
  'end'
]);

// Battle Phases
export const BattlePhaseSchema = z.enum([
  'start',
  'battle',
  'damage',
  'end'
]);

// Player Position
export const PlayerPositionSchema = z.enum([
  'player1',
  'player2'
]);

// Card Position
export const CardPositionSchema = z.enum([
  'attack',
  'defense',
  'face_down_attack',
  'face_down_defense'
]);

// Zone Types
export const ZoneTypeSchema = z.enum([
  'deck',
  'hand',
  'field',
  'graveyard',
  'banished',
  'extra_deck'
]);

// Field Zones
export const FieldZoneSchema = z.enum([
  'monster_1',
  'monster_2',
  'monster_3',
  'monster_4',
  'monster_5',
  'spell_trap_1',
  'spell_trap_2',
  'spell_trap_3',
  'spell_trap_4',
  'spell_trap_5',
  'field_spell',
  'extra_monster_1',
  'extra_monster_2'
]);

// Card Instance (card with game state)
export const CardInstanceSchema = z.object({
  instanceId: z.string(),
  cardId: z.string(),
  ownerId: PlayerPositionSchema,
  controllerId: PlayerPositionSchema,
  zone: ZoneTypeSchema,
  fieldZone: FieldZoneSchema.optional(),
  position: CardPositionSchema.optional(),
  isFaceUp: z.boolean().default(true),
  counters: z.record(z.string(), z.number()).default({}),
  equipCards: z.array(z.string()).default([]),
  isDestroyed: z.boolean().default(false),
  turnSummoned: z.number().optional(),
  hasAttacked: z.boolean().default(false),
  canAttack: z.boolean().default(true),
  canChangePosition: z.boolean().default(true)
});

// Player State
export const PlayerStateSchema = z.object({
  id: PlayerPositionSchema,
  name: z.string(),
  lifePoints: z.number().default(8000),
  deck: z.array(z.string()).default([]),
  hand: z.array(z.string()).default([]),
  field: z.record(FieldZoneSchema, z.string().optional()).default({}),
  graveyard: z.array(z.string()).default([]),
  banished: z.array(z.string()).default([]),
  extraDeck: z.array(z.string()).default([]),
  isReady: z.boolean().default(false),
  hasNormalSummoned: z.boolean().default(false),
  canDrawCard: z.boolean().default(true)
});

// Game Action
export const GameActionSchema = z.object({
  id: z.string(),
  playerId: PlayerPositionSchema,
  actionType: z.string(),
  timestamp: z.string(),
  description: z.string(),
  cardId: z.string().optional(),
  targetCardId: z.string().optional(),
  targetPlayerId: PlayerPositionSchema.optional(),
  fromZone: ZoneTypeSchema.optional(),
  toZone: ZoneTypeSchema.optional(),
  fromFieldZone: FieldZoneSchema.optional(),
  toFieldZone: FieldZoneSchema.optional(),
  damage: z.number().optional(),
  heal: z.number().optional(),
  processed: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).default({})
});

// Game State
export const GameStateSchema = z.object({
  gameId: z.string(),
  players: z.record(PlayerPositionSchema, PlayerStateSchema),
  cardInstances: z.record(z.string(), CardInstanceSchema),
  currentPlayer: PlayerPositionSchema,
  currentPhase: GamePhaseSchema,
  battlePhase: BattlePhaseSchema.optional(),
  turnNumber: z.number().default(1),
  gameStatus: z.enum(['waiting', 'playing', 'finished']).default('waiting'),
  winner: PlayerPositionSchema.optional(),
  gameLog: z.array(GameActionSchema).default([]),
  chainStack: z.array(z.string()).default([]),
  pendingActions: z.array(GameActionSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.string(), z.any()).default({})
});

// Types
export type GamePhase = z.infer<typeof GamePhaseSchema>;
export type BattlePhase = z.infer<typeof BattlePhaseSchema>;
export type PlayerPosition = z.infer<typeof PlayerPositionSchema>;
export type CardPosition = z.infer<typeof CardPositionSchema>;
export type ZoneType = z.infer<typeof ZoneTypeSchema>;
export type FieldZone = z.infer<typeof FieldZoneSchema>;
export type CardInstance = z.infer<typeof CardInstanceSchema>;
export type PlayerState = z.infer<typeof PlayerStateSchema>;
export type GameAction = z.infer<typeof GameActionSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
