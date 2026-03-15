const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

async function initDb() {
  const client = await pool.connect();
  try {
    // 1. Table for individual items found on pages
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        url TEXT,
        item_id TEXT,
        name TEXT,
        in_stock BOOLEAN,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // 2. Table for the URLs you want to track
    await client.query(`
      CREATE TABLE IF NOT EXISTS tracked_urls (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE,
        name TEXT,
        active BOOLEAN DEFAULT TRUE,
        last_checked TIMESTAMP,
        last_change TIMESTAMP,
        error_message TEXT
      );
    `);
    // 3. Table for settings (like your webhook)
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    console.log("Postgres Database Initialized");
  } finally {
    client.release();
  }
}

// --- Function Logic for Index.js ---

async function loadItems(url) {
  const res = await pool.query('SELECT item_id, name, in_stock FROM items WHERE url = $1', [url]);
  const map = new Map();
  res.rows.forEach(row => map.set(row.item_id, row));
  return map;
}

async function upsertItem(url, itemId, name, inStock) {
  await pool.query(
    `INSERT INTO items (url, item_id, name, in_stock, last_seen) 
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (url, item_id) DO UPDATE 
     SET in_stock = EXCLUDED.in_stock, last_seen = CURRENT_TIMESTAMP`,
    [url, itemId, name, inStock]
  );
}

async function listTrackedUrls() {
  const res = await pool.query('SELECT * FROM tracked_urls ORDER BY id ASC');
  return res.rows;
}

async function listActiveTrackedUrls() {
  const res = await pool.query('SELECT * FROM tracked_urls WHERE active = TRUE');
  return res.rows;
}

async function createTrackedUrl(url, name) {
  const res = await pool.query(
    'INSERT INTO tracked_urls (url, name) VALUES ($1, $2) ON CONFLICT (url) DO UPDATE SET name = EXCLUDED.name RETURNING *',
    [url, name]
  );
  return res.rows[0];
}

async function deleteTrackedUrl(id) {
  const res = await pool.query('DELETE FROM tracked_urls WHERE id = $1 RETURNING *', [id]);
  return res.rowCount > 0;
}

async function updateTrackedUrlCheck(id, changed, error) {
  if (changed) {
    await pool.query(
      'UPDATE tracked_urls SET last_checked = CURRENT_TIMESTAMP, last_change = CURRENT_TIMESTAMP, error_message = $2 WHERE id = $1',
      [id, error]
    );
  } else {
    await pool.query(
      'UPDATE tracked_urls SET last_checked = CURRENT_TIMESTAMP, error_message = $2 WHERE id = $1',
      [id, error]
    );
  }
}

async function getSetting(key) {
  const res = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
  return res.rows[0]?.value;
}

async function setSetting(key, value) {
  await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
    [key, value]
  );
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
  getSetting, 
  setSetting 
};