# 🃏 Yu-Gi-Oh AI Game

## 🎯 Giới thiệu

**Yu-Gi-Oh AI Game** là một dự án AI-driven game sử dụng **Model Context Protocol (MCP)** để tạo ra trải nghiệm chơi Yu-Gi-Oh với AI thông minh. Game được xây dựng với **React Ink** cho giao diện console đẹp mắt và **TypeScript** cho type safety.

### ✨ Tính năng chính

- 🎮 **Complete Yu-Gi-Oh Mechanics**: Summoning, battles, phases, tributes
- 🤖 **AI-Driven Logic**: AI hiểu rules và tự động xử lý game logic
- 🎨 **Beautiful Console UI**: React Ink với interactive interface
- 🔧 **MCP Integration**: 7 tools cho AI decision making
- 📊 **Real-time Updates**: File-based communication với AI
- 🃏 **40+ Cards Database**: Classic Yu-Gi-Oh cards với full details

## 🏗️ Kiến trúc

```
Yu-Gi-Oh AI Game
├── Game UI (React Ink) ←→ JSON Files ←→ MCP Server ←→ AI
├── Database Layer: Cards & Game State Schemas
├── Game Engine: Yu-Gi-Oh Rules & Mechanics
└── MCP Tools: AI Integration Interface
```

## 🚀 Cài đặt và Chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Build project

```bash
npm run build
```

### 3. Chạy Game

```bash
npm run start:game
```

### 4. Chạy MCP Server (cho AI)

```bash
npm run start:mcp
```

## 🔧 Cấu hình MCP với Claude Desktop

1. Mở Claude Desktop và vào Settings
2. Chọn mục Developer và bật Developer Mode
3. Tìm file cấu hình tại:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
4. Thêm cấu hình MCP:

```json
{
  "mcpServers": {
    "yugioh-ai": {
      "command": "node",
      "args": ["path/to/yugioh-ai-game/dist/mcp.js"]
    }
  }
}
```

## 🎮 Cách chơi

### Controls cơ bản:

- **[1]** - View Game Board (field, monsters, spells/traps)
- **[2]** - View Hand Cards (với navigation)
- **[3]** - View Game Log (action history)
- **[4]** - Help Screen
- **[N]** - Next Phase
- **[ESC]** - Exit Game

### Hand View Controls:

- **[←→]** - Navigate through cards
- **[D]** - Toggle card details
- **[S]** - Summon selected card

### Game Flow:

1. **Draw Phase**: Rút 1 thẻ (skip turn đầu)
2. **Standby Phase**: Resolve standby effects
3. **Main Phase 1**: Summon monsters, activate spells
4. **Battle Phase**: Attack với monsters
5. **Main Phase 2**: Additional actions
6. **End Phase**: End turn, discard to 6 cards

## 🤖 AI Integration

### MCP Tools Available:

1. **`readYuGiOhAction`** - Đọc player actions từ JSON
2. **`getYuGiOhRules`** - Comprehensive Yu-Gi-Oh rules
3. **`viewYuGiOhGameState`** - Current game state
4. **`updateYuGiOhGameState`** - Update game state
5. **`getYuGiOhCardDetails`** - Card information lookup
6. **`processYuGiOhAction`** - Process actions với game engine
7. **`searchYuGiOhCards`** - Search card database

### AI Workflow:

```
1. Player makes move → JSON file updated
2. AI reads action → analyzes game state
3. AI processes rules → makes decision
4. AI updates game state → JSON file updated
5. Game UI auto-refreshes → continues
```
