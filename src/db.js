const { Pool } = require('pg');

// This uses the DATABASE_URL you pasted into Render's settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render/external connections
  }
});

async function initDb() {
  const client = await pool.connect();
  try {
    // Creates the table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        url TEXT,
        name TEXT,
        price TEXT,
        in_stock BOOLEAN,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Postgres Database Initialized");
  } finally {
    client.release();
  }
}

module.exports = { 
  pool, 
  initDb, 
  loadItems, 
  upsertItem, 
  listTrackedUrls,        // <--- Make sure this is here
  listActiveTrackedUrls,  // <--- And this
  createTrackedUrl, 
  deleteTrackedUrl, 
  updateTrackedUrlCheck, 
  getSetting, 
  setSetting 
};