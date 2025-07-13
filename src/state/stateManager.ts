// Pure State Management - AI-Driven Architecture
import fs from "fs/promises";
import path from "path";
import {
  GameState,
  PlayerState,
  FieldState,
  CardState,
  HistoryState,
  PlayerId,
  GamePhase,
  CardInstance,
  WaifuInstance,
  GameLogEntry,
} from "../types/game.js";

// File paths for state persistence
const STATE_DIR = path.join(process.cwd(), "game_state");
const GAME_STATE_FILE = path.join(STATE_DIR, "game.json");
const PLAYER_STATE_FILE = path.join(STATE_DIR, "players.json");
const FIELD_STATE_FILE = path.join(STATE_DIR, "field.json");
const CARD_STATE_FILE = path.join(STATE_DIR, "cards.json");
const HISTORY_STATE_FILE = path.join(STATE_DIR, "history.json");

export class StateManager {
  // Initialize state directory
  static async initializeStateDirectory(): Promise<void> {
    try {
      await fs.mkdir(STATE_DIR, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore
    }
  }

  // Game State Management
  static async loadGameState(): Promise<GameState | null> {
    try {
      const data = await fs.readFile(GAME_STATE_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  static async saveGameState(gameState: GameState): Promise<void> {
    await this.initializeStateDirectory();
    gameState.lastUpdated = new Date().toISOString();
    await fs.writeFile(GAME_STATE_FILE, JSON.stringify(gameState, null, 2));
  }

  // Player State Management
  static async loadPlayerStates(): Promise<{ player1: PlayerState; player2: PlayerState } | null> {
    try {
      const data = await fs.readFile(PLAYER_STATE_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  static async savePlayerStates(players: { player1: PlayerState; player2: PlayerState }): Promise<void> {
    await this.initializeStateDirectory();
    await fs.writeFile(PLAYER_STATE_FILE, JSON.stringify(players, null, 2));
  }

  static async updatePlayerState(playerId: PlayerId, updates: Partial<PlayerState>): Promise<void> {
    const players = await this.loadPlayerStates();
    if (players) {
      players[playerId] = { ...players[playerId], ...updates };
      await this.savePlayerStates(players);
    }
  }

  // Field State Management
  static async loadFieldState(): Promise<FieldState | null> {
    try {
      const data = await fs.readFile(FIELD_STATE_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  static async saveFieldState(fieldState: FieldState): Promise<void> {
    await this.initializeStateDirectory();
    await fs.writeFile(FIELD_STATE_FILE, JSON.stringify(fieldState, null, 2));
  }

  static async addWaifuToField(playerId: PlayerId, waifu: WaifuInstance): Promise<void> {
    const fieldState = await this.loadFieldState();
    if (fieldState) {
      if (playerId === 'player1') {
        fieldState.player1Field.push(waifu);
      } else {
        fieldState.player2Field.push(waifu);
      }
      await this.saveFieldState(fieldState);
    }
  }

  static async removeWaifuFromField(waifuInstanceId: string): Promise<void> {
    const fieldState = await this.loadFieldState();
    if (fieldState) {
      fieldState.player1Field = fieldState.player1Field.filter(w => w.instanceId !== waifuInstanceId);
      fieldState.player2Field = fieldState.player2Field.filter(w => w.instanceId !== waifuInstanceId);
      await this.saveFieldState(fieldState);
    }
  }

  // Card State Management
  static async loadCardState(): Promise<CardState | null> {
    try {
      const data = await fs.readFile(CARD_STATE_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  static async saveCardState(cardState: CardState): Promise<void> {
    await this.initializeStateDirectory();
    await fs.writeFile(CARD_STATE_FILE, JSON.stringify(cardState, null, 2));
  }

  static async moveCard(cardInstanceId: string, fromLocation: string, toLocation: string, playerId: PlayerId): Promise<void> {
    const cardState = await this.loadCardState();
    if (!cardState) return;

    // Find and remove card from source
    let card: CardInstance | undefined;
    const sourceKey = `${playerId}${fromLocation.charAt(0).toUpperCase() + fromLocation.slice(1)}` as keyof CardState;
    const targetKey = `${playerId}${toLocation.charAt(0).toUpperCase() + toLocation.slice(1)}` as keyof CardState;

    const sourceArray = cardState[sourceKey] as CardInstance[];
    const targetArray = cardState[targetKey] as CardInstance[];

    const cardIndex = sourceArray.findIndex(c => c.instanceId === cardInstanceId);
    if (cardIndex !== -1) {
      card = sourceArray.splice(cardIndex, 1)[0];
      card.location = toLocation as any;
      targetArray.push(card);
      await this.saveCardState(cardState);
    }
  }

  // History State Management
  static async loadHistoryState(): Promise<HistoryState | null> {
    try {
      const data = await fs.readFile(HISTORY_STATE_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  static async saveHistoryState(historyState: HistoryState): Promise<void> {
    await this.initializeStateDirectory();
    await fs.writeFile(HISTORY_STATE_FILE, JSON.stringify(historyState, null, 2));
  }

  static async addGameLogEntry(entry: GameLogEntry): Promise<void> {
    const historyState = await this.loadHistoryState();
    if (historyState) {
      historyState.gameLog.push(entry);
      historyState.lastAction = entry.description;
      await this.saveHistoryState(historyState);
    }
  }

  // Utility methods
  static async getAllStates(): Promise<{
    game: GameState | null;
    players: { player1: PlayerState; player2: PlayerState } | null;
    field: FieldState | null;
    cards: CardState | null;
    history: HistoryState | null;
  }> {
    return {
      game: await this.loadGameState(),
      players: await this.loadPlayerStates(),
      field: await this.loadFieldState(),
      cards: await this.loadCardState(),
      history: await this.loadHistoryState(),
    };
  }

  static async clearAllStates(): Promise<void> {
    try {
      await fs.rm(STATE_DIR, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, ignore
    }
  }

  static async backupStates(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), `game_backup_${timestamp}`);
    
    await fs.mkdir(backupDir, { recursive: true });
    
    try {
      await fs.cp(STATE_DIR, backupDir, { recursive: true });
      return backupDir;
    } catch (error) {
      throw new Error(`Failed to backup states: ${error}`);
    }
  }

  static async restoreStates(backupDir: string): Promise<void> {
    try {
      await this.clearAllStates();
      await fs.cp(backupDir, STATE_DIR, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to restore states: ${error}`);
    }
  }
}
