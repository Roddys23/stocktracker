'use strict';

// Load .env file when running locally (not on Render)
if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (_) { /* dotenv optional */ }
}

const express = require('express');
const { initDb, loadItems, upsertItem } = require('./db');
const { scrape } = require('./scraper');
const { notify } = require('./discord');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Comma-separated list of shop URLs to monitor.
 * e.g. SHOP_URLS=https://example.com/collections/all,https://shop2.com/stock
 */
const SHOP_URLS = (process.env.SHOP_URLS || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const PORT        = parseInt(process.env.PORT || '3000', 10);

// ---------------------------------------------------------------------------
// Express server
// ---------------------------------------------------------------------------

const app = express();

/** Keep-alive endpoint – hit by an external pinger every 14 minutes */
app.get('/health', (_req, res) => {
  res.send('OK');
});

// ---------------------------------------------------------------------------
// Scrape + diff logic
// ---------------------------------------------------------------------------

/**
 * Run one full scrape cycle for every configured URL.
 */
async function runScrape() {
  if (SHOP_URLS.length === 0) {
    console.warn('[tracker] No SHOP_URLS configured – skipping scrape.');
    return;
  }

  for (const url of SHOP_URLS) {
    try {
      console.log(`[tracker] Starting scrape for ${url}`);
      const [scraped, stored] = await Promise.all([
        scrape(url),
        loadItems(url),
      ]);

      for (const item of scraped) {
        const prev = stored.get(item.itemId);

        if (!prev) {
          // Brand-new item we have never seen before
          await upsertItem(url, item.itemId, item.name, item.inStock);
          if (item.inStock) {
            await notify('new', item.name, url);
          }
        } else if (!prev.inStock && item.inStock) {
          // Was out-of-stock, now back in stock
          await upsertItem(url, item.itemId, item.name, item.inStock);
          await notify('restock', item.name, url);
        } else {
          // No relevant change – still update last_seen / name
          await upsertItem(url, item.itemId, item.name, item.inStock);
        }
      }

      console.log(`[tracker] Finished scrape for ${url}`);
    } catch (err) {
      console.error(`[tracker] Error scraping ${url}:`, err.message);
    }
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function main() {
  // Initialise DB (creates table if missing)
  await initDb();

  // Run an immediate scrape on startup, then every 15 minutes
  runScrape();
  setInterval(runScrape, INTERVAL_MS);

  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
    console.log(`[server] Health endpoint: http://localhost:${PORT}/health`);
    console.log(`[tracker] Scrape interval: every ${INTERVAL_MS / 60_000} minutes`);
  });
}

main().catch((err) => {
  console.error('[main] Fatal error:', err);
  process.exit(1);
});
