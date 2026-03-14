'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

/**
 * Ensure the tracked_items table exists.
 * Columns:
 *   id          – auto PK
 *   url         – the shop page URL this item was found on
 *   item_id     – unique identifier scraped from the page (e.g. variant id or href)
 *   name        – human-readable product name
 *   in_stock    – boolean
 *   last_seen   – timestamp of the last scrape run that found this item
 */
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
  console.log('[db] Table ready.');
}

/**
 * Load all stored items for a given shop URL.
 * @param {string} url
 * @returns {Promise<Map<string, {name: string, inStock: boolean}>>}
 */
async function loadItems(url) {
  const { rows } = await pool.query(
    'SELECT item_id, name, in_stock FROM tracked_items WHERE url = $1',
    [url],
  );
  const map = new Map();
  for (const row of rows) {
    map.set(row.item_id, { name: row.name, inStock: row.in_stock });
  }
  return map;
}

/**
 * Upsert a scraped item record.
 * @param {string} url
 * @param {string} itemId
 * @param {string} name
 * @param {boolean} inStock
 */
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

module.exports = { pool, initDb, loadItems, upsertItem };
