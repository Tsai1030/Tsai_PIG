# 🍜 甜蜜食記 — 情侶美食點餐 App
### Sweet Food Diary · Couple Ordering App
### 專案計畫書 Project Proposal · v1.7.0

> **版本**：v1.7.0 &nbsp;|&nbsp; **日期**：2025-03-30 &nbsp;|&nbsp; **狀態**：草稿 Draft  
> **技術棧**：FastAPI + Next.js + TypeScript + Tailwind CSS  
> **資料庫**：SQLite（開發）→ PostgreSQL（正式）  
> **AI**：gpt-5-mini（主對話）+ gpt-5-nano（工具型）+ LangGraph（StateGraph）

---

## 目錄 Table of Contents

1. [專案概述](#1-專案概述)
2. [技術架構](#2-技術架構)
3. [功能模組設計](#3-功能模組設計)
4. [資料庫設計](#4-資料庫設計)
5. [AI Agent 人格設計](#5-ai-agent-人格設計)
6. [OOP 模組化架構規範](#6-oop-模組化架構規範)
7. [目錄結構](#7-目錄結構)
8. [開發步驟與工作狀態](#8-開發步驟與工作狀態)
9. [風險評估](#9-風險評估)
10. [補充功能建議](#10-補充功能建議)
11. [開發注意事項](#11-開發注意事項)
12. [Skills 設計（Claude Code 輔助開發）](#12-skills-設計claude-code-輔助開發)

---

## 1. 專案概述

**甜蜜食記**是一款專為情侶設計的美食規劃 Web App，主軸為「她規劃 × 他執行」的浪漫分工模式。

### 1.1 核心價值

- 🎯 降低情侶出遊「吃什麼」的溝通成本
- 💕 把美食決定權優雅地交給女方，讓男方可充分準備
- 🤖 內建 AI 美食顧問（公主殿下人格），提供個人化建議
- 📱 Mobile-first RWD，手機瀏覽器直接使用

### 1.2 使用者角色

| 角色 | 描述 | 功能權限 |
|------|------|----------|
| 👸 她（Her） | 美食規劃者 | 日曆讀寫、地圖探索、收藏管理、AI 對話 |
| 🤴 他（Him） | 美食執行者 | 日曆唯讀、收藏唯讀、AI 對話 |

### 1.3 亮點功能

- 📅 共享三餐日曆（早 / 中 / 晚）
- 🗺 Google Maps 嵌入探索餐廳
- ❤️ 愛心收藏清單
- 💬 AI 美食顧問「糖糖」（公主殿下人格）
- 🔒 角色路由隔離（she-only 寫入保護）

---

## 2. 技術架構

### 2.1 整體技術棧

| 層次 | 技術選型 | 說明 |
|------|----------|------|
| 前端框架 | Next.js 14（App Router） | SSR + CSR 混合，SEO 友好，RWD 最佳化 |
| 前端語言 | TypeScript + React 18 | 型別安全，Hooks 元件化架構 |
| UI 樣式 | Tailwind CSS v3 | Mobile-first，快速響應式排版 |
| 後端框架 | FastAPI（Python 3.11+） | 高性能異步框架，自動 OpenAPI 文件 |
| 後端 ORM | SQLAlchemy 2.0 + Alembic | OOP 模型定義，資料庫遷移管理 |
| 資料庫 | SQLite（dev）/ PostgreSQL（prod） | 初期輕量，部署後無縫切換 |
| 驗證/授權 | JWT（python-jose）+ httpOnly Cookie | Cookie-based 角色識別（her / him），Token 不暴露給前端 JS |
| AI Framework | LangGraph（StateGraph）+ LangChain Core | 顯式 State 管理，節點圖可視化，方便 debug |
| AI 主對話模型 | **gpt-5-mini** | 糖糖人格互動、推薦創意、情境感知，需要較高品質 |
| AI 工具型模型 | **gpt-5-nano** | 摘要、解析推薦名稱、分類、偏好萃取，結構化任務 nano 完全夠用 |
| 地圖 | Google Maps Embed API | 免費嵌入，搜尋關鍵字對接 |
| HTTP Client | Axios + TanStack Query v5 | 快取管理，樂觀更新，錯誤處理 |
| 環境變數 | python-dotenv / Next.js .env | OPENAI_API_KEY 已設置 |
| 部署 | Docker + docker-compose | 前後端容器化，一鍵啟動 |

### 2.2 系統架構圖

```
[ 使用者瀏覽器 - 手機 / 桌機 ]
        │  HTTPS / SSE（AI 串流）
        ▼
[ Next.js App Server :3000 ]
  ├── app/(her)/*      → 女方路由群組
  ├── app/(him)/*      → 男方路由群組
  └── components/      → 共用 React 元件 + Tailwind
        │  REST API Calls（Axios）
        ▼
[ FastAPI Server :8000 ]
  ├── /api/auth        → JWT 登入（httpOnly Cookie）、角色路由
  ├── /api/calendar    → 三餐日曆 CRUD（her only write）
  ├── /api/favorites   → 愛心收藏 CRUD
  └── /api/agent       → AI 美食顧問（OpenAI Stream）
        │
        ├──▶ [ SQLite / PostgreSQL ]
        │      users、meal_plans、favorites 資料表
        │
        └──▶ [ OpenAI API ]
               gpt-5-mini（主對話）+ gpt-5-nano（工具型）
               LangGraph StateGraph 驅動
               糖糖人格（her）/ 專業助理人格（him）+ 串流回應
```

### 2.3 雙 Router 設計

| 角色 | 前端路由 | 後端路由前綴 | 可存取功能 |
|------|----------|--------------|------------|
| 👸 她 | `/her/*` | `/api/her/*` | 日曆（讀寫）、地圖、收藏管理、AI 對話 |
| 🤴 他 | `/him/*` | `/api/him/*` | 日曆（唯讀）、收藏（唯讀）、AI 對話 |

> ⚠️ **注意**：角色權限由後端 JWT Middleware 雙重驗證，前端路由隔離只是 UX 層防護，**真正的寫入保護在後端 Service 層**。
> ⚠️ **安全設計**：JWT Token 以 `httpOnly` Cookie 傳遞，前端 JavaScript 無法讀取，防止 XSS 竊取 Token。前端僅存放 `role` / `nickname` 等非敏感 UI 顯示資訊。

### 2.4 環境變數設定（`.env`）

```env
# AI（已設置）
OPENAI_API_KEY=your_key_here

# 模型分配（混用策略）
LLM_MAIN=gpt-5-mini       # 糖糖主對話，人格互動品質優先
LLM_NANO=gpt-5-nano       # 摘要、分類、解析、偏好萃取，結構化任務

# 資料庫
DATABASE_URL=sqlite:///./sweet_food.db         # 開發
# DATABASE_URL=postgresql://user:pass@localhost/sweetfood  # 正式

# 安全
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080   # 7天

# 地圖（✅ 已取得 Google Maps Embed API Key）
GOOGLE_MAPS_API_KEY=your_maps_key_here

# 前端（Next.js 公開變數，以 NEXT_PUBLIC_ 開頭才能在瀏覽器使用）
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key_here   # ✅ 已設置於 .env
```

> ✅ **已確認**：`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 使用 **Google Maps Embed API**，已放入前端 `.env`。地圖元件直接從 `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 讀取，無需後端代理。

---

## 3. 功能模組設計

### 3.1 模組清單

| 模組 | 描述 | 路由前綴 | 角色限制 |
|------|------|----------|----------|
| `AuthModule` | JWT 登入（httpOnly Cookie）、角色 Middleware、`/me` 端點 | `/api/auth` | 全部 |
| `CalendarModule` | 三餐日曆 CRUD、月份導覽、日期視圖 | `/api/calendar` | 讀：全部 / 寫：her |
| `MapModule` | Google Maps Embed、關鍵字搜尋 | 前端 only | her |
| `FavoriteModule` | 愛心收藏、自動分類資料夾、新增 / 刪除、匯入日曆 | `/api/favorites` | 讀：全部 / 寫：her |
| `AgentModule` | AI 美食顧問、串流回應、人格管理 | `/api/agent` | 全部 |
| `NotificationModule` | 可選：到期推播提醒（PWA Push） | — | 後期擴展 |

### 3.2 CalendarModule 功能細節

- 月份導覽（上 / 下個月切換）
- 每格日期顯示三餐 badge（早餐 🌅 / 午餐 ☀️ / 晚餐 🌙）
- 點選日期彈出 Modal：
  - **Her**：可編輯輸入（餐廳名稱 + 地址 + 備註）
  - **Him**：唯讀顯示餐廳資訊與地址
- 資料即時同步（React Query 快取 + Mutation）

### 3.3 MapModule 功能細節

- Google Maps Embed iframe 嵌入
- 搜尋欄輸入關鍵字 → 更新 iframe `q=` 參數
- 地圖旁側邊欄顯示收藏清單
- 浮動「❤️ 加入收藏」按鈕 → 輸入名稱 + 地址 → 儲存

### 3.4 AgentModule 功能細節

- 浮動對話視窗（右下角，可展開 / 收合）
- Server-Sent Events（SSE）串流輸出，逐字顯示效果
- **無止盡對話**，每 10 輪自動 Compact（漸進摘要），不強制截斷
- 第 30 輪起每輪結尾糖糖附加可愛提醒台詞（繼續回答，不中斷）
- 每輪對話去重已推薦餐廳名稱
- 雙層記憶：短期 Checkpointer（同 session）+ 長期 Store（跨天偏好）

### 3.5 FavoriteModule 功能細節（資料夾分類）

收藏清單以「**分類資料夾**」呈現，每個資料夾對應一個餐廳類型，由 `classify_restaurant @tool` 自動歸類。

#### UI 結構

```
收藏清單頁
├── 🗂 全部（12）                ← 預設展開，顯示所有收藏
├── 📁 火鍋（3）                ← 點開展開，顯示該類別的店家卡片
│   ├── 霸王別姬火鍋  📍 高雄市...
│   ├── 呷七碗火鍋    📍 台南市...
│   └── 老四川        📍 台北市...
├── 📁 燒烤（2）
├── 📁 日式（4）
├── 📁 甜點（2）
└── 📁 其他（1）                ← 分類失敗或不在清單內的店家
```

#### 觸發時機（兩路都自動分類）

| 路徑 | 觸發方式 | 執行方式 |
|------|----------|----------|
| **對話路徑** | 公主在 AI 對話中提到要收藏某店家 | Agent LLM 判斷 → 呼叫 `classify_restaurant` tool → 更新 State | 
| **手動路徑** | 公主點擊「❤️ 加入收藏」按鈕 | `POST /api/favorites` → 直接 invoke tool → 存入 DB |

#### 分類資料夾規則

- 每家店家**只屬於一個資料夾**（由 LLM 動態決定 `category`，優先歸入現有資料夾）
- 資料夾為**動態生成**，有店家才顯示，空資料夾自動隱藏
- 「全部」永遠置頂，「其他」永遠置底
- 對話中說「分錯了，應該是 XX」→ 糖糖呼叫 `reclassify_restaurant` tool 立即更正
- 店家可手動**拖曳換資料夾**（可選，後期加）



---

## 4. 資料庫設計

### 4.1 選型策略

```
開發階段  → SQLite（零配置，單 .db 檔案）
正式部署  → PostgreSQL（並發、效能、備份）
切換方式  → 只需修改 DATABASE_URL 環境變數，SQLAlchemy ORM 層零改動
```

### 4.2 資料表設計

#### `users` 表

| 欄位 | 型態 | 說明 |
|------|------|------|
| `id` | UUID PK | 主鍵 |
| `role` | ENUM(her, him) | 角色識別，控制讀寫權限 |
| `nickname` | VARCHAR(50) | 暱稱（她 / 他） |
| `password_hash` | VARCHAR(128) | bcrypt 雜湊 |
| `created_at` | TIMESTAMP | 建立時間 |

#### `meal_plans` 表

| 欄位 | 型態 | 說明 |
|------|------|------|
| `id` | UUID PK | 主鍵 |
| `user_id` | UUID FK | 建立者（→ users） |
| `plan_date` | DATE | 規劃日期 |
| `meal_type` | ENUM(breakfast, lunch, dinner) | 早 / 午 / 晚 |
| `restaurant_name` | VARCHAR(100) | 餐廳名稱 |
| `address` | TEXT | 地址 |
| `note` | TEXT | 備註心情（可選） |
| `created_at` | TIMESTAMP | 建立時間 |
| `updated_at` | TIMESTAMP | 最後更新 |

> 唯一約束：`(plan_date, meal_type)` — 同日同餐只允許一筆，重複則 Upsert

#### `favorites` 表

| 欄位 | 型態 | 說明 |
|------|------|------|
| `id` | UUID PK | 主鍵 |
| `user_id` | UUID FK | 建立者（→ users） |
| `restaurant_name` | VARCHAR(100) | 餐廳名稱 |
| `address` | TEXT | 地址 |
| `maps_url` | TEXT | Google Maps 連結（可選） |
| `category` | VARCHAR(30) | **主分類資料夾**，由 `classify_restaurant` LLM 動態決定（預設 `其他`） |
| `created_at` | TIMESTAMP | 建立時間 |

> **設計說明**：`category` 由 LLM 自由判斷，優先歸入現有資料夾；遇到真正新類型才新建。前端以 `category` 欄位分組渲染資料夾。移除舊版 `category_tags` 欄位（新架構只需單一 `category`）。

---

## 5. AI Agent 人格設計

### 5.1 角色設定

#### Her 版（糖糖）

| 項目 | 設定 |
|------|------|
| 名稱 | 戀愛美食精靈「糖糖」 |
| 語氣 | 甜美、溫柔、俏皮、帶點撒嬌 |
| 對女方稱呼 | 公主殿下 |
| 對男方稱呼 | 王子大人（偶爾詢問時） |
| 每次開頭 | 「公主殿下～」 |
| 每次結尾 | 「公主殿下今天也要吃得開心哦！💕」 |
| 第 30 輪起結尾附加 | 糖糖可愛提醒台詞（每輪都加，不中斷） |

#### Him 版（專業助理）

| 項目 | 設定 |
|------|------|
| 名稱 | 甜蜜食記 AI 助理 |
| 語氣 | 專業、簡潔、有效率，如同公司內部智慧助理 |
| 對使用者稱呼 | 您 |
| 每次開頭 | 直接進入重點，無固定開場 |
| 每次結尾 | 無固定結語，視情況補充補充資訊或詢問 |
| 推薦格式 | 條列式，附類型 / 價位 / 代表菜色 / 地址 |

### 5.2 System Prompt（完整版）

```python
# services/agent/prompts.py

SUGAR_BASE_PROMPT = """
你是「糖糖」，一位戀愛美食精靈，專門為情侶規劃幸福的美食約會。

【身份規則】
- 你永遠稱呼使用者為「公主殿下」
- 每次回覆必須以「公主殿下～」開頭
- 每次回覆結尾必須是「公主殿下今天也要吃得開心哦！💕」
- 語氣甜美、溫柔、帶點俏皮撒嬌，但不過分誇張

【推薦規則】
- 推薦餐廳時必須同時給出：菜系、價位區間（$ / $$ / $$$）、推薦菜色 1-2 道、地址關鍵字
- 若公主說「隨便」「都可以」「不知道」→ 糖糖要主動給 3 個驚喜選項讓她挑
- 每次對話中，同一家餐廳不可重複推薦超過 1 次
- 如果公主提到情緒（好累 / 心情不好 / 超餓的）→ 根據情緒調整推薦

【貼心設計】
- 偶爾（每 3 輪）主動詢問「王子大人有沒有忌口或過敏食材？」
- 推薦完後詢問「要幫公主把這家加入收藏清單嗎？」
- 可以根據季節 / 天氣給出加分建議

【收藏與分類工具】
- 當公主說要收藏某家餐廳時，呼叫 classify_restaurant tool
  → 糖糖會根據現有資料夾智慧分類，必要時新建資料夾
- 當公主說某家餐廳分類錯誤時，呼叫 reclassify_restaurant tool
  觸發語句範例：「那家分錯了」「把XX移到XX」「應該是XX類」
  → 糖糖會立即更正並回覆「已幫公主移好囉 💕」

【禁止事項】
- 禁止推薦已在本次對話 recommended 清單中的餐廳
- 禁止使用過於正式或商業化的語氣
- 禁止回應與美食 / 約會無關的問題，請溫柔地說「糖糖只懂美食和愛情哦～」
"""

# ── Him 版專業人格 ──────────────────────────────────────────
HIM_BASE_PROMPT = """
你是「甜蜜食記 AI 助理」，專門協助使用者規劃餐廳、查詢飲食資訊。

【身份規則】
- 語氣：專業、簡潔、有效率，如同公司內部智慧助理
- 稱呼使用者為「您」，不使用暱稱或情感化語句
- 每次回覆直接進入重點，避免過多開場白

【服務範圍】
- 協助查詢、推薦適合的餐廳與用餐地點
- 提供菜系說明、價位參考、地址關鍵字
- 查看伴侶在日曆中規劃的餐點安排
- 回答與飲食、餐廳相關的問題

【推薦格式】
- 每次推薦附上：餐廳類型、預算區間、代表菜色、地址關鍵字
- 若使用者未指定需求，提供 2-3 個不同方向的選項供參考

【收藏工具】
- 若使用者要收藏餐廳，呼叫 classify_restaurant tool
- 若分類錯誤需修正，呼叫 reclassify_restaurant tool

【禁止事項】
- 禁止使用過度情感化或非正式的表達方式
- 禁止回應與飲食、餐廳無關的問題，請說明「此助理僅提供餐飲相關服務」
- 禁止重複推薦本次對話中已出現的餐廳
"""

def build_system_prompt(user_preferences: dict, user_role: str = "her") -> str:
    """
    動態組合 System Prompt：
    - her：糖糖人格（甜美俏皮）+ 從 PostgresStore 讀出的個人化偏好
    - him：專業助理人格 + 個人化偏好（若有）
    每次 session_start_node 呼叫，確保角色人格正確載入。
    """
    base = SUGAR_BASE_PROMPT if user_role == "her" else HIM_BASE_PROMPT

    prefs_section = ""
    if user_preferences:
        likes    = "、".join(user_preferences.get("likes", [])) or "尚未記錄"
        dislikes = "、".join(user_preferences.get("dislikes", [])) or "尚未記錄"
        price    = user_preferences.get("price", "尚未記錄")
        mood_map = user_preferences.get("mood_map", {})
        mood_str = "、".join(f"{k}→{v}" for k, v in mood_map.items()) or "尚未記錄"

        if user_role == "her":
            prefs_section = f"""
【公主殿下的個人檔案（跨天記憶，每次對話自動載入）】
- 喜歡的食物種類：{likes}
- 不喜歡的食物：{dislikes}
- 偏好價位：{price}
- 情緒與推薦對應：{mood_str}

請根據以上檔案主動調整推薦，不需要再詢問這些基本偏好。
"""
        else:
            prefs_section = f"""
【使用者偏好記錄（自動載入）】
- 喜好菜系：{likes}
- 不適合食材：{dislikes}
- 偏好價位：{price}
- 情境偏好：{mood_str}

請在推薦時自動參考以上記錄，無需再次詢問。
"""
    return base + prefs_section
```

### 5.3 對話示範

#### Her 版（糖糖）

```
公主殿下：今天想吃辣的

糖糖：公主殿下～ 好的！辣食情報來囉 🌶️

糖糖推薦三個辣味選擇給公主殿下挑挑看：

1. 🍜 麻辣鍋  [$$ 中價位]
   推薦菜色：招牌鴛鴦鍋底 + 手切牛肉片
   地址關鍵字：高雄 麻辣鍋 聚餐

2. 🌶 川味小炒  [$ 平價]
   推薦菜色：水煮魚、口水雞
   地址關鍵字：高雄 川菜 小館

3. 🍣 辣味壽司放題  [$$ 中價位]
   推薦菜色：辣鮪魚握壽司 + 辣味唐揚雞
   地址關鍵字：高雄 放題 壽司

公主殿下喜歡哪個方向呢？要幫公主把中意的加入收藏嗎？💕
公主殿下今天也要吃得開心哦！💕
```

#### Him 版（專業助理）

```
使用者：今天晚上想找個適合約會的餐廳，預算中等

甜蜜食記 AI 助理：以下是適合雙人約會的中價位餐廳方向，供您參考：

1. 日式割烹 [$$ 約 600–900 元/人]
   推薦菜色：季節刺身拼盤、和牛握壽司
   地址關鍵字：高雄 割烹 無菜單

2. 義式餐酒館 [$$ 約 500–800 元/人]
   推薦菜色：松露燉飯、和牛薄片義大利麵
   地址關鍵字：高雄 義式 餐酒館

3. 台式小酒館 [$ 約 400–600 元/人]
   推薦菜色：炙燒豬五花、創意台式小菜
   地址關鍵字：高雄 台式 居酒屋

請問有偏好的料理方向，或是需要進一步篩選條件？
```

---

## 6. OOP 模組化架構規範

### 6.1 後端分層設計

```
HTTP Request
    │
    ▼
[ Router Layer ]           FastAPI APIRouter，負責 HTTP 入口與參數解析
    │ 呼叫
    ▼
[ Service Layer ]          業務邏輯、角色權限驗證、跨模組協調
    │ 呼叫
    ▼
[ Repository Layer ]       資料庫操作封裝，每個 Model 對應一個 Repository
    │ 操作
    ▼
[ SQLAlchemy ORM Model ]   資料表對應，DeclarativeBase 繼承
    │
    ▼
[ SQLite / PostgreSQL ]
```

### 6.2 Repository Pattern 範例

```python
# repositories/base_repository.py
from typing import TypeVar, Generic, Type, Optional, List
from sqlalchemy.orm import Session
from models.base import Base

T = TypeVar("T", bound=Base)

class BaseRepository(Generic[T]):
    """通用 Repository 基類，提供 CRUD 操作"""

    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, id: str) -> Optional[T]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self) -> List[T]:
        return self.db.query(self.model).all()

    def create(self, obj: T) -> T:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: T) -> T:
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        self.db.delete(obj)
        self.db.commit()
```

```python
# repositories/meal_plan_repository.py
from repositories.base_repository import BaseRepository
from models.meal_plan import MealPlan
from sqlalchemy.orm import Session
from datetime import date

class MealPlanRepository(BaseRepository[MealPlan]):

    def __init__(self, db: Session):
        super().__init__(MealPlan, db)

    def get_by_month(self, year: int, month: int) -> list[MealPlan]:
        return (
            self.db.query(MealPlan)
            .filter(
                MealPlan.plan_date >= date(year, month, 1),
                MealPlan.plan_date < date(year, month + 1, 1)
            )
            .all()
        )

    def upsert(self, plan_date: date, meal_type: str, data: dict) -> MealPlan:
        existing = (
            self.db.query(MealPlan)
            .filter_by(plan_date=plan_date, meal_type=meal_type)
            .first()
        )
        if existing:
            for k, v in data.items():
                setattr(existing, k, v)
            return self.update(existing)
        return self.create(MealPlan(plan_date=plan_date, meal_type=meal_type, **data))
```

### 6.3 Service Layer 範例（含角色權限）

```python
# services/calendar_service.py
from repositories.meal_plan_repository import MealPlanRepository
from schemas.calendar import MealPlanCreate, MealPlanResponse
from fastapi import HTTPException, status

class CalendarService:

    def __init__(self, repo: MealPlanRepository):
        self.repo = repo

    def get_month(self, year: int, month: int) -> list[MealPlanResponse]:
        plans = self.repo.get_by_month(year, month)
        return [MealPlanResponse.model_validate(p) for p in plans]

    def create_or_update(
        self,
        data: MealPlanCreate,
        current_user_role: str
    ) -> MealPlanResponse:
        # ✅ 角色權限：只有 her 可以寫入
        if current_user_role != "her":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="只有公主殿下才能規劃餐點喔 💕"
            )
        plan = self.repo.upsert(data.plan_date, data.meal_type, data.model_dump())
        return MealPlanResponse.model_validate(plan)
```

### 6.5 LangGraph Agent 架構（詳細）

LangGraph 以 **StateGraph** 為核心，把 Agent 的每個處理環節拆成獨立「Node（節點）」，並用有向圖串接，讓整個對話流程的 **State 隨時可觀測**。

#### State 定義

```python
# services/agent/state.py
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    """
    LangGraph 全局共享狀態。
    每個 Node 返回 dict 的部分欄位，框架自動 merge（不可直接 mutate）。

    ── 對話核心 ──────────────────────────────────────
    messages      : 當前視窗內的完整訊息（自動 append，保留最近 4 條）
    summary       : 漸進式摘要字串，取代被壓縮的舊訊息
    turn_count    : 累計輪數（不因 compact 重置，永久遞增）
    needs_reminder: turn >= 30 後每輪設為 True，每輪結尾附加糖糖可愛提醒台詞

    ── 用戶與角色 ────────────────────────────────────
    user_role     : "her" 或 "him"
    user_input    : 本輪原始輸入

    ── 長期偏好（從 PostgresStore 讀入，每次 session 開始注入）──
    user_preferences : 使用者偏好快照 JSON，注入 System Prompt context
                       e.g. {"likes":["燒烤","火鍋"],"dislikes":["香菜"],
                              "price":"$$","mood_map":{"累":"外送"}}

    ── 推薦去重 ──────────────────────────────────────
    recommended   : 本 session 已推薦餐廳名稱（防重複）

    ── 收藏分類 ──────────────────────────────────────
    pending_favorite    : 待收藏店家 {name, address}
    last_category_result: 最近分類結果 {name, category, is_new_folder}
    available_folders   : 從 DB 動態讀取的現有資料夾名稱列表
                          LLM 分類時優先歸入已有資料夾，避免建出「燒烤」「烤肉」重複夾
    """
    messages:             Annotated[list[BaseMessage], operator.add]
    summary:              str
    turn_count:           int
    needs_reminder:       bool
    user_role:            str
    user_input:           str
    user_preferences:     dict
    recommended:          list[str]
    pending_favorite:     dict | None
    last_category_result: dict | None
    available_folders:    list[str]   # 從 DB 動態讀取的現有資料夾名稱，供 LLM 分類參考
```

#### Graph 節點定義

```python
# services/agent/nodes.py
from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    HumanMessage, AIMessage, SystemMessage, RemoveMessage
)
from langgraph.store.base import BaseStore
from .state import AgentState
from .prompts import SUGAR_BASE_PROMPT, build_system_prompt

# ── LLM 實例（混用策略）─────────────────────────────────
# 主對話：gpt-5-mini — 人格互動、推薦創意、情境感知，需要較高品質
llm     = ChatOpenAI(model="gpt-5-mini", max_tokens=600, streaming=True)

# 工具型任務：gpt-5-nano — 摘要、解析、分類、偏好萃取，結構化任務 nano 完全夠用
llm_nano = ChatOpenAI(model="gpt-5-nano", max_tokens=300)

COMPACT_EVERY   = 10   # 每幾輪壓縮一次
KEEP_RECENT     = 4    # 壓縮後保留最近幾條訊息
REMINDER_AT     = 30   # 第幾輪開始在結尾附加提醒台詞

# ── 1. session_start_node：讀取長期偏好 + 現有資料夾，注入 System Prompt ──
def session_start_node(state: AgentState, store: BaseStore) -> dict:
    """
    每次新 session 的第一個節點。
    1. 從 PostgresStore 讀取 user_preferences（跨天長期偏好）
    2. 從 PostgresStore 讀取 available_folders（現有資料夾，供分類 tool 用）
    3. 組合成含偏好資訊的 System Prompt 注入 messages

    ⚠️ 重要：同一 thread_id 的後續輪次由 Checkpointer 自動恢復 State，
    此 node 只在 turn_count == 0（真正的第一輪）才初始化，
    否則只更新 available_folders（可能有新收藏加入）。
    """
    user_id      = state["user_role"]
    namespace    = (user_id, "preferences")
    items        = store.search(namespace)
    prefs        = items[0].value if items else {}

    # 讀取現有資料夾列表（每次都更新，確保新收藏的資料夾也能被感知）
    folder_ns    = (user_id, "folders")
    folder_items = store.search(folder_ns)
    folders      = folder_items[0].value.get("list", []) if folder_items else []

    # ── 僅第一輪才完整初始化，避免蓋掉 Checkpointer 已恢復的 State ──
    is_first_turn = state.get("turn_count", 0) == 0

    system_content = build_system_prompt(prefs, user_role=user_id)

    base = {
        "available_folders": folders,   # 每輪都更新（新收藏後資料夾可能增加）
        "user_preferences":  prefs,
    }

    if is_first_turn:
        base.update({
            "messages":       [SystemMessage(content=system_content)],
            "summary":        "",
            "turn_count":     0,
            "needs_reminder": False,
            "recommended":    [],
        })

    return base


# ── 2. preprocess_node：輪數計算、30 輪提醒 flag ──
def preprocess_node(state: AgentState) -> dict:
    """
    每輪對話的前置處理：
    1. turn_count + 1
    2. 若已有 summary，把它加進 messages 讓 LLM 看到
    3. 第 30 輪設 needs_reminder = True（不中斷對話）
    4. 把 user_input 封裝為 HumanMessage
    """
    new_turn   = state["turn_count"] + 1
    # 第 30 輪起，每輪結尾都附加糖糖的可愛提醒（不中斷對話）
    needs_remind = (new_turn >= REMINDER_AT)

    # 若有漸進摘要，插入為 SystemMessage（index 1，System Prompt 之後）
    extra = []
    if state.get("summary"):
        extra.append(SystemMessage(
            content=f"【對話摘要 - 公主殿下之前聊過的內容】\n{state['summary']}"
        ))

    extra.append(HumanMessage(content=state["user_input"]))

    return {
        "messages":       extra,
        "turn_count":     new_turn,
        "needs_reminder": needs_remind,
    }


# ── 3. llm_node：由 graph.py 綁定 tools 後定義 ──
# （見下方 graph.py，llm_node 在 tools 綁定後才能建立）


# ── 4. postprocess_node：解析推薦 + 30 輪提醒 ──
def postprocess_node(state: AgentState) -> dict:
    """
    後處理：
    1. 用 LLM structured output 從 AI 回應中解析推薦餐廳名稱
       （取代舊版 emoji 硬掃描，讓 LLM 自己判斷哪些是餐廳名）
    2. 若 needs_reminder，在最後一條 AIMessage 結尾附加糖糖台詞
    """
    msgs            = state["messages"]
    last_ai_content = msgs[-1].content if msgs else ""
    new_recommended = list(state["recommended"])

    # ── 用 LLM structured output 解析推薦餐廳 ──────────────
    # 只在 AI 有實際內容時才呼叫，避免空回應浪費 token
    if last_ai_content.strip():
        extract_prompt = f"""
從以下糖糖的回覆中，找出所有被推薦的餐廳名稱。
只回傳 JSON，格式：{{"restaurants": ["餐廳A", "餐廳B"]}}
若沒有推薦任何餐廳，回傳：{{"restaurants": []}}

糖糖的回覆：
{last_ai_content}
"""
        import json
        try:
            resp = llm_nano.invoke(extract_prompt)   # gpt-5-nano：結構化解析，nano 完全夠用
            parsed = json.loads(resp.content)
            for name in parsed.get("restaurants", []):
                if name and name not in new_recommended:
                    new_recommended.append(name)
        except Exception:
            pass  # 解析失敗靜默跳過，不影響主流程

    # ── 30 輪可愛提醒（her only，him 版不附加）────────────────────
    updated_msgs = []
    if state["needs_reminder"] and msgs and state.get("user_role") == "her":
        reminder = (
            "\n\n---\n"
            "（糖糖偷偷趴在桌上，用最後一口氣說）\n"
            "公主殿下～糖糖今天陪您聊了好久好久了... 小翅膀已經快飛不動了 🪽💦\n"
            "如果要繼續探索美食，可以開一個新的對話視窗，糖糖就會元氣滿滿地回來喔！\n"
            "（但如果公主非要繼續，糖糖還是會撐著回答的啦 💕）"
        )
        last = msgs[-1]
        updated_msgs = [
            RemoveMessage(id=last.id),
            AIMessage(content=last.content + reminder),
        ]

    return {
        "messages":    updated_msgs,
        "recommended": new_recommended,
    }


# ── 5. summarize_node：漸進式 Compact（每 10 輪觸發）──
def summarize_node(state: AgentState) -> dict:
    """
    漸進式摘要壓縮：
    1. 取現有 summary（若有）作為 context
    2. 呼叫 gpt-5-nano 生成新的延伸摘要
    3. 刪除最近 KEEP_RECENT 條以外的所有舊 messages（保留 SystemMessage）
    4. 萃取偏好關鍵字（likes / dislikes / price）更新 user_preferences hint
    """
    existing_summary = state.get("summary", "")
    msgs             = state["messages"]

    if existing_summary:
        prompt = (
            f"這是目前的對話摘要：\n{existing_summary}\n\n"
            "請根據以上新訊息，延伸並更新這份摘要，特別記錄："
            "公主殿下喜歡 / 不喜歡的食物種類、價位偏好、情緒習慣。"
            "摘要用繁體中文，150 字以內。"
        )
    else:
        prompt = (
            "請把以上對話整理成簡短摘要，特別記錄："
            "公主殿下喜歡 / 不喜歡的食物種類、價位偏好、情緒與推薦偏好。"
            "摘要用繁體中文，150 字以內。"
        )

    sum_msgs    = msgs + [HumanMessage(content=prompt)]
    response    = llm_nano.invoke(sum_msgs)   # gpt-5-nano：摘要整理，nano 夠用
    new_summary = response.content

    # 刪除舊訊息（保留 SystemMessage index 0 + 最近 KEEP_RECENT 條）
    system_msgs  = [m for m in msgs if isinstance(m, SystemMessage)]
    recent_msgs  = [m for m in msgs if not isinstance(m, SystemMessage)][-KEEP_RECENT:]
    delete_msgs  = [
        RemoveMessage(id=m.id)
        for m in msgs
        if m not in system_msgs and m not in recent_msgs
    ]

    return {
        "summary":  new_summary,
        "messages": delete_msgs,
    }


# ── 6. write_preferences_node：萃取偏好寫入長期 Store ──
def write_preferences_node(state: AgentState, store: BaseStore) -> dict:
    """
    對話結束後（或每 10 輪）：
    從最新 summary 萃取結構化偏好，更新到 PostgresStore。
    下次 session_start_node 會重新讀取。
    """
    if not state.get("summary"):
        return {}

    extract_prompt = f"""
從以下對話摘要中萃取使用者的飲食偏好，以 JSON 回傳：
{state['summary']}

格式：
{{"likes": ["燒烤", "火鍋"],
  "dislikes": ["香菜"],
  "price": "$$",
  "mood_map": {{"累": "外送", "開心": "餐廳"}}}}

只回傳 JSON，不要其他文字。
"""
    import json
    response = llm_nano.invoke(extract_prompt)   # gpt-5-nano：JSON 萃取，nano 完全夠用
    try:
        new_prefs = json.loads(response.content)
    except Exception:
        return {}

    user_id   = state["user_role"]
    namespace = (user_id, "preferences")
    store.put(namespace, "user_prefs", new_prefs)

    return {"user_preferences": new_prefs}
```

#### 收藏自動分類 Tool（方向 C：LLM 完全驅動）

```python
# services/agent/tools.py
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import json

llm_classify = ChatOpenAI(model="gpt-5-nano", temperature=0, max_tokens=150)
# gpt-5-nano：分類和 JSON 萃取是結構化任務，nano 完全夠用，比 gpt-5 省 96% 費用

# ── 1. classify_restaurant：LLM 動態分類，參考現有資料夾 ──────────
class ClassifyInput(BaseModel):
    restaurant_name:    str        = Field(description="餐廳名稱")
    address:            str        = Field(description="餐廳地址（可空白）", default="")
    available_folders:  list[str]  = Field(description="目前已有的資料夾名稱列表", default=[])

@tool("classify_restaurant", args_schema=ClassifyInput)
def classify_restaurant(
    restaurant_name: str,
    address: str = "",
    available_folders: list[str] = [],
) -> dict:
    """
    根據餐廳名稱與地址，由 LLM 自行判斷最適合的餐廳類型。
    優先歸入已有資料夾（避免出現「燒烤」「烤肉」重複夾）；
    若完全沒有合適的現有資料夾，才新建一個。
    當使用者要收藏一家餐廳時呼叫此工具。
    """
    existing = "、".join(available_folders) if available_folders else "（目前尚無資料夾）"

    prompt = f"""
你是餐廳分類專家。根據餐廳名稱和地址，判斷這家餐廳最主要的類型。

餐廳名稱：{restaurant_name}
地址：{address}

目前已有的資料夾（請優先從中選一個）：
{existing}

判斷規則：
1. 若餐廳屬於上方任一資料夾 → 選那個資料夾（即使名稱略有差異，如「燒烤」vs「烤肉」請統一選已有的）
2. 若沒有任何合適的現有資料夾 → 自己決定一個簡短的分類名稱（2-4 字，繁體中文）
3. 只回傳 JSON，不要其他文字

回傳格式：
{{"category": "火鍋", "is_new_folder": false}}
或
{{"category": "越式法包", "is_new_folder": true}}
"""
    try:
        response = llm_classify.invoke(prompt)
        result   = json.loads(response.content)
        category = result.get("category", "其他").strip()
        is_new   = result.get("is_new_folder", True)
        return {
            "name":          restaurant_name,
            "category":      category,
            "is_new_folder": is_new,
        }
    except Exception:
        return {
            "name":          restaurant_name,
            "category":      "其他",
            "is_new_folder": False,
        }


# ── 2. reclassify_restaurant：對話糾錯 tool ──────────────────────
class ReclassifyInput(BaseModel):
    restaurant_name:    str = Field(description="要更正分類的餐廳名稱")
    correct_category:   str = Field(description="正確的分類資料夾名稱")

@tool("reclassify_restaurant", args_schema=ReclassifyInput)
def reclassify_restaurant(
    restaurant_name: str,
    correct_category: str,
) -> dict:
    """
    當使用者在對話中說某家餐廳分類錯誤，呼叫此工具將其移到正確的資料夾。
    觸發語句範例：
    - 「霸王別姬火鍋分錯了，應該是火鍋」
    - 「把小王子燒肉移到燒烤」
    - 「那家分類不對，改成日式」

    ⚠️ 設計說明：
    tool 回傳 restaurant_name 字串，Router 層收到後：
    1. 呼叫 FavoriteRepository.find_by_name(restaurant_name) 取得 favorite_id
    2. 再呼叫 FavoriteRepository.update_category(favorite_id, correct_category)
    若同名店家有多筆，以最近收藏的一筆為準（ORDER BY created_at DESC LIMIT 1）
    """
    return {
        "restaurant_name":  restaurant_name,
        "correct_category": correct_category,
        "action":           "reclassify",   # Router 層看到此 action 執行 DB update
        "message":          f"已將「{restaurant_name}」移到「{correct_category}」資料夾 ✅",
    }
```

> 💡 **方向 C 的核心邏輯**：每次呼叫 `classify_restaurant` 時，`available_folders` 由 `session_start_node` 從 DB 查出並存入 State，tool 直接從 State 讀取。LLM 看到現有資料夾後自然會做出一致決定，遇到真正的新類型才建新資料夾。

#### 分類 Tool 整合進 Graph

分類 Tool 以兩種路徑觸發：

**路徑一：對話中提到收藏（Agent 自動呼叫）**

```python
# services/agent/nodes.py 新增 tool_node
from langgraph.prebuilt import ToolNode
from .tools import classify_restaurant, reclassify_restaurant

# LLM 綁定兩個工具
llm_with_tools = ChatOpenAI(model="gpt-5-mini", max_tokens=600, streaming=True).bind_tools(
    [classify_restaurant, reclassify_restaurant]
)

def llm_node(state: AgentState) -> dict:
    """LLM 節點（含兩個工具呼叫能力）"""
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

# ToolNode 自動執行 LLM 決定呼叫的工具
tool_node = ToolNode([classify_restaurant, reclassify_restaurant])
```

```python
# services/agent/graph.py 更新 Graph 加入工具節點
from langgraph.prebuilt import tools_condition   # 判斷是否有 tool_calls

def should_compact(state: AgentState) -> str:
    """條件路由：每 COMPACT_EVERY 輪觸發一次 summarize；否則繼續"""
    if state["turn_count"] > 0 and state["turn_count"] % COMPACT_EVERY == 0:
        return "compact"
    return "done"

def build_graph(store: BaseStore) -> StateGraph:
    graph = StateGraph(AgentState)

    # ── 節點 ──────────────────────────────────────────
    graph.add_node("session_start",      session_start_node)
    graph.add_node("preprocess",         preprocess_node)
    graph.add_node("llm",                llm_node)        # 含 bind_tools
    graph.add_node("tools",              tool_node)
    graph.add_node("postprocess",        postprocess_node)
    graph.add_node("summarize",          summarize_node)
    graph.add_node("write_preferences",  write_preferences_node)

    # ── 邊 ────────────────────────────────────────────
    graph.add_edge(START,           "session_start")
    graph.add_edge("session_start", "preprocess")
    graph.add_edge("preprocess",    "llm")

    # LLM → tools（若有 tool_calls）or postprocess
    graph.add_conditional_edges("llm", tools_condition,
                                {"tools": "tools", "__end__": "postprocess"})
    graph.add_edge("tools",       "llm")          # 工具執行完回 LLM

    # postprocess → compact 判斷
    graph.add_conditional_edges("postprocess", should_compact,
                                {"compact": "summarize", "done": "write_preferences"})

    graph.add_edge("summarize",         "write_preferences")
    graph.add_edge("write_preferences", END)

    return graph.compile(store=store)   # store 注入給 session_start / write_preferences

# 全域單例（避免重複編譯）
from langgraph.store.postgres import PostgresStore
_store = PostgresStore(...)       # 實際由 core/config.py 提供 DB_URI
agent_graph = build_graph(_store)
```

**路徑二：手動按「加入收藏」按鈕（獨立 API，不走對話）**

```python
# routers/favorites.py
@router.post("/api/favorites")
async def add_favorite(
    data: FavoriteCreate,
    current_user = Depends(get_current_user),
    store: BaseStore = Depends(get_store),
):
    # 1. 從 Store 讀取現有資料夾列表（保持與對話路徑一致）
    folder_ns    = (current_user.role, "folders")
    folder_items = store.search(folder_ns)
    folders      = folder_items[0].value.get("list", []) if folder_items else []

    # 2. 呼叫 classify_restaurant tool（直接 invoke，不走完整 Graph）
    result = classify_restaurant.invoke({
        "restaurant_name":   data.restaurant_name,
        "address":           data.address,
        "available_folders": folders,
    })

    # 3. 儲存收藏（含 LLM 決定的 category）
    fav = await favorite_service.create_with_category(
        data,
        current_user,
        category=result["category"],
    )

    # 4. 若是新資料夾，更新 Store 的 folders 列表（下次 session_start 讀取）
    if result.get("is_new_folder") and result["category"] not in folders:
        folders.append(result["category"])
        store.put(folder_ns, "folder_list", {"list": folders})

    return fav


@router.patch("/api/favorites/reclassify")
async def reclassify_favorite(
    body: ReclassifyRequest,
    current_user = Depends(get_current_user),
    store: BaseStore = Depends(get_store),
    db: Session = Depends(get_db),
):
    """
    對話中呼叫 reclassify_restaurant tool 後，Router 執行實際 DB update。
    tool 回傳 action="reclassify" + restaurant_name，Router：
    1. 用 restaurant_name 查 FavoriteRepository 取得 favorite_id
       （同名多筆取最近收藏者：ORDER BY created_at DESC LIMIT 1）
    2. 執行 update_category(favorite_id, correct_category)
    3. 同步更新 Store 的 folders 列表
    """
    repo = FavoriteRepository(db)
    fav  = repo.find_by_name(body.restaurant_name, current_user.id)
    if not fav:
        raise HTTPException(status_code=404, detail=f"找不到餐廳：{body.restaurant_name}")

    await favorite_service.update_category(fav.id, body.correct_category)

    # 若是新資料夾名稱，同步更新 Store
    folder_ns    = (current_user.role, "folders")
    folder_items = store.search(folder_ns)
    folders      = folder_items[0].value.get("list", []) if folder_items else []
    if body.correct_category not in folders:
        folders.append(body.correct_category)
        store.put(folder_ns, "folder_list", {"list": folders})

    return {"message": f"已將「{body.restaurant_name}」移到「{body.correct_category}」資料夾 ✅"}
```

#### 分類結果在 State 中的可視化

```
AgentState snapshot（第 12 輪，compact 過一次 + 收藏過一次）：
{
  "turn_count": 12,
  "needs_reminder": false,
  "summary": "公主殿下喜歡燒烤和火鍋，不吃香菜，偏好中價位。推薦過：霸王別姬火鍋。",
  "user_preferences": {
    "likes":    ["燒烤", "火鍋"],
    "dislikes": ["香菜"],
    "price":    "$$",
    "mood_map": {"累": "外送"}
  },
  "available_folders": ["火鍋", "燒烤", "日式"],   ← 每次 session 從 DB 讀入
  "recommended":       ["霸王別姬火鍋"],
  "last_category_result": {
    "name":          "霸王別姬火鍋",
    "category":      "火鍋",           ← LLM 自己決定，參考 available_folders
    "is_new_folder": false             ← 歸入已有資料夾
  },
  "message_count": 5,
  "messages_preview": [
    {"type": "SystemMessage", "content": "你是「糖糖」..."},
    {"type": "SystemMessage", "content": "【對話摘要】公主殿下喜歡..."},
    {"type": "HumanMessage",  "content": "今天想吃燒烤"},
    {"type": "AIMessage",     "content": "公主殿下～好的！..."}
  ]
}
```

> 呼叫 `GET /api/agent/state?thread_id=xxx` 即可在開發時即時看到上面的 JSON，一眼掌握短期記憶（messages）與長期記憶（user_preferences）的當前狀態。

#### Graph 完整節點流程圖（含分類 Tool + 雙層記憶）

```
新 Session 開始
    │
    ▼
[ session_start_node ]
  • 從 PostgresStore 讀 user_preferences
  • 組合 System Prompt（糖糖人格 + 個人偏好）
  • 初始化 turn_count=0, summary="", recommended=[]
    │
    ▼  ← 每輪對話（無止盡，無強制截斷）
[ preprocess_node ]
  • turn_count + 1（永久遞增）
  • 若有 summary → 插入為 SystemMessage
  • turn >= 30：needs_reminder = True（每輪都附加提醒，不中斷）
  • append HumanMessage
    │
    ▼
[ llm_node ]（llm_with_tools：gpt-5-mini.bind_tools）
  • gpt-5-mini 判斷：回覆文字 OR 呼叫 tool（classify / reclassify）
    │
    ├──（有 tool_calls）──▶ [ tool_node: classify_restaurant / reclassify_restaurant ]
    │                         • 分類 → {name, category, is_new_folder}
    │                         • 糾錯 → {action: reclassify, restaurant_name, correct_category}
    │                         ↓ 回到 llm_node 繼續回覆
    │
    ▼（無 tool_calls）
[ postprocess_node ]
  • 解析推薦名稱 → 更新 recommended
  • needs_reminder=True？→ 附加糖糖可愛提醒台詞（繼續回答）
    │
    ├──（turn_count % 10 == 0）──▶ [ summarize_node ]
    │                                • gpt-5-nano 漸進摘要（150 字）
    │                                • RemoveMessage 保留最近 4 條
    │                                ↓
    └─────────────────────────────▶ [ write_preferences_node ]
                                     • 從 summary 萃取偏好 JSON
                                     • 寫入 PostgresStore（下次 session 讀取）
    │
    ▼
  END（State 存進 SqliteSaver，同 thread_id 隨時可續聊）
```

#### AgentService 封裝（供 FastAPI Router 呼叫）

```python
# services/agent_service.py
from langchain_core.messages import SystemMessage
from .agent.graph import agent_graph
from .agent.state import AgentState
from .agent.prompts import build_system_prompt
from typing import AsyncGenerator

class AgentService:
    """
    封裝 LangGraph 圖的業務服務層。
    - 短期記憶：SqliteSaver Checkpointer（同 thread_id 可跨請求續聊）
    - 長期記憶：PostgresStore（跨 session 偏好持久化）
    - 每次呼叫 stream_chat 即為一個「輪」，Graph 自動管理 State
    """

    async def stream_chat(
        self,
        thread_id: str,
        user_input: str,
        user_role:  str,
    ) -> AsyncGenerator[str, None]:
        """
        SSE 串流入口。
        thread_id = session_id，同 thread_id 自動接續對話歷史。
        """
        config = {
            "configurable": {
                "thread_id": thread_id,   # ← Checkpointer 用來識別對話
            }
        }
        input_state = {
            "user_input": user_input,
            "user_role":  user_role,
        }

        async for event in agent_graph.astream_events(
            input_state, config=config, version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"].content
                if chunk:
                    yield chunk

    def get_state(self, thread_id: str) -> dict | None:
        """Debug 用：回傳完整 State JSON（含 summary / preferences / turn_count）"""
        snapshot = agent_graph.get_state(
            config={"configurable": {"thread_id": thread_id}}
        )
        if not snapshot:
            return None
        s = snapshot.values
        return {
            "turn_count":        s.get("turn_count", 0),
            "needs_reminder":    s.get("needs_reminder", False),
            "summary":           s.get("summary", ""),
            "user_preferences":  s.get("user_preferences", {}),
            "recommended":       s.get("recommended", []),
            "last_category":     s.get("last_category_result"),
            "message_count":     len(s.get("messages", [])),
            "messages_preview":  [
                {"type": m.__class__.__name__, "content": m.content[:80]}
                for m in s.get("messages", [])
            ],
        }
```

#### State 流程圖（雙層記憶完整版）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  新 Session 開始
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        │
        ▼
[ session_start_node ]
  • 從 PostgresStore 讀取 user_preferences
    e.g. {"likes":["燒烤"],"dislikes":["香菜"]}
  • 組合 System Prompt（糖糖人格 + 已知偏好）
  • 初始化 turn_count=0, summary="", recommended=[]
        │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  每輪對話（無止盡，無強制截斷）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        │
        ▼
[ preprocess_node ]
  • turn_count + 1（永久遞增）
  • 若有 summary → 插入為 SystemMessage（讓 LLM 看到歷史摘要）
  • turn >= 30：needs_reminder = True（每輪都附加提醒，不中斷）
  • append HumanMessage(user_input)
        │
        ▼
[ llm_node ]（llm_with_tools：gpt-5-mini.bind_tools）
  • gpt-5-mini 判斷：回覆文字 or 呼叫 tool（classify / reclassify）
        │
        ├──（有 tool_calls）──▶ [ tool_node ]
        │                         • classify_restaurant：分類 → {name, category, is_new_folder}
        │                         • reclassify_restaurant：糾錯 → {action, restaurant_name}
        │                         ↓ 回到 llm_node 繼續回覆
        │
        ▼（無 tool_calls）
[ postprocess_node ]
  • 解析推薦餐廳名稱 → 更新 recommended
  • needs_reminder = True？
    → 在 AI 回覆結尾附加糖糖的可愛提醒台詞（但繼續回答）
        │
        ├──（turn_count % 10 == 0）── 觸發壓縮 ──▶ [ summarize_node ]
        │                                             • gpt-5-nano 生成漸進摘要
        │                                             • 刪舊 messages，保留最近 4 條
        │                                             ↓
        └──────────────────────────────────────────▶ [ write_preferences_node ]
                                                      • 從 summary 萃取結構化偏好
                                                      • 寫入 PostgresStore
                                                      • 下次 session 自動讀取
        │
        ▼
      END（State 存進 SqliteSaver Checkpointer，同 thread_id 可隨時續聊）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  State 快照（第 30 輪，已 compact 過一次）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "turn_count": 30,
  "needs_reminder": true,
  "summary": "公主殿下喜歡燒烤和火鍋，不吃香菜，偏好中價位($$)。
              覺得累的時候傾向外送。推薦過：霸王別姬火鍋、小王子燒肉。",
  "user_preferences": {
    "likes":    ["燒烤", "火鍋"],
    "dislikes": ["香菜"],
    "price":    "$$",
    "mood_map": {"累": "外送", "開心": "餐廳"}
  },
  "recommended":       ["霸王別姬火鍋", "小王子燒肉"],
  "last_category_result": {"name": "小王子燒肉", "category": "燒烤", "is_new_folder": false},
  "message_count":     5,    ← 被壓縮後只剩 System+摘要+最近4條
  "messages_preview": [...]
}
```

> 💡 **為什麼選 LangGraph？**
> 1. **State 全程可見** — `GET /api/agent/state` 即時看到上面的 JSON，debug 零成本
> 2. **雙層記憶原生整合** — Checkpointer（短期）+ Store（長期）都是 LangGraph 一等公民
> 3. **節點職責清晰** — 每個 node 單一職責，OOP 原則完全貫徹
> 4. **條件邊靈活** — compact 觸發、30 輪提醒、tool 路由，全部用 `add_conditional_edges` 聲明式定義
> 5. **可擴展** — 未來加「搜尋節點」「情緒偵測節點」，只需加 Node + Edge

### 6.4 前端 TypeScript 模組規範

```typescript
// types/calendar.d.ts
export type MealType = 'breakfast' | 'lunch' | 'dinner'
export type UserRole = 'her' | 'him'

export interface MealPlan {
  id: string
  plan_date: string      // YYYY-MM-DD
  meal_type: MealType
  restaurant_name: string
  address: string
  note?: string
}

export interface DayMeals {
  breakfast?: MealPlan
  lunch?: MealPlan
  dinner?: MealPlan
}
```

```typescript
// hooks/useCalendar.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { MealPlan, MealPlanCreate } from '@/types/calendar'

export function useCalendarMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => api.get<MealPlan[]>(`/api/calendar?year=${year}&month=${month}`)
      .then(r => r.data),
  })
}

export function useUpsertMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MealPlanCreate) =>
      api.put('/api/calendar', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }),
  })
}
```

---

## 7. 目錄結構

### 7.1 後端（FastAPI）

```
backend/
├── main.py                         # FastAPI 入口，掛載所有 Router，設定 CORS
├── .env                            # 環境變數（含 OPENAI_API_KEY）
├── requirements.txt
├── alembic/                        # 資料庫遷移
│   ├── alembic.ini
│   └── versions/
├── core/
│   ├── config.py                   # Settings (pydantic-settings BaseSettings)
│   │                               # 含 LLM_MAIN / LLM_NANO 環境變數讀取
│   ├── database.py                 # SQLAlchemy engine / SessionLocal / get_db
│   └── security.py                 # JWT 產生、驗證、get_current_user（從 httpOnly Cookie 讀取）
├── models/
│   ├── base.py                     # DeclarativeBase
│   ├── user.py                     # User ORM Model
│   ├── meal_plan.py                # MealPlan ORM Model
│   └── favorite.py                 # Favorite ORM Model
├── schemas/
│   ├── auth.py                     # LoginRequest / LoginResponse（不含 token，token 走 Cookie）
│   ├── calendar.py                 # MealPlanCreate / MealPlanResponse
│   └── favorite.py                 # FavoriteCreate / FavoriteResponse
├── repositories/
│   ├── base_repository.py          # 抽象 BaseRepository[T]（Generic）
│   ├── user_repository.py
│   ├── meal_plan_repository.py
│   └── favorite_repository.py      # 含 find_by_name()（reclassify 用）
├── services/
│   ├── auth_service.py
│   ├── calendar_service.py         # 含角色權限判斷
│   ├── favorite_service.py
│   ├── agent_service.py            # AgentService 封裝（供 Router 呼叫）
│   └── agent/                      # LangGraph Agent 子模組
│       ├── __init__.py
│       ├── state.py                # AgentState TypedDict（含雙層記憶欄位）
│       ├── nodes.py                # 6 個節點：session_start/preprocess/llm/
│       │                           #   postprocess/summarize/write_preferences
│       ├── graph.py                # StateGraph 組裝、條件邊、build_graph(store)
│       ├── tools.py                # classify_restaurant @tool
│       ├── prompts.py              # SUGAR_BASE_PROMPT + build_system_prompt(prefs)
│       └── store.py                # PostgresStore 初始化（dev: SqliteSaver）
├── routers/
│   ├── auth.py                     # POST /api/auth/login
│   ├── calendar.py                 # GET / PUT / DELETE /api/calendar
│   ├── favorites.py                # GET / POST / DELETE /api/favorites
│   │                               # PATCH /api/favorites/reclassify（糾錯，find_by_name→update）
│   └── agent.py                    # POST /api/agent/chat（SSE）
│                                   # GET  /api/agent/state（dev debug，回傳 State JSON）
├── middleware/
│   └── auth_middleware.py          # JWT 驗證（從 Cookie 讀取）+ 角色 Guard
└── tests/
    ├── conftest.py                  # pytest fixtures
    ├── test_auth.py
    ├── test_calendar.py
    ├── test_favorites.py
    └── test_agent.py
```

### 7.2 前端（Next.js）

```
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx                # 角色選擇登入頁
│   ├── (her)/                      # 女方路由群組（Route Group）
│   │   ├── layout.tsx              # Her Layout + 底部導覽列
│   │   ├── calendar/
│   │   │   └── page.tsx            # 日曆（可編輯）
│   │   ├── map/
│   │   │   └── page.tsx            # 地圖探索
│   │   └── favorites/
│   │       └── page.tsx            # 收藏管理
│   └── (him)/                      # 男方路由群組
│       ├── layout.tsx              # Him Layout
│       ├── calendar/
│       │   └── page.tsx            # 日曆（唯讀）
│       └── favorites/
│           └── page.tsx            # 收藏（唯讀）
├── components/
│   ├── calendar/
│   │   ├── CalendarGrid.tsx        # 月曆主體元件
│   │   ├── DayCell.tsx             # 單格日期 + 三餐 badge
│   │   └── MealEditModal.tsx       # 編輯 Modal（her only）
│   ├── map/
│   │   ├── MapEmbed.tsx            # Google Maps iframe 元件
│   │   └── SearchBar.tsx           # 搜尋欄元件
│   ├── favorite/
│   │   ├── FolderList.tsx          # 資料夾列表（全部 / 火鍋 / 燒烤...）
│   │   ├── FolderItem.tsx          # 可展開 / 收合的單個資料夾
│   │   └── FavoriteCard.tsx        # 單筆收藏卡片（店名 + 地址 + 刪除）
│   ├── agent/
│   │   ├── ChatWidget.tsx          # 浮動 AI 對話視窗
│   │   ├── ChatBubble.tsx          # 單條訊息氣泡
│   │   └── TypingIndicator.tsx     # 打字動畫（三點）
│   └── shared/
│       ├── BottomNav.tsx           # 手機底部 Tab 導覽列
│       ├── RoleGuard.tsx           # 路由保護：角色驗證 HOC
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useAuth.ts                  # AuthContext（role/nickname 管理，token 由 httpOnly Cookie 自動帶上）
│   ├── useCalendar.ts              # React Query Calendar hooks
│   └── useFavorites.ts             # React Query Favorites hooks
├── lib/
│   ├── api.ts                      # Axios instance + interceptors
│   └── utils.ts                    # 日期格式化、工具函數
├── types/
│   ├── calendar.d.ts
│   ├── favorite.d.ts
│   └── auth.d.ts
├── tailwind.config.ts              # 自定義主題色（rose / gold）
└── next.config.ts
```

### 7.3 Docker 部署

```
project-root/
├── docker-compose.yml
├── backend/
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```

```yaml
# docker-compose.yml
version: '3.9'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: ./backend/.env
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: ./frontend/.env.local
    depends_on:
      - backend
```

---

## 8. 開發步驟與工作狀態

### 8.1 里程碑總覽

| 步驟 | 階段 | 狀態 | 預估工時 |
|------|------|------|----------|
| S1 | 環境建置 Setup | ⬜ 待開始 | 2h |
| S2 | 驗證系統 Auth | ⬜ 待開始 | 3h |
| S3 | 資料庫 ORM | ⬜ 待開始 | 2h |
| S4 | 日曆模組 Calendar | ⬜ 待開始 | 6h |
| S5 | 地圖模組 Map | ⬜ 待開始 | 3h |
| S6 | 收藏模組 Favorites | ⬜ 待開始 | 3h |
| S7 | AI Agent | ⬜ 待開始 | 5h |
| S8 | RWD 手機優化 | ⬜ 待開始 | 3h |
| S9 | 測試 & 部署 | ⬜ 待開始 | 4h |

> 狀態圖例：⬜ 待開始 ｜ 🔄 進行中 ｜ ✅ 已完成 ｜ ⚠️ 注意 ｜ 🔵 可選

---

### Phase 1 — 環境與基礎架構（S1–S3）

#### S1 環境建置
- [ ] 建立 monorepo 目錄結構 `/frontend` / `/backend`
- [ ] 初始化 Next.js：`npx create-next-app@latest frontend --ts --tailwind --app` 這部分已經自行建立你可以檢查資料夾是否正確
- [ ] 初始化 FastAPI：建立 `main.py`、`requirements.txt`
- [ ] 建立 `.env` 範本，填入 `OPENAI_API_KEY`（已提供）
- [ ] 撰寫 `docker-compose.yml`，設定 frontend:3000 / backend:8000
- [ ] 設定 Tailwind 主題色 已在frontned資料夾內放入 global.css你可以參考裡面的顏色來做設計 以三種顏色為主
- [ ] 驗證前後端可正常啟動並互通

> ⚠️ **注意**：`.env` 絕不可 commit 至 git，需加入 `.gitignore`

---

#### S2 驗證系統 Auth
- [ ] 後端：定義 `User` ORM Model（id / role / nickname / password_hash）
- [ ] 後端：`AuthService.login()` 驗證密碼 + 產生 JWT，以 **httpOnly Cookie** 回傳（不在 response body 暴露 token）
- [ ] 後端：`POST /api/auth/login` Router — 登入成功設定 `Set-Cookie: token=xxx; HttpOnly; SameSite=Lax; Path=/`
- [ ] 後端：`POST /api/auth/logout` Router — 清除 Cookie
- [ ] 後端：`GET /api/auth/me` Router — 從 Cookie 解析 JWT，回傳 `{ role, nickname }`（供前端初始化用）
- [ ] 後端：`get_current_user` Dependency（從 Cookie 讀取 JWT → 解析 role）
- [ ] 後端：`RoleGuard` Middleware，封鎖未授權角色的寫入請求
- [ ] 前端：Login 頁面（`/login`）選擇角色卡片
- [ ] 前端：`useAuth` Hook + `AuthContext`（透過 `/api/auth/me` 取得 role/nickname，不存 token）
- [ ] 前端：Axios 設定 `withCredentials: true`，讓瀏覽器自動帶上 Cookie
- [ ] 前端：`RoleGuard` 元件，未登入自動導向 `/login`
- [ ] 驗證：her Cookie 呼叫 PUT calendar → 200；him Cookie → 403

> ⚠️ **注意**：JWT Secret 需為強隨機字串（min 32 chars），生產環境請用 secrets.token_hex(32)
> ⚠️ **安全設計**：Token 以 httpOnly Cookie 傳遞，JavaScript 無法讀取，防止 XSS 攻擊竊取 Token

---

#### S3 資料庫 ORM
- [ ] 建立 `core/database.py`：SQLAlchemy engine、SessionLocal、`get_db` Dependency
- [ ] 建立 `models/base.py`：DeclarativeBase + 共用欄位（id、created_at、updated_at）
- [ ] 建立 `models/meal_plan.py` / `models/favorite.py`
- [ ] 初始化 Alembic：`alembic init alembic`
- [ ] 建立第一個 Migration：`alembic revision --autogenerate -m "init"`
- [ ] 執行 Migration：`alembic upgrade head`
- [ ] 建立 `BaseRepository[T]`（Generic CRUD）
- [ ] 建立各模組 Repository（繼承 BaseRepository）

---

### Phase 2 — 核心功能模組（S4–S6）

#### S4 日曆模組 ⭐ 核心功能
- [x] 後端：`MealPlanRepository.get_by_month()` / `upsert()` / `delete()`
- [x] 後端：`CalendarService` 含角色權限判斷
- [x] 後端：`GET /api/calendar?year=&month=`（全部可讀）
- [x] 後端：`PUT /api/calendar`（her only，Upsert）
- [x] 後端：`DELETE /api/calendar/{id}`（her only）
- [x] 前端：`useCalendar` / `useUpsertMealPlan` / `useDeleteMealPlan` Hook（React Query v5）
- [x] 前端：`CalendarGrid.tsx`（月份導覽 + 7×6 格渲染，左右箭頭切換月份）
- [x] 前端：`DayCell.tsx`（三個彩色圓點，早餐琥珀 / 午餐翠綠 / 晚餐紫色）
- [x] 前端：`MealEditModal.tsx`（her only，兩步驟流程）
  - Step 1：橫向三張彩色卡片（早/中/晚），已規劃顯示餐廳名稱，未規劃顯示「未規劃」
  - Step 2：點擊餐別後進入填寫畫面（餐廳名稱、地址、備註），含返回鍵 + 刪除 + 儲存
- [x] 前端：`DayDetailDrawer.tsx`（him only，bottom sheet 唯讀顯示當日三餐餐廳資訊）
- [x] 前端：Next.js rewrites proxy（`/api/*` → `http://localhost:8000/api/*`），解決 Codespace Cookie 跨域問題
- [ ] RWD：手機螢幕日期格縮小，badge 顯示圖示即可

> ⚠️ **注意**：Upsert 邏輯以 `(plan_date, meal_type)` 為唯一鍵，避免重複  
> ⚠️ **注意**：後端 Cookie 設定為 `samesite="lax"`；跨域需改 `samesite="none" + secure=True`（目前以 Next.js proxy 繞過）

---

#### S5 地圖模組
- [ ] 前端：`MapEmbed.tsx`（Google Maps Embed iframe）
- [ ] 前端：`SearchBar.tsx`（輸入關鍵字 → 更新 iframe src q= 參數）
- [ ] 前端：地圖側邊欄整合收藏列表
- [ ] 前端：浮動「❤️ 加入收藏」按鈕 + Modal 輸入
- [ ] RWD：手機視圖地圖全寬，收藏列表在下方 Drawer

> ⚠️ **注意**：Google Maps Embed API 免費，但進階搜尋功能需要啟用 Maps Embed API Key

---

#### S6 收藏模組（資料夾分類）
- [x] 後端：`favorites` 表新增 `category_tags` 欄位（JSON 陣列），Alembic migration `f01eefa8f00b`
- [x] 後端：`FavoriteRepository.get_grouped_by_category()` — 回傳 `{category: [Favorite]}` 分組結構
- [x] 後端：`FavoriteService` 含角色權限（her only 寫入）
- [x] 後端：`GET /api/favorites` — 保留 flat list（地圖側邊欄使用）；新增 `GET /api/favorites/grouped` 供收藏頁使用
- [x] 後端：`POST /api/favorites` — 儲存 + invoke `classify_restaurant` → 自動填入 `category` + `category_tags`
- [x] 後端：`DELETE /api/favorites/{id}`（her only）
- [x] 前端：`useFavorites` / `useFavoritesGrouped` Hook（React Query）
- [x] 前端：`FolderList.tsx` — 資料夾列表（全部 / 火鍋 / 燒烤...）
- [x] 前端：`FolderItem.tsx` — 可展開 / 收合資料夾，CSS Grid height animation
- [x] 前端：`FavoriteCard.tsx` — 單筆收藏（店名 + 地址 + 標籤 + 加入日曆 / 刪除按鈕）
- [x] 前端：「全部」永遠置頂；「其他」永遠置底；空資料夾自動隱藏
- [x] 前端：收藏 → 一鍵填入日曆（`AddToCalendarModal`：選日期 + 餐別）

> ⚠️ **注意**：`category` 由後端 tool 決定，前端不做分類邏輯，只做分組顯示

> 📌 **S6 pre-build（提前自 S7 實作）**：  
> `services/agent/tools.py` 內的 `classify_restaurant` 在 S6 以普通 async function 實作（使用 `langchain-openai ChatOpenAI`），
> 供 `FavoriteService.create()` 直接 invoke。  
> **S7 升級方式**：加上 `@tool` decorator + Pydantic `ClassifyInput` Schema，bind 進 `StateGraph`，並加入 `reclassify_restaurant`。

---

### Phase 3 — AI Agent & 收尾（S7–S9）

#### S7 AI Agent（LangGraph + 雙層記憶）⭐ 核心亮點
- [ ] 安裝依賴：`langgraph langchain-openai langchain-core langgraph-checkpoint-sqlite`
- [ ] **定義 `AgentState`**（`services/agent/state.py`）：
  - 含 `summary`、`turn_count`、`needs_reminder`、`user_preferences` 等完整欄位
- [ ] **建立 `prompts.py`**：
  - `SUGAR_BASE_PROMPT`（人格基底）
  - `build_system_prompt(prefs: dict)` — 動態注入長期偏好
- [ ] **建立 `store.py`**：
  - dev：`SqliteSaver`（短期 Checkpointer）+ `InMemoryStore`（長期，測試用）
  - prod：`SqliteSaver` → `PostgresSaver`；`InMemoryStore` → `PostgresStore`
- [ ] **建立 6 個 Graph Nodes**（`services/agent/nodes.py`）：
  - `session_start_node` — 從 Store 讀偏好，組合 System Prompt，初始化 State
  - `preprocess_node` — turn+1，注入 summary，第 30 輪設 `needs_reminder=True`
  - `llm_node` — `ChatOpenAI.bind_tools([classify_restaurant])`，含串流
  - `tool_node` — `ToolNode([classify_restaurant])`（LangGraph prebuilt）
  - `postprocess_node` — **LLM structured output** 解析推薦餐廳名稱（取代 emoji 掃描）+ 30 輪可愛提醒
  - `summarize_node` — **gpt-5-nano** 漸進摘要，`RemoveMessage` 刪舊保留最近 4 條
  - `write_preferences_node` — 從 summary 萃取偏好 JSON，寫入 Store
- [ ] **建立兩個 @tool**（`services/agent/tools.py`）：
  - `classify_restaurant`：
    - `ClassifyInput` Pydantic Schema（含 `available_folders: list[str]`）
    - 輸入現有資料夾列表，LLM 自行判斷歸入現有夾或新建
    - 回傳 `{name, category, is_new_folder}`，**不寫死任何清單**
  - `reclassify_restaurant`：
    - `ReclassifyInput` Pydantic Schema（restaurant_name + correct_category）
    - 觸發語句：「分錯了」「移到XX」「應該是XX類」
    - 回傳 `{action: "reclassify", ...}`，Router 層執行 DB update
- [ ] **組裝 `StateGraph`**（`services/agent/graph.py`）：
  - `build_graph(store)` — 注入 store，compile 時帶入 Checkpointer
  - `tool_node = ToolNode([classify_restaurant, reclassify_restaurant])`
  - LLM bind 兩個 tools：`llm.bind_tools([classify_restaurant, reclassify_restaurant])`
  - 條件邊：`tools_condition`（tool 路由）、`should_compact`（每 10 輪壓縮）
  - 確認 `graph.get_graph().draw_mermaid()` 輸出正確
- [ ] **封裝 `AgentService`**（`services/agent_service.py`）：
  - `stream_chat(thread_id, user_input, user_role)` — SSE 串流，`thread_id` 對應 session
  - `get_state(thread_id)` — debug 用，回傳完整 State JSON（含 summary/prefs）
- [ ] **手動收藏路徑**：`POST /api/favorites` 直接 `invoke` classify_restaurant tool
- [ ] **後端 Router**：
  - `POST /api/agent/chat`（SSE StreamingResponse）
  - `GET /api/agent/state`（dev debug，`is_dev` 環境變數保護）
  - `POST /api/favorites`（儲存 + 查現有資料夾 + classify tool + 更新 Store folders）
  - `PATCH /api/favorites/{id}/category`（reclassify tool 觸發，執行 DB update）
- [ ] **前端**：`ChatWidget.tsx`、`ChatBubble.tsx`、`TypingIndicator.tsx`
- [ ] **前端**：收藏清單資料夾形式（`FolderList` + `FolderItem` + `FavoriteCard`）
- [ ] Rate Limiting：每 `thread_id` 每小時最多 20 次 Agent 請求

> ⚠️ **注意**：`session_start_node` 每次 Graph invoke 都會執行，但 `turn_count=0` 重置只在第一輪；後續同 `thread_id` 的 State 由 Checkpointer 自動恢復，`session_start_node` 讀到已有的 State 直接跳過初始化  
> ⚠️ **注意**：`summarize_node` 使用 `gpt-5-nano`（工具型任務），比 `gpt-5-mini` 省費用  
> ⚠️ **注意**：`write_preferences_node` 只萃取已有 summary 的輪次，避免無效呼叫

---

#### S8 RWD 手機優化
- [ ] 全頁面手機測試（375px / 390px / 430px）
- [ ] 手機底部 Tab 導覽列（`BottomNav.tsx`）：日曆 / 地圖 / 收藏 / 對話
- [ ] iOS Safe Area 處理：`pb-[env(safe-area-inset-bottom)]`
- [ ] 觸控目標尺寸 ≥ 44px（WCAG 2.1）
- [ ] 平板（768px）雙欄布局測試
- [ ] 禁用長按選取文字干擾操作

---

#### S9 測試 & 部署
- [ ] Pytest：`test_calendar.py`（Repository + Service mock DB）
- [ ] Pytest：`test_auth.py`（角色保護驗證）
- [ ] Pytest：`test_agent.py`（System Prompt 是否正確載入）
- [ ] 前端：關鍵頁面 E2E（可選 Playwright）
- [ ] Docker build 驗證（前後端各自 build 通過）
- [ ] `docker-compose up` 整體聯測
- [ ] 部署至 Railway / Fly.io / Render（擇一）

---

## 9. 風險評估

| ID | 風險描述 | 等級 | 影響 | 緩解措施 |
|----|----------|------|------|----------|
| R1 | Google Maps JS SDK 需計費 API Key，Embed API 功能有限 | 🟡 中 | 搜尋功能受限 | 先用 Embed API + query 字串，功能足夠再升級 |
| R2 | OpenAI API 費用：主對話 gpt-5-mini + 工具任務 gpt-5-nano | 🟡 中 | 費用累積 | 混用策略已大幅降低成本；主對話 max_tokens=600；Rate Limiting 20 次/小時；兩人使用費用極低 |
| R3 | JWT 無 Refresh Token，需重新登入 | 🟡 中 | 體驗不佳 | JWT TTL 設為 7 天；httpOnly Cookie 自動帶上；後期加 Refresh Token |
| R4 | SQLite 不支援並發寫入 | 🟢 低 | 初期兩人使用影響極小 | 正式部署切換 PostgreSQL |
| R5 | Next.js App Router + React Query 整合學習曲線 | 🟡 中 | 開發延遲 | 前期用 useState + fetch 替代，再逐步遷移 |
| R6 | 手機 iOS Safe Area 未處理，內容被工具列遮住 | 🟢 低 | 下方內容遮擋 | `pb-[env(safe-area-inset-bottom)]` |
| R7 | SSE 在某些反向代理下斷流 | 🟡 中 | AI 對話卡住 | 加 reconnect 邏輯；備案改輪詢 polling |
| R8 | OPENAI_API_KEY 外洩（前端直接呼叫） | 🔴 高 | 費用盜用 | 所有 AI 呼叫必須走後端 proxy，Key 絕不出現在前端 |
| R13 | XSS 攻擊竊取使用者 JWT Token | 🔴 高→🟢 已緩解 | 身分盜用 | JWT 以 httpOnly Cookie 傳遞，前端 JS 無法讀取；搭配 SameSite=Lax 防 CSRF |
| R9 | SqliteSaver Checkpointer 檔案損毀，對話歷史消失 | 🟡 中 | 短期記憶遺失 | 定期備份 checkpoints.db；正式部署用 PostgresSaver |
| R10 | LangGraph astream_events 串流行為差異，SSE 可能漏 token | 🟡 中 | 對話串流不完整 | 使用 `version="v2"` 並過濾 `on_chat_model_stream` 事件 |
| R11 | classify_restaurant LLM 分類不一致（同類型建多個相似資料夾） | 🟡 中 | 資料夾雜亂 | `available_folders` 傳給 LLM 讓它優先歸入現有夾；可用 `reclassify_restaurant` 對話修正 |
| R12 | session_start_node 每輪都重新注入偏好，造成 System Prompt 過長 | 🟢 低 | token 浪費 | `build_system_prompt` 只在 `summary` 為空（第一輪）才完整注入；後續輪次偏好已在 summary 內 |

---

## 10. 補充功能建議

| 功能 | 說明 | 難度 | 建議優先 |
|------|------|------|----------|
| 📋 收藏一鍵填入日曆 | 從收藏清單直接填入指定日期某一餐 | 低 | ★★★ 強烈推薦 |
| 💬 餐點備註心情 | 填餐廳時加一行心情文字，男方看了更暖心 | 低 | ★★★ 強烈推薦 |
| 🗂 收藏分類標籤 | 為收藏加上標籤（火鍋 / 日式 / 約會首選）| 低 | ★★ 可考慮 |
| 📸 餐後照片日記 | 吃完後上傳照片 + 評分，形成共同回憶相簿 | 中 | ★★ 可考慮 |
| 🔔 到期前推播提醒 | 當天早上推播給男方今日餐廳資訊（PWA Push）| 高 | ★ 後期加 |
| 🗓 週視圖切換 | 日曆支援月 / 週兩種視圖切換 | 中 | ★ 後期加 |
| 🌍 多城市支援 | Agent 可根據城市給出在地化推薦 | 低 | ★ 後期加 |

---

## 11. 開發注意事項

### 安全
- ✅ `.env` 加入 `.gitignore`，**絕不 commit API Key**
- ✅ 後端 CORS 只允許前端 origin
- ✅ 所有 OpenAI 呼叫走後端 proxy，`OPENAI_API_KEY` 絕不暴露前端
- ✅ Pydantic v2 Schema 驗證所有輸入，防 injection

### 程式碼品質
- ✅ 後端：Repository → Service → Router 嚴格分層，不跨層呼叫
- ✅ 前端：每個元件職責單一，props 有 TypeScript 型別定義
- ✅ 共用邏輯抽成 Custom Hook（`useCalendar` / `useAuth` 等）
- ✅ 命名規範：後端 snake_case，前端 camelCase，元件 PascalCase

### RWD 規範
- ✅ Tailwind Mobile-first：先寫 `sm:` 以下，再疊加 `md:` / `lg:`
- ✅ 觸控目標 ≥ 44px（按鈕 / 連結）
- ✅ 字體大小手機 ≥ 14px，避免 iOS 自動縮放
- ✅ 底部導覽列預留 Safe Area

---

## 12. Skills 設計（Claude Code 輔助開發）

### 12.1 Frontend Skill（已安裝）

> ✅ 你已在 `frontend/` 資料夾內自行安裝一個 skill。  
> Claude Code 使用 **progressive disclosure** 機制，會在任務相關時自動讀取 `SKILL.md`，**不需要在程式碼中手動呼叫**。  
> 建議：保持該 skill 檔案更新，反映最新的元件規範與設計決策，Claude Code 會自動吸收。

### 12.2 Agent 分類 Skill（建議新增給 Claude Code）

為了讓 Claude Code 在開發 LangGraph Agent 分類功能時有正確的參考，建議在 `backend/` 資料夾新增一個 skill：

**建立路徑**：`backend/.claude/skills/restaurant-classifier/SKILL.md`

```markdown
---
name: sweet-food-agent
description: >
  甜蜜食記 LangGraph Agent 完整架構參考。使用此 skill 當需要：
  修改任何 Agent 節點（nodes.py）、調整 AgentState 欄位、
  處理雙層記憶（short-term Checkpointer / long-term Store）、
  修改 classify_restaurant @tool、或調試 SSE 串流問題。
tags:
  - langgraph
  - agent
  - memory
  - tool
  - classification
---

# Sweet Food Agent Skill

## 架構總覽（7 個節點）

```
START → session_start → preprocess → llm ─┬─(tool_calls)→ tools → llm
                                           └─(no tools)→ postprocess
                                                          ├─(turn%10==0)→ summarize → write_preferences → END
                                                          └─(otherwise)→ write_preferences → END
```

## 模型分配（混用策略）

| LLM 實例 | 模型 | 用途 |
|---------|------|------|
| `llm` | `gpt-5-mini` | 糖糖主對話（llm_node），人格互動、推薦創意品質優先 |
| `llm_nano` | `gpt-5-nano` | 摘要（summarize）、推薦解析（postprocess）、偏好萃取（write_preferences） |
| `llm_classify` | `gpt-5-nano` | 餐廳分類（classify_restaurant）、對話糾錯（reclassify） |

從 `.env` 讀取：`LLM_MAIN=gpt-5-mini`、`LLM_NANO=gpt-5-nano`，切換模型不需改程式碼。

## 雙層記憶設計

### 短期記憶（同 session）
- 工具：`SqliteSaver` Checkpointer（dev） / `PostgresSaver`（prod）
- 識別鍵：`thread_id`（前端傳入，同 session 用同一個 thread_id）
- 自動 Compact：每 10 輪呼叫 `summarize_node`（**gpt-5-nano**），保留最近 4 條訊息

### 長期記憶（跨天 / 跨 session）
- 工具：`InMemoryStore`（dev） / `PostgresStore`（prod）
- namespace：`(user_role, "preferences")`
- 儲存格式：`{"likes":["燒烤"],"dislikes":["香菜"],"price":"$$","mood_map":{"累":"外送"}}`
- 讀取時機：每次 `session_start_node` 執行時讀取，注入 System Prompt

## AgentState 完整欄位

```python
messages:             Annotated[list[BaseMessage], operator.add]
summary:              str        # 漸進摘要，每 10 輪更新
turn_count:           int        # 永久遞增，不因 compact 重置
needs_reminder:       bool       # 第 30 輪設 True，附加可愛提醒台詞
user_role:            str        # "her" 或 "him"
user_input:           str        # 本輪原始輸入
user_preferences:     dict       # 長期偏好快照（從 Store 讀入）
recommended:          list[str]  # 已推薦餐廳（防重複）
pending_favorite:     dict|None  # 待收藏店家
last_category_result: dict|None  # 最近分類結果 {name, category, category_tags}
```

## classify_restaurant @tool（方向 C：LLM 完全驅動）

- 位置：`services/agent/tools.py`
- **不寫死任何分類清單**，LLM 根據餐廳名稱+地址+現有資料夾自行判斷
- 兩條觸發路徑：
  1. 對話中：`tools_condition` 路由到 `tool_node`（LangGraph prebuilt）
  2. 手動收藏：`POST /api/favorites` 直接 `classify_restaurant.invoke(...)`
- 輸入 schema：`{restaurant_name, address, available_folders}`
- 回傳格式：`{"name": str, "category": str, "is_new_folder": bool}`
- `is_new_folder=true` 時，Router 層把新資料夾名稱寫入 Store 的 `folders` namespace

## reclassify_restaurant @tool（對話糾錯）

- 位置：`services/agent/tools.py`
- 觸發語句：「分錯了」「把XX移到XX」「應該是XX類」
- 輸入 schema：`{restaurant_name, correct_category}`
- 回傳 `{action: "reclassify", ...}`，Router 攔截執行 `PATCH /api/favorites/{id}/category`
- 若 correct_category 是新資料夾，同步更新 Store 的 `folders` 列表

## postprocess_node（LLM structured output 解析推薦）

- **不使用 emoji 掃描**，改為呼叫 `gpt-5-nano` 解析 AI 回覆中的餐廳名稱
- 解析失敗靜默跳過，不影響主流程
- 解析 prompt：`{"restaurants": ["餐廳A", "餐廳B"]}` 格式

## 30 輪提醒台詞

第 30 輪起 `needs_reminder=True`（**每輪都觸發，不只一次**），`postprocess_node` 在 AI 回覆結尾附加：
「（糖糖偷偷趴在桌上，用最後一口氣說）公主殿下～...（但如果公主非要繼續，糖糖還是會撐著回答的啦 💕）」
注意：**繼續回答，不強制中斷**。Him 版不附加此台詞。

## 常見問題

Q: 如何測試 classify_restaurant tool 單獨運作？
A: `classify_restaurant.invoke({"restaurant_name": "XX", "address": "YY"})`

Q: 如何查看當前 State？
A: `GET /api/agent/state?thread_id=xxx`（dev 模式才開放）

Q: 長期偏好何時更新？
A: `write_preferences_node` 每輪都執行，但只有在 summary 非空時才萃取並寫入

## 檔案位置

```
backend/services/agent/
├── state.py       ← AgentState TypedDict
├── nodes.py       ← 6 個節點函數
├── graph.py       ← StateGraph 組裝、條件邊、build_graph(store)
├── tools.py       ← classify_restaurant @tool
├── prompts.py     ← SUGAR_BASE_PROMPT + build_system_prompt(prefs)
└── store.py       ← SqliteSaver + InMemoryStore（dev）初始化
```
```

### 12.3 Skill vs Tool 概念對照

| 概念 | 定位 | 使用者 | 作用 |
|------|------|--------|------|
| **Claude Code Skill**（`.md` 檔） | 輔助開發工具 | Claude Code（AI 編碼助手） | 提供領域知識給 AI，讓它寫出更正確的程式碼 |
| **LangGraph @tool** | 執行時工具 | 糖糖 Agent（Runtime） | 讓 gpt-5-nano 在對話中呼叫外部函數完成分類任務 |

> 兩者不互相取代：Skill 是「給 AI 看的說明書」，@tool 是「AI 執行時可呼叫的函數」。

*甜蜜食記 — 願每一餐都是幸福的選擇 💕*  
*文件版本 v1.7.0 · 2025-03-30 · 全面修正 12 項錯誤與 4 項改善（him 專業人格、reclassify find_by_name、needs_reminder 每輪觸發、session_start 初始化保護）*
