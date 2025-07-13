import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { GameState, getCardById } from "../../database/index.js";
import { GameBoard } from "../components/GameBoard.js";
import { HandView } from "../components/HandView.js";
import { GameLog } from "../components/GameLog.js";

interface GameScreenProps {
  gameState: GameState;
  onAction: (action: any) => void;
  onExit: () => void;
  isWaitingForAI?: boolean;
}

type ViewMode = "board" | "hand" | "log" | "help";

export const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  onAction,
  onExit,
  isWaitingForAI = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [selectedHandIndex, setSelectedHandIndex] = useState(0);
  const [showCardDetails, setShowCardDetails] = useState(false);

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const isPlayerTurn = gameState.currentPlayer === "player1";

  if (!currentPlayer) {
    return (
      <Box justifyContent="center" alignItems="center">
        <Text color="red">Error: Invalid current player</Text>
      </Box>
    );
  }

  useInput((input, key) => {
    if (key.escape) {
      onExit();
      return;
    }

    // View mode switching
    if (input === "1") setViewMode("board");
    if (input === "2") setViewMode("hand");
    if (input === "3") setViewMode("log");
    if (input === "4") setViewMode("help");

    // Hand navigation
    if (viewMode === "hand") {
      if (key.leftArrow && selectedHandIndex > 0) {
        setSelectedHandIndex(selectedHandIndex - 1);
      }
      if (key.rightArrow && selectedHandIndex < currentPlayer.hand.length - 1) {
        setSelectedHandIndex(selectedHandIndex + 1);
      }
      if (input === "d") {
        setShowCardDetails(!showCardDetails);
      }
      if (input === "s" && isPlayerTurn) {
        // Summon selected card (only monsters)
        const cardId = currentPlayer.hand[selectedHandIndex];
        if (cardId) {
          const card = getCardById(cardId);
          if (card && card.cardType === "monster") {
            onAction({
              id: `summon_${Date.now()}`,
              playerId: "player1",
              actionType: "normal_summon",
              timestamp: new Date().toISOString(),
              description: `Player 1 attempts to summon ${card.name}`,
              cardId,
              processed: false,
            });
          }
        }
      }

      if (
        input === "c" &&
        isPlayerTurn &&
        (gameState.currentPhase === "main1" ||
          gameState.currentPhase === "main2")
      ) {
        // Cast/Activate selected spell card
        const cardId = currentPlayer.hand[selectedHandIndex];
        if (cardId) {
          const card = getCardById(cardId);
          if (card && card.cardType === "spell") {
            onAction({
              id: `spell_${Date.now()}`,
              playerId: "player1",
              actionType: "activate_spell",
              timestamp: new Date().toISOString(),
              description: `Player 1 activates spell ${card.name}`,
              cardId,
              processed: false,
            });
          }
        }
      }

      if (
        input === "t" &&
        isPlayerTurn &&
        viewMode === "hand" &&
        (gameState.currentPhase === "main1" ||
          gameState.currentPhase === "main2")
      ) {
        // Set selected trap card face-down
        const cardId = currentPlayer.hand[selectedHandIndex];
        if (cardId) {
          const card = getCardById(cardId);
          if (card && card.cardType === "trap") {
            onAction({
              id: `trap_${Date.now()}`,
              playerId: "player1",
              actionType: "set_spell_trap",
              timestamp: new Date().toISOString(),
              description: `Player 1 sets trap ${card.name}`,
              cardId,
              processed: false,
            });
          }
        }
      }
    }

    // Game actions - chỉ gửi action, AI sẽ xử lý logic
    if (isPlayerTurn) {
      if (input === "n") {
        // Next phase
        onAction({
          id: `phase_${Date.now()}`,
          playerId: "player1",
          actionType: "advance_phase",
          timestamp: new Date().toISOString(),
          description: "Player 1 advances phase",
          processed: false,
        });
      }

      // Thêm các actions khác
      if (input === "a" && gameState.currentPhase === "battle") {
        // Attack action - AI sẽ xử lý logic tấn công
        onAction({
          id: `attack_${Date.now()}`,
          playerId: "player1",
          actionType: "declare_attack",
          timestamp: new Date().toISOString(),
          description: "Player 1 declares attack",
          processed: false,
        });
      }

      // Removed duplicate set trap action - only use the one in hand view with cardId
    }
  });

  const renderStatusBar = () => (
    <Box
      justifyContent="space-between"
      borderStyle="single"
      borderColor="white"
      padding={1}
    >
      <Box>
        <Text color="white" bold>
          Yu-Gi-Oh! AI Duel
        </Text>
        <Text color="magenta">
          {" "}
          | Turn {gameState.turnNumber} | {gameState.currentPhase.toUpperCase()}
        </Text>
      </Box>

      <Box>
        <Text color={isPlayerTurn ? "green" : "red"}>
          {isPlayerTurn ? "YOUR TURN" : "AI TURN"}
          {isWaitingForAI && <Text color="yellow"> ⏳ AI Processing...</Text>}
        </Text>
      </Box>

      <Box>
        <Text color="cyan">
          Views: [1]Board [2]Hand [3]Log [4]Help |
          {isPlayerTurn && gameState.currentPhase === "battle" && " [A]Attack"}
          {isPlayerTurn &&
            (gameState.currentPhase === "main1" ||
              gameState.currentPhase === "main2") &&
            " [C]Spell"}
          {isPlayerTurn && " [N]Next"}
        </Text>
      </Box>
    </Box>
  );

  const renderControls = () => {
    if (!isPlayerTurn) {
      return (
        <Box justifyContent="center" padding={1}>
          <Text color="yellow">⏳ Waiting for AI to make a move...</Text>
        </Box>
      );
    }

    return (
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="green"
        padding={1}
      >
        <Text color="green" bold>
          Available Actions:
        </Text>

        <Box marginTop={1}>
          <Text color="white">[N] Next Phase | [ESC] Exit Game</Text>
        </Box>

        {viewMode === "hand" && (
          <Box marginTop={1}>
            <Text color="cyan">
              [←→] Navigate | [D] Details | [S] Summon Selected
            </Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text color="gray" dimColor>
            Current Phase: {gameState.currentPhase.toUpperCase()}
          </Text>
        </Box>
      </Box>
    );
  };

  const renderHelpScreen = () => (
    <Box flexDirection="column" padding={2}>
      <Text color="white" bold underline>
        🎮 YU-GI-OH! AI DUEL - HELP
      </Text>

      <Box marginTop={2}>
        <Text color="yellow" bold>
          Navigation:
        </Text>
      </Box>
      <Text color="white">• [1] - View Game Board</Text>
      <Text color="white">• [2] - View Hand Cards</Text>
      <Text color="white">• [3] - View Game Log</Text>
      <Text color="white">• [4] - Show This Help</Text>
      <Text color="white">• [ESC] - Exit Game</Text>

      <Box marginTop={2}>
        <Text color="yellow" bold>
          Game Actions (AI-Driven):
        </Text>
      </Box>
      <Text color="white">• [N] - Advance to Next Phase</Text>
      <Text color="white">• [S] - Summon Selected Monster (in Hand view)</Text>
      <Text color="white">
        • [C] - Cast Selected Spell (in Hand view, Main Phase)
      </Text>
      <Text color="white">
        • [T] - Set Selected Trap (in Hand view, Main Phase)
      </Text>
      <Text color="white">• [A] - Declare Attack (Battle Phase)</Text>
      <Text color="cyan"> ⚡ All actions processed by AI logic!</Text>

      <Box marginTop={2}>
        <Text color="yellow" bold>
          Hand View:
        </Text>
      </Box>
      <Text color="white">• [←→] - Navigate through cards</Text>
      <Text color="white">• [D] - Toggle card details</Text>
      <Text color="white">• [S] - Summon selected monster</Text>
      <Text color="white">• [C] - Cast selected spell (Main Phase)</Text>

      <Box marginTop={2}>
        <Text color="yellow" bold>
          Game Rules:
        </Text>
      </Box>
      <Text color="white">• Start with 8000 Life Points</Text>
      <Text color="white">• Draw 1 card each turn (except first turn)</Text>
      <Text color="white">• Normal Summon 1 monster per turn</Text>
      <Text color="white">• Level 5+ monsters require tributes</Text>
      <Text color="white">• Battle Phase: Attack with monsters</Text>
      <Text color="white">• Reduce opponent's LP to 0 to win</Text>

      <Box marginTop={2} justifyContent="center">
        <Text color="cyan" italic>
          Press any view key to return to game
        </Text>
      </Box>
    </Box>
  );

  const renderMainContent = () => {
    switch (viewMode) {
      case "board":
        return <GameBoard gameState={gameState} />;
      case "hand":
        return (
          <HandView
            hand={currentPlayer.hand}
            selectedIndex={selectedHandIndex}
            showDetails={showCardDetails}
          />
        );
      case "log":
        return <GameLog />;
      case "help":
        return renderHelpScreen();
      default:
        return <GameBoard gameState={gameState} />;
    }
  };

  // Game over check
  if (gameState.gameStatus === "finished") {
    const winner = gameState.winner;
    const winnerName =
      winner && gameState.players[winner]
        ? gameState.players[winner]!.name
        : "Unknown";

    return (
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Text color="yellow" bold>
          🎉 GAME OVER! 🎉
        </Text>
        <Text color="white" bold>
          Winner: {winnerName}
        </Text>
        <Box marginTop={2}>
          <Text color="cyan">Press [ESC] to exit</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      {renderStatusBar()}

      <Box flexGrow={1}>{renderMainContent()}</Box>

      {renderControls()}
    </Box>
  );
};
