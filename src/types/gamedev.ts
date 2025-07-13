// Game Development Simulator Types - AI-Driven Architecture

// Core Game Studio
export interface GameStudio {
  id: string;
  name: string;
  founded: string;
  reputation: number; // 0-100
  money: number;
  employees: Employee[];
  currentProjects: GameProject[];
  completedGames: CompletedGame[];
  technologies: Technology[];
  marketResearch: MarketData[];
  lastUpdated: string;
}

// Employee System
export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  skills: SkillSet;
  salary: number;
  happiness: number; // 0-100
  productivity: number; // 0-100
  experience: number; // years
  hiredDate: string;
  traits: EmployeeTrait[];
}

export type EmployeeRole = 
  | 'programmer' 
  | 'designer' 
  | 'artist' 
  | 'sound_engineer' 
  | 'tester' 
  | 'producer' 
  | 'marketer';

export interface SkillSet {
  programming: number; // 0-100
  design: number;
  art: number;
  sound: number;
  testing: number;
  management: number;
  marketing: number;
}

export interface EmployeeTrait {
  id: string;
  name: string;
  description: string;
  effect: TraitEffect;
}

export interface TraitEffect {
  type: 'skill_bonus' | 'productivity_bonus' | 'salary_modifier' | 'special';
  value: number;
  target?: string;
}

// Game Development
export interface GameProject {
  id: string;
  name: string;
  genre: GameGenre;
  platform: Platform[];
  targetAudience: TargetAudience;
  budget: number;
  timeEstimate: number; // months
  currentPhase: DevelopmentPhase;
  progress: number; // 0-100
  quality: QualityMetrics;
  assignedEmployees: string[]; // employee IDs
  startDate: string;
  features: GameFeature[];
  bugs: Bug[];
  marketingCampaign?: MarketingCampaign;
}

export type GameGenre = 
  | 'action' 
  | 'rpg' 
  | 'strategy' 
  | 'puzzle' 
  | 'simulation' 
  | 'sports' 
  | 'racing' 
  | 'adventure' 
  | 'horror' 
  | 'indie';

export type Platform = 'pc' | 'mobile' | 'console' | 'web' | 'vr';

export type TargetAudience = 'kids' | 'teens' | 'adults' | 'hardcore' | 'casual' | 'all';

export type DevelopmentPhase = 
  | 'concept' 
  | 'pre_production' 
  | 'production' 
  | 'alpha' 
  | 'beta' 
  | 'gold_master' 
  | 'post_launch';

export interface QualityMetrics {
  gameplay: number; // 0-100
  graphics: number;
  sound: number;
  story: number;
  performance: number;
  overall: number;
}

export interface GameFeature {
  id: string;
  name: string;
  description: string;
  complexity: number; // 1-10
  implemented: boolean;
  timeRequired: number; // hours
  requiredSkills: EmployeeRole[];
}

export interface Bug {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  foundDate: string;
  fixedDate?: string;
  assignedTo?: string; // employee ID
}

// Completed Games
export interface CompletedGame {
  id: string;
  name: string;
  genre: GameGenre;
  platform: Platform[];
  releaseDate: string;
  developmentCost: number;
  marketingCost: number;
  sales: GameSales;
  reviews: GameReview[];
  awards: Award[];
}

export interface GameSales {
  totalUnits: number;
  totalRevenue: number;
  salesByPlatform: Record<Platform, number>;
  salesByMonth: MonthlyData[];
}

export interface GameReview {
  source: string;
  score: number; // 0-100
  date: string;
  summary: string;
}

export interface Award {
  name: string;
  category: string;
  year: number;
  prestige: number; // 1-10
}

// Technology & Research
export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  level: number; // 1-10
  researchCost: number;
  researchTime: number; // months
  unlocked: boolean;
  benefits: TechBenefit[];
}

export type TechCategory = 
  | 'engine' 
  | 'graphics' 
  | 'ai' 
  | 'networking' 
  | 'audio' 
  | 'tools' 
  | 'platform';

export interface TechBenefit {
  type: 'quality_bonus' | 'cost_reduction' | 'time_reduction' | 'new_feature';
  value: number;
  description: string;
}

// Market & Business
export interface MarketData {
  genre: GameGenre;
  platform: Platform;
  demand: number; // 0-100
  competition: number; // 0-100
  trendDirection: 'rising' | 'stable' | 'falling';
  averagePrice: number;
  month: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  budget: number;
  duration: number; // months
  channels: MarketingChannel[];
  effectiveness: number; // 0-100
  startDate: string;
}

export type MarketingChannel = 
  | 'social_media' 
  | 'gaming_press' 
  | 'influencers' 
  | 'conventions' 
  | 'advertising' 
  | 'beta_testing';

// Events & Random Events
export interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  choices: EventChoice[];
  triggerDate: string;
  resolved: boolean;
}

export type EventType = 
  | 'market_change' 
  | 'employee_event' 
  | 'technology_breakthrough' 
  | 'competitor_action' 
  | 'industry_news' 
  | 'crisis';

export interface EventChoice {
  id: string;
  text: string;
  consequences: EventConsequence[];
}

export interface EventConsequence {
  type: 'money' | 'reputation' | 'employee_stat' | 'project_impact' | 'tech_unlock';
  value: number;
  target?: string;
  description: string;
}

// Utility Types
export interface MonthlyData {
  month: string;
  value: number;
}

export interface GameLog {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  details?: any;
}

export type LogType = 
  | 'hire' 
  | 'fire' 
  | 'project_start' 
  | 'project_complete' 
  | 'game_release' 
  | 'research' 
  | 'event' 
  | 'financial';

// MCP Tool Parameters
export interface HireEmployeeParams {
  name: string;
  role: EmployeeRole;
  salary: number;
}

export interface StartProjectParams {
  name: string;
  genre: GameGenre;
  platform: Platform[];
  budget: number;
  assignedEmployees: string[];
}

export interface AdvanceTimeParams {
  months: number;
}

export interface ResearchTechParams {
  technologyId: string;
  assignedEmployees: string[];
}
