import {
  GameState,
  PlayerPosition,
  CardInstance,
  getCardById,
  MonsterCard,
} from "../../database/index.js";

export interface BattleResult {
  success: boolean;
  message: string;
  damage?: number;
  destroyedCards?: string[];
  battleOutcome?: "attacker_wins" | "defender_wins" | "draw";
}

export class BattleManager {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Declare an attack with a monster
   */
  declareAttack(attackerId: string, targetId?: string): BattleResult {
    const attacker = this.gameState.cardInstances[attackerId];

    if (!attacker) {
      return { success: false, message: "Invalid attacker" };
    }

    // Validation checks
    const validationResult = this.validateAttack(attacker);
    if (!validationResult.success) {
      return validationResult;
    }

    // Direct attack if no target specified
    if (!targetId) {
      return this.directAttack(attacker);
    }

    // Attack target monster
    const target = this.gameState.cardInstances[targetId];
    if (!target) {
      return { success: false, message: "Invalid target" };
    }

    return this.monsterBattle(attacker, target);
  }

  /**
   * Validate if an attack can be declared
   */
  private validateAttack(attacker: CardInstance): BattleResult {
    // Check if it's battle phase
    if (this.gameState.currentPhase !== "battle") {
      return { success: false, message: "Not in battle phase" };
    }

    // Check if attacker is controlled by current player
    if (attacker.controllerId !== this.gameState.currentPlayer) {
      return { success: false, message: "Not your monster" };
    }

    // Check if monster is in attack position
    if (attacker.position !== "attack") {
      return { success: false, message: "Monster must be in attack position" };
    }

    // Check if monster can attack
    if (!attacker.canAttack || attacker.hasAttacked) {
      return { success: false, message: "Monster cannot attack" };
    }

    // Check if monster was summoned this turn
    if (attacker.turnSummoned === this.gameState.turnNumber) {
      return { success: false, message: "Cannot attack on summon turn" };
    }

    return { success: true, message: "Attack is valid" };
  }

  /**
   * Execute direct attack on opponent
   */
  private directAttack(attacker: CardInstance): BattleResult {
    const attackerCard = getCardById(attacker.cardId) as MonsterCard;
    const opponent = this.getOpponent(attacker.controllerId);

    if (!opponent) {
      return { success: false, message: "Invalid opponent" };
    }

    // Check if opponent has monsters that can be attacked
    if (this.hasAttackableMonsters(opponent.id)) {
      return {
        success: false,
        message: "Cannot attack directly while opponent has monsters",
      };
    }

    // Deal damage
    const damage = attackerCard.attack;
    opponent.lifePoints -= damage;
    attacker.hasAttacked = true;

    // Add to game log
    this.gameState.gameLog.push({
      id: `direct_attack_${Date.now()}`,
      playerId: attacker.controllerId,
      actionType: "direct_attack",
      timestamp: new Date().toISOString(),
      description: `${attackerCard.name} attacks directly for ${damage} damage`,
      cardId: attacker.cardId,
      targetPlayerId: opponent.id,
      damage,
      processed: true,
      metadata: {},
    });

    // Check for game over
    if (opponent.lifePoints <= 0) {
      this.gameState.gameStatus = "finished";
      this.gameState.winner = attacker.controllerId;
    }

    return {
      success: true,
      message: `Direct attack successful! ${damage} damage dealt`,
      damage,
      battleOutcome: "attacker_wins",
    };
  }

  /**
   * Execute battle between two monsters
   */
  private monsterBattle(
    attacker: CardInstance,
    defender: CardInstance
  ): BattleResult {
    const attackerCard = getCardById(attacker.cardId) as MonsterCard;
    const defenderCard = getCardById(defender.cardId) as MonsterCard;

    const attackerPlayer = this.gameState.players[attacker.controllerId];
    const defenderPlayer = this.gameState.players[defender.controllerId];

    if (!attackerPlayer || !defenderPlayer) {
      return { success: false, message: "Invalid players" };
    }

    let battleOutcome: "attacker_wins" | "defender_wins" | "draw";
    let damage = 0;
    const destroyedCards: string[] = [];
    let message = "";

    // Calculate battle
    if (
      defender.position === "attack" ||
      defender.position === "face_down_attack"
    ) {
      // Attack vs Attack
      if (attackerCard.attack > defenderCard.attack) {
        battleOutcome = "attacker_wins";
        damage = attackerCard.attack - defenderCard.attack;
        defenderPlayer.lifePoints -= damage;
        destroyedCards.push(defender.instanceId);
        message = `${attackerCard.name} destroys ${defenderCard.name}! ${damage} damage dealt`;
      } else if (attackerCard.attack < defenderCard.attack) {
        battleOutcome = "defender_wins";
        damage = defenderCard.attack - attackerCard.attack;
        attackerPlayer.lifePoints -= damage;
        destroyedCards.push(attacker.instanceId);
        message = `${defenderCard.name} destroys ${attackerCard.name}! ${damage} damage dealt`;
      } else {
        battleOutcome = "draw";
        destroyedCards.push(attacker.instanceId, defender.instanceId);
        message = `Both monsters are destroyed in battle!`;
      }
    } else {
      // Attack vs Defense
      if (attackerCard.attack > defenderCard.defense) {
        battleOutcome = "attacker_wins";
        destroyedCards.push(defender.instanceId);
        message = `${attackerCard.name} destroys ${defenderCard.name} in defense position`;
      } else if (attackerCard.attack < defenderCard.defense) {
        battleOutcome = "defender_wins";
        damage = defenderCard.defense - attackerCard.attack;
        attackerPlayer.lifePoints -= damage;
        message = `${defenderCard.name} defends successfully! ${damage} damage dealt to attacker`;
      } else {
        battleOutcome = "draw";
        message = `No damage dealt - equal ATK and DEF`;
      }
    }

    // Mark attacker as having attacked
    attacker.hasAttacked = true;

    // Destroy monsters if necessary
    for (const instanceId of destroyedCards) {
      this.destroyMonster(instanceId);
    }

    // Add to game log
    this.gameState.gameLog.push({
      id: `battle_${Date.now()}`,
      playerId: attacker.controllerId,
      actionType: "monster_battle",
      timestamp: new Date().toISOString(),
      description: message,
      cardId: attacker.cardId,
      targetCardId: defender.cardId,
      damage: damage > 0 ? damage : undefined,
      processed: true,
      metadata: {
        attackerATK: attackerCard.attack,
        defenderATK: defenderCard.attack,
        defenderDEF: defenderCard.defense,
        defenderPosition: defender.position,
        battleOutcome,
      },
    });

    // Check for game over
    if (attackerPlayer.lifePoints <= 0) {
      this.gameState.gameStatus = "finished";
      this.gameState.winner = defender.controllerId;
    } else if (defenderPlayer.lifePoints <= 0) {
      this.gameState.gameStatus = "finished";
      this.gameState.winner = attacker.controllerId;
    }

    return {
      success: true,
      message,
      damage: damage > 0 ? damage : undefined,
      destroyedCards,
      battleOutcome,
    };
  }

  /**
   * Destroy a monster and send it to graveyard
   */
  private destroyMonster(instanceId: string): void {
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
  }

  /**
   * Check if a player has monsters that can be attacked
   */
  private hasAttackableMonsters(playerId: PlayerPosition): boolean {
    const player = this.gameState.players[playerId];
    if (!player) return false;

    return Object.values(player.field).some((instanceId) => {
      if (!instanceId) return false;
      const instance = this.gameState.cardInstances[instanceId];
      return (
        instance &&
        instance.zone === "field" &&
        instance.fieldZone?.startsWith("monster_") &&
        !instance.isDestroyed
      );
    });
  }

  /**
   * Get the opponent of a player
   */
  private getOpponent(playerId: PlayerPosition) {
    const opponentId: PlayerPosition =
      playerId === "player1" ? "player2" : "player1";
    return this.gameState.players[opponentId];
  }

  /**
   * Change monster battle position
   */
  changePosition(
    playerId: PlayerPosition,
    instanceId: string,
    newPosition: "attack" | "defense"
  ): { success: boolean; message: string } {
    const instance = this.gameState.cardInstances[instanceId];
    const player = this.gameState.players[playerId];

    if (!instance || instance.controllerId !== playerId) {
      return { success: false, message: "Invalid monster" };
    }

    if (!player) {
      return { success: false, message: "Invalid player" };
    }

    if (!instance.canChangePosition) {
      return { success: false, message: "Cannot change position this turn" };
    }

    if (instance.hasAttacked) {
      return {
        success: false,
        message: "Cannot change position after attacking",
      };
    }

    const oldPosition = instance.position;
    instance.position = newPosition;
    instance.canChangePosition = false;

    const card = getCardById(instance.cardId) as MonsterCard;

    this.gameState.gameLog.push({
      id: `position_change_${Date.now()}`,
      playerId,
      actionType: "change_position",
      timestamp: new Date().toISOString(),
      description: `${player.name} changed ${card.name} from ${oldPosition} to ${newPosition} position`,
      cardId: instance.cardId,
      processed: true,
      metadata: { oldPosition, newPosition },
    });

    return {
      success: true,
      message: `Successfully changed ${card.name} to ${newPosition} position`,
    };
  }
}
