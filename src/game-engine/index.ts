// Export all game engine components
export * from "./phases/gamePhases.js";
export * from "./mechanics/summoning.js";
export * from "./mechanics/battle.js";

// Main Game Engine class
import {
  GameState,
  PlayerPosition,
  GameAction,
  createRandomDeck,
} from "../database/index.js";
import { GamePhaseManager } from "./phases/gamePhases.js";
import { SummoningManager } from "./mechanics/summoning.js";
import { BattleManager } from "./mechanics/battle.js";

export class YuGiOhGameEngine {
  private gameState: GameState;
  private phaseManager: GamePhaseManager;
  private summoningManager: SummoningManager;
  private battleManager: BattleManager;

  constructor(gameState?: GameState) {
    this.gameState = gameState || this.createNewGame();
    this.phaseManager = new GamePhaseManager(this.gameState);
    this.summoningManager = new SummoningManager(this.gameState);
    this.battleManager = new BattleManager(this.gameState);
  }

  /**
   * Create a new game state
   */
  createNewGame(): GameState {
    const gameId = `yugioh_${Date.now()}`;
    const now = new Date().toISOString();

    // Create decks for both players
    const player1Deck = createRandomDeck(40);
    const player2Deck = createRandomDeck(40);

    // Initial hands (5 cards each)
    const player1Hand = player1Deck.splice(0, 5);
    const player2Hand = player2Deck.splice(0, 5);

    const gameState: GameState = {
      gameId,
      players: {
        player1: {
          id: "player1",
          name: "Player 1",
          lifePoints: 8000,
          deck: player1Deck,
          hand: player1Hand,
          field: {},
          graveyard: [],
          banished: [],
          extraDeck: [],
          isReady: false,
          hasNormalSummoned: false,
          canDrawCard: true,
        },
        player2: {
          id: "player2",
          name: "AI Duelist",
          lifePoints: 8000,
          deck: player2Deck,
          hand: player2Hand,
          field: {},
          graveyard: [],
          banished: [],
          extraDeck: [],
          isReady: false,
          hasNormalSummoned: false,
          canDrawCard: true,
        },
      },
      cardInstances: {},
      currentPlayer: "player1",
      currentPhase: "draw",
      turnNumber: 1,
      gameStatus: "playing",
      gameLog: [],
      chainStack: [],
      pendingActions: [],
      createdAt: now,
      updatedAt: now,
      metadata: {},
    };

    return gameState;
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Update game state
   */
  updateGameState(newState: GameState): void {
    this.gameState = newState;
    this.phaseManager = new GamePhaseManager(this.gameState);
    this.summoningManager = new SummoningManager(this.gameState);
    this.battleManager = new BattleManager(this.gameState);
  }

  /**
   * Process a game action
   */
  processAction(action: GameAction): {
    success: boolean;
    message: string;
    result?: any;
  } {
    try {
      switch (action.actionType) {
        case "advance_phase":
          return this.advancePhase();

        case "normal_summon":
          if (!action.cardId) {
            return {
              success: false,
              message: "Card ID required for normal summon",
            };
          }
          return this.summoningManager.normalSummon(
            action.playerId,
            action.cardId,
            action.metadata?.position || "attack"
          );

        case "set_monster":
          if (!action.cardId) {
            return {
              success: false,
              message: "Card ID required for set monster",
            };
          }
          return this.summoningManager.setMonster(
            action.playerId,
            action.cardId
          );

        case "flip_summon":
          if (!action.targetCardId) {
            return {
              success: false,
              message: "Target card ID required for flip summon",
            };
          }
          return this.summoningManager.flipSummon(
            action.playerId,
            action.targetCardId
          );

        case "declare_attack":
          if (!action.cardId) {
            return { success: false, message: "Attacker card ID required" };
          }
          const result = this.battleManager.declareAttack(
            action.cardId,
            action.targetCardId
          );
          return { success: result.success, message: result.message, result };

        case "change_position":
          if (!action.targetCardId || !action.metadata?.position) {
            return {
              success: false,
              message: "Target card ID and position required",
            };
          }
          return this.battleManager.changePosition(
            action.playerId,
            action.targetCardId,
            action.metadata.position
          );

        default:
          return {
            success: false,
            message: `Unknown action type: ${action.actionType}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error processing action: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Advance to next phase
   */
  private advancePhase(): { success: boolean; message: string } {
    if (!this.phaseManager.canAdvancePhase()) {
      return { success: false, message: "Cannot advance phase at this time" };
    }

    const nextPhase = this.phaseManager.nextPhase();
    this.phaseManager.executePhaseActions();

    return {
      success: true,
      message: `Advanced to ${nextPhase} phase`,
    };
  }

  /**
   * Get available actions for current player and phase
   */
  getAvailableActions(): string[] {
    return this.phaseManager.getAvailableActions();
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.gameState.gameStatus === "finished";
  }

  /**
   * Get winner if game is over
   */
  getWinner(): PlayerPosition | undefined {
    return this.gameState.winner;
  }

  /**
   * Get current player
   */
  getCurrentPlayer(): PlayerPosition {
    return this.gameState.currentPlayer;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): string {
    return this.gameState.currentPhase;
  }

  /**
   * Get game summary for display
   */
  getGameSummary(): {
    gameId: string;
    currentPlayer: string;
    currentPhase: string;
    turnNumber: number;
    gameStatus: string;
    players: {
      [key: string]: {
        name: string;
        lifePoints: number;
        handSize: number;
        deckSize: number;
        fieldMonsters: number;
        graveyardSize: number;
      };
    };
  } {
    const summary = {
      gameId: this.gameState.gameId,
      currentPlayer: this.gameState.currentPlayer,
      currentPhase: this.gameState.currentPhase,
      turnNumber: this.gameState.turnNumber,
      gameStatus: this.gameState.gameStatus,
      players: {} as any,
    };

    Object.entries(this.gameState.players).forEach(([playerId, player]) => {
      const fieldMonsters = Object.values(player.field).filter((instanceId) => {
        if (!instanceId) return false;
        const instance = this.gameState.cardInstances[instanceId];
        return instance && instance.fieldZone?.startsWith("monster_");
      }).length;

      summary.players[playerId] = {
        name: player.name,
        lifePoints: player.lifePoints,
        handSize: player.hand.length,
        deckSize: player.deck.length,
        fieldMonsters,
        graveyardSize: player.graveyard.length,
      };
    });

    return summary;
  }
}
