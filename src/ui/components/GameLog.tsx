import React from "react";
import { Box, Text } from "ink";
import { GameAction } from "../../database/index.js";

interface GameLogProps {
  gameLog: GameAction[];
  maxEntries?: number;
}

export const GameLog: React.FC<GameLogProps> = ({
  gameLog,
  maxEntries = 10,
}) => {
  const recentLogs = gameLog.slice(-maxEntries);

  const getActionColor = (actionType: string): string => {
    switch (actionType) {
      case "normal_summon":
      case "set_monster":
      case "flip_summon":
        return "blue";
      case "direct_attack":
      case "monster_battle":
        return "red";
      case "draw_card":
        return "green";
      case "advance_phase":
        return "yellow";
      case "activate_spell":
        return "magenta";
      case "activate_trap":
        return "purple";
      default:
        return "white";
    }
  };

  const getActionIcon = (actionType: string): string => {
    switch (actionType) {
      case "normal_summon":
        return "🔮";
      case "set_monster":
        return "🛡️";
      case "flip_summon":
        return "🔄";
      case "direct_attack":
        return "⚔️";
      case "monster_battle":
        return "⚡";
      case "draw_card":
        return "🃏";
      case "advance_phase":
        return "⏭️";
      case "activate_spell":
        return "✨";
      case "activate_trap":
        return "🪤";
      case "tribute":
        return "💀";
      case "change_position":
        return "🔄";
      default:
        return "📝";
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <Box flexDirection="column" width="100%" height={15}>
      <Box justifyContent="center" borderStyle="single" borderColor="white">
        <Text color="white" bold>
          🎮 GAME LOG
        </Text>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        padding={1}
        height={13}
      >
        {recentLogs.length === 0 ? (
          <Box justifyContent="center" alignItems="center" height="100%">
            <Text color="gray" italic>
              No actions yet...
            </Text>
          </Box>
        ) : (
          recentLogs.map((log, index) => (
            <Box
              key={log.id || index}
              marginBottom={index < recentLogs.length - 1 ? 1 : 0}
            >
              <Box width={8}>
                <Text color="gray" dimColor>
                  {formatTimestamp(log.timestamp)}
                </Text>
              </Box>

              <Box width={3} justifyContent="center">
                <Text>{getActionIcon(log.actionType)}</Text>
              </Box>

              <Box flexGrow={1}>
                <Text color={getActionColor(log.actionType)}>
                  {log.description}
                </Text>
              </Box>

              {log.damage && (
                <Box width={12} justifyContent="flex-end">
                  <Text color="red" bold>
                    -{log.damage} LP
                  </Text>
                </Box>
              )}

              {log.heal && (
                <Box width={12} justifyContent="flex-end">
                  <Text color="green" bold>
                    +{log.heal} LP
                  </Text>
                </Box>
              )}
            </Box>
          ))
        )}
      </Box>

      {gameLog.length > maxEntries && (
        <Box justifyContent="center">
          <Text color="gray" dimColor>
            ... and {gameLog.length - maxEntries} more actions
          </Text>
        </Box>
      )}
    </Box>
  );
};
