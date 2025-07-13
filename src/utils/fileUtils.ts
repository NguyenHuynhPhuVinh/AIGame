import fs from "fs/promises";
import path from "path";
import { GameState, WaifuCard } from '../types/game.js';
import { WAIFU_CARDS } from '../data/cards.js';

// File paths
export const GAME_STATE_FILE = path.join(process.cwd(), "waifu_game_state.json");
export const CARDS_FILE = path.join(process.cwd(), "waifu_cards.json");

// Game State file operations
export async function loadGameState(): Promise<GameState | null> {
  try {
    const data = await fs.readFile(GAME_STATE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function saveGameState(gameState: GameState): Promise<void> {
  await fs.writeFile(
    GAME_STATE_FILE,
    JSON.stringify(gameState, null, 2),
    "utf-8"
  );
}

export async function gameStateExists(): Promise<boolean> {
  try {
    await fs.access(GAME_STATE_FILE);
    return true;
  } catch {
    return false;
  }
}

// Cards file operations
export async function loadCards(): Promise<WaifuCard[]> {
  try {
    const data = await fs.readFile(CARDS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default cards
    return WAIFU_CARDS;
  }
}

export async function saveCards(cards: WaifuCard[]): Promise<void> {
  await fs.writeFile(
    CARDS_FILE,
    JSON.stringify(cards, null, 2),
    "utf-8"
  );
}

// Backup and restore
export async function backupGameState(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(process.cwd(), `waifu_game_backup_${timestamp}.json`);
  
  const gameState = await loadGameState();
  if (gameState) {
    await fs.writeFile(backupFile, JSON.stringify(gameState, null, 2), "utf-8");
    return backupFile;
  }
  
  throw new Error("No game state to backup");
}

export async function restoreGameState(backupFile: string): Promise<void> {
  const data = await fs.readFile(backupFile, "utf-8");
  const gameState = JSON.parse(data);
  await saveGameState(gameState);
}

// Cleanup utilities
export async function cleanupGameFiles(): Promise<void> {
  try {
    await fs.unlink(GAME_STATE_FILE);
  } catch {
    // File doesn't exist, ignore
  }
  
  try {
    await fs.unlink(CARDS_FILE);
  } catch {
    // File doesn't exist, ignore
  }
}

// File watching (for future use)
export function watchGameState(callback: (gameState: GameState) => void): void {
  // Implementation for watching game state changes
  // This could be used for real-time updates
}
