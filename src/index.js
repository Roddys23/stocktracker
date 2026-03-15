'use strict';

// 1. Setup Environment and Dependencies
if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (_) { /* dotenv optional */ }
}

const path = require('path');
const express = require('express');
const {
  initDb,
  loadItems,
  upsertItem,
  listTrackedUrls,
  listActiveTrackedUrls,
  createTrackedUrl,
  deleteTrackedUrl,
  updateTrackedUrlCheck,
  getSetting,
  setSetting,
} = require('./db');
const { scrape } = require('./scraper');
const { notify } = require('./discord');

// 2. Initialize Express
const app = express();
const PORT = process.env.PORT || 10000;
const publicDir = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use(express.static(publicDir));

// 3. Heartbeat / Health Routes for Render
app.get('/', (req, res) => {
  res.send('Tracker is active and scanning every 15 minutes.');
});

app.get('/health', (_req, res) => {
  res.send('OK');
});

// 4. Configuration Constants
const SHOP_URLS = (process.env.SHOP_URLS || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
let isScraping = false;

// 5. Helper Functions
function normalizeHttpUrl(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl || '').trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch (_) { return null; }
}

function deriveNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch (_) { return url; }
}

async function seedEnvUrlsIfNeeded() {
  const existing = await listTrackedUrls();
  if (existing.length > 0 || SHOP_URLS.length === 0) return;
  for (const url of SHOP_URLS) {
    try {
      await createTrackedUrl(url, deriveNameFromUrl(url));
    } catch (err) {
      console.error(`[tracker] Failed to seed URL ${url}:`, err.message);
    }
  }
}

// 6. API Routes for the Frontend
app.get('/api/urls', async (_req, res) => {
  try { res.json(await listTrackedUrls()); } 
  catch (err) { res.status(500).json({ error: 'Failed to load tracked URLs.' }); }
});

app.post('/api/urls', async (req, res) => {
  const normalized = normalizeHttpUrl(req.body && req.body.url);
  const providedName = req.body && typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 150) : '';
  if (!normalized) return res.status(400).json({ error: 'Provide a valid URL.' });
  try {
    const created = await createTrackedUrl(normalized, providedName || deriveNameFromUrl(normalized));
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: 'Unable to create URL.' }); }
});

app.delete('/api/urls/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const deleted = await deleteTrackedUrl(id);
    if (!deleted) return res.status(404).json({ error: 'Not found.' });
    res.status(204).end();
  } catch (err) { res.status(500).json({ error: 'Unable to delete.' }); }
});

app.get('/api/settings/webhook', async (_req, res) => {
  try { res.json({ webhookUrl: (await getSetting('discord_webhook_url')) || '' }); } 
  catch (err) { res.status(500).json({ error: 'Error loading webhook.' }); }
});

app.post('/api/settings/webhook', async (req, res) => {
  const webhookUrl = String((req.body && req.body.webhookUrl) || '').trim();
  try {
    await setSetting('discord_webhook_url', webhookUrl);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Error saving webhook.' }); }
});

app.post('/api/scrape-now', async (_req, res) => {
  if (isScraping) return res.status(409).json({ error: 'Scrape in progress.' });
  runScrape().catch((err) => console.error('[scrape-now] Error:', err.message));
  res.json({ message: 'Scrape started.' });
});

// 7. Core Scraping Logic
async function runScrape() {
  if (isScraping) return;
  isScraping = true;
  try {
    const activeUrls = await listActiveTrackedUrls();
    for (const tracked of activeUrls) {
      const { id, url } = tracked;
      let changedThisCycle = false;
      try {
        console.log(`[tracker] Scraping ${url}`);
        const [scraped, stored] = await Promise.all([scrape(url), loadItems(url)]);
        for (const item of scraped) {
          const prev = stored.get(item.itemId);
          if (!prev || (!prev.inStock && item.inStock)) {
            changedThisCycle = true;
            await upsertItem(url, item.itemId, item.name, item.inStock);
            if (item.inStock) await notify(prev ? 'restock' : 'new', item.name, url);
          } else {
            await upsertItem(url, item.itemId, item.name, item.inStock);
          }
        }
        await updateTrackedUrlCheck(id, changedThisCycle, null);
      } catch (err) {
        await updateTrackedUrlCheck(id, false, err.message);
        console.error(`[tracker] Error:`, err.message);
      }
    }
  } finally { isScraping = false; }
}

// 8. Main Entry Point
async function main() {
  await initDb();
  await seedEnvUrlsIfNeeded();

  // Start the background interval
  setInterval(runScrape, INTERVAL_MS);
  runScrape(); // Initial run

  // Start the heartbeat server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Live on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('[main] Fatal error:', err);
  process.exit(1);
});