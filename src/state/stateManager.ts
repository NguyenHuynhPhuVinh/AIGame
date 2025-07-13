// Pure State Management - Game Development Simulator
import fs from "fs/promises";
import path from "path";
import {
  GameStudio,
  Employee,
  GameProject,
  CompletedGame,
  Technology,
  MarketData,
  GameEvent,
  GameLog
} from "../types/gamedev.js";

// File paths for state persistence
const DATA_DIR = path.join(process.cwd(), "game_data");
const STUDIO_FILE = path.join(DATA_DIR, "studio.json");
const EMPLOYEES_FILE = path.join(DATA_DIR, "employees.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const COMPLETED_GAMES_FILE = path.join(DATA_DIR, "completed_games.json");
const TECHNOLOGIES_FILE = path.join(DATA_DIR, "technologies.json");
const MARKET_FILE = path.join(DATA_DIR, "market_data.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const LOGS_FILE = path.join(DATA_DIR, "game_logs.json");

export class GameStateManager {
  // Initialize data directory
  static async initializeDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore
    }
  }

  // Studio State Management
  static async loadStudio(): Promise<GameStudio | null> {
    try {
      const data = await fs.readFile(STUDIO_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  static async saveStudio(studio: GameStudio): Promise<void> {
    await this.initializeDataDirectory();
    studio.lastUpdated = new Date().toISOString();
    await fs.writeFile(STUDIO_FILE, JSON.stringify(studio, null, 2));
  }

  // Employee Management
  static async loadEmployees(): Promise<Employee[]> {
    try {
      const data = await fs.readFile(EMPLOYEES_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async saveEmployees(employees: Employee[]): Promise<void> {
    await this.initializeDataDirectory();
    await fs.writeFile(EMPLOYEES_FILE, JSON.stringify(employees, null, 2));
  }

  static async addEmployee(employee: Employee): Promise<void> {
    const employees = await this.loadEmployees();
    employees.push(employee);
    await this.saveEmployees(employees);
  }

  static async removeEmployee(employeeId: string): Promise<void> {
    const employees = await this.loadEmployees();
    const filtered = employees.filter(emp => emp.id !== employeeId);
    await this.saveEmployees(filtered);
  }

  static async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<void> {
    const employees = await this.loadEmployees();
    const index = employees.findIndex(emp => emp.id === employeeId);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates };
      await this.saveEmployees(employees);
    }
  }

  // Project Management
  static async loadProjects(): Promise<GameProject[]> {
    try {
      const data = await fs.readFile(PROJECTS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async saveProjects(projects: GameProject[]): Promise<void> {
    await this.initializeDataDirectory();
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  }

  static async addProject(project: GameProject): Promise<void> {
    const projects = await this.loadProjects();
    projects.push(project);
    await this.saveProjects(projects);
  }

  static async updateProject(projectId: string, updates: Partial<GameProject>): Promise<void> {
    const projects = await this.loadProjects();
    const index = projects.findIndex(proj => proj.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      await this.saveProjects(projects);
    }
  }

  static async completeProject(projectId: string): Promise<void> {
    const projects = await this.loadProjects();
    const projectIndex = projects.findIndex(proj => proj.id === projectId);
    
    if (projectIndex !== -1) {
      const project = projects[projectIndex];
      
      // Move to completed games
      const completedGame: CompletedGame = {
        id: project.id,
        name: project.name,
        genre: project.genre,
        platform: project.platform,
        releaseDate: new Date().toISOString(),
        developmentCost: project.budget,
        marketingCost: project.marketingCampaign?.budget || 0,
        sales: {
          totalUnits: 0,
          totalRevenue: 0,
          salesByPlatform: {} as any,
          salesByMonth: []
        },
        reviews: [],
        awards: []
      };

      const completedGames = await this.loadCompletedGames();
      completedGames.push(completedGame);
      await this.saveCompletedGames(completedGames);

      // Remove from active projects
      projects.splice(projectIndex, 1);
      await this.saveProjects(projects);
    }
  }

  // Completed Games Management
  static async loadCompletedGames(): Promise<CompletedGame[]> {
    try {
      const data = await fs.readFile(COMPLETED_GAMES_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async saveCompletedGames(games: CompletedGame[]): Promise<void> {
    await this.initializeDataDirectory();
    await fs.writeFile(COMPLETED_GAMES_FILE, JSON.stringify(games, null, 2));
  }

  // Technology Management
  static async loadTechnologies(): Promise<Technology[]> {
    try {
      const data = await fs.readFile(TECHNOLOGIES_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async saveTechnologies(technologies: Technology[]): Promise<void> {
    await this.initializeDataDirectory();
    await fs.writeFile(TECHNOLOGIES_FILE, JSON.stringify(technologies, null, 2));
  }

  static async unlockTechnology(techId: string): Promise<void> {
    const technologies = await this.loadTechnologies();
    const tech = technologies.find(t => t.id === techId);
    if (tech) {
      tech.unlocked = true;
      await this.saveTechnologies(technologies);
    }
  }

  // Market Data Management
  static async loadMarketData(): Promise<MarketData[]> {
    try {
      const data = await fs.readFile(MARKET_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async saveMarketData(marketData: MarketData[]): Promise<void> {
    await this.initializeDataDirectory();
    await fs.writeFile(MARKET_FILE, JSON.stringify(marketData, null, 2));
  }

  // Events Management
  static async loadEvents(): Promise<GameEvent[]> {
    try {
      const data = await fs.readFile(EVENTS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async saveEvents(events: GameEvent[]): Promise<void> {
    await this.initializeDataDirectory();
    await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
  }

  static async addEvent(event: GameEvent): Promise<void> {
    const events = await this.loadEvents();
    events.push(event);
    await this.saveEvents(events);
  }

  // Game Logs Management
  static async loadLogs(): Promise<GameLog[]> {
    try {
      const data = await fs.readFile(LOGS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async saveLogs(logs: GameLog[]): Promise<void> {
    await this.initializeDataDirectory();
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
  }

  static async addLog(log: GameLog): Promise<void> {
    const logs = await this.loadLogs();
    logs.push(log);
    
    // Keep only last 1000 logs to prevent file from growing too large
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    await this.saveLogs(logs);
  }

  // Utility Methods
  static async getAllData(): Promise<{
    studio: GameStudio | null;
    employees: Employee[];
    projects: GameProject[];
    completedGames: CompletedGame[];
    technologies: Technology[];
    marketData: MarketData[];
    events: GameEvent[];
    logs: GameLog[];
  }> {
    return {
      studio: await this.loadStudio(),
      employees: await this.loadEmployees(),
      projects: await this.loadProjects(),
      completedGames: await this.loadCompletedGames(),
      technologies: await this.loadTechnologies(),
      marketData: await this.loadMarketData(),
      events: await this.loadEvents(),
      logs: await this.loadLogs()
    };
  }

  static async clearAllData(): Promise<void> {
    try {
      await fs.rm(DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, ignore
    }
  }

  static async backupData(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), `game_backup_${timestamp}`);
    
    await fs.mkdir(backupDir, { recursive: true });
    
    try {
      await fs.cp(DATA_DIR, backupDir, { recursive: true });
      return backupDir;
    } catch (error) {
      throw new Error(`Failed to backup data: ${error}`);
    }
  }
}
