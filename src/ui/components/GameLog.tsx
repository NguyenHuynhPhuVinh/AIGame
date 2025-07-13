import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import fs from "fs/promises";
import path from "path";

interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  playerId: string;
  actionType?: string;
  details?: any;
}

interface GameLogProps {
  maxEntries?: number;
}

const GAME_LOG_FILE = path.join(process.cwd(), "yugioh_log.json");

export const GameLog: React.FC<GameLogProps> = ({ maxEntries = 10 }) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGameLog = async () => {
      try {
        const data = await fs.readFile(GAME_LOG_FILE, "utf-8");
        const gameLog = JSON.parse(data);
        setLogEntries(gameLog.entries || []);
      } catch (error) {
        console.error("Error loading game log:", error);
        setLogEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameLog();

    // Watch for log file changes
    const interval = setInterval(loadGameLog, 1000);
    return () => clearInterval(interval);
  }, []);

  const recentLogs = logEntries.slice(-maxEntries);

  const getActionColor = (actionType?: string): string => {
    if (!actionType) return "white";

    switch (actionType) {
      case "normal_summon":
      case "set_monster":
      case "flip_summon":
        return "blue";
      case "direct_attack":
      case "monster_battle":
      case "declare_attack":
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

  const getActionIcon = (actionType?: string): string => {
    if (!actionType) return "📝";

    switch (actionType) {
      case "normal_summon":
        return "🔮";
      case "set_monster":
        return "🛡️";
      case "flip_summon":
        return "🔄";
      case "direct_attack":
      case "declare_attack":
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
      case "set_spell_trap":
        return "🪤";
      case "tribute":
        return "💀";
      case "change_position":
        return "🔄";
      case "game_start":
        return "🎮";
      case "ai_decision":
        return "🤖";
      case "spell_effect":
        return "💫";
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

              <Box width={10}>
                <Text color="cyan" bold>
                  {log.playerId}
                </Text>
              </Box>

              <Box flexGrow={1}>
                <Text color={getActionColor(log.actionType)}>
                  {log.message}
                </Text>
              </Box>

              {log.details?.damage && (
                <Box width={12} justifyContent="flex-end">
                  <Text color="red" bold>
                    -{log.details.damage} LP
                  </Text>
                </Box>
              )}

              {log.details?.heal && (
                <Box width={12} justifyContent="flex-end">
                  <Text color="green" bold>
                    +{log.details.heal} LP
                  </Text>
                </Box>
              )}
            </Box>
          ))
        )}
      </Box>

      {logEntries.length > maxEntries && (
        <Box justifyContent="center">
          <Text color="gray" dimColor>
            ... and {logEntries.length - maxEntries} more entries
          </Text>
        </Box>
      )}
    </Box>
  );
};
