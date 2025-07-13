// Game Development Simulator Data
import { 
  Technology, 
  EmployeeTrait, 
  GameFeature, 
  MarketData,
  TechCategory,
  GameGenre,
  Platform,
  EmployeeRole
} from '../types/gamedev.js';

// Available Technologies
export const TECHNOLOGIES: Technology[] = [
  // Engine Technologies
  {
    id: 'basic_engine',
    name: 'Basic Game Engine',
    category: 'engine',
    level: 1,
    researchCost: 10000,
    researchTime: 2,
    unlocked: true,
    benefits: [
      { type: 'quality_bonus', value: 10, description: 'Basic game development capabilities' }
    ]
  },
  {
    id: 'advanced_engine',
    name: 'Advanced 3D Engine',
    category: 'engine',
    level: 3,
    researchCost: 50000,
    researchTime: 6,
    unlocked: false,
    benefits: [
      { type: 'quality_bonus', value: 25, description: 'Advanced 3D rendering and physics' },
      { type: 'new_feature', value: 1, description: 'Unlocks 3D game development' }
    ]
  },
  {
    id: 'next_gen_engine',
    name: 'Next-Gen Engine',
    category: 'engine',
    level: 5,
    researchCost: 200000,
    researchTime: 12,
    unlocked: false,
    benefits: [
      { type: 'quality_bonus', value: 40, description: 'Cutting-edge graphics and performance' },
      { type: 'time_reduction', value: 20, description: 'Faster development with advanced tools' }
    ]
  },

  // Graphics Technologies
  {
    id: 'basic_graphics',
    name: 'Basic 2D Graphics',
    category: 'graphics',
    level: 1,
    researchCost: 5000,
    researchTime: 1,
    unlocked: true,
    benefits: [
      { type: 'quality_bonus', value: 5, description: 'Basic 2D sprite rendering' }
    ]
  },
  {
    id: 'advanced_graphics',
    name: 'Advanced Shaders',
    category: 'graphics',
    level: 3,
    researchCost: 30000,
    researchTime: 4,
    unlocked: false,
    benefits: [
      { type: 'quality_bonus', value: 20, description: 'Custom shaders and visual effects' }
    ]
  },
  {
    id: 'ray_tracing',
    name: 'Real-time Ray Tracing',
    category: 'graphics',
    level: 5,
    researchCost: 150000,
    researchTime: 8,
    unlocked: false,
    benefits: [
      { type: 'quality_bonus', value: 35, description: 'Photorealistic lighting and reflections' }
    ]
  },

  // AI Technologies
  {
    id: 'basic_ai',
    name: 'Basic Game AI',
    category: 'ai',
    level: 1,
    researchCost: 8000,
    researchTime: 2,
    unlocked: true,
    benefits: [
      { type: 'quality_bonus', value: 8, description: 'Simple NPC behavior' }
    ]
  },
  {
    id: 'advanced_ai',
    name: 'Machine Learning AI',
    category: 'ai',
    level: 4,
    researchCost: 80000,
    researchTime: 6,
    unlocked: false,
    benefits: [
      { type: 'quality_bonus', value: 30, description: 'Adaptive and intelligent NPCs' },
      { type: 'new_feature', value: 1, description: 'Procedural content generation' }
    ]
  },

  // Networking
  {
    id: 'basic_networking',
    name: 'Basic Multiplayer',
    category: 'networking',
    level: 2,
    researchCost: 25000,
    researchTime: 3,
    unlocked: false,
    benefits: [
      { type: 'new_feature', value: 1, description: 'Local multiplayer support' }
    ]
  },
  {
    id: 'online_networking',
    name: 'Online Multiplayer',
    category: 'networking',
    level: 4,
    researchCost: 100000,
    researchTime: 8,
    unlocked: false,
    benefits: [
      { type: 'new_feature', value: 1, description: 'Online multiplayer with matchmaking' },
      { type: 'quality_bonus', value: 25, description: 'Stable online experience' }
    ]
  }
];

// Employee Traits
export const EMPLOYEE_TRAITS: EmployeeTrait[] = [
  {
    id: 'workaholic',
    name: 'Workaholic',
    description: 'Works extra hours but burns out faster',
    effect: { type: 'productivity_bonus', value: 25 }
  },
  {
    id: 'creative_genius',
    name: 'Creative Genius',
    description: 'Exceptional creative abilities',
    effect: { type: 'skill_bonus', value: 30, target: 'design' }
  },
  {
    id: 'coding_wizard',
    name: 'Coding Wizard',
    description: 'Master programmer with exceptional skills',
    effect: { type: 'skill_bonus', value: 35, target: 'programming' }
  },
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Boosts team morale and productivity',
    effect: { type: 'special', value: 15 }
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Produces higher quality work but slower',
    effect: { type: 'skill_bonus', value: 20 }
  },
  {
    id: 'budget_conscious',
    name: 'Budget Conscious',
    description: 'Helps reduce project costs',
    effect: { type: 'salary_modifier', value: -20 }
  },
  {
    id: 'innovative',
    name: 'Innovative',
    description: 'Comes up with breakthrough ideas',
    effect: { type: 'special', value: 25 }
  },
  {
    id: 'experienced',
    name: 'Industry Veteran',
    description: 'Years of experience in game development',
    effect: { type: 'skill_bonus', value: 15 }
  }
];

// Common Game Features
export const GAME_FEATURES: GameFeature[] = [
  {
    id: 'basic_gameplay',
    name: 'Core Gameplay Loop',
    description: 'The fundamental game mechanics',
    complexity: 5,
    implemented: false,
    timeRequired: 200,
    requiredSkills: ['programmer', 'designer']
  },
  {
    id: 'ui_system',
    name: 'User Interface',
    description: 'Menus, HUD, and user interaction',
    complexity: 3,
    implemented: false,
    timeRequired: 80,
    requiredSkills: ['programmer', 'designer', 'artist']
  },
  {
    id: 'save_system',
    name: 'Save/Load System',
    description: 'Player progress persistence',
    complexity: 4,
    implemented: false,
    timeRequired: 60,
    requiredSkills: ['programmer']
  },
  {
    id: 'audio_system',
    name: 'Audio System',
    description: 'Music and sound effects',
    complexity: 3,
    implemented: false,
    timeRequired: 100,
    requiredSkills: ['sound_engineer', 'programmer']
  },
  {
    id: 'multiplayer',
    name: 'Multiplayer Support',
    description: 'Online or local multiplayer',
    complexity: 8,
    implemented: false,
    timeRequired: 300,
    requiredSkills: ['programmer']
  },
  {
    id: 'achievements',
    name: 'Achievement System',
    description: 'Player achievements and rewards',
    complexity: 2,
    implemented: false,
    timeRequired: 40,
    requiredSkills: ['programmer', 'designer']
  },
  {
    id: 'tutorial',
    name: 'Tutorial System',
    description: 'Teaches players how to play',
    complexity: 4,
    implemented: false,
    timeRequired: 80,
    requiredSkills: ['designer', 'programmer']
  },
  {
    id: 'localization',
    name: 'Localization',
    description: 'Multiple language support',
    complexity: 3,
    implemented: false,
    timeRequired: 60,
    requiredSkills: ['programmer']
  }
];

// Initial Market Data
export const INITIAL_MARKET_DATA: MarketData[] = [
  // PC Market
  { genre: 'action', platform: 'pc', demand: 75, competition: 80, trendDirection: 'stable', averagePrice: 59.99, month: '2024-01' },
  { genre: 'rpg', platform: 'pc', demand: 70, competition: 60, trendDirection: 'rising', averagePrice: 49.99, month: '2024-01' },
  { genre: 'strategy', platform: 'pc', demand: 65, competition: 50, trendDirection: 'stable', averagePrice: 39.99, month: '2024-01' },
  { genre: 'indie', platform: 'pc', demand: 80, competition: 90, trendDirection: 'rising', averagePrice: 19.99, month: '2024-01' },
  
  // Mobile Market
  { genre: 'puzzle', platform: 'mobile', demand: 85, competition: 95, trendDirection: 'stable', averagePrice: 2.99, month: '2024-01' },
  { genre: 'action', platform: 'mobile', demand: 90, competition: 85, trendDirection: 'rising', averagePrice: 4.99, month: '2024-01' },
  { genre: 'simulation', platform: 'mobile', demand: 70, competition: 60, trendDirection: 'rising', averagePrice: 3.99, month: '2024-01' },
  
  // Console Market
  { genre: 'action', platform: 'console', demand: 85, competition: 70, trendDirection: 'stable', averagePrice: 69.99, month: '2024-01' },
  { genre: 'sports', platform: 'console', demand: 75, competition: 40, trendDirection: 'stable', averagePrice: 59.99, month: '2024-01' },
  { genre: 'racing', platform: 'console', demand: 60, competition: 45, trendDirection: 'falling', averagePrice: 49.99, month: '2024-01' }
];

// Helper Functions
export function getRandomEmployeeName(): string {
  const firstNames = [
    'Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn',
    'Sage', 'River', 'Phoenix', 'Skyler', 'Cameron', 'Dakota', 'Emery', 'Finley'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'
  ];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

export function getRandomTrait(): EmployeeTrait {
  return EMPLOYEE_TRAITS[Math.floor(Math.random() * EMPLOYEE_TRAITS.length)];
}

export function getTechnologyById(id: string): Technology | undefined {
  return TECHNOLOGIES.find(tech => tech.id === id);
}

export function getFeatureById(id: string): GameFeature | undefined {
  return GAME_FEATURES.find(feature => feature.id === id);
}
