import React from "react";
import { Box, Text } from "ink";
import { GameState, getCardById, MonsterCard } from "../../database/index.js";

interface GameBoardProps {
  gameState: GameState;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  const player1 = gameState.players.player1;
  const player2 = gameState.players.player2;

  if (!player1 || !player2) {
    return (
      <Box justifyContent="center" alignItems="center">
        <Text color="red">Error: Invalid game state</Text>
      </Box>
    );
  }

  const renderMonsterZone = (
    playerId: "player1" | "player2",
    zoneNumber: number
  ) => {
    const player = gameState.players[playerId];
    if (!player) return null;

    const zoneKey = `monster_${zoneNumber}` as keyof typeof player.field;
    const instanceId = player.field[zoneKey];

    if (!instanceId) {
      return (
        <Box width={12} height={4} borderStyle="single" borderColor="gray">
          <Text color="gray">Empty</Text>
        </Box>
      );
    }

    const instance = gameState.cardInstances[instanceId];
    if (!instance) {
      return (
        <Box width={12} height={4} borderStyle="single" borderColor="red">
          <Text color="red">Error</Text>
        </Box>
      );
    }

    const card = getCardById(instance.cardId);
    if (!card || card.cardType !== "monster") {
      return (
        <Box width={12} height={4} borderStyle="single" borderColor="red">
          <Text color="red">Invalid</Text>
        </Box>
      );
    }

    const monsterCard = card as MonsterCard;
    const isAttackPosition = instance.position === "attack";
    const isFaceUp = instance.isFaceUp;

    return (
      <Box
        width={12}
        height={4}
        borderStyle="single"
        borderColor={isAttackPosition ? "yellow" : "blue"}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        {isFaceUp ? (
          <>
            <Text color="white" bold>
              {monsterCard.name.length > 10
                ? monsterCard.name.substring(0, 10)
                : monsterCard.name}
            </Text>
            <Text color="green">
              {monsterCard.attack}/{monsterCard.defense}
            </Text>
            <Text color="cyan" dimColor>
              Lv.{monsterCard.level}
            </Text>
          </>
        ) : (
          <Text color="gray">Face-Down</Text>
        )}
      </Box>
    );
  };

  const renderSpellTrapZone = (
    playerId: "player1" | "player2",
    zoneNumber: number
  ) => {
    const player = gameState.players[playerId];
    if (!player) return null;

    const zoneKey = `spell_trap_${zoneNumber}` as keyof typeof player.field;
    const instanceId = player.field[zoneKey];

    if (!instanceId) {
      return (
        <Box width={10} height={3} borderStyle="single" borderColor="gray">
          <Text color="gray">Empty</Text>
        </Box>
      );
    }

    const instance = gameState.cardInstances[instanceId];
    const card = getCardById(instance?.cardId || "");

    return (
      <Box
        width={10}
        height={3}
        borderStyle="single"
        borderColor={card?.cardType === "spell" ? "green" : "purple"}
        alignItems="center"
        justifyContent="center"
      >
        <Text color="white">
          {instance?.isFaceUp
            ? card?.name.substring(0, 8) || "Unknown"
            : "Face-Down"}
        </Text>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" width="100%">
      {/* Player 2 (AI) Area */}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="red"
        padding={1}
      >
        <Box justifyContent="space-between">
          <Text color="red" bold>
            {player2.name}
          </Text>
          <Text color="red">LP: {player2.lifePoints}</Text>
          <Text color="cyan">Hand: {player2.hand.length}</Text>
          <Text color="yellow">Deck: {player2.deck.length}</Text>
        </Box>

        {/* Player 2 Spell/Trap Zones */}
        <Box justifyContent="space-around" marginY={1}>
          {[1, 2, 3, 4, 5].map((zone) => (
            <Box key={`p2-st-${zone}`}>
              {renderSpellTrapZone("player2", zone)}
            </Box>
          ))}
        </Box>

        {/* Player 2 Monster Zones */}
        <Box justifyContent="space-around">
          {[1, 2, 3, 4, 5].map((zone) => (
            <Box key={`p2-monster-${zone}`}>
              {renderMonsterZone("player2", zone)}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Game Info */}
      <Box
        justifyContent="center"
        alignItems="center"
        borderStyle="double"
        borderColor="white"
        padding={1}
        marginY={1}
      >
        <Text color="white" bold>
          Turn {gameState.turnNumber} |{" "}
          {gameState.currentPlayer === "player1" ? player1.name : player2.name}
          's {gameState.currentPhase.toUpperCase()} Phase
        </Text>
      </Box>

      {/* Player 1 Area */}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="blue"
        padding={1}
      >
        {/* Player 1 Monster Zones */}
        <Box justifyContent="space-around">
          {[1, 2, 3, 4, 5].map((zone) => (
            <Box key={`p1-monster-${zone}`}>
              {renderMonsterZone("player1", zone)}
            </Box>
          ))}
        </Box>

        {/* Player 1 Spell/Trap Zones */}
        <Box justifyContent="space-around" marginY={1}>
          {[1, 2, 3, 4, 5].map((zone) => (
            <Box key={`p1-st-${zone}`}>
              {renderSpellTrapZone("player1", zone)}
            </Box>
          ))}
        </Box>

        <Box justifyContent="space-between">
          <Text color="blue" bold>
            {player1.name}
          </Text>
          <Text color="blue">LP: {player1.lifePoints}</Text>
          <Text color="cyan">Hand: {player1.hand.length}</Text>
          <Text color="yellow">Deck: {player1.deck.length}</Text>
        </Box>
      </Box>
    </Box>
  );
};
