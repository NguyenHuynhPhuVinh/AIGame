# 🎮 HƯỚNG DẪN DEMO GAME KÉO BÚA BAO

## 🎯 Ý tưởng AI-Driven Game Logic

Thay vì hardcode logic game phức tạp, AI sẽ hiểu mô tả và tự động cập nhật game state thông qua MCP tools đơn giản.

## 🏗️ Kiến trúc

```
CMD Game (game.js) ←→ JSON Files ←→ MCP Server ←→ AI
```

### 📁 Files giao tiếp:

- **action.json**: CMD game ghi action → MCP đọc
- **gameState.json**: MCP ghi state → CMD game đọc

### 🔧 MCP Tools (chỉ 4 tools đơn giản):

1. **readPlayerAction**: Đọc action từ JSON
2. **getGameRules**: AI hiểu luật game
3. **viewGameState**: Xem trạng thái từ JSON
4. **updateGameState**: Ghi trạng thái mới vào JSON

## 🚀 Cách chạy Demo

### Bước 1: Build MCP Server

```bash
npm run build
```

### Bước 2: Chạy CMD Game

```bash
node game.js
```

### Bước 3: Tương tác

1. **CMD Game**: Người chơi chọn đá/giấy/kéo
2. **CMD Game**: Tự động random AI choice và ghi vào `action.json`
3. **CMD Game**: Chờ vĩnh viễn AI xử lý (watch file changes)
4. **AI**: Gọi `readPlayerAction` → `getGameRules` → `viewGameState` → `updateGameState`
5. **CMD Game**: Tự động cập nhật UI khi `gameState.json` thay đổi
6. **CMD Game**: Cho phép người chơi tiếp tục

## 🎮 Demo Commands cho AI

### Workflow chuẩn:

```
1. "Hãy đọc action từ CMD game" → readPlayerAction
2. "Cho tôi biết luật chơi" → getGameRules
3. "Xem trạng thái game hiện tại" → viewGameState
4. "Cập nhật game state với logic phù hợp" → updateGameState
```

### Ví dụ cụ thể:

```
CMD Game: Player chọn rock, AI random paper
Action JSON: {"player1Choice": "rock", "player2Choice": "paper", ...}

AI workflow:
1. Đọc action → thấy rock vs paper
2. Hiểu luật → paper thắng rock
3. Xem state → round 1, score 0-0
4. Cập nhật → AI thắng, score 0-1, chuyển round 2

CMD Game: Tự động hiển thị kết quả mới!
```

## 🎯 Ưu điểm của approach này

1. **AI-Driven**: Logic game do AI quyết định, không hardcode
2. **Flexible**: Dễ mở rộng cho game phức tạp hơn (Yu-Gi-Oh, etc.)
3. **Simple MCP**: Chỉ 4 tools đơn giản, dễ maintain
4. **File-based**: Giao tiếp qua JSON, dễ debug
5. **Separation**: CMD game chỉ UI, MCP chỉ đọc/ghi, AI làm logic

## 🔮 Mở rộng cho game phức tạp

Với approach này, có thể dễ dàng tạo:

- **Card games**: AI đọc mô tả thẻ bài và tự xử lý effect
- **RPG games**: AI hiểu skill description và cập nhật stats
- **Strategy games**: AI phân tích move và cập nhật board state

## 🧪 Test nhanh

Nếu không muốn chạy CMD game, có thể test trực tiếp:

```
1. Tạo action.json thủ công
2. Gọi readPlayerAction
3. Gọi updateGameState với logic mong muốn
```

## 📝 Lưu ý

- CMD game tự khởi tạo gameState.json khi start
- MCP chỉ đọc/ghi, không tạo state
- AI là "brain" chính của game logic
- File-based communication đảm bảo persistence
