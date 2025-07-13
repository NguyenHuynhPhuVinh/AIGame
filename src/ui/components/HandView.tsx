import React from "react";
import { Box, Text } from "ink";
import {
  getCardById,
  MonsterCard,
  SpellCard,
  TrapCard,
} from "../../database/index.js";

interface HandViewProps {
  hand: string[];
  selectedIndex?: number;
  showDetails?: boolean;
}

export const HandView: React.FC<HandViewProps> = ({
  hand,
  selectedIndex = -1,
  showDetails = false,
}) => {
  const renderCard = (cardId: string, index: number) => {
    const card = getCardById(cardId);
    if (!card) {
      return (
        <Box
          key={index}
          width={16}
          height={6}
          borderStyle="single"
          borderColor="red"
          flexDirection="column"
          padding={1}
        >
          <Text color="red">Unknown Card</Text>
        </Box>
      );
    }

    const isSelected = index === selectedIndex;
    const borderColor = isSelected
      ? "yellow"
      : card.cardType === "monster"
      ? "blue"
      : card.cardType === "spell"
      ? "green"
      : "purple";

    return (
      <Box
        key={index}
        width={16}
        height={6}
        borderStyle={isSelected ? "double" : "single"}
        borderColor={borderColor}
        flexDirection="column"
        padding={1}
      >
        <Text color="white" bold>
          {card.name.length > 12
            ? card.name.substring(0, 12) + "..."
            : card.name}
        </Text>

        <Text color="cyan" dimColor>
          {card.cardType.toUpperCase()}
        </Text>

        {card.cardType === "monster" && (
          <>
            <Text color="green">ATK: {(card as MonsterCard).attack}</Text>
            <Text color="blue">DEF: {(card as MonsterCard).defense}</Text>
            <Text color="yellow">Lv.{(card as MonsterCard).level}</Text>
          </>
        )}

        {(card.cardType === "spell" || card.cardType === "trap") && (
          <Text color="gray" dimColor>
            {card.cardType === "spell"
              ? (card as SpellCard).spellType
              : (card as TrapCard).trapType}
          </Text>
        )}

        <Text color="white" dimColor>
          [{index + 1}]
        </Text>
      </Box>
    );
  };

  const renderCardDetails = (cardId: string) => {
    const card = getCardById(cardId);
    if (!card) return null;

    return (
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor="white"
        padding={2}
        marginTop={1}
        width="100%"
      >
        <Text color="white" bold underline>
          {card.name}
        </Text>

        <Box marginY={1}>
          <Text color="cyan">Type: </Text>
          <Text color="white">{card.cardType.toUpperCase()}</Text>

          {card.cardType === "monster" && (
            <>
              <Text color="cyan"> | Attribute: </Text>
              <Text color="white">
                {(card as MonsterCard).attribute.toUpperCase()}
              </Text>
              <Text color="cyan"> | Race: </Text>
              <Text color="white">
                {(card as MonsterCard).monsterType.toUpperCase()}
              </Text>
            </>
          )}

          {card.cardType === "spell" && (
            <>
              <Text color="cyan"> | Spell Type: </Text>
              <Text color="white">
                {(card as SpellCard).spellType.toUpperCase()}
              </Text>
            </>
          )}

          {card.cardType === "trap" && (
            <>
              <Text color="cyan"> | Trap Type: </Text>
              <Text color="white">
                {(card as TrapCard).trapType.toUpperCase()}
              </Text>
            </>
          )}
        </Box>

        {card.cardType === "monster" && (
          <Box>
            <Text color="green">ATK: {(card as MonsterCard).attack}</Text>
            <Text color="blue"> / DEF: {(card as MonsterCard).defense}</Text>
            <Text color="yellow"> / Level: {(card as MonsterCard).level}</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text color="gray">Description:</Text>
        </Box>
        <Text color="white" wrap="wrap">
          {card.description}
        </Text>

        {(card.cardType === "monster" && (card as MonsterCard).effect) ||
        (card.cardType === "spell" && (card as SpellCard).effect) ||
        (card.cardType === "trap" && (card as TrapCard).effect) ? (
          <>
            <Box marginTop={1}>
              <Text color="yellow">Effect:</Text>
            </Box>
            <Text color="white" wrap="wrap">
              {card.cardType === "monster"
                ? (card as MonsterCard).effect
                : card.cardType === "spell"
                ? (card as SpellCard).effect
                : (card as TrapCard).effect}
            </Text>
          </>
        ) : null}

        <Box marginTop={1}>
          <Text color="magenta">Rarity: {card.rarity.toUpperCase()}</Text>
        </Box>
      </Box>
    );
  };

  const selectedCard =
    selectedIndex >= 0 && selectedIndex < hand.length
      ? getCardById(hand[selectedIndex])
      : null;

  return (
    <Box flexDirection="column" width="100%">
      <Box justifyContent="center" marginBottom={1}>
        <Text color="white" bold underline>
          HAND ({hand.length} cards)
        </Text>
      </Box>

      <Box justifyContent="flex-start" flexWrap="wrap">
        {hand.map((cardId, index) => renderCard(cardId, index))}
      </Box>

      {/* Controls hint */}
      <Box justifyContent="center" marginTop={1}>
        <Text color="cyan">
          [←→] Navigate | [D] Details
          {selectedCard?.cardType === "monster" && " | [S] Summon"}
          {selectedCard?.cardType === "spell" && " | [C] Cast Spell"}
          {selectedCard?.cardType === "trap" && " | [T] Set Trap"}
        </Text>
      </Box>

      {showDetails &&
        selectedIndex >= 0 &&
        selectedIndex < hand.length &&
        renderCardDetails(hand[selectedIndex])}

      {hand.length === 0 && (
        <Box justifyContent="center" padding={2}>
          <Text color="gray" italic>
            No cards in hand
          </Text>
        </Box>
      )}
    </Box>
  );
};
