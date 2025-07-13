// Game Types & Interfaces - AI-Driven Architecture

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

export interface Modifier {
  id: string;
  name: string;
  type: "attack" | "defense" | "charm" | "hp";
  value: number;
  duration: number; // -1 for permanent
  source: string;
}

export interface WaifuInstance {
  instanceId: string;
  cardId: string;
  ownerId: string;
  position: number;
  status: "summoning_sickness" | "ready" | "tapped" | "stunned";
  currentHP?: number; // If different from base
  modifiers: Modifier[];
  summonedTurn: number;
}

export interface CardInstance {
  instanceId: string;
  cardId: string;
  ownerId: string;
  location: "hand" | "deck" | "field" | "graveyard";
  position?: number;
}

// Core State Interfaces
export interface GameState {
  gameId: string;
  status: "waiting" | "playing" | "finished";
  currentPlayer: "player1" | "player2";
  turnNumber: number;
  phase: "draw" | "main" | "battle" | "end";
  winner?: "player1" | "player2" | "draw";
  createdAt: string;
  lastUpdated: string;
}

export interface PlayerState {
  playerId: string;
  name: string;
  hp: number;
  mana: number;
  maxMana: number;
  handSize: number;
  deckSize: number;
  fieldSize: number;
  graveyardSize: number;
}

export interface FieldState {
  player1Field: WaifuInstance[];
  player2Field: WaifuInstance[];
  maxFieldSize: number;
}

export interface CardState {
  player1Hand: CardInstance[];
  player2Hand: CardInstance[];
  player1Deck: CardInstance[];
  player2Deck: CardInstance[];
  player1Graveyard: CardInstance[];
  player2Graveyard: CardInstance[];
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  playerId: string;
  action: string;
  description: string;
  details: any;
}

export interface HistoryState {
  gameLog: GameLogEntry[];
  lastAction: string;
}

// Type aliases
export type PlayerId = "player1" | "player2";
export type GamePhase = "draw" | "main" | "battle" | "end";
export type CardLocation = "hand" | "deck" | "field" | "graveyard";
export type WaifuStatus = "summoning_sickness" | "ready" | "tapped" | "stunned";

// MCP Tool Parameters
export interface UpdateGamePhaseParams {
  phase: GamePhase;
  currentPlayer?: PlayerId;
  turnNumber?: number;
}

export interface UpdatePlayerStatsParams {
  playerId: PlayerId;
  hp?: number;
  mana?: number;
  maxMana?: number;
}

export interface MoveCardParams {
  cardInstanceId: string;
  fromLocation: CardLocation;
  toLocation: CardLocation;
  position?: number;
}

export interface SummonWaifuParams {
  cardInstanceId: string;
  playerId: PlayerId;
  position: number;
  status?: WaifuStatus;
}

export interface UpdateWaifuStatusParams {
  waifuInstanceId: string;
  status?: WaifuStatus;
  currentHP?: number;
  modifiers?: Modifier[];
}

export interface RemoveWaifuParams {
  waifuInstanceId: string;
  reason: "destroyed" | "returned" | "sacrificed";
}

export interface AddGameLogParams {
  playerId: string;
  action: string;
  description: string;
  details?: any;
}
