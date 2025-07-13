import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import { GameState } from "../database/index.js";
import { YuGiOhGameEngine } from "../game-engine/index.js";
import { GameScreen } from "./screens/GameScreen.js";

interface YuGiOhUIProps {
  initialGameState?: GameState;
  onGameAction?: (action: any) => void;
  onExit?: () => void;
  onStateUpdate?: (callback: (gameState: GameState) => void) => void;
}

const YuGiOhUI: React.FC<YuGiOhUIProps> = ({
  initialGameState,
  onGameAction,
  onExit,
  onStateUpdate,
}) => {
  const [gameEngine] = useState(() => new YuGiOhGameEngine(initialGameState));
  const [gameState, setGameState] = useState<GameState>(
    gameEngine.getGameState()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>("");

  const handleAction = async (action: any) => {
    setIsLoading(true);
    setLastAction(action.description || action.actionType);

    try {
      console.log(
        "🎮 UI: Sending action to AI for processing:",
        action.actionType
      );

      // UI chỉ gửi action, không xử lý logic
      // Tất cả logic sẽ được AI xử lý thông qua MCP tools
      if (onGameAction) {
        onGameAction(action);
      }
    } catch (error) {
      console.error("Error sending action:", error);
      setIsLoading(false);
    }
    // Không setIsLoading(false) ở đây - sẽ được clear khi AI response
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      process.exit(0);
    }
  };

  // Register state update callback with parent
  useEffect(() => {
    if (onStateUpdate) {
      onStateUpdate((newGameState: GameState) => {
        console.log("🔄 UI: Received state update from file watcher");
        gameEngine.updateGameState(newGameState);
        setGameState({ ...newGameState });
        setIsLoading(false); // Clear loading state when AI responds
      });
    }
  }, [onStateUpdate, gameEngine]);

  // Update game state when external state changes (initial load)
  useEffect(() => {
    if (initialGameState) {
      gameEngine.updateGameState(initialGameState);
      setGameState({ ...initialGameState });
    }
  }, [initialGameState, gameEngine]);

  if (isLoading) {
    return (
      <Box
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Text color="yellow" bold>
          🤖 AI đang xử lý...
        </Text>
        <Text color="cyan">Action: {lastAction}</Text>
        <Text color="gray" italic>
          Vui lòng chờ AI phân tích và thực hiện logic game
        </Text>
        <Box marginTop={1}>
          <Text color="white">
            ⚡ Tất cả game logic được AI quản lý hoàn toàn
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <GameScreen
      gameState={gameState}
      onAction={handleAction}
      onExit={handleExit}
      isWaitingForAI={isLoading}
    />
  );
};

// Export components for external use
export { YuGiOhUI, GameScreen };
export * from "./components/GameBoard.js";
export * from "./components/HandView.js";
export * from "./components/GameLog.js";

// Default export for standalone usage
export default YuGiOhUI;

// Standalone render function
export function renderYuGiOhGame(gameState?: GameState) {
  const { unmount } = render(<YuGiOhUI initialGameState={gameState} />);
  return unmount;
}
