#!/usr/bin/env node

// Game Studio Initializer - AI-Driven Game Development Simulator
import { GameStateManager } from '../state/stateManager.js';
import { TECHNOLOGIES, INITIAL_MARKET_DATA, getRandomEmployeeName, getRandomTrait } from '../data/gameData.js';
import { 
  GameStudio, 
  Employee, 
  EmployeeRole,
  GameLog,
  LogType 
} from '../types/gamedev.js';

function generateRandomSkills(): any {
  return {
    programming: Math.floor(Math.random() * 40) + 30, // 30-70
    design: Math.floor(Math.random() * 40) + 30,
    art: Math.floor(Math.random() * 40) + 30,
    sound: Math.floor(Math.random() * 40) + 30,
    testing: Math.floor(Math.random() * 40) + 30,
    management: Math.floor(Math.random() * 40) + 20,
    marketing: Math.floor(Math.random() * 40) + 20
  };
}

function createStarterEmployee(role: EmployeeRole): Employee {
  const skills = generateRandomSkills();
  
  // Boost primary skill based on role
  switch (role) {
    case 'programmer':
      skills.programming += 20;
      break;
    case 'designer':
      skills.design += 20;
      break;
    case 'artist':
      skills.art += 20;
      break;
    case 'sound_engineer':
      skills.sound += 20;
      break;
    case 'tester':
      skills.testing += 20;
      break;
    case 'producer':
      skills.management += 20;
      break;
    case 'marketer':
      skills.marketing += 20;
      break;
  }

  const employee: Employee = {
    id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: getRandomEmployeeName(),
    role: role,
    skills: skills,
    salary: Math.floor(Math.random() * 20000) + 40000, // 40k-60k
    happiness: Math.floor(Math.random() * 20) + 70, // 70-90
    productivity: Math.floor(Math.random() * 20) + 70, // 70-90
    experience: Math.floor(Math.random() * 5) + 1, // 1-5 years
    hiredDate: new Date().toISOString(),
    traits: Math.random() > 0.7 ? [getRandomTrait()] : [] // 30% chance of trait
  };

  return employee;
}

async function initializeGameStudio(): Promise<void> {
  console.log("🎮 Initializing AI-Driven Game Development Studio...");
  
  const now = new Date().toISOString();
  const studioId = `studio_${Date.now()}`;

  // 1. Create Game Studio
  const studio: GameStudio = {
    id: studioId,
    name: "AI Game Studios",
    founded: now,
    reputation: 50, // Start with neutral reputation
    money: 100000, // Starting budget: $100k
    employees: [],
    currentProjects: [],
    completedGames: [],
    technologies: [],
    marketResearch: [],
    lastUpdated: now
  };

  // 2. Create Starting Employees (small team)
  const startingEmployees: Employee[] = [
    createStarterEmployee('programmer'),
    createStarterEmployee('designer'),
    createStarterEmployee('artist')
  ];

  // 3. Initialize Technologies (basic ones unlocked)
  const technologies = TECHNOLOGIES.map(tech => ({
    ...tech,
    unlocked: tech.level === 1 // Only level 1 techs start unlocked
  }));

  // 4. Initialize Market Data
  const marketData = [...INITIAL_MARKET_DATA];

  // 5. Create Initial Game Log
  const initialLog: GameLog = {
    id: `log_${Date.now()}`,
    timestamp: now,
    type: 'financial' as LogType,
    message: '🎮 AI Game Studios founded! Starting with $100,000 budget and 3 employees.',
    details: {
      studioId: studioId,
      initialBudget: 100000,
      employeeCount: startingEmployees.length,
      architecture: 'AI_DRIVEN_PURE_STATE'
    }
  };

  // Save all data
  await GameStateManager.saveStudio(studio);
  await GameStateManager.saveEmployees(startingEmployees);
  await GameStateManager.saveTechnologies(technologies);
  await GameStateManager.saveMarketData(marketData);
  await GameStateManager.addLog(initialLog);

  console.log("✅ Game studio initialized successfully!");
  console.log(`🏢 Studio: ${studio.name}`);
  console.log(`💰 Budget: $${studio.money.toLocaleString()}`);
  console.log(`⭐ Reputation: ${studio.reputation}/100`);
  console.log("");
  console.log("👥 Starting Team:");
  startingEmployees.forEach((emp, index) => {
    const primarySkill = Object.entries(emp.skills).reduce((a, b) => 
      emp.skills[a[0] as keyof typeof emp.skills] > emp.skills[b[0] as keyof typeof emp.skills] ? a : b
    );
    console.log(`  ${index + 1}. ${emp.name} (${emp.role}) - ${primarySkill[0]}: ${primarySkill[1]}`);
    if (emp.traits.length > 0) {
      console.log(`     🎯 Trait: ${emp.traits[0].name}`);
    }
  });
  console.log("");
  console.log("🔬 Available Technologies:");
  technologies.filter(tech => tech.unlocked).forEach(tech => {
    console.log(`  ✅ ${tech.name} (${tech.category})`);
  });
  console.log("");
  console.log("📊 Market Overview:");
  const topMarkets = marketData
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 5);
  topMarkets.forEach(market => {
    const trend = market.trendDirection === 'rising' ? '📈' : 
                  market.trendDirection === 'falling' ? '📉' : '➡️';
    console.log(`  ${trend} ${market.genre} (${market.platform}): ${market.demand}% demand, $${market.averagePrice}`);
  });
  console.log("");
  console.log("📁 Data Files Created:");
  console.log("  - game_data/studio.json (Studio info)");
  console.log("  - game_data/employees.json (Team members)");
  console.log("  - game_data/projects.json (Active projects)");
  console.log("  - game_data/completed_games.json (Released games)");
  console.log("  - game_data/technologies.json (Research tree)");
  console.log("  - game_data/market_data.json (Market trends)");
  console.log("  - game_data/events.json (Game events)");
  console.log("  - game_data/game_logs.json (Activity log)");
  console.log("");
  console.log("🚀 Ready for AI to manage the studio via MCP tools!");
  console.log("💡 AI will make all business decisions through pure state management");
  console.log("");
  console.log("🔧 Available MCP Tool Categories:");
  console.log("  - Studio Management (view studio, update finances, reputation)");
  console.log("  - Employee Management (hire, fire, train, assign)");
  console.log("  - Project Management (start projects, track progress, release)");
  console.log("  - Technology Research (research new tech, unlock features)");
  console.log("  - Market Analysis (view trends, plan releases)");
  console.log("  - Time Management (advance time, trigger events)");
}

async function main() {
  try {
    // Clear any existing data
    await GameStateManager.clearAllData();
    
    // Initialize new studio
    await initializeGameStudio();
    
  } catch (error) {
    console.error("❌ Failed to initialize studio:", error);
    process.exit(1);
  }
}

main().catch(console.error);
