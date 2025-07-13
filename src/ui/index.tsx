import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import { GameState } from "../database/index.js";
import { YuGiOhGameEngine } from "../game-engine/index.js";
import { GameScreen } from "./screens/GameScreen.js";

interface YuGiOhUIProps {
  initialGameState?: GameState;
  onGameAction?: (action: any) => void;
  onExit?: () => void;
}

const YuGiOhUI: React.FC<YuGiOhUIProps> = ({
  initialGameState,
  onGameAction,
  onExit,
}) => {
  const [gameEngine] = useState(() => new YuGiOhGameEngine(initialGameState));
  const [gameState, setGameState] = useState<GameState>(
    gameEngine.getGameState()
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: any) => {
    setIsLoading(true);

    try {
      // Process action through game engine
      const result = gameEngine.processAction(action);

      if (result.success) {
        // Update local state
        setGameState({ ...gameEngine.getGameState() });

        // Notify parent component
        if (onGameAction) {
          onGameAction(action);
        }
      } else {
        // Handle error - could show notification
        console.error("Action failed:", result.message);
      }
    } catch (error) {
      console.error("Error processing action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      process.exit(0);
    }
  };

  // Update game state when external state changes
  useEffect(() => {
    if (initialGameState) {
      gameEngine.updateGameState(initialGameState);
      setGameState({ ...initialGameState });
    }
  }, [initialGameState, gameEngine]);

  if (isLoading) {
    return (
      <Box justifyContent="center" alignItems="center" height="100%">
        <Text color="yellow">⏳ Processing action...</Text>
      </Box>
    );
  }

  return (
    <GameScreen
      gameState={gameState}
      onAction={handleAction}
      onExit={handleExit}
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
