'use strict';
'use strict';

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[db] DATABASE_URL environment variable is not set. Postgres is required.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
});

function mapTrackedUrlRow(row) {
  return {
    id: row.id,
    url: row.url,
    name: row.name,
    active: Boolean(row.active),
    lastCheck: row.last_check,
    lastChangeAt: row.last_change_at,
    changedSinceLastCheck: Boolean(row.changed_since_last_check),
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracked_items (
      id        SERIAL PRIMARY KEY,
      url       TEXT NOT NULL,
      item_id   TEXT NOT NULL,
      name      TEXT,
      in_stock  BOOLEAN NOT NULL DEFAULT FALSE,
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (url, item_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracked_urls (
      id                        SERIAL PRIMARY KEY,
      url                       TEXT NOT NULL UNIQUE,
      name                      TEXT,
      active                    BOOLEAN NOT NULL DEFAULT TRUE,
      last_check                TIMESTAMPTZ,
      last_change_at            TIMESTAMPTZ,
      changed_since_last_check  BOOLEAN NOT NULL DEFAULT FALSE,
      last_error                TEXT,
      created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  console.log('[db] PostgreSQL tables ready.');
}

async function loadItems(url) {
  const { rows } = await pool.query(
    'SELECT item_id, name, in_stock FROM tracked_items WHERE url = $1',
    [url],
  );

  const map = new Map();
  for (const row of rows) {
    map.set(row.item_id, { name: row.name, inStock: Boolean(row.in_stock) });
  }
  return map;
}

async function upsertItem(url, itemId, name, inStock) {
  await pool.query(
    `INSERT INTO tracked_items (url, item_id, name, in_stock, last_seen)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (url, item_id) DO UPDATE
       SET name      = EXCLUDED.name,
           in_stock  = EXCLUDED.in_stock,
           last_seen = EXCLUDED.last_seen`,
    [url, itemId, name, inStock],
  );
}

async function listTrackedUrls() {
  const { rows } = await pool.query(
    `SELECT id, url, name, active, last_check, last_change_at,
            changed_since_last_check, last_error, created_at, updated_at
     FROM tracked_urls
     ORDER BY created_at DESC`,
  );
  return rows.map(mapTrackedUrlRow);
}

async function listActiveTrackedUrls() {
  const allUrls = await listTrackedUrls();
  return allUrls.filter((u) => u.active);
}

async function createTrackedUrl(url, name = null) {
  const { rows } = await pool.query(
    `INSERT INTO tracked_urls (url, name, active)
     VALUES ($1, $2, TRUE)
     ON CONFLICT (url) DO UPDATE
       SET name = COALESCE(EXCLUDED.name, tracked_urls.name),
           active = TRUE,
           updated_at = NOW()
     RETURNING id, url, name, active, last_check, last_change_at,
               changed_since_last_check, last_error, created_at, updated_at`,
    [url, name],
  );
  return mapTrackedUrlRow(rows[0]);
}

async function deleteTrackedUrl(id) {
  const { rows } = await pool.query('SELECT id, url FROM tracked_urls WHERE id = $1', [id]);
  if (rows.length === 0) return false;

  await pool.query('DELETE FROM tracked_items WHERE url = $1', [rows[0].url]);
  await pool.query('DELETE FROM tracked_urls WHERE id = $1', [id]);
  return true;
}

async function updateTrackedUrlCheck(id, changed, error = null) {
  await pool.query(
    `UPDATE tracked_urls
     SET last_check = NOW(),
         changed_since_last_check = $2,
         last_change_at = CASE WHEN $2 THEN NOW() ELSE last_change_at END,
         last_error = $3,
         updated_at = NOW()
     WHERE id = $1`,
    [id, changed, error],
  );
}

async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value,
           updated_at = NOW()`,
    [key, value],
  );
}

async function getSetting(key) {
  const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
  return rows.length ? rows[0].value : null;
}

module.exports = {
  pool,
  initDb,
  loadItems,
  upsertItem,
  listTrackedUrls,
  listActiveTrackedUrls,
  createTrackedUrl,
  deleteTrackedUrl,
  updateTrackedUrlCheck,
  setSetting,
  getSetting,
};
