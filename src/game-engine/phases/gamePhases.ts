import { GameState, GamePhase, PlayerPosition } from "../../database/index.js";

export class GamePhaseManager {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Advance to the next phase
   */
  nextPhase(): GamePhase {
    const currentPhase = this.gameState.currentPhase;
    let nextPhase: GamePhase;

    switch (currentPhase) {
      case "draw":
        nextPhase = "standby";
        break;
      case "standby":
        nextPhase = "main1";
        break;
      case "main1":
        nextPhase = "battle";
        break;
      case "battle":
        nextPhase = "main2";
        break;
      case "main2":
        nextPhase = "end";
        break;
      case "end":
        // End turn, switch to opponent's draw phase
        this.switchTurn();
        nextPhase = "draw";
        break;
      default:
        nextPhase = "draw";
    }

    this.gameState.currentPhase = nextPhase;
    this.gameState.updatedAt = new Date().toISOString();

    return nextPhase;
  }

  /**
   * Switch to the other player's turn
   */
  private switchTurn(): void {
    this.gameState.currentPlayer =
      this.gameState.currentPlayer === "player1" ? "player2" : "player1";
    this.gameState.turnNumber += 1;

    // Reset turn-specific flags
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    if (currentPlayer) {
      currentPlayer.hasNormalSummoned = false;
      currentPlayer.canDrawCard = true;
    }

    // Reset monster attack flags
    Object.values(this.gameState.cardInstances).forEach((instance) => {
      if (
        instance.controllerId === this.gameState.currentPlayer &&
        instance.zone === "field" &&
        instance.fieldZone?.startsWith("monster_")
      ) {
        instance.hasAttacked = false;
        instance.canAttack = true;
        instance.canChangePosition = true;
      }
    });
  }

  /**
   * Check if a phase transition is valid
   */
  canAdvancePhase(): boolean {
    const currentPhase = this.gameState.currentPhase;

    // Can't advance from battle phase if there are pending attacks
    if (currentPhase === "battle") {
      return !this.hasPendingAttacks();
    }

    // Can't advance if there are pending chain resolutions
    if (this.gameState.chainStack.length > 0) {
      return false;
    }

    return true;
  }

  /**
   * Check if there are pending attacks in battle phase
   */
  private hasPendingAttacks(): boolean {
    const currentPlayer = this.gameState.currentPlayer;

    return Object.values(this.gameState.cardInstances).some(
      (instance) =>
        instance.controllerId === currentPlayer &&
        instance.zone === "field" &&
        instance.fieldZone?.startsWith("monster_") &&
        instance.canAttack &&
        !instance.hasAttacked &&
        instance.position === "attack"
    );
  }

  /**
   * Execute phase-specific actions
   */
  executePhaseActions(): void {
    const currentPhase = this.gameState.currentPhase;
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];

    switch (currentPhase) {
      case "draw":
        this.executeDrawPhase();
        break;
      case "standby":
        this.executeStandbyPhase();
        break;
      case "main1":
        this.executeMainPhase();
        break;
      case "battle":
        this.executeBattlePhase();
        break;
      case "main2":
        this.executeMainPhase();
        break;
      case "end":
        this.executeEndPhase();
        break;
    }
  }

  private executeDrawPhase(): void {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    if (!currentPlayer) return;

    // Skip draw on first turn for player going first
    if (
      this.gameState.turnNumber === 1 &&
      this.gameState.currentPlayer === "player1"
    ) {
      return;
    }

    // Draw a card if deck is not empty
    if (currentPlayer.deck.length > 0 && currentPlayer.canDrawCard) {
      const drawnCard = currentPlayer.deck.shift()!;
      currentPlayer.hand.push(drawnCard);
      currentPlayer.canDrawCard = false;

      this.gameState.gameLog.push({
        id: `draw_${Date.now()}`,
        playerId: this.gameState.currentPlayer,
        actionType: "draw_card",
        timestamp: new Date().toISOString(),
        description: `${currentPlayer.name} drew a card`,
        cardId: drawnCard,
        processed: true,
        metadata: {},
      });
    }
  }

  private executeStandbyPhase(): void {
    // Execute standby phase effects
    // This is where continuous effects and standby triggers would activate
  }

  private executeMainPhase(): void {
    // Main phase - player can summon monsters, activate spells, set traps
    // This is handled by player actions, not automatic
  }

  private executeBattlePhase(): void {
    // Battle phase - handle automatic battle calculations
    // Most battle actions are player-initiated
  }

  private executeEndPhase(): void {
    // End phase - cleanup effects, end of turn triggers
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    if (!currentPlayer) return;

    // Check hand size limit (normally 6 in Yu-Gi-Oh)
    if (currentPlayer.hand.length > 6) {
      // Player must discard down to 6 cards
      // This would trigger a player action to choose which cards to discard
    }
  }

  /**
   * Get available actions for current phase
   */
  getAvailableActions(): string[] {
    const currentPhase = this.gameState.currentPhase;
    const actions: string[] = [];

    switch (currentPhase) {
      case "draw":
        actions.push("advance_phase");
        break;
      case "standby":
        actions.push("advance_phase");
        break;
      case "main1":
        actions.push(
          "normal_summon",
          "set_monster",
          "activate_spell",
          "set_spell_trap",
          "advance_phase"
        );
        break;
      case "battle":
        actions.push("declare_attack", "advance_phase");
        break;
      case "main2":
        actions.push(
          "normal_summon",
          "set_monster",
          "activate_spell",
          "set_spell_trap",
          "advance_phase"
        );
        break;
      case "end":
        actions.push("advance_phase");
        break;
    }

    return actions;
  }
}
