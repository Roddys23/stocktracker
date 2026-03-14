'use strict';

const { Pool } = require('pg');
const sqlite3 = require('sqlite3');

const DATABASE_URL = process.env.DATABASE_URL;
const USE_POSTGRES = Boolean(DATABASE_URL);

let pool = null;
let sqliteDb = null;

if (USE_POSTGRES) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });
} else {
  const sqlitePath = process.env.SQLITE_PATH || './stocktracker.db';
  sqliteDb = new sqlite3.Database(sqlitePath);
  console.log(`[db] Using local SQLite at ${sqlitePath}`);
}

function sqliteRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function sqliteAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function sqliteGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

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
  if (USE_POSTGRES) {
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
    return;
  }

  await sqliteRun(`
    CREATE TABLE IF NOT EXISTS tracked_items (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      url       TEXT NOT NULL,
      item_id   TEXT NOT NULL,
      name      TEXT,
      in_stock  INTEGER NOT NULL DEFAULT 0,
      last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (url, item_id)
    )
  `);

  await sqliteRun(`
    CREATE TABLE IF NOT EXISTS tracked_urls (
      id                        INTEGER PRIMARY KEY AUTOINCREMENT,
      url                       TEXT NOT NULL UNIQUE,
      name                      TEXT,
      active                    INTEGER NOT NULL DEFAULT 1,
      last_check                TEXT,
      last_change_at            TEXT,
      changed_since_last_check  INTEGER NOT NULL DEFAULT 0,
      last_error                TEXT,
      created_at                TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at                TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await sqliteRun(`
    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('[db] SQLite tables ready.');
}

async function loadItems(url) {
  const rows = USE_POSTGRES
    ? (await pool.query(
      'SELECT item_id, name, in_stock FROM tracked_items WHERE url = $1',
      [url],
    )).rows
    : await sqliteAll(
      'SELECT item_id, name, in_stock FROM tracked_items WHERE url = ?',
      [url],
    );

  const map = new Map();
  for (const row of rows) {
    map.set(row.item_id, { name: row.name, inStock: Boolean(row.in_stock) });
  }
  return map;
}

async function upsertItem(url, itemId, name, inStock) {
  if (USE_POSTGRES) {
    await pool.query(
      `INSERT INTO tracked_items (url, item_id, name, in_stock, last_seen)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (url, item_id) DO UPDATE
         SET name      = EXCLUDED.name,
             in_stock  = EXCLUDED.in_stock,
             last_seen = EXCLUDED.last_seen`,
      [url, itemId, name, inStock],
    );
    return;
  }

  await sqliteRun(
    `INSERT INTO tracked_items (url, item_id, name, in_stock, last_seen)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(url, item_id) DO UPDATE
       SET name      = excluded.name,
           in_stock  = excluded.in_stock,
           last_seen = CURRENT_TIMESTAMP`,
    [url, itemId, name, inStock ? 1 : 0],
  );
}

async function listTrackedUrls() {
  if (USE_POSTGRES) {
    const { rows } = await pool.query(
      `SELECT id, url, name, active, last_check, last_change_at,
              changed_since_last_check, last_error, created_at, updated_at
       FROM tracked_urls
       ORDER BY created_at DESC`,
    );
    return rows.map(mapTrackedUrlRow);
  }

  const rows = await sqliteAll(
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
  if (USE_POSTGRES) {
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

  await sqliteRun(
    `INSERT INTO tracked_urls (url, name, active, updated_at)
     VALUES (?, ?, 1, CURRENT_TIMESTAMP)
     ON CONFLICT(url) DO UPDATE
       SET name = COALESCE(excluded.name, tracked_urls.name),
           active = 1,
           updated_at = CURRENT_TIMESTAMP`,
    [url, name],
  );

  const row = await sqliteGet(
    `SELECT id, url, name, active, last_check, last_change_at,
            changed_since_last_check, last_error, created_at, updated_at
     FROM tracked_urls
     WHERE url = ?`,
    [url],
  );
  return mapTrackedUrlRow(row);
}

async function deleteTrackedUrl(id) {
  if (USE_POSTGRES) {
    const { rows } = await pool.query('SELECT id, url FROM tracked_urls WHERE id = $1', [id]);
    if (rows.length === 0) return false;

    await pool.query('DELETE FROM tracked_items WHERE url = $1', [rows[0].url]);
    await pool.query('DELETE FROM tracked_urls WHERE id = $1', [id]);
    return true;
  }

  const row = await sqliteGet('SELECT id, url FROM tracked_urls WHERE id = ?', [id]);
  if (!row) return false;

  await sqliteRun('DELETE FROM tracked_items WHERE url = ?', [row.url]);
  await sqliteRun('DELETE FROM tracked_urls WHERE id = ?', [id]);
  return true;
}

async function updateTrackedUrlCheck(id, changed, error = null) {
  if (USE_POSTGRES) {
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
    return;
  }

  await sqliteRun(
    `UPDATE tracked_urls
     SET last_check = CURRENT_TIMESTAMP,
         changed_since_last_check = ?,
         last_change_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE last_change_at END,
         last_error = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [changed ? 1 : 0, changed ? 1 : 0, error, id],
  );
}

async function setSetting(key, value) {
  if (USE_POSTGRES) {
    await pool.query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value,
             updated_at = NOW()`,
      [key, value],
    );
    return;
  }

  await sqliteRun(
    `INSERT INTO settings (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE
       SET value = excluded.value,
           updated_at = CURRENT_TIMESTAMP`,
    [key, value],
  );
}

async function getSetting(key) {
  if (USE_POSTGRES) {
    const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    return rows.length ? rows[0].value : null;
  }

  const row = await sqliteGet('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : null;
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
