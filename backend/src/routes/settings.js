const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { resetWarehouseSequelize } = require('../config/warehouseDatabase');

const ENV_PATH = path.join(__dirname, '../../.env');

// Parse .env file manually to preserve comments and format
function parseEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  const lines = content.split('\n');
  const env = {};
  for (const line of lines) {
    if (line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.substring(0, idx).trim();
    const val = line.substring(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

function updateEnv(updates) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
  const lines = content.split('\n');
  const updatedKeys = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.substring(0, idx).trim();

    if (updates[key] !== undefined) {
      lines[i] = `${key}=${updates[key]}`;
      updatedKeys.add(key);
    }
  }

  // Append new keys
  let appendContent = '';
  for (const [key, val] of Object.entries(updates)) {
    if (!updatedKeys.has(key)) {
      appendContent += `\n${key}=${val}`;
    }
  }

  content = lines.join('\n') + appendContent;
  fs.writeFileSync(ENV_PATH, content, 'utf-8');
}

// GET /apiv1/settings/db
router.get('/db', (req, res) => {
  try {
    const env = parseEnv();
    res.json({
      success: true,
      data: {
        host: env.WAREHOUSE_DB_HOST || env.DB_HOST || '',
        port: env.WAREHOUSE_DB_PORT || env.DB_PORT || '3306',
        database: env.WAREHOUSE_DB_NAME || env.DB_NAME || '',
        username: env.WAREHOUSE_DB_USER || env.DB_USER || '',
        // Don't send the real password back for security, just send a placeholder if it exists
        password: (env.WAREHOUSE_DB_PASSWORD || env.DB_PASSWORD) ? '********' : ''
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to read settings' });
  }
});

// POST /apiv1/settings/db
router.post('/db', async (req, res) => {
  try {
    const { host, port, database, username, password } = req.body;
    
    const updates = {};
    if (host !== undefined) {
      updates.WAREHOUSE_DB_HOST = host;
      process.env.WAREHOUSE_DB_HOST = host;
    }
    if (port !== undefined) {
      updates.WAREHOUSE_DB_PORT = port;
      process.env.WAREHOUSE_DB_PORT = port;
    }
    if (database !== undefined) {
      updates.WAREHOUSE_DB_NAME = database;
      process.env.WAREHOUSE_DB_NAME = database;
    }
    if (username !== undefined) {
      updates.WAREHOUSE_DB_USER = username;
      process.env.WAREHOUSE_DB_USER = username;
    }
    
    // Only update password if it's provided and not the placeholder
    if (password && password !== '********') {
      updates.WAREHOUSE_DB_PASSWORD = password;
      process.env.WAREHOUSE_DB_PASSWORD = password;
    }

    updateEnv(updates);
    
    // Reload the connection pool
    await resetWarehouseSequelize();

    res.json({ success: true, message: 'Settings saved and connection restarted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// POST /apiv1/settings/databases
router.post('/databases', async (req, res) => {
  try {
    const { host, port, username, password } = req.body;
    const env = parseEnv();
    
    // Use provided password, or fallback to env password if it's the placeholder
    const actualPassword = (password && password !== '********') 
      ? password 
      : (env.WAREHOUSE_DB_PASSWORD || env.DB_PASSWORD);

    const connection = await mysql.createConnection({
      host: host || env.WAREHOUSE_DB_HOST || env.DB_HOST,
      port: Number(port || env.WAREHOUSE_DB_PORT || env.DB_PORT || 3306),
      user: username || env.WAREHOUSE_DB_USER || env.DB_USER,
      password: actualPassword
    });

    const [rows] = await connection.query('SHOW DATABASES');
    await connection.end();

    const databases = rows.map(r => r.Database);
    res.json({ success: true, data: databases });
  } catch (err) {
    console.error('Failed to fetch databases:', err.message);
    res.status(500).json({ success: false, error: 'Failed to connect and fetch databases. Please check credentials.' });
  }
});

module.exports = router;
