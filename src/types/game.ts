// Game Types & Interfaces

export interface WaifuCard {
  id: string;
  name: string;
  attack: number;
  defense: number;
  charm: number;
  cost: number;
  rarity: "common" | "rare" | "super_rare" | "ultra_rare" | "legendary";
  description: string;
  flavorText: string;
  waifuType:
    | "dandere"
    | "tsundere"
    | "kuudere"
    | "yandere"
    | "genki"
    | "imouto"
    | "oneesan"
    | "ojousama"
    | "maid"
    | "idol";
}

export interface WaifuInstance {
  instanceId: string;
  cardId: string;
  currentAttack: number;
  currentDefense: number;
  currentCharm: number;
  canAttack: boolean;
  buffs: WaifuBuff[];
}

export interface WaifuBuff {
  id: string;
  name: string;
  type: "attack" | "defense" | "charm";
  value: number;
  duration: number; // -1 for permanent
  source: string;
}

export interface PlayerState {
  id: "player1" | "player2";
  name: string;
  hp: number;
  mana: number;
  maxMana: number;
  deck: string[];
  hand: string[];
  field: WaifuInstance[];
  graveyard: string[];
}

export interface GameState {
  gameId: string;
  status: "waiting" | "playing" | "finished";
  currentPlayer: "player1" | "player2";
  turnNumber: number;
  phase: "draw" | "main" | "battle" | "end";
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  winner?: "player1" | "player2";
  gameLog: GameLogEntry[];
  createdAt: string;
  lastAction: string;
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  playerId: string;
  action: string;
  description: string;
  details: any;
}

export type GamePhase = "draw" | "main" | "battle" | "end";
export type PlayerId = "player1" | "player2";
export type AttackTarget = "player" | "waifu";

// Game Actions
export interface SummonAction {
  type: "summon";
  playerId: PlayerId;
  cardId: string;
}

export interface AttackAction {
  type: "attack";
  playerId: PlayerId;
  attackerIndex: number;
  targetType: AttackTarget;
  targetIndex?: number;
}

export interface PhaseAction {
  type: "advance_phase";
  playerId: PlayerId;
}

export type GameAction = SummonAction | AttackAction | PhaseAction;

// Game Results & Responses
export interface SummonResult {
  success: boolean;
  waifusOnField: number;
  maxFieldSize: number;
  error?: string;
  instanceId?: string;
}

export interface CombatResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerSurvived: boolean;
  defenderSurvived: boolean;
  directPlayerDamage?: number;
  description: string;
}

export interface GameError {
  code: string;
  message: string;
  suggestion: string;
}
