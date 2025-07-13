# Game Architecture Redesign: AI-Driven Logic

## 🎯 Triết Lý Thiết Kế

**Game Engine = Pure State Management**
- Không có business logic
- Chỉ lưu trữ và trả về trạng thái
- Validation cơ bản (syntax, format)
- AI sẽ quyết định toàn bộ game logic

## 🏗️ Architecture Mới

### 1. State Management Files

```
src/state/
├── gameState.ts          # Core game state management
├── playerState.ts        # Player-specific state
├── fieldState.ts         # Field/battlefield state
├── cardState.ts          # Card instances and tracking
├── combatState.ts        # Combat resolution state
└── historyState.ts       # Game history and logs
```

### 2. MCP Tools Structure

```
src/mcp/tools/
├── state/
│   ├── getGameState.ts       # Read current game state
│   ├── getPlayerState.ts     # Read player-specific state
│   ├── getFieldState.ts      # Read field state
│   └── getCardState.ts       # Read card states
├── actions/
│   ├── updateGamePhase.ts    # Update game phase
│   ├── updatePlayerHP.ts     # Update player HP
│   ├── updatePlayerMana.ts   # Update player mana
│   ├── addCardToHand.ts      # Add card to hand
│   ├── removeCardFromHand.ts # Remove card from hand
│   ├── addWaifuToField.ts    # Add waifu to field
│   ├── removeWaifuFromField.ts # Remove waifu from field
│   ├── updateWaifuStatus.ts  # Update waifu status
│   └── addGameLog.ts         # Add log entry
└── validation/
    ├── validateGameState.ts  # Validate state consistency
    ├── validatePlayerAction.ts # Basic action validation
    └── validateCardData.ts   # Validate card data
```

## 📊 State Schema

### Game State
```typescript
interface GameState {
  gameId: string;
  status: 'waiting' | 'playing' | 'finished';
  currentPlayer: 'player1' | 'player2';
  turnNumber: number;
  phase: 'draw' | 'main' | 'battle' | 'end';
  winner?: 'player1' | 'player2' | 'draw';
  createdAt: string;
  lastUpdated: string;
}
```

### Player State
```typescript
interface PlayerState {
  playerId: string;
  name: string;
  hp: number;
  mana: number;
  maxMana: number;
  handSize: number;
  deckSize: number;
  fieldSize: number;
  graveyardSize: number;
}
```

### Field State
```typescript
interface FieldState {
  player1Field: WaifuInstance[];
  player2Field: WaifuInstance[];
  maxFieldSize: number;
}

interface WaifuInstance {
  instanceId: string;
  cardId: string;
  ownerId: string;
  position: number;
  status: 'summoning_sickness' | 'ready' | 'tapped' | 'stunned';
  currentHP?: number; // If different from base
  modifiers: Modifier[];
  summonedTurn: number;
}
```

### Card State
```typescript
interface CardState {
  player1Hand: CardInstance[];
  player2Hand: CardInstance[];
  player1Deck: CardInstance[];
  player2Deck: CardInstance[];
  player1Graveyard: CardInstance[];
  player2Graveyard: CardInstance[];
}

interface CardInstance {
  instanceId: string;
  cardId: string;
  ownerId: string;
  location: 'hand' | 'deck' | 'field' | 'graveyard';
  position?: number;
}
```

## 🔧 MCP Tools Implementation

### State Reading Tools

#### `getGameState`
```typescript
// Returns current game state
{
  "name": "getGameState",
  "description": "Get current game state",
  "parameters": {}
}
```

#### `getPlayerState`
```typescript
{
  "name": "getPlayerState", 
  "description": "Get player-specific state",
  "parameters": {
    "playerId": "player1 | player2"
  }
}
```

#### `getFieldState`
```typescript
{
  "name": "getFieldState",
  "description": "Get current field state with all waifus",
  "parameters": {}
}
```

#### `getCardState`
```typescript
{
  "name": "getCardState",
  "description": "Get card states (hands, decks, graveyards)",
  "parameters": {
    "playerId": "player1 | player2",
    "location": "hand | deck | graveyard | all"
  }
}
```

### State Modification Tools

#### `updateGamePhase`
```typescript
{
  "name": "updateGamePhase",
  "description": "Update current game phase",
  "parameters": {
    "phase": "draw | main | battle | end",
    "currentPlayer": "player1 | player2",
    "turnNumber": "number"
  }
}
```

#### `updatePlayerStats`
```typescript
{
  "name": "updatePlayerStats",
  "description": "Update player HP and mana",
  "parameters": {
    "playerId": "player1 | player2",
    "hp": "number",
    "mana": "number",
    "maxMana": "number"
  }
}
```

#### `moveCard`
```typescript
{
  "name": "moveCard",
  "description": "Move card between locations",
  "parameters": {
    "cardInstanceId": "string",
    "fromLocation": "hand | deck | field | graveyard",
    "toLocation": "hand | deck | field | graveyard",
    "position": "number"
  }
}
```

#### `summonWaifu`
```typescript
{
  "name": "summonWaifu",
  "description": "Create waifu instance on field",
  "parameters": {
    "cardInstanceId": "string",
    "playerId": "player1 | player2",
    "position": "number",
    "status": "summoning_sickness | ready"
  }
}
```

#### `updateWaifuStatus`
```typescript
{
  "name": "updateWaifuStatus",
  "description": "Update waifu status and stats",
  "parameters": {
    "waifuInstanceId": "string",
    "status": "summoning_sickness | ready | tapped | stunned",
    "currentHP": "number",
    "modifiers": "Modifier[]"
  }
}
```

#### `removeWaifu`
```typescript
{
  "name": "removeWaifu",
  "description": "Remove waifu from field",
  "parameters": {
    "waifuInstanceId": "string",
    "reason": "destroyed | returned | sacrificed"
  }
}
```

#### `addGameLog`
```typescript
{
  "name": "addGameLog",
  "description": "Add entry to game log",
  "parameters": {
    "playerId": "string",
    "action": "string",
    "description": "string",
    "details": "object"
  }
}
```

## 🤖 AI Logic Responsibilities

### Turn Management
- AI quyết định khi nào advance phase
- AI quyết định khi nào end turn
- AI quản lý turn order

### Combat Resolution
- AI tính toán combat damage
- AI quyết định combat outcomes
- AI áp dụng combat effects

### Card Effects
- AI interpret card abilities
- AI resolve card interactions
- AI handle triggered effects

### Win Conditions
- AI check win conditions
- AI declare game winner
- AI handle game end

### Rule Enforcement
- AI enforce game rules
- AI prevent illegal moves
- AI handle edge cases

## 🎮 Game Flow Example

### AI Turn Sequence
1. **Draw Phase**
   ```typescript
   // AI calls:
   updateGamePhase({phase: "draw", currentPlayer: "player1", turnNumber: 2})
   moveCard({cardInstanceId: "...", fromLocation: "deck", toLocation: "hand"})
   updatePlayerStats({playerId: "player1", mana: 2, maxMana: 2})
   ```

2. **Main Phase**
   ```typescript
   // AI calls:
   updateGamePhase({phase: "main"})
   // AI decides to summon waifu
   moveCard({cardInstanceId: "...", fromLocation: "hand", toLocation: "field"})
   summonWaifu({cardInstanceId: "...", playerId: "player1", status: "summoning_sickness"})
   updatePlayerStats({playerId: "player1", mana: 0})
   ```

3. **Battle Phase**
   ```typescript
   // AI calls:
   updateGamePhase({phase: "battle"})
   updateWaifuStatus({waifuInstanceId: "...", status: "ready"})
   // AI resolves combat
   updatePlayerStats({playerId: "player2", hp: 15})
   removeWaifu({waifuInstanceId: "...", reason: "destroyed"})
   addGameLog({action: "combat", description: "Akane defeats Yuki"})
   ```

4. **End Phase**
   ```typescript
   // AI calls:
   updateGamePhase({phase: "end"})
   updateGamePhase({phase: "draw", currentPlayer: "player2", turnNumber: 2})
   ```

## 🔍 Validation Layer

### Basic Validations (Engine Level)
- Schema validation
- Data type checking
- Required field validation
- ID uniqueness

### Game Logic Validations (AI Level)
- Rule compliance
- Action legality
- Resource availability
- Timing restrictions

## 📈 Benefits

### 1. Flexibility
- AI có thể implement bất kỳ rule nào
- Dễ dàng thay đổi game mechanics
- Có thể test different rule sets

### 2. Maintainability
- Engine code đơn giản, ít bug
- Logic tách biệt khỏi infrastructure
- Dễ debug và test

### 3. Extensibility
- Thêm card types mới dễ dàng
- Implement special abilities linh hoạt
- Support multiple game modes

### 4. AI Learning
- AI có thể học từ game patterns
- Optimize strategies over time
- Adapt to different play styles

## 🚀 Implementation Plan

### Phase 1: Core State Management
1. Implement basic state schemas
2. Create state reading tools
3. Create state modification tools
4. Add basic validation

### Phase 2: AI Integration
1. Migrate current logic to AI calls
2. Implement turn management
3. Implement combat resolution
4. Add comprehensive logging

### Phase 3: Advanced Features
1. Add card effect system
2. Implement special abilities
3. Add game modes
4. Optimize performance

## 📝 Migration Strategy

### Current → New
```typescript
// Old: Engine decides
function advancePhase(playerId) {
  // Complex logic here
  gameState.phase = nextPhase;
}

// New: AI decides
// AI calls: updateGamePhase({phase: "battle"})
function updateGamePhase(params) {
  // Simple state update
  gameState.phase = params.phase;
}
```

---
*Thiết kế architecture mới cho Waifu Card Game - AI-Driven Logic*