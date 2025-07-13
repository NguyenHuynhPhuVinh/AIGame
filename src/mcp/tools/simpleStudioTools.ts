// Simple MCP Tools for Studio Management (No Zod)
import { GameStateManager } from "../../state/stateManager.js";

export function registerStudioTools(server: any) {
  // Tool 1: Get Studio Overview
  server.tool(
    "getStudioOverview",
    "🏢 Get complete studio overview (finances, reputation, team size, projects)",
    {},
    async () => {
      const studio = await GameStateManager.loadStudio();
      const employees = await GameStateManager.loadEmployees();
      const projects = await GameStateManager.loadProjects();
      const completedGames = await GameStateManager.loadCompletedGames();
      
      if (!studio) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No studio found! Run init-studio first to create a new studio.",
            },
          ],
        };
      }

      const activeProjects = projects.length;
      const totalRevenue = completedGames.reduce((sum, game) => sum + game.sales.totalRevenue, 0);
      const totalGames = completedGames.length;

      return {
        content: [
          {
            type: "text",
            text: `🏢 ${studio.name} - Studio Overview\n\n` +
                  `💰 Budget: $${studio.money.toLocaleString()}\n` +
                  `⭐ Reputation: ${studio.reputation}/100\n` +
                  `👥 Employees: ${employees.length}\n` +
                  `🎮 Active Projects: ${activeProjects}\n` +
                  `🏆 Released Games: ${totalGames}\n` +
                  `💵 Total Revenue: $${totalRevenue.toLocaleString()}\n` +
                  `📅 Founded: ${new Date(studio.founded).toLocaleDateString()}\n` +
                  `🕒 Last Updated: ${new Date(studio.lastUpdated).toLocaleString()}`,
          },
        ],
      };
    }
  );

  // Tool 2: Update Studio Finances
  server.tool(
    "updateStudioFinances",
    "💰 Update studio budget (add/subtract money). Parameters: amount (number), reason (string)",
    {
      amount: { type: "number", description: "Amount to add (positive) or subtract (negative)" },
      reason: { type: "string", description: "Reason for the financial change" },
    },
    async (params: any) => {
      const { amount, reason } = params;
      const studio = await GameStateManager.loadStudio();
      
      if (!studio) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No studio found!",
            },
          ],
        };
      }

      const oldMoney = studio.money;
      studio.money += amount;

      // Prevent negative money (bankruptcy protection)
      if (studio.money < 0) {
        studio.money = 0;
      }

      await GameStateManager.saveStudio(studio);

      // Log the transaction
      await GameStateManager.addLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'financial',
        message: `💰 ${amount >= 0 ? 'Income' : 'Expense'}: $${Math.abs(amount).toLocaleString()} - ${reason}`,
        details: { oldAmount: oldMoney, newAmount: studio.money, change: amount, reason }
      });

      const changeText = amount >= 0 ? `+$${amount.toLocaleString()}` : `-$${Math.abs(amount).toLocaleString()}`;
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Studio finances updated!\n\n` +
                  `💰 Budget: $${oldMoney.toLocaleString()} → $${studio.money.toLocaleString()}\n` +
                  `📊 Change: ${changeText}\n` +
                  `📝 Reason: ${reason}`,
          },
        ],
      };
    }
  );

  // Tool 3: Update Studio Reputation
  server.tool(
    "updateStudioReputation",
    "⭐ Update studio reputation (0-100). Parameters: change (number), reason (string)",
    {
      change: { type: "number", description: "Reputation change (positive or negative)" },
      reason: { type: "string", description: "Reason for reputation change" },
    },
    async (params: any) => {
      const { change, reason } = params;
      const studio = await GameStateManager.loadStudio();
      
      if (!studio) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No studio found!",
            },
          ],
        };
      }

      const oldReputation = studio.reputation;
      studio.reputation = Math.max(0, Math.min(100, studio.reputation + change));

      await GameStateManager.saveStudio(studio);

      // Log the reputation change
      await GameStateManager.addLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'event',
        message: `⭐ Reputation ${change >= 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} - ${reason}`,
        details: { oldReputation, newReputation: studio.reputation, change, reason }
      });

      const changeText = change >= 0 ? `+${change}` : `${change}`;
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Studio reputation updated!\n\n` +
                  `⭐ Reputation: ${oldReputation} → ${studio.reputation}/100\n` +
                  `📊 Change: ${changeText}\n` +
                  `📝 Reason: ${reason}`,
          },
        ],
      };
    }
  );

  // Tool 4: Get Financial Summary
  server.tool(
    "getFinancialSummary",
    "📊 Get detailed financial summary and recent transactions",
    {},
    async () => {
      const studio = await GameStateManager.loadStudio();
      const logs = await GameStateManager.loadLogs();
      const completedGames = await GameStateManager.loadCompletedGames();
      const employees = await GameStateManager.loadEmployees();
      
      if (!studio) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No studio found!",
            },
          ],
        };
      }

      // Calculate monthly expenses
      const monthlySalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);
      const monthlyExpenses = monthlySalaries + 10000; // Base operating costs

      // Get recent financial transactions
      const financialLogs = logs
        .filter(log => log.type === 'financial')
        .slice(-10)
        .reverse();

      // Calculate total revenue from games
      const totalRevenue = completedGames.reduce((sum, game) => sum + game.sales.totalRevenue, 0);
      const totalDevelopmentCosts = completedGames.reduce((sum, game) => sum + game.developmentCost, 0);
      const totalMarketingCosts = completedGames.reduce((sum, game) => sum + game.marketingCost, 0);

      let summary = `📊 Financial Summary - ${studio.name}\n\n`;
      summary += `💰 Current Budget: $${studio.money.toLocaleString()}\n`;
      summary += `💵 Monthly Expenses: $${monthlyExpenses.toLocaleString()}\n`;
      summary += `👥 Monthly Salaries: $${monthlySalaries.toLocaleString()}\n`;
      summary += `📅 Months Sustainable: ${Math.floor(studio.money / monthlyExpenses)}\n\n`;
      
      summary += `🎮 Game Revenue Summary:\n`;
      summary += `  💰 Total Revenue: $${totalRevenue.toLocaleString()}\n`;
      summary += `  💸 Development Costs: $${totalDevelopmentCosts.toLocaleString()}\n`;
      summary += `  📢 Marketing Costs: $${totalMarketingCosts.toLocaleString()}\n`;
      summary += `  📈 Net Profit: $${(totalRevenue - totalDevelopmentCosts - totalMarketingCosts).toLocaleString()}\n\n`;

      if (financialLogs.length > 0) {
        summary += `📜 Recent Transactions:\n`;
        financialLogs.forEach((log, index) => {
          const date = new Date(log.timestamp).toLocaleDateString();
          summary += `  ${index + 1}. [${date}] ${log.message}\n`;
        });
      }

      return {
        content: [
          {
            type: "text",
            text: summary,
          },
        ],
      };
    }
  );

  // Tool 5: Initialize New Studio
  server.tool(
    "initializeStudio",
    "🏗️ Initialize a new game development studio",
    {},
    async () => {
      try {
        // Clear existing data
        await GameStateManager.clearAllData();
        
        // Run initialization (simplified version)
        const now = new Date().toISOString();
        const studioId = `studio_${Date.now()}`;

        const studio = {
          id: studioId,
          name: "AI Game Studios",
          founded: now,
          reputation: 50,
          money: 100000,
          employees: [],
          currentProjects: [],
          completedGames: [],
          technologies: [],
          marketResearch: [],
          lastUpdated: now
        };

        await GameStateManager.saveStudio(studio);

        // Create initial log
        await GameStateManager.addLog({
          id: `log_${Date.now()}`,
          timestamp: now,
          type: 'financial',
          message: '🎮 AI Game Studios founded! Starting with $100,000 budget.',
          details: { studioId, initialBudget: 100000 }
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ Studio initialized successfully!\n\n` +
                    `🏢 Studio: ${studio.name}\n` +
                    `💰 Budget: $${studio.money.toLocaleString()}\n` +
                    `⭐ Reputation: ${studio.reputation}/100\n` +
                    `📅 Founded: ${new Date(studio.founded).toLocaleDateString()}\n\n` +
                    `🚀 Ready to start your game development journey!`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to initialize studio: ${error}`,
            },
          ],
        };
      }
    }
  );
}
