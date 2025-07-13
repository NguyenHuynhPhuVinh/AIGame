import {
  GameState,
  PlayerPosition,
  CardInstance,
  FieldZone,
  getCardById,
  MonsterCard,
} from "../../database/index.js";

export class SummoningManager {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Normal Summon a monster from hand
   */
  normalSummon(
    playerId: PlayerPosition,
    cardId: string,
    position: "attack" | "defense" = "attack"
  ): { success: boolean; message: string; instanceId?: string } {
    const player = this.gameState.players[playerId];
    const card = getCardById(cardId);

    // Validation checks
    if (!card || card.cardType !== "monster") {
      return { success: false, message: "Invalid monster card" };
    }

    if (!player) {
      return { success: false, message: "Invalid player" };
    }

    if (!player.hand.includes(cardId)) {
      return { success: false, message: "Card not in hand" };
    }

    if (player.hasNormalSummoned) {
      return { success: false, message: "Already normal summoned this turn" };
    }

    const monsterCard = card as MonsterCard;

    // Check if tribute is required (Level 5+ monsters)
    if (monsterCard.level >= 5) {
      const tributesRequired = monsterCard.level >= 7 ? 2 : 1;
      const availableTributes = this.getAvailableTributes(playerId);

      if (availableTributes.length < tributesRequired) {
        return {
          success: false,
          message: `Need ${tributesRequired} tribute(s) for Level ${monsterCard.level} monster`,
        };
      }
    }

    // Find empty monster zone
    const emptyZone = this.findEmptyMonsterZone(playerId);
    if (!emptyZone) {
      return { success: false, message: "No empty monster zones" };
    }

    // Perform tributes if required
    if (monsterCard.level >= 5) {
      const tributesRequired = monsterCard.level >= 7 ? 2 : 1;
      const tributes = this.getAvailableTributes(playerId).slice(
        0,
        tributesRequired
      );

      for (const tributeId of tributes) {
        this.sendToGraveyard(tributeId);
      }
    }

    // Create card instance
    const instanceId = `${cardId}_${Date.now()}`;
    const cardInstance: CardInstance = {
      instanceId,
      cardId,
      ownerId: playerId,
      controllerId: playerId,
      zone: "field",
      fieldZone: emptyZone,
      position,
      isFaceUp: true,
      counters: {},
      equipCards: [],
      isDestroyed: false,
      turnSummoned: this.gameState.turnNumber,
      hasAttacked: false,
      canAttack: position === "attack",
      canChangePosition: false, // Can't change position on summon turn
    };

    // Update game state
    this.gameState.cardInstances[instanceId] = cardInstance;
    player.hand = player.hand.filter((id) => id !== cardId);
    player.field[emptyZone] = instanceId;
    player.hasNormalSummoned = true;

    // Add to game log
    this.gameState.gameLog.push({
      id: `summon_${Date.now()}`,
      playerId,
      actionType: "normal_summon",
      timestamp: new Date().toISOString(),
      description: `${player.name} Normal Summoned ${monsterCard.name} in ${position} position`,
      cardId,
      toZone: "field",
      toFieldZone: emptyZone,
      processed: true,
      metadata: { position, level: monsterCard.level },
    });

    return {
      success: true,
      message: `Successfully summoned ${monsterCard.name}`,
      instanceId,
    };
  }

  /**
   * Set a monster face-down in defense position
   */
  setMonster(
    playerId: PlayerPosition,
    cardId: string
  ): { success: boolean; message: string; instanceId?: string } {
    const player = this.gameState.players[playerId];
    const card = getCardById(cardId);

    // Validation checks
    if (!card || card.cardType !== "monster") {
      return { success: false, message: "Invalid monster card" };
    }

    if (!player) {
      return { success: false, message: "Invalid player" };
    }

    if (!player.hand.includes(cardId)) {
      return { success: false, message: "Card not in hand" };
    }

    if (player.hasNormalSummoned) {
      return { success: false, message: "Already normal summoned this turn" };
    }

    // Find empty monster zone
    const emptyZone = this.findEmptyMonsterZone(playerId);
    if (!emptyZone) {
      return { success: false, message: "No empty monster zones" };
    }

    // Create card instance
    const instanceId = `${cardId}_${Date.now()}`;
    const cardInstance: CardInstance = {
      instanceId,
      cardId,
      ownerId: playerId,
      controllerId: playerId,
      zone: "field",
      fieldZone: emptyZone,
      position: "face_down_defense",
      isFaceUp: false,
      counters: {},
      equipCards: [],
      isDestroyed: false,
      turnSummoned: this.gameState.turnNumber,
      hasAttacked: false,
      canAttack: false,
      canChangePosition: false,
    };

    // Update game state
    this.gameState.cardInstances[instanceId] = cardInstance;
    player.hand = player.hand.filter((id) => id !== cardId);
    player.field[emptyZone] = instanceId;
    player.hasNormalSummoned = true;

    // Add to game log
    this.gameState.gameLog.push({
      id: `set_${Date.now()}`,
      playerId,
      actionType: "set_monster",
      timestamp: new Date().toISOString(),
      description: `${player.name} Set a monster face-down`,
      cardId,
      toZone: "field",
      toFieldZone: emptyZone,
      processed: true,
      metadata: { position: "face_down_defense" },
    });

    return {
      success: true,
      message: "Successfully set monster face-down",
      instanceId,
    };
  }

  /**
   * Find empty monster zone for a player
   */
  private findEmptyMonsterZone(playerId: PlayerPosition): FieldZone | null {
    const player = this.gameState.players[playerId];
    if (!player) return null;

    const monsterZones: FieldZone[] = [
      "monster_1",
      "monster_2",
      "monster_3",
      "monster_4",
      "monster_5",
    ];

    for (const zone of monsterZones) {
      if (!player.field[zone]) {
        return zone;
      }
    }

    return null;
  }

  /**
   * Get available monsters for tribute
   */
  private getAvailableTributes(playerId: PlayerPosition): string[] {
    const player = this.gameState.players[playerId];
    if (!player) return [];

    const tributes: string[] = [];

    Object.entries(player.field).forEach(([zone, instanceId]) => {
      if (instanceId && zone.startsWith("monster_")) {
        const instance = this.gameState.cardInstances[instanceId];
        if (instance && instance.controllerId === playerId) {
          tributes.push(instanceId);
        }
      }
    });

    return tributes;
  }

  /**
   * Send a card instance to graveyard
   */
  private sendToGraveyard(instanceId: string): void {
    const instance = this.gameState.cardInstances[instanceId];
    if (!instance) return;

    const owner = this.gameState.players[instance.ownerId];
    if (!owner) return;

    // Remove from field
    if (instance.fieldZone) {
      owner.field[instance.fieldZone] = undefined;
    }

    // Add to graveyard
    owner.graveyard.push(instance.cardId);

    // Update instance
    instance.zone = "graveyard";
    instance.fieldZone = undefined;
    instance.isDestroyed = true;

    // Add to game log
    this.gameState.gameLog.push({
      id: `tribute_${Date.now()}`,
      playerId: instance.controllerId,
      actionType: "tribute",
      timestamp: new Date().toISOString(),
      description: `${owner.name} tributed a monster`,
      cardId: instance.cardId,
      fromZone: "field",
      toZone: "graveyard",
      processed: true,
      metadata: {},
    });
  }

  /**
   * Flip summon a face-down monster
   */
  flipSummon(
    playerId: PlayerPosition,
    instanceId: string
  ): { success: boolean; message: string } {
    const instance = this.gameState.cardInstances[instanceId];
    const player = this.gameState.players[playerId];

    if (!instance || instance.controllerId !== playerId) {
      return { success: false, message: "Invalid monster" };
    }

    if (!player) {
      return { success: false, message: "Invalid player" };
    }

    if (instance.position !== "face_down_defense") {
      return { success: false, message: "Monster is not face-down" };
    }

    if (!instance.canChangePosition) {
      return { success: false, message: "Cannot change position this turn" };
    }

    // Flip the monster
    instance.isFaceUp = true;
    instance.position = "attack";
    instance.canChangePosition = false;

    const card = getCardById(instance.cardId) as MonsterCard;

    // Add to game log
    this.gameState.gameLog.push({
      id: `flip_${Date.now()}`,
      playerId,
      actionType: "flip_summon",
      timestamp: new Date().toISOString(),
      description: `${player.name} Flip Summoned ${card.name}`,
      cardId: instance.cardId,
      processed: true,
      metadata: { attack: card.attack, defense: card.defense },
    });

    return {
      success: true,
      message: `Successfully flip summoned ${card.name}`,
    };
  }
}
