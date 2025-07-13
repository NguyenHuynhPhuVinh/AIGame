import {
  GameState,
  PlayerState,
  PlayerId,
  WaifuInstance,
  SummonResult,
  CombatResult,
} from "../types/game.js";
import { getCardById } from "../data/cards.js";
import {
  createStarterDeck,
  shuffleDeck,
  addGameLogEntry,
  getOpponentId,
  createWaifuInstance,
  calculateBattle,
  checkWinCondition,
} from "../utils/gameUtils.js";

export class WaifuGameEngine {
  // Initialize new game
  static createInitialGameState(): GameState {
    const deck1 = shuffleDeck(createStarterDeck());
    const deck2 = shuffleDeck(createStarterDeck());

    const now = new Date().toISOString();

    const gameState: GameState = {
      gameId: `waifu_${Date.now()}`,
      status: "playing",
      currentPlayer: "player1",
      turnNumber: 1,
      phase: "draw",
      players: {
        player1: {
          id: "player1",
          name: "AI Player 1",
          hp: 20,
          mana: 1,
          maxMana: 1,
          deck: deck1.slice(5), // Remaining cards after drawing initial hand
          hand: deck1.slice(0, 5), // Initial 5 cards
          field: [],
          graveyard: [],
        },
        player2: {
          id: "player2",
          name: "AI Player 2",
          hp: 20,
          mana: 1,
          maxMana: 1,
          deck: deck2.slice(5),
          hand: deck2.slice(0, 5),
          field: [],
          graveyard: [],
        },
      },
      gameLog: [],
      createdAt: now,
      lastAction: "Game initialized",
    };

    addGameLogEntry(
      gameState,
      "system",
      "game_start",
      "🎴 Pure MCP Waifu Card Game Started - AI vs AI",
      { gameMode: "AI_SELF_PLAY" }
    );

    return gameState;
  }

  // Draw phase logic
  static executeDrawPhase(gameState: GameState, playerId: PlayerId): boolean {
    if (gameState.currentPlayer !== playerId || gameState.phase !== "draw") {
      return false;
    }

    const player = gameState.players[playerId];

    // Draw a card if deck has cards
    if (player.deck.length > 0) {
      const drawnCard = player.deck.pop()!;
      player.hand.push(drawnCard);
      addGameLogEntry(
        gameState,
        playerId,
        "draw",
        `${player.name} drew a card`
      );
    }

    // Advance to main phase
    gameState.phase = "main";
    addGameLogEntry(
      gameState,
      playerId,
      "phase_change",
      `${player.name} entered main phase`
    );

    return true;
  }

  // Summon waifu logic with improved validation and error handling
  static summonWaifu(
    gameState: GameState,
    playerId: PlayerId,
    cardId: string
  ): SummonResult {
    const result: SummonResult = {
      success: false,
      waifusOnField: 0,
      maxFieldSize: 5,
      error: undefined,
    };

    // Validate turn
    if (gameState.currentPlayer !== playerId) {
      result.error = `Not ${playerId}'s turn! Current player: ${gameState.currentPlayer}`;
      return result;
    }

    // Validate phase
    if (gameState.phase !== "main") {
      result.error = `Can only summon during main phase! Current phase: ${gameState.phase}`;
      return result;
    }

    const player = gameState.players[playerId];
    const card = getCardById(cardId);

    // Validate card exists
    if (!card) {
      result.error = `Card "${cardId}" not found in database!`;
      return result;
    }

    // Validate card in hand
    const handIndex = player.hand.indexOf(cardId);
    if (handIndex === -1) {
      result.error = `Card "${card.name}" not in ${player.name}'s hand!`;
      return result;
    }

    // Validate mana cost
    if (player.mana < card.cost) {
      result.error = `Not enough mana! Need ${card.cost}, have ${player.mana}`;
      return result;
    }

    // Validate field space
    if (player.field.length >= 5) {
      result.error = `Field is full! Maximum 5 waifus on field. Current: ${player.field.length}`;
      result.waifusOnField = player.field.length;
      return result;
    }

    // Perform summon
    player.hand.splice(handIndex, 1);
    player.mana -= card.cost;

    const waifuInstance = createWaifuInstance(cardId);
    player.field.push(waifuInstance);

    // Update result
    result.success = true;
    result.waifusOnField = player.field.length;
    result.instanceId = waifuInstance.instanceId;

    addGameLogEntry(
      gameState,
      playerId,
      "summon",
      `${player.name} summoned ${card.name} (${player.field.length}/5 on field)`,
      {
        cardId: card.id,
        cost: card.cost,
        stats: `${card.attack}/${card.defense}/${card.charm}`,
        fieldPosition: player.field.length - 1,
        waifusOnField: player.field.length,
        instanceId: waifuInstance.instanceId,
      }
    );

    return result;
  }

  // Battle phase logic
  static enterBattlePhase(gameState: GameState, playerId: PlayerId): boolean {
    if (gameState.currentPlayer !== playerId || gameState.phase !== "main") {
      return false;
    }

    gameState.phase = "battle";
    addGameLogEntry(
      gameState,
      playerId,
      "phase_change",
      `${gameState.players[playerId].name} entered battle phase`
    );

    return true;
  }

  // Attack logic
  static executeAttack(
    gameState: GameState,
    playerId: PlayerId,
    attackerIndex: number,
    targetType: "player" | "waifu",
    targetIndex?: number
  ): boolean {
    if (gameState.currentPlayer !== playerId || gameState.phase !== "battle") {
      return false;
    }

    const player = gameState.players[playerId];
    const opponent = gameState.players[getOpponentId(playerId)];

    // Validate attacker
    if (attackerIndex < 0 || attackerIndex >= player.field.length) {
      return false;
    }

    const attacker = player.field[attackerIndex];
    if (!attacker.canAttack) return false;

    const attackerCard = getCardById(attacker.cardId);
    if (!attackerCard) return false;

    if (targetType === "player") {
      // Direct attack
      if (opponent.field.length > 0) return false; // Can't attack directly if opponent has waifus

      opponent.hp -= attacker.currentAttack;
      attacker.canAttack = false;

      addGameLogEntry(
        gameState,
        playerId,
        "direct_attack",
        `${attackerCard.name} attacked ${opponent.name} directly for ${attacker.currentAttack} damage`,
        {
          damage: attacker.currentAttack,
          opponentHP: opponent.hp,
        }
      );
    } else {
      // Attack waifu
      if (
        targetIndex === undefined ||
        targetIndex < 0 ||
        targetIndex >= opponent.field.length
      ) {
        return false;
      }

      const target = opponent.field[targetIndex];
      const targetCard = getCardById(target.cardId);
      if (!targetCard) return false;

      // Calculate battle with detailed combat mechanics
      const battleResult = calculateBattle(
        attacker.currentAttack,
        target.currentDefense,
        attackerCard.name,
        targetCard.name
      );

      if (battleResult.type === "attacker_wins") {
        opponent.hp -= battleResult.damage;
        opponent.field.splice(targetIndex, 1);
        opponent.graveyard.push(target.cardId);

        addGameLogEntry(
          gameState,
          playerId,
          "waifu_battle",
          battleResult.description,
          {
            attackerName: attackerCard.name,
            defenderName: targetCard.name,
            attackerAttack: attacker.currentAttack,
            defenderDefense: target.currentDefense,
            damage: battleResult.damage,
            opponentHP: opponent.hp,
            result: "attacker_wins",
          }
        );
      } else if (battleResult.type === "defender_wins") {
        player.hp -= battleResult.damage;
        player.field.splice(attackerIndex, 1);
        player.graveyard.push(attacker.cardId);

        addGameLogEntry(
          gameState,
          playerId,
          "waifu_battle",
          battleResult.description,
          {
            attackerName: attackerCard.name,
            defenderName: targetCard.name,
            attackerAttack: attacker.currentAttack,
            defenderDefense: target.currentDefense,
            damage: battleResult.damage,
            playerHP: player.hp,
            result: "defender_wins",
          }
        );
      } else {
        // Tie - both destroyed
        player.field.splice(attackerIndex, 1);
        opponent.field.splice(targetIndex, 1);
        player.graveyard.push(attacker.cardId);
        opponent.graveyard.push(target.cardId);

        addGameLogEntry(
          gameState,
          playerId,
          "waifu_battle",
          battleResult.description,
          {
            attackerName: attackerCard.name,
            defenderName: targetCard.name,
            attackerAttack: attacker.currentAttack,
            defenderDefense: target.currentDefense,
            result: "tie",
          }
        );
      }

      attacker.canAttack = false;
    }

    // Check win condition
    const winner = checkWinCondition(gameState);
    if (winner) {
      gameState.status = "finished";
      gameState.winner = winner;
      addGameLogEntry(
        gameState,
        winner,
        "game_win",
        `${gameState.players[winner].name} wins!`
      );
    }

    return true;
  }

  // End turn logic
  static endTurn(gameState: GameState, playerId: PlayerId): boolean {
    if (gameState.currentPlayer !== playerId) {
      return false;
    }

    // Switch to other player
    const otherPlayer = getOpponentId(playerId);
    gameState.currentPlayer = otherPlayer;
    gameState.phase = "draw";

    if (otherPlayer === "player1") {
      gameState.turnNumber++;
    }

    // Increase mana for new turn
    const newCurrentPlayer = gameState.players[gameState.currentPlayer];
    newCurrentPlayer.maxMana = Math.min(10, newCurrentPlayer.maxMana + 1);
    newCurrentPlayer.mana = newCurrentPlayer.maxMana;

    // Remove summoning sickness
    newCurrentPlayer.field.forEach((waifu) => {
      waifu.canAttack = true;
    });

    addGameLogEntry(
      gameState,
      playerId,
      "end_turn",
      `Turn ended. ${newCurrentPlayer.name}'s turn begins`
    );

    return true;
  }

  // Advance phase logic
  static advancePhase(gameState: GameState, playerId: PlayerId): boolean {
    if (gameState.currentPlayer !== playerId) {
      return false;
    }

    switch (gameState.phase) {
      case "draw":
        return this.executeDrawPhase(gameState, playerId);
      case "main":
        return this.enterBattlePhase(gameState, playerId);
      case "battle":
        gameState.phase = "end";
        addGameLogEntry(
          gameState,
          playerId,
          "phase_change",
          `${gameState.players[playerId].name} entered end phase`
        );
        return true;
      case "end":
        return this.endTurn(gameState, playerId);
      default:
        return false;
    }
  }
}
