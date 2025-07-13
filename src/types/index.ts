/**
 * Các kiểu dữ liệu được sử dụng trong ứng dụng
 */

/**
 * Kiểu dữ liệu cho mục ví dụ
 */
export interface Example {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

/**
 * Kiểu dữ liệu cho kết quả tìm kiếm ví dụ
 */
export interface SearchResult {
  id: number;
  name: string;
  relevance: number;
}

/**
 * Kiểu dữ liệu cho cấu hình API
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
}

/**
 * Kiểu dữ liệu cho game Kéo Búa Bao
 */
export interface RockPaperScissorsGame {
  gameId: string;
  players: {
    player1: Player;
    player2: Player;
  };
  currentRound: number;
  maxRounds: number;
  gameStatus: "waiting" | "playing" | "finished";
  rounds: GameRound[];
  winner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  currentChoice?: "rock" | "paper" | "scissors";
  isReady: boolean;
}

export interface GameRound {
  roundNumber: number;
  player1Choice: "rock" | "paper" | "scissors";
  player2Choice: "rock" | "paper" | "scissors";
  winner: string | "tie";
  timestamp: string;
}

/**
 * Kiểu dữ liệu cho cập nhật game state
 */
export interface GameStateUpdate {
  gameId: string;
  action: string;
  playerAction?: {
    playerId: string;
    choice?: "rock" | "paper" | "scissors";
    data?: any;
  };
  description: string;
}

/**
 * Card Game Types - Game thẻ bài phức tạp
 */
export interface Card {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cardType: "spell" | "creature" | "artifact";
  attack?: number;
  defense?: number;
  effect: string; // Mô tả effect để AI hiểu
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface CardGamePlayer {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  deck: Card[];
  hand: Card[];
  playedCards: Card[];
  isReady: boolean;
}

export interface CardGameState {
  gameId: string;
  players: {
    player1: CardGamePlayer;
    player2: CardGamePlayer;
  };
  currentTurn: "player1" | "player2";
  turnNumber: number;
  gamePhase: "setup" | "playing" | "finished";
  winner?: string;
  gameLog: GameLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface GameLogEntry {
  timestamp: string;
  playerId: string;
  action: string;
  cardUsed?: Card;
  effect: string;
  hpChange?: number;
  manaChange?: number;
}

export interface CardAction {
  timestamp: string;
  playerId: string;
  actionType: "play_card" | "end_turn" | "surrender";
  cardId?: string;
  targetPlayerId?: string;
  description: string;
  processed: boolean;
}
