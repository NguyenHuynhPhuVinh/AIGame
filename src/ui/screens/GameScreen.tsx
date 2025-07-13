import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { GameState } from "../../database/index.js";
import { GameBoard } from "../components/GameBoard.js";
import { HandView } from "../components/HandView.js";
import { GameLog } from "../components/GameLog.js";

interface GameScreenProps {
  gameState: GameState;
  onAction: (action: any) => void;
  onExit: () => void;
}

type ViewMode = "board" | "hand" | "log" | "help";

export const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  onAction,
  onExit,
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
        // Summon selected card
        const cardId = currentPlayer.hand[selectedHandIndex];
        if (cardId) {
          onAction({
            id: `summon_${Date.now()}`,
            playerId: "player1",
            actionType: "normal_summon",
            timestamp: new Date().toISOString(),
            description: `Player 1 attempts to summon card`,
            cardId,
            processed: false,
          });
        }
      }
    }

    // Game actions
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
      </Box>

      <Box>
        <Text color={isPlayerTurn ? "green" : "red"}>
          {isPlayerTurn ? "YOUR TURN" : "AI TURN"}
        </Text>
      </Box>

      <Box>
        <Text color="cyan">Views: [1]Board [2]Hand [3]Log [4]Help</Text>
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
          Game Actions:
        </Text>
      </Box>
      <Text color="white">• [N] - Advance to Next Phase</Text>
      <Text color="white">• [S] - Summon Selected Card (in Hand view)</Text>

      <Box marginTop={2}>
        <Text color="yellow" bold>
          Hand View:
        </Text>
      </Box>
      <Text color="white">• [←→] - Navigate through cards</Text>
      <Text color="white">• [D] - Toggle card details</Text>
      <Text color="white">• [S] - Summon selected card</Text>

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
        return <GameLog gameLog={gameState.gameLog} />;
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
