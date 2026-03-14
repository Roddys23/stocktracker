# stocktracker

Track product stock from one or more shop URLs and send Discord alerts for new items and restocks.

## What changed

The app now includes a dashboard UI at `/` with two tabs:

1. `Tracked URLs`
- Add URL + optional name
- View each tracked URL and whether a qualifying change happened in the last scrape
- Delete a URL (hard-deletes related tracked item history)

2. `Settings`
- Save Discord webhook URL from the UI

A URL is marked as changed when either:

- A new product item is discovered for that URL
- An item moves from out-of-stock to in-stock

## Local run

1. Install dependencies:

```bash
npm install
```

2. (Optional) Create a `.env` file:

```dotenv
# Optional seed URLs (only used when DB has zero tracked URLs)
SHOP_URLS=https://example.com/collections/all,https://shop2.com/products

# Optional fallback webhook (UI setting takes priority)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Optional SQLite file path for local dev
# SQLITE_PATH=./stocktracker.db
```

3. Start the app:

```bash
npm start
```

4. Open:

- `http://localhost:3000/` - dashboard UI
- `http://localhost:3000/health` - health check

## Render deployment settings

The repository includes `render.yaml`.

Build command:

```bash
npm install && npx playwright install chromium --with-deps
```

Start command:

```bash
npm start
```

Set these environment variables in Render:

1. `DATABASE_URL`
- Required
- Use the internal connection string from your Render PostgreSQL service

2. `NODE_ENV`
- Set to `production`

3. `PORT`
- Optional (Render usually sets this automatically)

4. `DISCORD_WEBHOOK_URL`
- Optional fallback only
- The Settings tab value in the app takes priority

5. `SHOP_URLS`
- Optional seed only
- Used only when no tracked URLs exist yet in database

## Verify after deploy

1. Open `https://<your-service>.onrender.com/` and confirm dashboard loads.
2. Open `https://<your-service>.onrender.com/health` and confirm `OK`.
3. In dashboard:
- Add a URL and confirm it appears
- Save webhook in Settings
- Delete a URL and confirm it is removed
4. Check Render logs for scrape cycles and notification attempts.
