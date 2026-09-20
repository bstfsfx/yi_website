# 天台邑旅店 (yi_website)

小琉球住宿網站 — Next.js 15 + Tailwind CSS，包含首頁、住宿介紹（/sales）、即時空房線上訂房（/booking），空房資料由各訂房平台的 .ics 日曆自動彙整。

## 開發

```bash
npm install
npm run dev
```

- 首頁: http://localhost:3000
- 住宿與房型: /sales
- 線上訂房: /booking

## 環境變數

外部分訂房平台的 .ics 日曆匯出連結，每個線上房型一條。設定後 /api/sync-calendar 會抓取並解析這些 .ics，合併出空房狀態；未設定時該房型使用標示「示範」的測試資料。

| 變數 | 用途 |
| ---- | ---- |
| `ICS_DOUBLE_URL` | 雙人房 訂房平台 .ics 匯出連結 |
| `ICS_QUAD_URL` | 四人房 訂房平台 .ics 匯出連結 |

複製 `.env.example` 為 `.env` 填入網址，重啟 dev server 即生效。

## 如何取得 Airbnb 的 .ics 匯出連結

**注意**：訂房（guest）頁面的網址不是 iCal 連結，無法匯出房態。必須以**房源房東（host）帳號登入**，從房東後台取得。

1. 用房東帳號登入 airbnb.com。
2. 點右上角頭像 → **切換到出租模式（Switch to Hosting）**。
3. 在房東首頁進入 **行事曆（Calendar）**，選擇要匯出的房源（房型）。
4. 點行事曆右上角的**齒輪／列印圖示**。
5. 選 **匯出日曆 / Export calendar**，Airbnb 會顯示類似以下網址：
   `https://www.airbnb.com/calendar/ical/XXXXXXXXX.ics?s=...`
6. 複製該網址，填入 `ICS_DOUBLE_URL` / `ICS_QUAD_URL`。

Booking.com 同理：**房價與空房（Rates & Availability）→ 同步日曆（Sync calendars）→ Export iCal**。

## 部署到 Vercel

```bash
npx vercel deploy --prod
```

部署後設定正式環境的 .ics 網址並重新部署：

```bash
npx vercel env add ICS_DOUBLE_URL production
npx vercel env add ICS_QUAD_URL production
npx vercel redeploy --prod
```

未設定環境變數前，訂房頁會顯示標示「示範」的測試資料，功能仍可正常測試。

## 專案結構

- `app/` — Next.js App Router 頁面與 API route（/api/sync-calendar）
- `components/booking/` — 訂房 UI（空房表格、保留、購物車、結帳）
- `lib/` — 房型資料、.ics 解析、日期與格式化工具
- `public/media/` — 房間與旅店照片