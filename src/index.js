'use strict';

// Load .env file when running locally (not on Render)
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

const SHOP_URLS = (process.env.SHOP_URLS || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const PORT = parseInt(process.env.PORT || '3000', 10);

const app = express();
const publicDir = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use(express.static(publicDir));

app.get('/health', (_req, res) => {
  res.send('OK');
});

function normalizeHttpUrl(rawUrl) {
  try {
    const parsed = new URL(String(rawUrl || '').trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch (_) {
    return null;
  }
}

function deriveNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch (_) {
    return url;
  }
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

app.get('/api/urls', async (_req, res) => {
  try {
    const urls = await listTrackedUrls();
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tracked URLs.' });
  }
});

app.post('/api/urls', async (req, res) => {
  const normalized = normalizeHttpUrl(req.body && req.body.url);
  const providedName = req.body && typeof req.body.name === 'string'
    ? req.body.name.trim().slice(0, 150)
    : '';

  if (!normalized) {
    res.status(400).json({ error: 'Please provide a valid http/https URL.' });
    return;
  }

  try {
    const created = await createTrackedUrl(normalized, providedName || deriveNameFromUrl(normalized));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Unable to create tracked URL.' });
  }
});

app.delete('/api/urls/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid URL id.' });
    return;
  }

  try {
    const deleted = await deleteTrackedUrl(id);
    if (!deleted) {
      res.status(404).json({ error: 'Tracked URL not found.' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Unable to delete tracked URL.' });
  }
});

app.get('/api/settings/webhook', async (_req, res) => {
  try {
    const webhookUrl = await getSetting('discord_webhook_url');
    res.json({ webhookUrl: webhookUrl || '' });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load webhook setting.' });
  }
});

app.post('/api/settings/webhook', async (req, res) => {
  const webhookUrl = String((req.body && req.body.webhookUrl) || '').trim();

  if (webhookUrl.length > 0) {
    const normalized = normalizeHttpUrl(webhookUrl);
    if (!normalized) {
      res.status(400).json({ error: 'Please provide a valid webhook URL.' });
      return;
    }
  }

  try {
    await setSetting('discord_webhook_url', webhookUrl);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Unable to save webhook setting.' });
  }
});

app.post('/api/scrape-now', async (_req, res) => {
  if (isScraping) {
    res.status(409).json({ error: 'A scrape is already in progress. Please wait.' });
    return;
  }
  // Fire and forget — respond immediately so the UI doesn't hang
  runScrape().catch((err) => console.error('[scrape-now] Error:', err.message));
  res.json({ message: 'Scrape started.' });
});

let isScraping = false;

async function runScrape() {
  if (isScraping) {
    console.log('[tracker] Previous scrape still running - skipping this interval.');
    return;
  }

  isScraping = true;

  try {
    const activeUrls = await listActiveTrackedUrls();

    if (activeUrls.length === 0) {
      console.warn('[tracker] No tracked URLs configured - skipping scrape.');
      return;
    }

    for (const tracked of activeUrls) {
      const { id, url } = tracked;
      let changedThisCycle = false;

      try {
        console.log(`[tracker] Starting scrape for ${url}`);
        const [scraped, stored] = await Promise.all([
          scrape(url),
          loadItems(url),
        ]);

        for (const item of scraped) {
          const prev = stored.get(item.itemId);

          if (!prev) {
            changedThisCycle = true;
            await upsertItem(url, item.itemId, item.name, item.inStock);
            if (item.inStock) {
              await notify('new', item.name, url);
            }
          } else if (!prev.inStock && item.inStock) {
            changedThisCycle = true;
            await upsertItem(url, item.itemId, item.name, item.inStock);
            await notify('restock', item.name, url);
          } else {
            await upsertItem(url, item.itemId, item.name, item.inStock);
          }
        }

        await updateTrackedUrlCheck(id, changedThisCycle, null);
        console.log(`[tracker] Finished scrape for ${url}`);
      } catch (err) {
        await updateTrackedUrlCheck(id, false, err.message || 'Unknown scrape error');
        console.error(`[tracker] Error scraping ${url}:`, err.message);
      }
    }
  } finally {
    isScraping = false;
  }
}

async function main() {
  await initDb();
  await seedEnvUrlsIfNeeded();

  runScrape();
  setInterval(runScrape, INTERVAL_MS);

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
